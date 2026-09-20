//Plugin by Gab, Lucifero & 333 staff

const DAY_MS = 24 * 60 * 60 * 1000
const STATS_KEY = 'statsgiornaliere'
const TIMEZONE = 'Europe/Rome'

function getRomeDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).formatToParts(date)
  const map = Object.fromEntries(parts.map(p => [p.type, p.value]))
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    second: Number(map.second)
  }
}

function todayDate() {
  const { year, month, day } = getRomeDateParts()
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`
}

function getNextResetMs(now = new Date()) {
  const { year, month, day, hour, minute, second } = getRomeDateParts(now)
  const nowUtcMs = now.getTime()
  const currentRomeUtcMs = Date.UTC(year, month - 1, day, hour, minute, second)
  const romeOffsetMs = nowUtcMs - currentRomeUtcMs
  let nextMidnightUtcMs = Date.UTC(year, month - 1, day, 0, 0, 0) - romeOffsetMs
  if (nowUtcMs >= nextMidnightUtcMs) nextMidnightUtcMs += DAY_MS
  return nextMidnightUtcMs
}

function ensureStatsDb() {
  if (!global.db) global.db = { data: {} }
  if (!global.db.data) global.db.data = {}
  if (!global.db.data[STATS_KEY]) global.db.data[STATS_KEY] = { date: todayDate(), chats: {} }
  return global.db.data[STATS_KEY]
}

function loadDailyStats() {
  const stats = ensureStatsDb()
  const today = todayDate()
  if (stats.date !== today) {
    stats.date = today
    stats.chats = {}
    if (typeof global.markDbDirty === 'function') global.markDbDirty()
    console.log(`[statsgiornaliere] persisted state reset to ${today}`)
  }
  global.dailyStats = stats
  scheduleNextReset()
  return stats
}

function scheduleNextReset() {
  if (global._statsgiornaliere_scheduled) return
  const now = new Date()
  const nextMs = getNextResetMs(now)
  const ms = nextMs - now.getTime()
  global._statsgiornaliere_scheduled = true
  if (global._statsgiornaliere_timeout) clearTimeout(global._statsgiornaliere_timeout)
  global._statsgiornaliere_timeout = setTimeout(() => {
    global._statsgiornaliere_scheduled = false
    try {
      resetDailyStats()
    } catch (e) {
      console.error('resetDailyStats error', e)
    }
    scheduleNextReset()
  }, ms)
  console.log(`[statsgiornaliere] scheduled reset at Italy midnight in ${Math.round(ms / 1000)}s`)
}

function resetDailyStats() {
  const today = todayDate()
  const stats = ensureStatsDb()
  if (stats.date === today) {
    console.log('[statsgiornaliere] resetDailyStats skipped — already today:', today)
    return
  }
  console.log(`[statsgiornaliere] resetting daily stats from ${stats.date || 'none'} to ${today}`)
  stats.date = today
  stats.chats = {}
  if (typeof global.markDbDirty === 'function') global.markDbDirty()
  global.dailyStats = stats
  console.log('[statsgiornaliere] classifica giornaliera resettata')
}

loadDailyStats()
scheduleNextReset()

let handler = async (m, { conn, participants, groupMetadata, isAdmin }) => {
  try {
    const cmd = (m.text || '').trim().split(/\s+/)[0].replace(/^\./, '')
    if (!['statsgiornaliere','statsgiornaliera','statigiorno'].includes(cmd)) return

    if (!m.isGroup) return m.reply('❌ Questo comando funziona solo nei gruppi.');
    if (!global.dailyStats || global.dailyStats.date !== todayDate()) loadDailyStats()
    const chat = m.chat

    const gstats = global.dailyStats.chats[chat] || { total: 0, users: {} }

    const total = gstats.total || 0
    const usersObj = gstats.users || {}

    const entries = Object.entries(usersObj)
    entries.sort((a,b) => b[1] - a[1])

    const top3 = entries.slice(0,3)

    let topText = ''
    for (let i=0;i<3;i++) {
      const row = top3[i]
      if (!row) continue
      const [jid,count] = row
      const tag = `*@${jid.split('@')[0]}*`
      topText += `\n${i+1}. ${tag} — ${count} messaggi`
    }

    let prizesText = ''
    try {
      if (!global.db) global.db = { data: { users: {} } }
      if (!global.db.data) global.db.data = { users: {} }
      if (!global.db.data.users) global.db.data.users = {}
      const usersDb = global.db.data.users
      let prizesTextLocal = ''
      const cs = global.dailyStats.chats[chat] || { total: 0, users: {} }
      if (cs.awardedDate === todayDate()) {
        prizesText = '\nAncora nessuno, aggiudicati la top per avere 1000€!'
      } else {
        for (const row of top3) {
          const jid = row?.[0]
          if (!jid) continue
          try {
            if (!usersDb[jid]) usersDb[jid] = {}
            usersDb[jid].money = (usersDb[jid].money || 0) + 1000
            usersDb[jid].euro = (usersDb[jid].euro || 0) + 1000
            prizesTextLocal += `\n- *@${jid.split('@')[0]}* — +1000€`
          } catch (e) {
            console.error('Errore assegnazione premio a', jid, e)
          }
        }
        prizesText = prizesTextLocal || '\nNessun premio'
        cs.awardedDate = todayDate()
        global.dailyStats.chats[chat] = cs
      }
    } catch (e) {
      console.error('statsgiornaliere premio error', e)
      prizesText = '\nImpossibile assegnare premi (errore interno)'
    }

    const groups = []
    for (const [chatId, data] of Object.entries(global.dailyStats.chats || {})) {
      groups.push({ chatId, total: data.total || 0 })
    }
    groups.sort((a,b)=> b.total - a.total)
    const idx = groups.findIndex(g=> g.chatId === chat)
    let positionText = ''
    if (idx === -1) {
      positionText = 'Posizione: non classificato.'
    } else {
      const pos = idx + 1
      positionText = `*Posizione:* ${pos}/${groups.length}`
      if (pos > 1) {
        const above = groups[idx-1]
        const diff = (above.total || 0) - total
        let aboveName
        try { aboveName = await conn.getName(above.chatId) } catch (e) { aboveName = above.chatId.split('@')[0] }
        positionText += `\nGruppo sopra: *${aboveName}* — ${above.total} messaggi\nMancano: ${diff} messaggi per raggiungerli`
      } else {
        positionText += `\n*Sei in testa!*`
      }
    }

    let groupName = groupMetadata?.subject
    if (!groupName) {
      try { groupName = await conn.getName(chat) } catch (e) { groupName = chat.split('@')[0] }
    }
    const day = global.dailyStats.date || todayDate()

    const out = `*📊 STATISTICHE GIORNALIERE — ${groupName}*\n*Data:* ${day}\n\n*Messaggi totali oggi:* ${total}\n\n*Top 3 utenti:*${topText || '\nNessun messaggio registrato oggi.'}\n\n*Premi assegnati:*${prizesText || '\nNessun premio'}\n\n${positionText}\n\n> *Nota: la classifica viene resettata ogni giorno a 00:00 ora italiana.*`

    const mentions = top3.map(r=> r[0]).filter(Boolean)
    await conn.sendMessage(chat, { text: out, mentions })

    if (typeof global.markDbDirty === 'function') global.markDbDirty()

  } catch (e) {
    console.error('statsgiornaliere handler error', e)
    const msg = `❌ Errore nello script statsgiornaliere:\n${e && e.message ? e.message : String(e)}`
    try { await m.reply(msg) } catch (e2) { console.error('reply error', e2) }
  }
}

handler.before = async (m, { conn }) => {
  try {
    if (!m.isGroup) return
    if (!m.message) return
    if (m.fromMe) return

    const chat = m.chat
    if (!global.dailyStats) loadDailyStats()
    if (global.dailyStats.date !== todayDate()) {
      loadDailyStats()
    }
    if (!global.dailyStats.chats[chat]) global.dailyStats.chats[chat] = { total: 0, users: {} }
    const cs = global.dailyStats.chats[chat]
    cs.total = (cs.total || 0) + 1
    const who = m.sender
    cs.users[who] = (cs.users[who] || 0) + 1
  } catch (e) { console.error('statsgiornaliere before error', e) }
}

handler.help = ['statsgiornaliere']
handler.tags = ['group']
handler.command = ['statsgiornaliere','statsgiornaliera','statigiorno']
handler.group = true

export default handler
