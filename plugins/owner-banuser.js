//Plugin by Gab, Lucifero & 333 staff

import fetch from "node-fetch"

global.userBanTimeouts = global.userBanTimeouts || {}

const clearUserBanTimeout = (userId) => {
  if (global.userBanTimeouts[userId]) {
    clearTimeout(global.userBanTimeouts[userId])
    delete global.userBanTimeouts[userId]
  }
}

const scheduleUserBanExpiry = (conn, userId, durationMs, chatId) => {
  clearUserBanTimeout(userId)
  if (durationMs <= 0) return

  global.userBanTimeouts[userId] = setTimeout(async () => {
    const currentUser = global.db?.data?.users?.[userId]
    if (currentUser?.banned && currentUser.banExpiresAt && Date.now() >= currentUser.banExpiresAt) {
      currentUser.banned = false
      delete currentUser.banExpiresAt
      delete global.userBanTimeouts[userId]
      console.log(`[Ban Expiry] Utente ${userId} sbannato automaticamente`)
      
      if (chatId) {
        await conn.sendMessage(chatId, {
          text: `✅ @${userId.split('@')[0]} *non è più bannato e può usare il bot.*`,
          mentions: [userId]
        }).catch(() => {})
      }
    } else {
      delete global.userBanTimeouts[userId]
    }
  }, durationMs)
}

const waitForBanChoice = (conn, sender, timeout = 60000) => new Promise(resolve => {
  const listener = async ({ messages }) => {
    const msg = messages?.[0]
    if (!msg?.message) return
    const from = msg.key?.participant || msg.key?.remoteJid
    if (from !== sender) return
    const selectedButtonId = msg.message?.buttonsResponseMessage?.selectedButtonId
    if (!selectedButtonId) return
    conn.ev.off('messages.upsert', listener)
    resolve(selectedButtonId)
  }

  conn.ev.on('messages.upsert', listener)
  setTimeout(() => {
    conn.ev.off('messages.upsert', listener)
    resolve(null)
  }, timeout)
})

const banDurations = [
  { id: '1m', label: '1 minuto', ms: 60 * 1000 },
  { id: '5m', label: '5 minuti', ms: 5 * 60 * 1000 },
  { id: '10m', label: '10 minuti', ms: 10 * 60 * 1000 },
  { id: '30m', label: '30 minuti', ms: 30 * 60 * 1000 },
  { id: '1h', label: '1 ora', ms: 60 * 60 * 1000 },
  { id: 'perm', label: 'Finchè non viene sbannato', ms: 0 }
]

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

  let number = who.split('@')[0]
  let tag = '@' + number

  const fake = {
    key: {
      participants: '0@s.whatsapp.net',
      fromMe: false,
      id: '333BanUser'
    },
    message: {
      contactMessage: {
        displayName: `⏱️ 𝐃𝐮𝐫𝐚𝐭𝐚 𝐁𝐚𝐧`,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${number}:${number}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
      }
    },
    participant: '0@s.whatsapp.net'
  }

  await conn.sendMessage(m.chat, {
    text: `*⏱️ Per quanto tempo bannare ${tag}?*`,
    buttons: banDurations.map(option => ({
      buttonId: `banuser_duration_${option.id}`,
      buttonText: { displayText: option.label },
      type: 1
    })),
    headerType: 1
  }, { quoted: fake })

  const selected = await waitForBanChoice(conn, m.sender)
  if (!selected) return m.reply('⏳ Tempo scaduto, ban annullato.')

  const selectedDuration = banDurations.find(option => `banuser_duration_${option.id}` === selected)
  if (!selectedDuration) return m.reply('❌ Scelta non valida.')

  global.db.data.users[who].banned = true
  if (selectedDuration.ms > 0) {
    global.db.data.users[who].banExpiresAt = Date.now() + selectedDuration.ms
    scheduleUserBanExpiry(conn, who, selectedDuration.ms, m.chat)
  } else {
    clearUserBanTimeout(who)
    delete global.db.data.users[who].banExpiresAt
  }

  const durationText = selectedDuration.ms > 0 ? `per ${selectedDuration.label}` : 'finchè non viene sbannato'

  await conn.sendMessage(m.chat, {
    text: `🚫 *𝐔𝐓𝐄𝐍𝐓𝐄 𝐁𝐀𝐍𝐍𝐀𝐓𝐎*\n\n👤 ${tag}\n📞 wa.me/${number}\n⏱️ ${durationText}`,
    mentions: [who]
  }, { quoted: fake })
}

handler.command = /^banuser$/i
handler.owner = true

export default handler