//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn, text }) => {

  let who

  if (m.mentionedJid && m.mentionedJid.length > 0) {
    who = m.mentionedJid[0]
  } else if (m.quoted) {
    who = m.quoted.sender
  } else if (text) {
    who = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  }

  if (!who) return m.reply('❌ Tagga, rispondi o scrivi un numero')

  global.db.data.users = global.db.data.users || {}
  global.db.data.users[who] = global.db.data.users[who] || {}
  global.db.data.users[who].banned = false
  global.db.data.users[who].notifiedBan = false

  let number = who.split('@')[0]
  let tag = '@' + number

  const fake = {
    key: {
      participants: '0@s.whatsapp.net',
      fromMe: false,
      id: '333UnbanUser'
    },
    message: {
      contactMessage: {
        displayName: `✅ 𝐒𝐛𝐚𝐧 𝐔𝐭𝐞𝐧𝐭𝐞`,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${number}:${number}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
      }
    },
    participant: '0@s.whatsapp.net'
  }

  await conn.sendMessage(m.chat, {
    text: `✅ *𝐔𝐓𝐄𝐍𝐓𝐄 𝐒𝐁𝐀𝐍𝐍𝐀𝐓𝐎*\n\n👤 ${tag}\n📞 wa.me/${number}`,
    mentions: [who]
  }, { quoted: fake })
}

handler.command = /^unbanuser$/i
handler.owner = true

export default handler