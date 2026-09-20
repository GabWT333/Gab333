//Plugin by Gab, Lucifero & 333 staff


const FOOTBALL_API_KEY = "a906e1a601624a628eb189ffe0b9a438"
const COMPETITIONS = ["SA", "PL", "PD", "BL1", "FL1", "CL"]

const venueCache = {}

async function fetchVenue(teamId) {
  if (venueCache[teamId] !== undefined) return venueCache[teamId]
  try {
    const res = await fetch(`https://api.football-data.org/v4/teams/${teamId}`, {
      headers: { "X-Auth-Token": FOOTBALL_API_KEY }
    })
    const data = await res.json()
    const venue = data.venue || null
    venueCache[teamId] = venue
    return venue
  } catch (e) {
    venueCache[teamId] = null
    return null
  }
}

async function fetchMatchesByDate(dateFrom, dateTo) {
  let allMatches = []
  for (let comp of COMPETITIONS) {
    try {
      const res = await fetch(`https://api.football-data.org/v4/competitions/${comp}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`, {
        headers: { "X-Auth-Token": FOOTBALL_API_KEY }
      })
      const data = await res.json()
      if (data.matches) allMatches.push(...data.matches)
    } catch (e) {}
  }
  return allMatches
}

function getStatusEmoji(status) {
  if (status === "IN_PLAY" || status === "PAUSED") return "🔴 LIVE"
  if (status === "FINISHED") return "✅ FINITA"
  if (status === "TIMED" || status === "SCHEDULED") return "🕐"
  return "⚽"
}

function parseCustomDate(argsFull) {
  const mesiIT = {
    gennaio: "01", febbraio: "02", marzo: "03", aprile: "04",
    maggio: "05", giugno: "06", luglio: "07", agosto: "08",
    settembre: "09", ottobre: "10", novembre: "11", dicembre: "12"
  }

  const joined = argsFull.join(" ").toLowerCase().trim()

  const matchIT = joined.match(/^(\d{1,2})\s+([a-z]+)\s+(\d{4})$/)
  if (matchIT) {
    const day = matchIT[1].padStart(2, "0")
    const month = mesiIT[matchIT[2]]
    const year = matchIT[3]
    if (month) {
      const iso = `${year}-${month}-${day}`
      return { from: iso, to: iso, label: `📅 ${matchIT[1]} ${matchIT[2].charAt(0).toUpperCase() + matchIT[2].slice(1)} ${year}` }
    }
  }

  const matchSlash = joined.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
  if (matchSlash) {
    const day = matchSlash[1].padStart(2, "0")
    const month = matchSlash[2].padStart(2, "0")
    const year = matchSlash[3]
    const iso = `${year}-${month}-${day}`
    return { from: iso, to: iso, label: `📅 ${day}/${month}/${year}` }
  }

  const matchRange = joined.match(/^dal\s+(\d{1,2})\s+al\s+(\d{1,2})\s+([a-z]+)\s+(\d{4})$/)
  if (matchRange) {
    const dayFrom = matchRange[1].padStart(2, "0")
    const dayTo = matchRange[2].padStart(2, "0")
    const month = mesiIT[matchRange[3]]
    const year = matchRange[4]
    if (month) {
      return {
        from: `${year}-${month}-${dayFrom}`,
        to: `${year}-${month}-${dayTo}`,
        label: `📅 Dal ${matchRange[1]} al ${matchRange[2]} ${matchRange[3].charAt(0).toUpperCase() + matchRange[3].slice(1)} ${year}`
      }
    }
  }

  return null
}

