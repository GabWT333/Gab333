//Plugin by Gab, Lucifero & 333 staff

const PROMOTE_STUB = 29
const DEMOTE_STUB = 30
let antinukeListenerRegistered = false

function normalizeJid(jid) {
  if (!jid) return null
  return String(jid).trim()
}

function getMentionLabel(jid) {
  if (!jid) return null
  return jid.split('@')[0]
}

function toPhoneJid(value) {
  if (!value) return null
  const raw = String(value).trim()
  if (!raw) return null
  if (raw.includes('@')) return normalizeJid(raw)
  const digits = raw.replace(/\D/g, '')
  return normalizeJid(digits ? `${digits}@s.whatsapp.net` : null)
}

function getProtectedJids(conn, chatId, chat = {}) {
  const groupOwnerJid = normalizeJid((global.groupCache?.get(chatId)?.owner) || null)
  const botOwnerJid = normalizeJid(conn?.user?.jid || null)
  const ownerJids = (global.owner || [])
    .map(entry => Array.isArray(entry) ? entry[0] : entry)
    .map(toPhoneJid)
    .filter(Boolean)
  const authorizedJids = Object.keys(chat.antinukeAuthorized || {})
    .map(normalizeJid)
    .filter(Boolean)

  return [...new Set([groupOwnerJid, botOwnerJid, ...ownerJids, ...authorizedJids].filter(Boolean))]
}

async function closeGroup(conn, chatId) {
  try {
    await conn.groupSettingUpdate(chatId, 'announcement')
  } catch (e) {
    console.error('Errore chiusura gruppo antinuke:', e)
  }
}

async function demoteAllAdmins(conn, chatId, preserveJids = []) {
  try {
    const metadata = await conn.groupMetadata(chatId)
    const admins = (metadata?.participants || [])
      .filter(p => p.admin)
      .map(p => normalizeJid(p.id))
      .filter(Boolean)

    const toDemote = admins.filter(jid => !preserveJids.includes(jid))

    if (toDemote.length) {
      await conn.groupParticipantsUpdate(chatId, toDemote, 'demote')
    }
  } catch (e) {
    console.error('Errore demote admin antinuke:', e)
  }
}

function getCommandName(m) {
  const raw = (m.command || m.text || m.caption || '').toString().trim()
  const firstWord = raw.split(/\s+/)[0]?.toLowerCase() || ''
  return firstWord.replace(/^[^a-z0-9]+/, '').replace(/[^a-z0-9]+$/g, '') || ''
}

function isAdminAction(m) {
  if (m.messageStubType === PROMOTE_STUB || m.messageStubType === DEMOTE_STUB) return true

  const commandName = getCommandName(m)
  if (['p', 'promote', 'promuovi', 'mettiadmin'].includes(commandName)) return true
  if (['r', 'demote', 'retrocedi', 'togliadmin'].includes(commandName)) return true

  return false
}

async function triggerAntinuke(conn, chatId, actorJid, targetJids = [], reason = 'admin-change') {
  const chat = global.db.data.chats?.[chatId] || {}
  const preserveJids = getProtectedJids(conn, chatId, chat)

  await closeGroup(conn, chatId)
  await demoteAllAdmins(conn, chatId, preserveJids)
  const metadataAfter = await conn.groupMetadata(chatId).catch(() => null)
  const currentAdmins = new Set((metadataAfter?.participants || []).filter(p => p.admin).map(p => normalizeJid(p.id)).filter(Boolean))

  const ownerJids = (global.owner || []).map(entry => Array.isArray(entry) ? entry[0] : entry).map(toPhoneJid).filter(Boolean)
  const botOwnerJid = normalizeJid(conn?.user?.jid || null)
  const ownersSet = new Set([...ownerJids, botOwnerJid].filter(Boolean))

  const preservedAdmins = (preserveJids || []).filter(j => j && !targetJids.includes(j) && currentAdmins.has(j) && !ownersSet.has(j))

  const mentions = [actorJid, ...targetJids, ...preservedAdmins].filter(Boolean)
  const targetLabel = targetJids[0] ? targetJids[0].split('@')[0] : 'utente'
  const actorLabel = actorJid ? actorJid.split('@')[0] : 'admin'
  const actionText = reason === 'admin-exit' ? 'ha fatto uscire un amministratore' : 'ha promosso/retrocesso un amministratore'
  const preservedText = preservedAdmins.length ? `\n\nAmministratori rimasti admin: ${preservedAdmins.map(j => '@' + j.split('@')[0]).join(' ')}` : ''
  const warning = `⚠️ Tentativo di nuke rilevato, gruppo chiuso.\n\nL'admin @${actorLabel} ${actionText} (utente @${targetLabel})${preservedText}`

  await new Promise(resolve => setTimeout(resolve, 2000))

  await conn.sendMessage(chatId, {
    text: warning,
    mentions
  })
}

