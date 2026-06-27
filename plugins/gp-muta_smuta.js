//Codice di gp-muta_smuta.js

//Plugin by Gab, Lucifero & 333 staff

import fetch from 'node-fetch'

const logAdminAction = async (chatId, adminJid, actionKey, amount = 1) => {
  if (typeof global.logAdmin?.increment === 'function') {
    await global.logAdmin.increment(chatId, adminJid, actionKey, amount)
  } else {
    global.logAdminQueue = global.logAdminQueue || []
    global.logAdminQueue.push({ chatId, adminJid, actionKey, amount })
  }
}

let handler = async (m, {
  conn, command, text, groupMetadata, isAdmin, isMods
}) => {

  const isOwner = (jid) => {
    return global.owner.some(([number]) => jid.includes(number))
  }

  if (command == 'muta') {

    const mods = global.db.data.chats[m.chat]?.moderatori || []
const isMod = mods.includes(m.sender)

if (!isAdmin && !isMod)
  return m.reply('𝐒𝐨𝐥𝐨 𝐮𝐧 𝐚𝐝𝐦𝐢𝐧 𝐨 𝐮𝐧 𝐦𝐨𝐝𝐞𝐫𝐚𝐭𝐨𝐫𝐞 𝐩𝐮𝐨̀ 𝐞𝐬𝐞𝐠𝐮𝐢𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 👑')

    let menzione = m.mentionedJid[0]
      ? m.mentionedJid[0]
      : m.quoted
      ? m.quoted.sender
      : text

    if (!menzione) return m.reply('𝐌𝐞𝐧𝐳𝐢𝐨𝐧𝐚 𝐮𝐧 𝐮𝐭𝐞𝐧𝐭𝐞 👤')

    if (menzione == conn.user.jid) return 'ⓘ 𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐦𝐮𝐭𝐚𝐫𝐞 𝐢𝐥 𝐛𝐨𝐭'

    if (isOwner(menzione)) return '👑 𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐦𝐮𝐭𝐚𝐫𝐞 𝐮𝐧 𝐨𝐰𝐧𝐞𝐫'

    let utente = global.db.data.users[menzione]
    if (!utente) return m.reply('𝐔𝐭𝐞𝐧𝐭𝐞 𝐧𝐨𝐧 𝐭𝐫𝐨𝐯𝐚𝐭𝐨')

    if (utente.muto === true)
      return '𝐐𝐮𝐞𝐬𝐭𝐨 𝐮𝐭𝐞𝐧𝐭𝐞 𝐞̀ 𝐠𝐢𝐚 𝐦𝐮𝐭𝐚𝐭𝐨 🔇'

    let prova = {
      key: { participants: "0@s.whatsapp.net", fromMe: false, id: "Halo" },
      message: {
        locationMessage: {
          name: '𝐔𝐓𝚵𝐍𝐓𝚵 𝐌𝐔𝐓𝚲𝐓Ꮻ 🔇',
          jpegThumbnail: await (await fetch('https://telegra.ph/file/f8324d9798fa2ed2317bc.png')).buffer()
        }
      },
      participant: "0@s.whatsapp.net"
    }

    const rawText = (text || '').trim()
    const parts = rawText.split(/\s+/).filter(Boolean)
    let motivo = 'non specificato ma meritato'
    if (m.quoted) {
      if (rawText) motivo = rawText
    } else if (parts.length > 1) {
      const maybe = parts.slice(1).join(' ').trim()
      if (maybe) motivo = maybe
    } else if (parts.length === 1) {
      const tok = parts[0]
      if (!tok.includes('@') && !/^\+?\d+$/.test(tok)) motivo = tok
    }

    const targetJid = menzione && menzione.includes('@') ? menzione : (menzione ? menzione.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null)
    const actorJid = m.sender

    const finalText = `@${(targetJid||'').split('@')[0]} *mutato da* @${actorJid.split('@')[0]}.\n\n *motivo:* ${motivo}`

    utente.muto = true

    await conn.sendMessage(m.chat, { text: finalText, mentions: [targetJid, actorJid] }, { quoted: prova })
    await logAdminAction(m.chat, m.sender, 'mute')
  }

  if (command == 'smuta') {

    const mods = global.db.data.chats[m.chat]?.moderatori || []
const isMod = mods.includes(m.sender)

if (!isAdmin && !isMod)
  return m.reply('𝐒𝐨𝐥𝐨 𝐮𝐧 𝐚𝐝𝐦𝐢𝐧 𝐨 𝐮𝐧 𝐦𝐨𝐝𝐞𝐫𝐚𝐭𝐨𝐫𝐞 𝐩𝐮𝐨̀ 𝐞𝐬𝐞𝐠𝐮𝐢𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 👑')

    let menzione = m.mentionedJid[0]
      ? m.mentionedJid[0]
      : m.quoted
      ? m.quoted.sender
      : text

    if (!menzione) return m.reply('𝐌𝐞𝐧𝐳𝐢𝐨𝐧𝐚 𝐮𝐧 𝐮𝐭𝐞𝐧𝐭𝐞 👤')

    if (isOwner(menzione)) return '👑 𝐆𝐥𝐢 𝐨𝐰𝐧𝐞𝐫 𝐧𝐨𝐧 𝐡𝐚𝐧𝐧𝐨 𝐛𝐢𝐬𝐨𝐠𝐧𝐨 𝐝𝐢 𝐞𝐬𝐬𝐞𝐫𝐞 𝐬𝐦𝐮𝐭𝐚𝐭𝐢 😏'

    let utente = global.db.data.users[menzione]
    if (!utente) return m.reply('𝐔𝐭𝐞𝐧𝐭𝐞 𝐧𝐨𝐧 𝐭𝐫𝐨𝐯𝐚𝐭𝐨')

    if (utente.arrestoExpire && Date.now() < utente.arrestoExpire) {
      return m.reply('❌ Questo utente è attualmente in arresto e non può essere smutato con questo comando.')
    }

    if (utente.arrestoExpire && Date.now() >= utente.arrestoExpire) {
      utente.muto = false
      utente.arrestoExpire = null
    }

    utente.muto = false

    let prova = {
      key: { participants: "0@s.whatsapp.net", fromMe: false, id: "Halo" },
      message: {
        locationMessage: {
          name: '𝐔𝐓𝚵𝐍𝐓𝚵 𝐒𝐌𝐔𝐓𝚲𝐓Ꮻ 🔊',
          jpegThumbnail: await (await fetch('https://telegra.ph/file/aea704d0b242b8c41bf15.png')).buffer()
        }
      },
      participant: "0@s.whatsapp.net"
    }

    const rawText = (text || '').trim()
    const parts = rawText.split(/\s+/).filter(Boolean)
    let motivo = 'non specificato ma meritato'
    if (m.quoted) {
      if (rawText) motivo = rawText
    } else if (parts.length > 1) {
      const maybe = parts.slice(1).join(' ').trim()
      if (maybe) motivo = maybe
    } else if (parts.length === 1) {
      const tok = parts[0]
      if (!tok.includes('@') && !/^\+?\d+$/.test(tok)) motivo = tok
    }

    const targetJid = menzione && menzione.includes('@') ? menzione : (menzione ? menzione.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null)
    const actorJid = m.sender

    const finalText = `@${(targetJid||'').split('@')[0]} *smutato da* @${actorJid.split('@')[0]}.\n\n *motivo:* ${motivo}`

    await conn.sendMessage(m.chat, { text: finalText, mentions: [targetJid, actorJid] }, { quoted: prova })
    await logAdminAction(m.chat, m.sender, 'unmute')
  }
}

handler.command = /^(muta|smuta)$/i
handler.group = true
handler.botAdmin = true

export default handler