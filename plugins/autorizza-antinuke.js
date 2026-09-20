//Plugin by Gab, Lucifero & 333 staff

function normalizeJid(jid) {
  if (!jid) return null
  return String(jid).trim()
}

function getTargetJid(m, text) {
  if (m.mentionedJid?.[0]) return normalizeJid(m.mentionedJid[0])
  if (m.quoted?.sender) return normalizeJid(m.quoted.sender)
  const match = (text || '').match(/@?([0-9]+(?:@s\.whatsapp\.net)?)/)
  if (match?.[1]) return normalizeJid(match[1].includes('@') ? match[1] : `${match[1]}@s.whatsapp.net`)
  return null
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!m.isGroup) return

  const chat = global.db.data.chats[m.chat] || {}
  chat.antinukeAuthorized = chat.antinukeAuthorized || {}

  const groupMetadata = await conn.groupMetadata(m.chat).catch(() => null)
  const groupOwnerJid = normalizeJid(groupMetadata?.owner || groupMetadata?.ownerJid || null)
  const isBotOwner = global.owner?.some(([num]) => num === m.sender.split('@')[0]) || m.sender === conn.user.jid
  const isGroupOwner = m.sender === groupOwnerJid

  if (!isBotOwner && !isGroupOwner) {
    return conn.reply(m.chat, '❌ Solo l’owner del bot o il proprietario del gruppo può gestire l’autorizzazione anti-nuke.', m)
  }

  const listCommand = /^(autorizzati|listaautorizzati|listautorizzati)$/i.test(command)
  const targetJid = getTargetJid(m, text)

  if (listCommand) {
    const authorized = Object.keys(chat.antinukeAuthorized || {})
    if (!authorized.length) {
      return conn.reply(m.chat, 'ℹ️ Nessun utente è autorizzato all’anti-nuke.', m)
    }
    const mentions = authorized.map(jid => jid)
    const listText = authorized.map(jid => `• @${jid.split('@')[0]}`).join('\n')
    return conn.reply(m.chat, `📜 Lista utenti autorizzati all’anti-nuke:\n${listText}`, m, { mentions })
  }

  if (!targetJid) {
    return conn.reply(m.chat, `⚠️ Usa:\n• ${usedPrefix}autorizza antinuke @user\n• ${usedPrefix}disautorizza antinuke @user\n• ${usedPrefix}autorizzati antinuke`, m)
  }

  const action = /^(autorizza|addantinuke)$/i.test(command) ? 'add' : 'remove'

  if (action === 'add') {
    if (chat.antinukeAuthorized[targetJid]) {
      return conn.reply(m.chat, '❗ Utente già autorizzato!', m, { mentions: [targetJid] })
    }
    chat.antinukeAuthorized[targetJid] = true
    return conn.reply(m.chat, `✅ Utente autorizzato all’uso di anti-nuke: @${targetJid.split('@')[0]}\n\n> *Per visualizzare la lista degli utenti autorizzati*, usa il comando ${usedPrefix}listaautorizzati`, m, { mentions: [targetJid] })
  }

  if (!chat.antinukeAuthorized[targetJid]) {
    return conn.reply(m.chat, '❗ L’utente non è autorizzato!', m, { mentions: [targetJid] })
  }
  delete chat.antinukeAuthorized[targetJid]
  return conn.reply(m.chat, `🗑️ Autorizzazione rimossa per: @${targetJid.split('@')[0]}`, m, { mentions: [targetJid] })
}

handler.help = ['autorizza antinuke @user', 'disautorizza antinuke @user', 'autorizzati antinuke']
handler.tags = ['admin']
handler.command = /^(autorizza|addantinuke|disautorizza|removeantinuke|autorizzati|listaautorizzati|listautorizzati)$/i
handler.group = true

export default handler
