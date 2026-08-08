const getAfkState = () => {
  global.afkState = global.afkState || {}
  return global.afkState
}

const getPendingState = () => {
  global.afkPending = global.afkPending || {}
  return global.afkPending
}

const formatMention = (jid = '') => `@${jid.split('@')[0]}`

const formatDuration = (ms) => {
  const seconds = Math.floor((ms / 1000) % 60)
  const minutes = Math.floor((ms / (1000 * 60)) % 60)
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
  const days = Math.floor(ms / (1000 * 60 * 60 * 24))

  const parts = []
  if (days > 0) parts.push(`${days}g`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (seconds > 0) parts.push(`${seconds}s`)

  return parts.length > 0 ? parts.join(' ') : '0s'
}

const handler = async (m, { conn, text, command }) => {
  const afkState = getAfkState()
  const pendingState = getPendingState()

  if (command === 'afk') {
    const reason = (text || '').trim()
    if (!reason) {
      return conn.reply(m.chat, '🛌 Scrivi il motivo, es: .afk lavoro', m)
    }

    pendingState[m.sender] = { reason, chat: m.chat, at: Date.now() }

    return conn.sendMessage(m.chat, {
      text: `🛌 Dove vuoi essere AFK?\n\nMotivo: ${reason}`,
      footer: '333 AFK',
      buttons: [
        { buttonId: '.afk_scope group', buttonText: { displayText: '📍 Su questo gruppo' }, type: 1 },
        { buttonId: '.afk_scope all', buttonText: { displayText: '🌍 Su tutti i gruppi' }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }

  if (command === 'afk_scope') {
    const pending = pendingState[m.sender]
    if (!pending) return conn.reply(m.chat, '⚠️ Non hai una richiesta AFK in corso.', m)

    const scope = (text || '').trim().toLowerCase() === 'all' ? 'all' : 'group'
    afkState[m.sender] = {
      reason: pending.reason,
      scope,
      chat: m.chat,
      at: Date.now()
    }
    delete pendingState[m.sender]

    return conn.sendMessage(m.chat, {
      text: `✅ AFK attivato ${scope === 'all' ? 'su tutti i gruppi' : 'su questo gruppo'}\n\nMotivo: ${afkState[m.sender].reason}\n\nBuon riposo, ${formatMention(m.sender)}!`,
      mentions: [m.sender]
    }, { quoted: m })
  }
}

handler.before = async (m, { conn }) => {
  const afkState = getAfkState()
  const pendingState = getPendingState()
  const botJid = conn?.user?.jid

  if (!m?.sender || m.sender === botJid || m.fromMe || m.key?.fromMe) return false

  const isAfkRelated = /^(afk|afk_scope)$/i.test((m.text || '').replace(/^\./, '').split(/\s+/)[0] || '')

  if (afkState[m.sender] && !isAfkRelated) {
    const duration = formatDuration(Date.now() - afkState[m.sender].at)
    delete afkState[m.sender]
    delete pendingState[m.sender]
    await conn.sendMessage(m.chat, {
      text: `✅ AFK disattivato, bentornato ${formatMention(m.sender)}!\n\n⏱️ Sei stato AFK per: ${duration}\n\nSperiamo che tu abbia riposato bene!`,
      mentions: [m.sender]
    }, { quoted: m }).catch(() => {})
    return false
  }

  const mentions = (Array.isArray(m.mentionedJid) ? m.mentionedJid : [])
    .filter(Boolean)
    .filter((jid) => jid !== m.sender && jid !== botJid)

  if (!mentions.length) return false

  for (const jid of mentions) {
    const entry = afkState[jid]
    if (!entry) continue

    const allowed = entry.scope === 'all' || entry.chat === m.chat
    if (!allowed) continue

    const duration = formatDuration(Date.now() - entry.at)
    await conn.sendMessage(m.chat, {
      text: `👋 Hey ${formatMention(m.sender)}, ${formatMention(jid)} è offline per il seguente motivo:\n\n"${entry.reason}"\n\n⏱️ AFK da: ${duration}`,
      mentions: [m.sender, jid]
    }, { quoted: m }).catch(() => {})
    break
  }

  return false
}

handler.command = /^(afk|afk_scope)$/i
handler.help = ['afk [motivo]']
handler.tags = ['fun']

export default handler
