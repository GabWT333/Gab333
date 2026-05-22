//Plugin by Gab, Lucifero & 333 staff

import fs from 'fs'
import path from 'path'

const YGOAPI    = "https://db.ygoprodeck.com/api/v7/cardinfo.php"
const YGORANDOM = "https://db.ygoprodeck.com/api/v7/randomcard.php"
const DB_PATH   = path.join(process.cwd(), 'data', 'yugioh.json')
const COOLDOWN  = 5 * 60 * 1000

const ATTRIBUTI = {
  DARK:   "🌑 OSCURITÀ",
  LIGHT:  "✨ LUCE",
  FIRE:   "🔥 FUOCO",
  WATER:  "💧 ACQUA",
  EARTH:  "🌍 TERRA",
  WIND:   "🌪️ VENTO",
  DIVINE: "⚡ DIVINO",
}

const TIPI_CARTA = {
  "Normal Monster":       "👾 MOSTRO NORMALE",
  "Effect Monster":       "⚡ MOSTRO EFFETTO",
  "Fusion Monster":       "🔀 FUSIONE",
  "Ritual Monster":       "🌙 RITUALE",
  "Synchro Monster":      "💠 SINCRO",
  "Xyz Monster":          "🌀 XYZ",
  "Link Monster":         "🔗 LINK",
  "Pendulum Monster":     "⏳ PENDULUM",
  "Spell Card":           "📗 MAGIA",
  "Trap Card":            "📕 TRAPPOLA",
  "Skill Card":           "🃏 ABILITÀ",
  "Token":                "🪙 GETTONE",
}

function getRarita(atk) {
  if (atk === null || atk === undefined) return { stars: "★★★☆☆", label: "RARA"       }
  if (atk >= 3000) return { stars: "★★★★★", label: "LEGGENDARIA" }
  if (atk >= 2500) return { stars: "★★★★☆", label: "ULTRA RARA"  }
  if (atk >= 2000) return { stars: "★★★☆☆", label: "RARA"        }
  if (atk >= 1500) return { stars: "★★☆☆☆", label: "NON COMUNE"  }
  return                { stars: "★☆☆☆☆", label: "COMUNE"      }
}

function statBar(val, max = 5000) {
  if (val === null || val === undefined || val === "?" ) return "░░░░░░░░░░  N/A"
  const filled = Math.round((Number(val) / max) * 10)
  return "█".repeat(Math.min(filled, 10)) + "░".repeat(Math.max(10 - filled, 0)) + `  ${val}`
}

function padId(id) {
  return String(id).padStart(8, "0")
}

function trunc(str, len) {
  if (!str) return ""
  return str.length > len ? str.slice(0, len - 1) + "…" : str
}

function loadDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
      fs.writeFileSync(DB_PATH, JSON.stringify({}))
    }
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
  } catch {
    return {}
  }
}

function saveDB(db) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
}

function getUser(db, userId) {
  if (!db[userId]) db[userId] = { collezione: {}, ultimaPesca: 0 }
  return db[userId]
}

async function fetchRandom() {
  const res = await fetch(YGORANDOM)
  if (!res.ok) throw new Error("err")
  return await res.json()
}

async function fetchByName(name) {
  const res = await fetch(`${YGOAPI}?name=${encodeURIComponent(name)}`)
  if (!res.ok) throw new Error("not_found")
  const data = await res.json()
  if (data.error || !data.data?.length) throw new Error("not_found")
  return data.data[0]
}

async function fetchById(id) {
  const res = await fetch(`${YGOAPI}?id=${id}`)
  if (!res.ok) throw new Error("not_found")
  const data = await res.json()
  if (data.error || !data.data?.length) throw new Error("not_found")
  return data.data[0]
}

function buildCard(card, dataPesca = null) {
  const atk     = card.atk ?? card.atk === 0 ? card.atk : null
  const def     = card.def ?? card.def === 0 ? card.def : null
  const livello = card.level ? "⭐".repeat(Math.min(card.level, 12)) : null
  const rarita  = getRarita(atk)
  const attr    = ATTRIBUTI[card.attribute] || (card.attribute ? `🔹 ${card.attribute}` : "🃏 N/A")
  const tipo    = TIPI_CARTA[card.type] || `🃏 ${card.type}`
  const nome    = trunc(card.name?.toUpperCase(), 26)
  const descrizione = trunc(card.desc, 80)
  const dataRiga = dataPesca ? `\n┃  📅 Pescata il: ${dataPesca}` : ""

  let statsBlock = ""
  if (atk !== null || def !== null) {
    statsBlock = `
  ⚔️  ATK  ${statBar(atk)}
  🛡️  DEF  ${statBar(def)}
`
  }

  let livelloBlock = ""
  if (livello) {
    livelloBlock = `┃  ${trunc(livello, 26)}\n`
  }

  return `
  #${padId(card.id)}  ★ YGO CARD ★  

  ${nome.padEnd(26)}
  ${tipo.padEnd(26)}
  ${attr.padEnd(26)}
  ${rarita.stars}  ${rarita.label.padEnd(14)}
${livelloBlock}
  📜 EFFETTO/DESCRIZIONE   
  ${trunc(descrizione, 26)}
  ${trunc(descrizione.slice(26), 26)}
  ${trunc(descrizione.slice(52), 26)}
${statsBlock}
 🌐 ygoprodeck.com        ${dataRiga}
`
}