function getDateRange(args) {
  const now = new Date()
  const toIso = (d) => d.toISOString().split("T")[0]
  const arg = args[0]?.toLowerCase()

  if (!arg || arg === "oggi") {
    const today = toIso(now)
    return { from: today, to: today, label: "📅 OGGI" }
  }
  if (arg === "domani") {
    const tom = new Date(now)
    tom.setDate(tom.getDate() + 1)
    const t = toIso(tom)
    return { from: t, to: t, label: "📅 DOMANI" }
  }
  if (arg === "ieri") {
    const ieri = new Date(now)
    ieri.setDate(ieri.getDate() - 1)
    const i = toIso(ieri)
    return { from: i, to: i, label: "📅 IERI" }
  }
  if (arg === "settimana") {
    const end = new Date(now)
    end.setDate(end.getDate() + 7)
    return { from: toIso(now), to: toIso(end), label: "📅 PROSSIMI 7 GIORNI" }
  }
  if (arg === "weekend") {
    const day = now.getDay()
    const diffSab = (6 - day + 7) % 7 || 7
    const sab = new Date(now)
    sab.setDate(now.getDate() + diffSab)
    const dom = new Date(sab)
    dom.setDate(sab.getDate() + 1)
    return { from: toIso(sab), to: toIso(dom), label: "📅 WEEKEND" }
  }

  const custom = parseCustomDate(args)
  if (custom) return custom

  const n = parseInt(arg)
  if (!isNaN(n) && n >= 1 && n <= 30) {
    const end = new Date(now)
    end.setDate(end.getDate() + n)
    return { from: toIso(now), to: toIso(end), label: `📅 PROSSIMI ${n} GIORNI` }
  }

  return null
}

function formatDay(dateStr) {
  const d = new Date(dateStr + "T12:00:00Z")
  return d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Rome" })
}

function formatTime(utcDate) {
  const d = new Date(utcDate)
  return d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" })
}

let handler = async (m, { conn, args }) => {
  const chat = m.chat
  const arg = args[0]?.toLowerCase()

  if (arg === "classifica" || arg === "live") return

  const range = getDateRange(args)

  if (!range) {
    return m.reply(
`ℹ️ *Comandi disponibili:*

*.calcio* → oggi
*.calcio domani* → domani
*.calcio ieri* → ieri
*.calcio weekend* → sabato e domenica
*.calcio settimana* → prossimi 7 giorni
*.calcio 3* → prossimi N giorni (1-30)

📆 *Date specifiche:*
*.calcio 14 febbraio 2026*
*.calcio 14/02/2026*
*.calcio dal 10 al 14 febbraio 2026*`)
  }

  await m.reply(`🔍 Cerco le partite — ${range.label}...`)

  const matches = await fetchMatchesByDate(range.from, range.to)

  if (!matches.length) {
    return m.reply(`😔 Nessuna partita trovata per ${range.label.replace("📅 ", "")}.`)
  }


  const uniqueTeamIds = [...new Set(matches.map(m => m.homeTeam?.id).filter(Boolean))]
  await Promise.all(uniqueTeamIds.map(id => fetchVenue(id)))

  const byDay = {}
  for (let match of matches) {
    const day = match.utcDate.split("T")[0]
    if (!byDay[day]) byDay[day] = []
    byDay[day].push(match)
  }

  let testo = `╭──────────────────╮\n┃ ⚽ ${range.label}\n┃━━━━━━━━━━━━━━━━━━\n`

  let globalIndex = 1

  for (let day of Object.keys(byDay).sort()) {
    const dayMatches = byDay[day]
    testo += `┃\n┃ 📆 *${formatDay(day).toUpperCase()}*\n┃\n`

    let currentComp = ""

    for (let match of dayMatches) {
      const comp = match.competition?.name || ""
      if (comp !== currentComp) {
        currentComp = comp
        testo += `┃ 🏆 ${comp}\n`
      }

      const home = match.homeTeam.shortName || match.homeTeam.name
      const away = match.awayTeam.shortName || match.awayTeam.name
      const ora = formatTime(match.utcDate)
      const status = getStatusEmoji(match.status)
      const venue = venueCache[match.homeTeam?.id] || "N/D"

      let scoreStr = ""
      if (match.status === "IN_PLAY" || match.status === "PAUSED" || match.status === "FINISHED") {
        const hg = match.score?.fullTime?.home ?? match.score?.halfTime?.home ?? "?"
        const ag = match.score?.fullTime?.away ?? match.score?.halfTime?.away ?? "?"
        scoreStr = ` *${hg}-${ag}*`
      }

      testo += `┃\n┃ *${globalIndex}.* *${home}* vs *${away}*${scoreStr}\n┃    ${status} 🕐 ${ora}\n┃    🏟 ${venue}\n`
      globalIndex++
    }

    testo += `┃\n┃━━━━━━━━━━━━━━━━━━\n`
  }

  testo += `┃ Usa *.scommessa NUMERO*\n┃ per scommettere!\n╰──────────────────╯`

  global.todayMatches = global.todayMatches || {}
  global.todayMatches[chat] = matches

  await conn.sendMessage(chat, { text: testo }, { quoted: m })
}

handler.command = ["calcio"]
export default handler
