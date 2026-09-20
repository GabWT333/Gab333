//Plugin by Gab, Lucifero & 333 staff


const F1_API_KEY = "c9d9e589b3mshc7eecec96ccc03ep126bb1jsnbd4082441abd"
const F1_API_HOST = "api-formula-1.p.rapidapi.com"

async function fetchF1(endpoint) {
  try {
    const res = await fetch(`https://api-formula-1.p.rapidapi.com/${endpoint}`, {
      headers: {
        "x-rapidapi-key": F1_API_KEY,
        "x-rapidapi-host": F1_API_HOST
      }
    })
    return await res.json()
  } catch (e) { return null }
}

function getFlagEmoji(country) {
  const flags = {
    "bahrain": "🇧🇭", "saudi arabia": "🇸🇦", "australia": "🇦🇺", "japan": "🇯🇵",
    "china": "🇨🇳", "miami": "🇺🇸", "usa": "🇺🇸", "united states": "🇺🇸",
    "italy": "🇮🇹", "monaco": "🇲🇨", "canada": "🇨🇦", "spain": "🇪🇸",
    "austria": "🇦🇹", "uk": "🇬🇧", "great britain": "🇬🇧", "hungary": "🇭🇺",
    "belgium": "🇧🇪", "netherlands": "🇳🇱", "singapore": "🇸🇬", "azerbaijan": "🇦🇿",
    "mexico": "🇲🇽", "brazil": "🇧🇷", "las vegas": "🇺🇸", "qatar": "🇶🇦",
    "abu dhabi": "🇦🇪", "germany": "🇩🇪", "france": "🇫🇷", "portugal": "🇵🇹",
    "turkey": "🇹🇷", "russia": "🇷🇺"
  }
  if (!country) return "🏁"
  const key = country.toLowerCase()
  for (let k of Object.keys(flags)) {
    if (key.includes(k)) return flags[k]
  }
  return "🏁"
}

function getTeamEmoji(team) {
  if (!team) return "🚗"
  const t = team.toLowerCase()
  if (t.includes("ferrari")) return "🔴"
  if (t.includes("mercedes")) return "⬛"
  if (t.includes("red bull")) return "🔵"
  if (t.includes("mclaren")) return "🟠"
  if (t.includes("alpine")) return "🔵"
  if (t.includes("aston")) return "🟢"
  if (t.includes("williams")) return "🔵"
  if (t.includes("haas")) return "⚪"
  if (t.includes("alfa") || t.includes("sauber") || t.includes("kick")) return "🔴"
  if (t.includes("racing bulls") || t.includes("rb ") || t.includes("toro")) return "🔵"
  return "🚗"
}

function formatDate(dateStr) {
  if (!dateStr) return "N/D"
  const d = new Date(dateStr)
  return d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
}

function formatDateTime(dateStr) {
  if (!dateStr) return "N/D"
  const d = new Date(dateStr)
  return d.toLocaleString("it-IT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" })
}

