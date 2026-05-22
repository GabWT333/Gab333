//Plugin by Gab, Lucifero & 333 staff

const sessions = new Map()
const scheduledTasks = new Map()
let restored = false

const getNowRome = () => {
  const now = new Date()
  return new Date(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Rome',
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(now)
  )
}

const pad = (n) => String(n).padStart(2, '0')

const ensureDb = () => {
  if (!global?.db || !global.db.data) return false
  if (!global.db.data.scheduledRitarda) global.db.data.scheduledRitarda = []
  return true
}

const saveScheduled = (item) => {
  if (!ensureDb()) return
  const list = global.db.data.scheduledRitarda
  const index = list.findIndex(i => i.id === item.id)
  if (index !== -1) list[index] = item
  else list.push(item)
}

const removeScheduled = (id) => {
  if (!ensureDb()) return
  const list = global.db.data.scheduledRitarda
  global.db.data.scheduledRitarda = list.filter(i => i.id !== id)
}

const buildFooter = (sender) => {
  const username = sender.split('@')[0]
  return `\n\n*messaggio posticipato by @${username}*`
}

const scheduleTask = (task, conn) => {
  const delay = Math.max(0, task.due - Date.now())
  const sendTask = async () => {
    try {
      const mentionJids = [task.sender]
      await conn.sendMessage(task.chat, {
        text: `${task.message}${buildFooter(task.sender)}`,
        mentions: mentionJids,
        contextInfo: { mentionedJid: mentionJids }
      })
    } catch (e) {
      console.error('gp-ritarda errore invio:', e)
    } finally {
      removeScheduled(task.id)
      scheduledTasks.delete(task.id)
    }
  }

  const timeoutId = setTimeout(sendTask, delay)
  scheduledTasks.set(task.id, timeoutId)
}

const restorePendingSchedules = (conn) => {
  if (restored) return
  if (!conn || !ensureDb()) return

  const list = global.db.data.scheduledRitarda
  if (!Array.isArray(list) || !list.length) {
    restored = true
    return
  }

  for (const item of list) {
    if (!item || !item.id || !item.due || !item.chat || !item.sender || !item.message) continue
    if (scheduledTasks.has(item.id)) continue
    scheduleTask(item, conn)
  }

  restored = true
}

const restoreInterval = setInterval(() => {
  if (global.conn) {
    restorePendingSchedules(global.conn)
    if (restored) clearInterval(restoreInterval)
  }
}, 3000)

const parseTimeInput = (timeInput) => {
  if (!timeInput) return null
  timeInput = timeInput.trim().toLowerCase()

  const now = getNowRome()
  const result = {
    original: timeInput,
    delay: 0,
    when: ''
  }

  if (timeInput.includes(':')) {
    const [hoursStr, minutesStr] = timeInput.split(':')
    const hours = Number(hoursStr)
    const minutes = Number(minutesStr)

    if (
      Number.isNaN(hours) || Number.isNaN(minutes) ||
      hours < 0 || hours > 23 || minutes < 0 || minutes > 59
    ) return null

    const target = new Date(now)
    target.setHours(hours, minutes, 0, 0)
    if (target <= now) target.setDate(target.getDate() + 1)

    result.delay = target.getTime() - now.getTime()
    result.when = `${pad(hours)}:${pad(minutes)}`
    if (target.getDate() !== now.getDate()) result.when += ' (domani)'
    return result
  }

  const unit = timeInput.slice(-1)
  const amount = Number(timeInput.slice(0, -1))
  if (Number.isNaN(amount) || amount <= 0) return null

  if (unit === 's') result.delay = amount * 1000
  else if (unit === 'm') result.delay = amount * 60 * 1000
  else if (unit === 'h') result.delay = amount * 60 * 60 * 1000
  else return null

  result.when = `tra ${amount}${unit}`
  return result
}

const handler = async (m, { conn, args, isBotAdmin }) => {
  restorePendingSchedules(conn)

  if (!m.isGroup) {
    return conn.reply(m.chat, '❌ Questo comando funziona solo nei gruppi.', m)
  }

  if (!isBotAdmin) {
    return conn.reply(m.chat, '❌ Devo essere admin del gruppo per inviare messaggi con hidetag.', m)
  }

  const text = args.join(' ').trim()
  if (!text) {
    return conn.reply(m.chat,
`╔═✦ 𝐑𝐈𝐓𝐀𝐑𝐃𝐀𝐓𝐀𝐆 ✦═╗
┃ Uso: .ritardatag <messaggio>
┃ Esempio: .ritardatag messaggio casuale
╚═════════════════╝`, m)
  }

  const key = `${m.chat}|${m.sender}`
  sessions.set(key, {
    chat: m.chat,
    sender: m.sender,
    message: text,
    timestamp: Date.now()
  })

  return conn.sendMessage(m.chat, {
    text: `⏳ Messaggio salvato.
A che ora vuoi mandarlo?
Scrivi un orario come *18:30* oppure un ritardo come *10m*`,
  }, { quoted: m })
}

handler.before = async (m, { conn }) => {
  restorePendingSchedules(conn)

  if (!m.text) return
  if (m.fromMe) return

  const prefix = global.prefix || '.'
  const incoming = m.text.trim()
  if (
    (typeof prefix === 'string' && incoming.startsWith(prefix)) ||
    (prefix instanceof RegExp && prefix.test(incoming))
  ) return false

  const key = `${m.chat}|${m.sender}`
  const session = sessions.get(key)
  if (!session) return false

  const time = parseTimeInput(m.text.trim())
  if (!time) {
    await conn.sendMessage(m.chat, {
      text: '❌ Orario non valido. Scrivi un orario tipo *18:30* oppure un ritardo come *10m*.'
    }, { quoted: m })
    return true
  }

  sessions.delete(key)

  const scheduledAt = new Date(getNowRome().getTime() + time.delay)
  const formattedAt = `${pad(scheduledAt.getHours())}:${pad(scheduledAt.getMinutes())}` +
    ` ${pad(scheduledAt.getDate())}/${pad(scheduledAt.getMonth() + 1)}`

  const id = `${session.chat}-${session.sender}-${Date.now()}`
  const scheduled = {
    id,
    chat: session.chat,
    sender: session.sender,
    message: session.message,
    due: Date.now() + time.delay
  }

  saveScheduled(scheduled)
  scheduleTask(scheduled, conn)

  await conn.sendMessage(m.chat, {
    text: `✅ Messaggio posticipato a *${time.when}* (${formattedAt}).`
  }, { quoted: m })

  return true
}

handler.command = /^ritardatag$/i
handler.tags = ['gruppo']
handler.help = ['ritardatag <messaggio>']
handler.group = true
handler.admin = true
handler.botAdmin = true


export default handler