function ensureAntinukeListener(conn) {
  if (antinukeListenerRegistered || !conn?.ev) return
  antinukeListenerRegistered = true

  conn.ev.on('group-participants.update', async (update) => {
    try {
      if (!update?.id || !update.participants?.length) return
      const chat = global.db.data.chats?.[update.id] || {}
      if (chat.antinuke !== true) return
      if (update.action !== 'remove') return

      const previousMetadata = global.groupCache?.get(update.id) || null
      const removedJids = (update.participants || []).map(normalizeJid).filter(Boolean)
      const previousAdmins = new Set((previousMetadata?.participants || []).filter(p => p.admin).map(p => normalizeJid(p.id)).filter(Boolean))
      const affectedAdmins = removedJids.filter(jid => previousAdmins.has(jid))
      if (!affectedAdmins.length) return

      const protectedRemoved = affectedAdmins.some(jid => getProtectedJids(global.conn || conn, update.id, chat).includes(jid))
      if (protectedRemoved) return

      const actorJid = normalizeJid(update.author || update.actor || null)
      await triggerAntinuke(global.conn || conn, update.id, actorJid, affectedAdmins, 'admin-exit')
    } catch (e) {
      console.error('Errore antinuke group-participants.update:', e)
    }
  })
}

export async function before(m, { conn, isAdmin, isOwner, isROwner, command }) {
  if (!m.isGroup) return true
  if (m.fromMe) return true

  ensureAntinukeListener(conn)

  const chat = global.db.data.chats?.[m.chat] || {}
  if (chat.antinuke !== true) return true

  const actorJid = normalizeJid(m.sender)
  if (!actorJid) return true

  let groupMetadata = null
  try {
    groupMetadata = await conn.groupMetadata(m.chat)
  } catch (e) {
    groupMetadata = null
  }

  const groupOwnerJid = normalizeJid(groupMetadata?.owner || groupMetadata?.ownerJid || null)
  const botOwnerJid = normalizeJid(conn.user?.jid || null)
  const isProtectedActor = actorJid === groupOwnerJid || actorJid === botOwnerJid || isOwner || isROwner
  const authorizedUsers = chat.antinukeAuthorized || {}
  const isAuthorized = Boolean(authorizedUsers[actorJid])

  if (isProtectedActor || isAuthorized) return true

  const action = (() => {
    if (m.messageStubType === PROMOTE_STUB) return 'promote'
    if (m.messageStubType === DEMOTE_STUB) return 'demote'
    if (['p', 'promote', 'promuovi', 'mettiadmin'].includes(getCommandName(m))) return 'promote'
    if (['r', 'demote', 'retrocedi', 'togliadmin'].includes(getCommandName(m))) return 'demote'
    return null
  })()

  if (!action) return true
  
  const isStub = m.messageStubType === PROMOTE_STUB || m.messageStubType === DEMOTE_STUB
  const isTextualAction = !isStub && (action === 'promote' || action === 'demote')
  const isPrefixed = typeof m.text === 'string' && m.text.trim().startsWith('.')
  if (isTextualAction && (!isAdmin || !isPrefixed)) return true

  const targetJid = (() => {
    if (m.messageStubParameters?.[0]) return normalizeJid(m.messageStubParameters[0])
    if (m.mentionedJid?.[0]) return normalizeJid(m.mentionedJid[0])
    if (m.quoted?.sender) return normalizeJid(m.quoted.sender)
    if (m.text?.match(/@([0-9]+(?:@s\.whatsapp\.net)?)/)) {
      const match = m.text.match(/@([0-9]+(?:@s\.whatsapp\.net)?)/)
      return normalizeJid(match[1] ? `${match[1]}` : null)
    }
    return null
  })()

  const isTargetAdmin = Boolean(
    (m.messageStubType === DEMOTE_STUB || (action === 'demote' && targetJid)) &&
    (targetJid || m.messageStubParameters?.[0] || m.mentionedJid?.[0] || m.quoted?.sender)
  )

  const preserveJids = [groupOwnerJid, botOwnerJid].filter(Boolean)

  const shouldTrigger = isTargetAdmin || action === 'promote' || action === 'demote'

  if (shouldTrigger) {
    await triggerAntinuke(conn, m.chat, actorJid, [targetJid].filter(Boolean), action === 'promote' ? 'promote' : 'demote')
  } else {
    const adminLabel = getMentionLabel(actorJid) || 'admin'
    const targetLabel = getMentionLabel(targetJid) || 'utente'
    const actionLabel = action === 'promote' ? 'ha promosso' : 'ha retrocesso'
    const allProtected = getProtectedJids(conn, m.chat, chat).filter(j => j && j !== actorJid && j !== targetJid)
    const metadataNow = await conn.groupMetadata(m.chat).catch(() => null)
    const currentAdminsNow = new Set((metadataNow?.participants || []).filter(p => p.admin).map(p => normalizeJid(p.id)).filter(Boolean))
    const ownerJids = (global.owner || []).map(entry => Array.isArray(entry) ? entry[0] : entry).map(toPhoneJid).filter(Boolean)
    const botOwnerJid = normalizeJid(conn?.user?.jid || null)
    const ownersSet = new Set([...ownerJids, botOwnerJid].filter(Boolean))
    const preserved = allProtected.filter(j => currentAdminsNow.has(j) && !ownersSet.has(j))
    const preservedText = preserved.length ? `\n\nAmministratori rimasti admin: ${preserved.map(j => '@' + j.split('@')[0]).join(' ')}` : ''
    const warning = `⚠️ Tentativo di nuke rilevato, gruppo chiuso.\n\nL'admin @${adminLabel} ${actionLabel} l'utente @${targetLabel}${preservedText}`

    await conn.sendMessage(m.chat, {
      text: warning,
      mentions: [actorJid, targetJid, ...preserved].filter(Boolean)
    })
  }

  return false
}

export const disabled = false
