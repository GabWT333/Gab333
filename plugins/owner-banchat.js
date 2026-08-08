//Plugin by Gab, Lucifero & 333 staff

global.banTimeouts = global.banTimeouts || {}

const clearBanTimeout = (chatId) => {
  if (global.banTimeouts[chatId]) {
    clearTimeout(global.banTimeouts[chatId])
    delete global.banTimeouts[chatId]
  }
}

const scheduleBanExpiry = (conn, chatId, durationMs) => {
  clearBanTimeout(chatId)
  if (durationMs <= 0) return

  global.banTimeouts[chatId] = setTimeout(async () => {
    const currentChat = global.db?.data?.chats?.[chatId]
    if (currentChat?.isBanned && currentChat.banExpiresAt && Date.now() >= currentChat.banExpiresAt) {
      currentChat.isBanned = false
      delete currentChat.banExpiresAt
      delete global.banTimeouts[chatId]
      await conn.sendMessage(chatId, {
        text: `✅ *Il bot è stato riattivato in questa chat.*`
      }).catch(() => {})
    } else {
      delete global.banTimeouts[chatId]
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

let handler = async (m, { conn }) => {
  const chat = global.db.data.chats[m.chat] || {}

  if (chat.isBanned && chat.banExpiresAt && Date.now() >= chat.banExpiresAt) {
    chat.isBanned = false
    chat.banExpiresAt = null
    global.db.data.chats[m.chat] = chat
  }

  if (chat.isBanned) {
    return conn.sendMessage(m.chat, {
      text: `⚠️ *CHAT GIÀ BLOCCATA*

Il bot è già disattivato in questo gruppo.`
    }, { quoted: m })
  }

  await conn.sendMessage(m.chat, {
    text: `*⏱️ Per quanto tempo bannare la chat?*`,
    buttons: banDurations.map(option => ({
      buttonId: `ban_duration_${option.id}`,
      buttonText: { displayText: option.label },
      type: 1
    })),
    headerType: 1
  }, { quoted: m })

  const selected = await waitForBanChoice(conn, m.sender)
  if (!selected) return m.reply('⏳ Tempo scaduto, ban annullato.')

  const selectedDuration = banDurations.find(option => `ban_duration_${option.id}` === selected)
  if (!selectedDuration) return m.reply('❌ Scelta non valida.')

  chat.isBanned = true
  if (selectedDuration.ms > 0) {
    chat.banExpiresAt = Date.now() + selectedDuration.ms
    scheduleBanExpiry(conn, m.chat, selectedDuration.ms)
  } else {
    clearBanTimeout(m.chat)
    delete chat.banExpiresAt
  }
  global.db.data.chats[m.chat] = chat

  const durationText = selectedDuration.ms > 0 ? `per ${selectedDuration.label}` : 'finchè non viene sbannato'

  await conn.sendMessage(m.chat, {
    text: `╭─────────────╮
│ 🚫 *BANCHAT ATTIVATO*
│
│ Il bot è stato disattivato
│ in questo gruppo ${durationText}.
│
│ 📵 Nessun comando verrà eseguito
│ durante questo periodo.
│
│ 👑 Azione eseguita da:
│ @${m.sender.split('@')[0]}
╰─────────────╯`,
    mentions: [m.sender]
  }, { quoted: m })
}

handler.command = ['banchat']
handler.owner = true
handler.group = true

export default handler