let handler = async (m, { conn, args, command }) => {
  const userId = m.sender
  const db     = loadDB()
  const utente = getUser(db, userId)

  if (command === 'pesca') {
    const ora       = Date.now()
    const rimanente = COOLDOWN - (ora - utente.ultimaPesca)

    if (rimanente > 0) {
      const minuti = Math.ceil(rimanente / 60000)
      return m.reply(`⏳ Aspetta ancora *${minuti} minuto${minuti > 1 ? 'i' : ''}* prima di pescare un'altra carta!`)
    }

    let card
    try {
      card = await fetchRandom()
    } catch {
      return m.reply("❌ Errore nel pescare una carta. Riprova!")
    }

    const giaHai = !!utente.collezione[card.id]
    const dataP  = new Date().toLocaleDateString('it-IT')

    utente.collezione[card.id] = {
      id:        card.id,
      name:      card.name,
      type:      card.type,
      attribute: card.attribute || null,
      atk:       card.atk ?? null,
      def:       card.def ?? null,
      level:     card.level || null,
      desc:      card.desc,
      imageUrl:  card.card_images?.[0]?.image_url || null,
      pescata:   dataP,
    }
    utente.ultimaPesca = ora
    saveDB(db)

    const totale  = Object.keys(utente.collezione).length
    const rarita  = getRarita(card.atk ?? null)
    const carta   = buildCard(card, dataP)
    const suffix  = giaHai
      ? `♻️ Hai già *${card.name}*! Collezione aggiornata.`
      : `🎴 Hai pescato *${card.name.toUpperCase()}*!`
    const caption = `${carta}\n\n${suffix}\n📦 Carte nella tua collezione: *${totale}*`

    const imgUrl = card.card_images?.[0]?.image_url
    if (imgUrl) {
      try {
        const imgRes = await fetch(imgUrl)
        const buffer = Buffer.from(await imgRes.arrayBuffer())
        await conn.sendMessage(m.chat, { image: buffer, caption, mimetype: "image/jpeg" }, { quoted: m })
        return
      } catch {}
    }
    await conn.sendMessage(m.chat, { text: caption }, { quoted: m })
    return
  }

  if (command === 'collezione') {
    const lista = Object.values(utente.collezione)

    if (!lista.length) {
      return m.reply("📭 Non hai ancora pescato nessuna carta!\nUsa *.pesca* per iniziare.")
    }

    lista.sort((a, b) => a.name.localeCompare(b.name))

    const righe = lista.map(c => {
      const tipo   = TIPI_CARTA[c.type] || "🃏"
      const rarita = getRarita(c.atk)
      const emoji  = tipo.split(" ")[0]
      return `${emoji} *${c.name.toUpperCase()}* — ${rarita.stars}`
    })

    const testo =
      `\n` +
      `   🎴 LA TUA COLLEZIONE   \n` +
      `   ${lista.length} carte totali         \n` +
      `\n\n` +
      righe.join("\n")

    return m.reply(testo)
  }

  if (command === 'yugioh') {
    if (!args[0]) {
      return m.reply("📖 *Uso:* .yugioh <nome carta>\nEsempio: *.yugioh Dark Magician*\n\nPuoi vedere solo le carte che hai pescato con *.pesca*!\nUsa *.collezione* per vedere cosa hai.")
    }

    const query   = args.join(" ").toLowerCase()
    const trovata = Object.values(utente.collezione).find(c =>
      c.name.toLowerCase() === query || String(c.id) === query
    )

    if (!trovata) {
      return m.reply(`❌ Non hai ancora pescato *${query.toUpperCase()}*!\nUsa *.pesca* per trovarla o *.collezione* per vedere le tue carte.`)
    }

    let card
    try {
      card = await fetchById(trovata.id)
    } catch {
      return m.reply("❌ Errore nel caricare i dati. Riprova!")
    }

    const carta   = buildCard(card, trovata.pescata)
    const caption = carta
    const imgUrl  = card.card_images?.[0]?.image_url

    if (imgUrl) {
      try {
        const imgRes = await fetch(imgUrl)
        const buffer = Buffer.from(await imgRes.arrayBuffer())
        await conn.sendMessage(m.chat, { image: buffer, caption, mimetype: "image/jpeg" }, { quoted: m })
        return
      } catch {}
    }
    await conn.sendMessage(m.chat, { text: caption }, { quoted: m })
    return
  }
}

handler.help    = ["yugioh <nome>", "pesca", "collezione"]
handler.tags    = ["fun", "game"]
handler.command = ["yugioh", "pesca", "collezione"]

export default handler
