//Plugin by Gab, Lucifero & 333 staff

global.groupStatusTimeouts = global.groupStatusTimeouts || {}

const clearGroupStatusTimeout = (chatId) => {
  if (global.groupStatusTimeouts[chatId]) {
    clearTimeout(global.groupStatusTimeouts[chatId])
    delete global.groupStatusTimeouts[chatId]
  }
}

const scheduleGroupStatusExpiry = (conn, chatId, durationMs, targetStatus) => {
  clearGroupStatusTimeout(chatId)
  if (durationMs <= 0) return

  global.groupStatusTimeouts[chatId] = setTimeout(async () => {
    const currentChat = global.db?.data?.chats?.[chatId]
    if (currentChat?.statusExpiresAt && Date.now() >= currentChat.statusExpiresAt) {
      const newSetting = targetStatus === 'not_announcement' ? 'announcement' : 'not_announcement'
      await conn.groupSettingUpdate(chatId, newSetting).catch(() => {})
      delete currentChat.statusExpiresAt
      delete global.groupStatusTimeouts[chatId]
      const statusText = newSetting === 'not_announcement' ? 'aperto' : 'chiuso'
      await conn.sendMessage(chatId, {
        text: `ℹ️ *Il gruppo è tornato ${statusText} automaticamente.*`
      }).catch(() => {})
    } else {
      delete global.groupStatusTimeouts[chatId]
    }
  }, durationMs)
}

const waitForStatusChoice = (conn, sender, timeout = 60000) => new Promise(resolve => {
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

const waitForTime = (conn, sender, timeout = 60000) => new Promise(resolve => {
  const listener = async ({ messages }) => {
    const msg = messages?.[0]
    if (!msg?.message) return
    const from = msg.key?.participant || msg.key?.remoteJid
    if (from !== sender) return
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text
    if (!text) return
    conn.ev.off('messages.upsert', listener)
    resolve(text.trim())
  }
  conn.ev.on('messages.upsert', listener)
  setTimeout(() => {
    conn.ev.off('messages.upsert', listener)
    resolve(null)
  }, timeout)
})

const getItalianTime = () => {
  const now = new Date()
  return new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Rome' }))
}

const getMillisUntilTime = (hours, minutes) => {
  const ital = getItalianTime()
  let target = new Date(ital)
  target.setHours(hours, minutes, 0, 0)
  
  if (target <= ital) {
    target.setDate(target.getDate() + 1)
  }
  
  return target - ital
}

const durationOptions = [
  { id: '1m', label: '1 minuto', ms: 60 * 1000 },
  { id: '5m', label: '5 minuti', ms: 5 * 60 * 1000 },
  { id: '10m', label: '10 minuti', ms: 10 * 60 * 1000 },
  { id: '30m', label: '30 minuti', ms: 30 * 60 * 1000 },
  { id: '1h', label: '1 ora', ms: 60 * 60 * 1000 },
  { id: 'perm', label: 'Finchè non viene sbloccato', ms: 0 }
]

let handler = async (m, { conn, args }) => {
  await conn.sendMessage(m.chat, {
    text: `*⏱️ Per quanto tempo vuoi mantenere il gruppo chiuso?*`,
    buttons: [
      ...durationOptions.map(option => ({
        buttonId: `chiuso_duration_${option.id}`,
        buttonText: { displayText: option.label },
        type: 1
      })),
      {
        buttonId: 'chiuso_duration_custom',
        buttonText: { displayText: '🕐 Scegli orario' },
        type: 1
      }
    ],
    headerType: 1
  }, { quoted: m })

  const selected = await waitForStatusChoice(conn, m.sender)
  if (!selected) return m.reply('⏳ Tempo scaduto, comando annullato.')

  let durationMs = 0
  let durationText = ''
  
  if (selected === 'chiuso_duration_custom') {
    await m.reply('🕐 *Scrivi l\'orario in cui aprire il gruppo. Esempio: 22:30*')
    const timeInput = await waitForTime(conn, m.sender, 120000)
    
    if (!timeInput) return m.reply('⏳ Tempo scaduto.')
    
    const timeParts = timeInput.split(':')
    if (timeParts.length !== 2) return m.reply('❌ Formato non valido. Usa HH:mm (esempio: 22:30)')
    
    const hours = parseInt(timeParts[0])
    const minutes = parseInt(timeParts[1])
    
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return m.reply('❌ Orario non valido. Usa un orario tra 00:00 e 23:59')
    }
    
    durationMs = getMillisUntilTime(hours, minutes)
    const italianTime = getItalianTime()
    const targetTime = new Date(italianTime.getTime() + durationMs)
    durationText = `, verrà riaperto alle ${String(targetTime.getHours()).padStart(2, '0')}:${String(targetTime.getMinutes()).padStart(2, '0')}`
  } else {
    const selectedDuration = durationOptions.find(option => `chiuso_duration_${option.id}` === selected)
    if (!selectedDuration) return m.reply('❌ Scelta non valida.')
    durationMs = selectedDuration.ms
    durationText = `per ${selectedDuration.label}`
  }

  let setting = { "": "announcement" }[args[0] || ""]
  if (setting === undefined) return
  await conn.groupSettingUpdate(m.chat, setting)
  global.logAdmin?.increment?.(m.chat, m.sender, 'close')
  
  const chat = global.db.data.chats[m.chat] || {}
  if (durationMs > 0) {
    chat.statusExpiresAt = Date.now() + durationMs
    scheduleGroupStatusExpiry(conn, m.chat, durationMs, setting)
  } else {
    clearGroupStatusTimeout(m.chat)
    delete chat.statusExpiresAt
  }
  global.db.data.chats[m.chat] = chat
  
  conn.reply(m.chat, `𝐡𝐨 𝐜𝐡𝐢𝐮𝐬𝐨 𝐢𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 𝐜𝐨𝐧 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐨 ${durationText}! 𝐜𝐡𝐚𝐭 𝐚𝐩𝐞𝐫𝐭𝐚 𝐬𝐨𝐥𝐨 𝐩𝐞𝐫 𝐚𝐝𝐦𝐢𝐧\n\n> 𝐝𝐢𝐠𝐢𝐭𝐚 ''.𝐚𝐩𝐫𝐢'' 𝐩𝐞𝐫 𝐚𝐩𝐫𝐢𝐫𝐞 𝐥𝐚 𝐜𝐡𝐚𝐭 𝐚𝐢 𝐦𝐞𝐦𝐛𝐫𝐢.`)
}

handler.help = ["𝐜𝐡𝐢𝐮𝐝𝐢/𝐜𝐡𝐢𝐮𝐬𝐨"]
handler.tags = ["admin"]
handler.command = /^(chiuso|chiudi)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler