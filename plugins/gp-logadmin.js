//Plugin by Gab, Lucifero & 333 staff

const ACTION_LABELS = {
  accepts: 'Richieste approvate',
  removes: 'Espulsioni',
  promotes: 'Promozioni',
  demotes: 'Retrocessioni',
  open: 'Aperture gruppo',
  close: 'Chiusure gruppo',
  restrict: 'Info admin-only',
  unrestrict: 'Info liberi',
}

const defaultActionCounts = () => ({
  accepts: 0,
  removes: 0,
  promotes: 0,
  demotes: 0,
  open: 0,
  close: 0,
  restrict: 0,
  unrestrict: 0,
  commands: 0,
})

global.logAdminQueue = global.logAdminQueue || []

const getItalianDateKey = (date = new Date()) => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Rome',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

const formatItalianDate = (date = new Date()) => {
  return new Intl.DateTimeFormat('it-IT', {
    timeZone: 'Europe/Rome',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

const ensureDb = async () => {
  if (global.db && !global.db.data && typeof global.loadDatabase === 'function') {
    await global.loadDatabase()
  }
}

const ensureChatLog = async (chatId) => {
  await ensureDb()
  if (!global.db?.data) return null
  if (!global.db.data.chats) global.db.data.chats = {}
  if (!global.db.data.chats[chatId]) global.db.data.chats[chatId] = {}
  const chat = global.db.data.chats[chatId]
  if (!chat.adminLogs) chat.adminLogs = {}
  return chat
}

const incrementAdminAction = async (chatId, adminJid, actionKey, amount = 1) => {
  if (!chatId || !adminJid || !actionKey) return
  const chat = await ensureChatLog(chatId)
  if (!chat) return

  const dayKey = getItalianDateKey()
  if (!chat.adminLogs[dayKey]) chat.adminLogs[dayKey] = {}
  if (!chat.adminLogs[dayKey][adminJid]) chat.adminLogs[dayKey][adminJid] = defaultActionCounts()
  chat.adminLogs[dayKey][adminJid][actionKey] += amount
}

global.logAdmin = global.logAdmin || {}
global.logAdmin.increment = global.logAdmin.increment || incrementAdminAction

const processLogAdminQueue = async () => {
  if (!Array.isArray(global.logAdminQueue) || !global.logAdminQueue.length) return
  const queue = [...global.logAdminQueue]
  global.logAdminQueue = []
  for (const item of queue) {
    try {
      if (!item || !item.chatId || !item.adminJid || !item.actionKey) continue
      await incrementAdminAction(item.chatId, item.adminJid, item.actionKey, item.amount ?? 1)
    } catch (e) {}
  }
}

processLogAdminQueue()

const formatAdminSummary = async (conn, chatId, dayKey) => {
  await ensureDb()
  if (!global.db?.data || !global.db.data.chats?.[chatId] || !global.db.data.chats[chatId].adminLogs) return null
  const dailyLog = global.db.data.chats[chatId].adminLogs[dayKey]
  if (!dailyLog) return null

  const rows = []
  const mentions = []
  const entries = Object.entries(dailyLog)
  if (!entries.length) return null

  const adminInfos = await Promise.all(entries.map(async ([jid, counts]) => {
    let name = jid.split('@')[0]
    try {
      if (conn && typeof conn.getName === 'function') {
        const resolved = await conn.getName(jid)
        if (resolved) name = resolved
      }
    } catch (e) {
    }
    const total = Object.values(counts).reduce((sum, value) => sum + (Number(value) || 0), 0)
    return { jid, name, counts, total }
  }))

  adminInfos.sort((a, b) => b.total - a.total)

  for (const admin of adminInfos) {
    if (admin.total === 0) continue
    mentions.push(admin.jid)
    const lines = Object.entries(admin.counts)
      .filter(([key, value]) => key !== 'commands' && value > 0)
      .map(([key, value]) => `• ${ACTION_LABELS[key] || key}: ${value}`)
      .join('\n')
    const totalCommands = admin.counts.commands || 0

    rows.push(`👤 @${admin.jid.split('@')[0]}\n${lines}${lines ? '\n' : ''}• Totale comandi effettuati: ${totalCommands}`)
  }

  if (!rows.length) return null

  const displayDate = formatItalianDate(new Date(dayKey))
  return {
    text: `📊 *Riepilogo amministrazione di oggi* (${displayDate})\n\n${rows.join('\n\n')}\n\n` +
      `*⏱️ A 00:00 si ripristinano le statistiche*\n`,
    mentions
  }
}

const attachListeners = () => {
  const conn = global.conn
  if (!conn?.ev?.on) return false
  if (global.logAdminListenerInitialized) return true

  conn.ev.on('group-participants.update', async (update) => {
    try {
      const { id, action, participants, author, actor } = update
      const chatId = conn.decodeJid ? conn.decodeJid(id) : id
      if (!chatId || !chatId.endsWith('@g.us')) return

      const botJid = conn.user && (conn.user.jid || conn.user.id)
        ? (conn.decodeJid ? conn.decodeJid(conn.user.jid || conn.user.id) : conn.user.jid || conn.user.id)
        : null
      const admin = conn.decodeJid ? conn.decodeJid(actor || author) : (actor || author)
      if (!admin) return
      if (botJid && admin === botJid) return

      const count = Array.isArray(participants) ? participants.length : 1
      switch (action) {
        case 'add':
          await incrementAdminAction(chatId, admin, 'accepts', count)
          break
        case 'remove':
          await incrementAdminAction(chatId, admin, 'removes', count)
          break
        case 'promote':
          await incrementAdminAction(chatId, admin, 'promotes', count)
          break
        case 'demote':
          await incrementAdminAction(chatId, admin, 'demotes', count)
          break
      }
    } catch (e) {
      console.error('[logadmin] group-participants.update error', e)
    }
  })

  conn.ev.on('groups.update', async (updates) => {
    try {
      for (const update of updates) {
        if (!update || !update.id) continue
        const chatId = conn.decodeJid ? conn.decodeJid(update.id) : update.id
        if (!chatId || !chatId.endsWith('@g.us')) continue
        const botJid = conn.user && (conn.user.jid || conn.user.id)
          ? (conn.decodeJid ? conn.decodeJid(conn.user.jid || conn.user.id) : conn.user.jid || conn.user.id)
          : null
        const admin = conn.decodeJid ? conn.decodeJid(update.author) : update.author
        if (!admin || (botJid && admin === botJid)) continue

        if (update.announce !== undefined) {
          await incrementAdminAction(chatId, admin, update.announce ? 'close' : 'open')
        }
        if (update.restrict !== undefined) {
          await incrementAdminAction(chatId, admin, update.restrict ? 'restrict' : 'unrestrict')
        }
      }
    } catch (e) {
      console.error('[logadmin] groups.update error', e)
    }
  })

  global.logAdminListenerInitialized = true
  return true
}

const initPlugin = () => {
  if (attachListeners()) return
  let attempts = 0
  const maxAttempts = 10
  const interval = setInterval(() => {
    attempts++
    if (attachListeners()) {
      clearInterval(interval)
    } else if (attempts >= maxAttempts) {
      clearInterval(interval)
      console.warn('[logadmin] Listener attachment failed after', maxAttempts, 'attempts')
    }
  }, 1000)
}

initPlugin()

const handler = async (m, { conn, args }) => {
  if (!m.isGroup) return m.reply('❌ Questo comando funziona solo nei gruppi.')

  const todayKey = getItalianDateKey()
  const todayDisplay = formatItalianDate(new Date(todayKey))
  const result = await formatAdminSummary(conn, m.chat, todayKey)
  if (!result) {
    return m.reply(`✅ Nessuna azione amministrativa registrata per oggi (${todayDisplay}) in questo gruppo.`)
  }

  await conn.sendMessage(m.chat, {
    text: result.text,
    mentions: result.mentions
  }, { quoted: m })
}

handler.help = ['logadmin']
handler.tags = ['admin']
handler.command = /^(logadmin)$/i
handler.group = true
handler.admin = true

export default handler
