//Plugin by Gab, Lucifero & 333 staff

import fs from 'fs'

let handler = async (m, { conn, isAdmin, command, text }) => {
  if (!isAdmin) return await conn.reply(m.chat, 'Solo un amministratore può usare il comando.', m)

  const who = m.mentionedJid?.[0] || m.quoted?.sender || text?.split(/\s+/)?.[0]
  if (!who) return await conn.reply(m.chat, 'Menziona la persona da arrestare o da scarcerare.', m)

  const normalizeJid = (input) => {
    if (!input) return null
    input = input.trim()
    if (input.startsWith('@')) input = input.slice(1)
    if (input.includes('@')) {
      if (input.endsWith('@s.whatsapp.net') || input.endsWith('@c.us')) return input
      return `${input.split('@')[0]}@s.whatsapp.net`
    }
    const digits = input.replace(/[^0-9]/g, '')
    return digits ? `${digits}@s.whatsapp.net` : null
  }

  const jailTarget = normalizeJid(who)
  if (!jailTarget) return await conn.reply(m.chat, 'Menziona un utente valido.', m)
  if (jailTarget === conn.user.jid) return await conn.reply(m.chat, 'Non puoi usare il comando su se stesso.', m)

  const isOwner = (jid) => global.owner.some(([number]) => jid.includes(number))
  if (isOwner(jailTarget)) return await conn.reply(m.chat, 'Impossibile usare questo comando su un owner.', m)

  let user = global.db.data.users[jailTarget]
  if (!user) user = global.db.data.users[jailTarget] = { exp: 0, euro: 0, muto: false, registered: false, arrestoExpire: null }
  if (user.muto && user.arrestoExpire && Date.now() >= user.arrestoExpire) {
    user.muto = false
    user.arrestoExpire = null
  }

  const commandName = command?.toLowerCase()
  if (commandName === 'arresta') {
    if (user.muto) return await conn.reply(m.chat, 'Questo utente è già in arresto.', m)

    const iconPath = './icone/arrestato.png'
    if (!fs.existsSync(iconPath)) return await conn.reply(m.chat, 'Immagine arresto non trovata. Aggiungi `icone/arrestato.png` e riprova.', m)

    let buffer
    try {
      buffer = fs.readFileSync(iconPath)
    } catch (e) {
      console.error(e)
      return await conn.reply(m.chat, 'Errore durante il caricamento dell\'icona arresto. Riprova.', m)
    }

    const minutes = 5
    const durationMs = minutes * 60 * 1000
    user.muto = true
    user.arrestoExpire = Date.now() + durationMs

    await conn.sendMessage(m.chat, {
      image: buffer,
      caption: `@${jailTarget.split('@')[0]} *sei stato arrestato per 5 minuti. Non potrai parlare né usare comandi fino al termine della pena.*\n> *Se vuoi scarcerare prima, usa il comando ''.scarcera''*`,
      mentions: [jailTarget]
    }, { quoted: m })

    setTimeout(async () => {
      const currentUser = global.db.data.users[jailTarget]
      if (currentUser?.muto && currentUser.arrestoExpire && Date.now() >= currentUser.arrestoExpire) {
        currentUser.muto = false
        currentUser.arrestoExpire = null
        await conn.sendMessage(m.chat, {
          text: `✅ @${jailTarget.split('@')[0]} *ha scontato la pena. Puoi tornare a scrivere e usare comandi.*`,
          mentions: [jailTarget]
        })
      }
    }, durationMs)
  } else if (commandName === 'scarcera') {
    if (!user.muto) return await conn.reply(m.chat, 'Questo utente non è attualmente in arresto.', m)

    user.muto = false
    user.arrestoExpire = null
    await conn.sendMessage(m.chat, {
      text: `✅ @${jailTarget.split('@')[0]} *è stato scarcerato immediatamente. Puoi tornare a scrivere e usare comandi.*`,
      mentions: [jailTarget]
    }, { quoted: m })
  }
}

handler.command = /^(arresta|scarcera)$/i
handler.group = true
handler.admin = true
handler.fail = null

export default handler
