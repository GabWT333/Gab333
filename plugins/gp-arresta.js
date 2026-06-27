//Plugin by Gab, Lucifero & 333 staff

import fs from 'fs'

global.scarceri = global.scarceri || {}
const CAUZIONE = 5000

let handler = async (m, { conn, isAdmin, command, text }) => {
  if (!isAdmin) return await conn.reply(m.chat, 'Solo un amministratore può usare il comando.', m)

  const commandName = command?.toLowerCase()

  if (commandName === 'confermascarcero') {
    const adminJid = m.sender
    let data = global.scarceri[adminJid]
    if (!data) return m.reply('❌ Nessuna richiesta di scarcero in corso')

    const targetJid = data.target
    const targetUser = global.db.data.users[targetJid]
    const adminUser = global.db.data.users[adminJid]

    if (!adminUser || (adminUser.money || 0) < CAUZIONE) {
      delete global.scarceri[adminJid]
      return m.reply(`❌ Servono almeno ${CAUZIONE} euro per scarcerare`)
    }

    adminUser.money -= CAUZIONE

    if (targetUser) {
      targetUser.muto = false
      targetUser.arrestoExpire = null
    }

    delete global.scarceri[adminJid]

    await conn.sendMessage(m.chat, {
      text: `✅ @${targetJid.split('@')[0]} *è stato scarcerato!* 💰 Hai pagato ${CAUZIONE}€ di cauzione.\n\nPuoi tornare a scrivere e usare comandi.`,
      mentions: [targetJid]
    }, { quoted: m })
    return
  }

  if (commandName === 'annullascarcero') {
    const adminJid = m.sender
    delete global.scarceri[adminJid]
    return m.reply('❌ Scarcero annullato')
  }

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

    let adminUser = global.db.data.users[m.sender]
    if (!adminUser) {
      adminUser = global.db.data.users[m.sender] = { exp: 0, euro: 0, muto: false, registered: false, money: 0 }
    }

    if ((adminUser.money || 0) < CAUZIONE) {
      return await conn.sendMessage(m.chat, {
        text: `❌ Non hai abbastanza soldi per scarcerare @${jailTarget.split('@')[0]}\n\n💰 Cauzione: ${CAUZIONE}€\n💵 Tuoi soldi: ${adminUser.money || 0}€`
      }, { quoted: m, mentions: [jailTarget] })
    }

    const adminJid = m.sender
    global.scarceri[adminJid] = { target: jailTarget }

    await conn.sendMessage(m.chat, {
      text: `❓ Sei sicuro di voler scarcerare @${jailTarget.split('@')[0]}?\n\n💰 Cauzione: ${CAUZIONE}€\n\nI tuoi soldi: ${adminUser.money || 0}€`,
      buttons: [
        { buttonId: '.confermascarcero', buttonText: { displayText: '✅ SI' }, type: 1 },
        { buttonId: '.annullascarcero', buttonText: { displayText: '❌ NO' }, type: 1 }
      ],
      headerType: 1,
      mentions: [jailTarget]
    }, { quoted: m })
  }
}

handler.command = /^(arresta|scarcera|confermascarcero|annullascarcero)$/i
handler.group = true
handler.admin = true
handler.fail = null

export default handler