let handler = async (m, { conn, args }) => {
  const chat = m.chat
  const cmd = args[0]?.toLowerCase()

  if (!cmd || cmd === "prossima") {
    await m.reply("🏎 Cerco la prossima gara F1...")
    const data = await fetchF1("races?season=current&type=race")
    if (!data?.response?.length) return m.reply("❌ Errore nel recuperare le gare.")

    const now = new Date()
    const prossima = data.response.find(r => new Date(r.date) >= now)
    if (!prossima) return m.reply("❌ Nessuna gara in programma.")

    const flag = getFlagEmoji(prossima.competition?.location?.country)
    const circuito = prossima.circuit?.name || "N/D"
    const city = prossima.competition?.location?.city || ""
    const country = prossima.competition?.location?.country || ""
    const gara = prossima.competition?.name || prossima.name || "N/D"
    const round = prossima.round || "?"
    const dataGara = formatDate(prossima.date)

    let sessioni = ""
    if (prossima.sessions) {
      const s = prossima.sessions
      if (s.fp1) sessioni += `┃ 🔧 *Prove 1:* ${formatDateTime(s.fp1)}\n`
      if (s.fp2) sessioni += `┃ 🔧 *Prove 2:* ${formatDateTime(s.fp2)}\n`
      if (s.fp3) sessioni += `┃ 🔧 *Prove 3:* ${formatDateTime(s.fp3)}\n`
      if (s.sprint_qualifying) sessioni += `┃ ⚡ *Sprint Quali:* ${formatDateTime(s.sprint_qualifying)}\n`
      if (s.sprint) sessioni += `┃ ⚡ *Sprint:* ${formatDateTime(s.sprint)}\n`
      if (s.qualifying) sessioni += `┃ 🏁 *Qualifiche:* ${formatDateTime(s.qualifying)}\n`
      if (s.race) sessioni += `┃ 🏆 *GARA:* ${formatDateTime(s.race)}\n`
    }

    return conn.sendMessage(chat, { text:
`╭──────────────────╮
┃ 🏎 𝐏𝐑𝐎𝐒𝐒𝐈𝐌𝐀 𝐆𝐀𝐑𝐀 𝐅𝟏
┃━━━━━━━━━━━━━━━━━━
┃ ${flag} *${gara}*
┃ 📍 Round ${round} — ${city}, ${country}
┃━━━━━━━━━━━━━━━━━━
┃ 🏟 *${circuito}*
┃ 📅 ${dataGara}
┃━━━━━━━━━━━━━━━━━━
${sessioni}┃━━━━━━━━━━━━━━━━━━
┃ *.f1 calendario* → tutte le gare
┃ *.f1 classifica* → Mondiale piloti
┃ *.f1 costruttori* → Mondiale team
┃ *.f1 ultima* → risultati ultima gara
╰──────────────────╯` }, { quoted: m })
  }

  if (cmd === "calendario") {
    await m.reply("📅 Carico il calendario F1...")
    const data = await fetchF1("races?season=current&type=race")
    if (!data?.response?.length) return m.reply("❌ Errore nel recuperare il calendario.")

    const now = new Date()
    let testo = `╭──────────────────╮\n┃ 🏎 𝐂𝐀𝐋𝐄𝐍𝐃𝐀𝐑𝐈𝐎 𝐅𝟏 ${new Date().getFullYear()}\n┃━━━━━━━━━━━━━━━━━━\n`

    for (let race of data.response) {
      const flag = getFlagEmoji(race.competition?.location?.country)
      const nome = race.competition?.name || race.name || "N/D"
      const data_gara = race.date ? new Date(race.date).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" }) : "N/D"
      const passata = new Date(race.date) < now
      const stato = passata ? "✅" : "🔜"
      testo += `┃ ${stato} *R${race.round}* ${flag} ${nome} — ${data_gara}\n`
    }

    testo += `╰──────────────────╯`
    return conn.sendMessage(chat, { text: testo }, { quoted: m })
  }

  if (cmd === "classifica") {
    await m.reply("🏆 Carico il Mondiale Piloti...")
    const data = await fetchF1("rankings/drivers?season=current")
    if (!data?.response?.length) return m.reply("❌ Errore nel recuperare la classifica.")

    let testo = `╭──────────────────╮\n┃ 🏆 𝐌𝐎𝐍𝐃𝐈𝐀𝐋𝐄 𝐏𝐈𝐋𝐎𝐓𝐈\n┃━━━━━━━━━━━━━━━━━━\n`

    for (let d of data.response.slice(0, 20)) {
      const pos = d.position
      const nome = `${d.driver?.name?.firstname || ""} ${d.driver?.name?.lastname || ""}`.trim()
      const team = d.team?.name || ""
      const punti = d.points || 0
      const wins = d.wins || 0
      const teamEmoji = getTeamEmoji(team)
      const medal = pos === 1 ? "🥇" : pos === 2 ? "🥈" : pos === 3 ? "🥉" : `${pos}.`
      testo += `┃ ${medal} *${nome}*\n┃    ${teamEmoji} ${team} — *${punti} pts* 🏆${wins}\n`
    }

    testo += `╰──────────────────╯`
    return conn.sendMessage(chat, { text: testo }, { quoted: m })
  }

  if (cmd === "costruttori") {
    await m.reply("🏭 Carico il Mondiale Costruttori...")
    const data = await fetchF1("rankings/teams?season=current")
    if (!data?.response?.length) return m.reply("❌ Errore nel recuperare la classifica costruttori.")

    let testo = `╭──────────────────╮\n┃ 🏭 𝐌𝐎𝐍𝐃𝐈𝐀𝐋𝐄 𝐂𝐎𝐒𝐓𝐑𝐔𝐓𝐓𝐎𝐑𝐈\n┃━━━━━━━━━━━━━━━━━━\n`

    for (let t of data.response) {
      const pos = t.position
      const team = t.team?.name || "N/D"
      const punti = t.points || 0
      const wins = t.wins || 0
      const teamEmoji = getTeamEmoji(team)
      const medal = pos === 1 ? "🥇" : pos === 2 ? "🥈" : pos === 3 ? "🥉" : `${pos}.`
      testo += `┃ ${medal} ${teamEmoji} *${team}*\n┃    *${punti} pts* 🏆${wins}\n`
    }

    testo += `╰──────────────────╯`
    return conn.sendMessage(chat, { text: testo }, { quoted: m })
  }

  if (cmd === "ultima") {
    await m.reply("🏁 Cerco i risultati dell'ultima gara...")
    const data = await fetchF1("races?season=current&type=race")
    if (!data?.response?.length) return m.reply("❌ Errore.")

    const now = new Date()
    const passate = data.response.filter(r => new Date(r.date) < now)
    if (!passate.length) return m.reply("❌ Nessuna gara ancora disputata.")
    const ultima = passate[passate.length - 1]

    const risultati = await fetchF1(`rankings/races?race=${ultima.id}`)
    const flag = getFlagEmoji(ultima.competition?.location?.country)
    const nomeGara = ultima.competition?.name || ultima.name || "N/D"

    let testo = `╭──────────────────╮\n┃ 🏁 ${flag} *${nomeGara}*\n┃━━━━━━━━━━━━━━━━━━\n`

    if (risultati?.response?.length) {
      for (let r of risultati.response.slice(0, 10)) {
        const pos = r.position
        const nome = `${r.driver?.name?.firstname || ""} ${r.driver?.name?.lastname || ""}`.trim()
        const team = r.team?.name || ""
        const tempo = r.time?.time || r.time?.behind || ""
        const teamEmoji = getTeamEmoji(team)
        const medal = pos === 1 ? "🥇" : pos === 2 ? "🥈" : pos === 3 ? "🥉" : `${pos}.`
        const punti = r.points ? `+${r.points}pts` : ""
        testo += `┃ ${medal} *${nome}*\n┃    ${teamEmoji} ${team} ${tempo} ${punti}\n`
      }
    } else {
      testo += `┃ Risultati non ancora disponibili.\n`
    }

    testo += `╰──────────────────╯`
    return conn.sendMessage(chat, { text: testo }, { quoted: m })
  }

  if (cmd === "piloti") {
    await m.reply("🧑‍✈️ Carico i piloti della stagione...")
    const data = await fetchF1("drivers?season=current")
    if (!data?.response?.length) return m.reply("❌ Errore.")

    let testo = `╭──────────────────╮\n┃ 🧑‍✈️ 𝐏𝐈𝐋𝐎𝐓𝐈 ${new Date().getFullYear()}\n┃━━━━━━━━━━━━━━━━━━\n`

    const sorted = data.response.sort((a, b) => (a.teams?.[0]?.team?.name || "").localeCompare(b.teams?.[0]?.team?.name || ""))
    let currentTeam = ""

    for (let p of sorted) {
      const nome = `${p.name?.firstname || ""} ${p.name?.lastname || ""}`.trim()
      const team = p.teams?.[0]?.team?.name || "N/D"
      const numero = p.number || "?"
      const naz = getFlagEmoji(p.nationality)
      const teamEmoji = getTeamEmoji(team)
      if (team !== currentTeam) {
        currentTeam = team
        testo += `┃\n┃ ${teamEmoji} *${team}*\n`
      }
      testo += `┃  #${numero} ${naz} ${nome}\n`
    }

    testo += `╰──────────────────╯`
    return conn.sendMessage(chat, { text: testo }, { quoted: m })
  }

  return m.reply(
`╭──────────────────╮
┃ 🏎 𝐂𝐎𝐌𝐀𝐍𝐃𝐈 𝐅𝟏
┃━━━━━━━━━━━━━━━━━━
┃ *.f1* → prossima gara
┃ *.f1 calendario* → stagione completa
┃ *.f1 classifica* → Mondiale Piloti
┃ *.f1 costruttori* → Mondiale Team
┃ *.f1 ultima* → risultati ultima gara
┃ *.f1 piloti* → tutti i piloti 2025
╰──────────────────╯`)
}

handler.command = ["f1"]
export default handler