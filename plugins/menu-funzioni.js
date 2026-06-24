//Codice di menu-funzioni.js

//Plugin by Gab, Lucifero & 333 staff

import fs from 'fs'

let handler = async (m, { conn, usedPrefix, isOwner, isROwner }) => {
  const userName = m.pushName || 'Utente'
  const userNumber = m.sender.split('@')[0]

  const chat = global.db.data.chats[m.chat] || {}
  const bot = global.db.data.settings[conn.user.jid] || {}

  const {
    rileva, jadibotmd, welcome, goodbye, modoadmin, antiporno,
    antivoip, antitrava, antiArab, antiLink, antilinkig, antilinktiktok,
    antilinktg, antimedia, antispam, antitoxic, antiBot, antioneview,
    antigore, antibusiness, reaction, bestemmiometro, ai, vocali, logrichieste,
    slowmode
  } = chat

  const { antiprivato, soloCreatore, read, anticall } = bot

  const imgBuffer = fs.readFileSync('icone/333.jpg')

  const fake = {
    key: {
      participants: '0@s.whatsapp.net',
      fromMe: false,
      id: '333Funzioni'
    },
    message: {
      locationMessage: {
        name: '⚙️ 𝐌𝐞𝐧𝐮 𝐅𝐮𝐧𝐳𝐢𝐨𝐧𝐢 𝟑𝟑𝟑 𝐁𝐨𝐭',
        jpegThumbnail: imgBuffer.toString('base64'),
        vcard: 'BEGIN:VCARD\nVERSION:3.0\nN:;333;;;\nFN:333\nEND:VCARD'
      }
    },
    participant: '0@s.whatsapp.net'
  }

  const s = (val) => val ? '✅' : '❌'
  const p = usedPrefix

  const catalogs = `┃━━━━━━━━━━━━━━
┃ 📦 𝐂𝐀𝐓𝐀𝐋𝐎𝐆𝐇𝐈 𝐑𝐀𝐏𝐈𝐃𝐈
┃━━━━━━━━━━━━━━
┃ 🔒 ${p}attiva security
┃    antilink + antiporno + modoadmin
┃ 🛡️ ${p}attiva protezione
┃    antispam + antitoxic + antibot
┃    antivoip 
┃ 🎬 ${p}attiva media
┃    antimedia + antiporno + antigore
┃ 🔗 ${p}attiva antilink
┃    antilink + tg + ig + tiktok
┃ 💣 ${p}attiva full
┃    attiva tutto quanto sopra`

  const ownerSection = (isOwner || isROwner) ? `
┃━━━━━━━━━━━━━━
┃ 👑 𝐅𝐔𝐍𝐙𝐈𝐎𝐍𝐈 𝐎𝐖𝐍𝐄𝐑
┃━━━━━━━━━━━━━━
┃${s(antiprivato)} ⮕ ${p}antiprivato
┃${s(soloCreatore)} ⮕ ${p}solocreatore
┃${s(read)} ⮕ ${p}lettura
┃${s(anticall)} ⮕ ${p}anticall
┃━━━━━━━━━━━━━━
┃ 👤 Richiesto da: *${userName}*
┃ 📱 Numero: *+${userNumber}*` : ''

  const menuFunzioniText =
`╭─────────╮
┃ ⚙️ 𝐌𝐄𝐍𝐔 𝐅𝐔𝐍𝐙𝐈𝐎𝐍𝐈 𝐃𝐈
┃ ꙰  𝟥𝟥𝟥 𝔹𝕆𝕋  ꙰
┃━━━━━━━━━━━━━━
┃ 🔧 𝐅𝐔𝐍𝐙𝐈𝐎𝐍𝐈 𝐆𝐑𝐔𝐏𝐏𝐎
┃━━━━━━━━━━━━━━
┃${s(welcome)} ⮕ ${p}benvenuto
┃${s(goodbye)} ⮕ ${p}addio
┃${s(modoadmin)} ⮕ ${p}modoadmin
┃${s(slowmode)} ⮕ ${p}slowmode
┃${s(bestemmiometro)} ⮕ ${p}bestemmiometro
┃${s(logrichieste)} ⮕ ${p}logrichieste
┃━━━━━━━━━━━━━━
┃ 🚫 𝐀𝐍𝐓𝐈
┃━━━━━━━━━━━━━━
┃${s(antiporno)} ⮕ ${p}antiporno
┃${s(antigore)} ⮕ ${p}antigore
┃${s(antispam)} ⮕ ${p}antispam
┃${s(antitrava)} ⮕ ${p}antitrava
┃${s(antiBot)} ⮕ ${p}antibot
┃${s(antibusiness)} ⮕ ${p}antibusiness
┃${s(antivoip)} ⮕ ${p}antivoip
┃${s(antimedia)} ⮕ ${p}antimedia
┃${s(antiLink)} ⮕ ${p}antilink
┃${s(antilinkig)} ⮕ ${p}antilinkig
┃${s(antilinktiktok)} ⮕ ${p}antilinktiktok
┃${s(antilinktg)} ⮕ ${p}antilinktg
${catalogs}${ownerSection}
┃━━━━━━━━━━━━━━
┃ ✅ = Attivo  ❌ = Disattivo
┃━━━━━━━━━━━━━━
┃ ℹ️ 𝐔𝐒𝐎
┃ ${p}attiva antilink
┃ ${p}disabilita antilink
╰─────────╯`.trim()

  await conn.sendMessage(m.chat, {
    text: menuFunzioniText
  }, { quoted: fake })
}

handler.help = ['funzioni']
handler.tags = ['menu']
handler.command = /^(funzioni)$/i

export default handler