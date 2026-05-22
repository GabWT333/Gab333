//Plugin by Gab, Lucifero & 333 staff

import fs from 'fs'
import path from 'path'

const POKEAPI = "https://pokeapi.co/api/v2/pokemon"
const TOTAL_POKEMON = 1025
const DB_PATH = path.join(process.cwd(), 'data', 'pokedex.json')

const TIPI = {
  fire:     { emoji: "🔥", ita: "FUOCO"    },
  water:    { emoji: "💧", ita: "ACQUA"    },
  grass:    { emoji: "🌿", ita: "ERBA"     },
  electric: { emoji: "⚡", ita: "ELETTRO"  },
  psychic:  { emoji: "🔮", ita: "PSICO"    },
  dragon:   { emoji: "🐉", ita: "DRAGO"    },
  ice:      { emoji: "❄️", ita: "GHIACCIO" },
  fighting: { emoji: "🥊", ita: "LOTTA"    },
  poison:   { emoji: "☠️", ita: "VELENO"   },
  ground:   { emoji: "🌍", ita: "TERRA"    },
  flying:   { emoji: "🦅", ita: "VOLANTE"  },
  bug:      { emoji: "🐛", ita: "INSETTO"  },
  rock:     { emoji: "🪨", ita: "ROCCIA"   },
  ghost:    { emoji: "👻", ita: "SPETTRO"  },
  dark:     { emoji: "🌑", ita: "BUIO"     },
  steel:    { emoji: "⚙️", ita: "ACCIAIO"  },
  fairy:    { emoji: "✨", ita: "FOLLETTO" },
  normal:   { emoji: "⭐", ita: "NORMALE"  },
}

function getRarita(hp) {
  if (hp >= 120) return { stars: "★★★★★", label: "LEGGENDARIO" }
  if (hp >= 100) return { stars: "★★★★☆", label: "ULTRA RARO"  }
  if (hp >= 80)  return { stars: "★★★☆☆", label: "RARO"        }
  if (hp >= 60)  return { stars: "★★☆☆☆", label: "NON COMUNE"  }
  return              { stars: "★☆☆☆☆", label: "COMUNE"      }
}

function statBar(val, max = 160) {
  const filled = Math.round((val / max) * 10)
  return "█".repeat(filled) + "░".repeat(10 - filled) + `  ${val}`
}

function padId(id) {
  return String(id).padStart(4, "0")
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

function getUserDex(db, userId) {
  if (!db[userId]) db[userId] = { catturati: {}, ultimaCattura: 0 }
  return db[userId]
}

async function fetchPokemon(nameOrId) {
  const res = await fetch(`${POKEAPI}/${String(nameOrId).toLowerCase()}`)
  if (!res.ok) throw new Error("not_found")
  const data = await res.json()
  const statMap = {}
  for (const s of data.stats) statMap[s.stat.name] = s.base_stat
  return {
    id:         data.id,
    name:       data.name,
    nameIT:     data.name.toUpperCase(),
    hp:         statMap["hp"]             ?? 50,
    atk:        statMap["attack"]         ?? 50,
    def:        statMap["defense"]        ?? 50,
    spatk:      statMap["special-attack"] ?? 50,
    spd:        statMap["speed"]          ?? 50,
    types:      data.types.map(t => t.type.name),
    moves:      data.moves
                  .sort(() => Math.random() - 0.5)
                  .slice(0, 4)
                  .map(m => m.move.name.replace(/-/g, " ").toUpperCase()),
    artworkUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`,
  }
}

function buildCard(poke, dataC = null) {
  const rarita  = getRarita(poke.hp)
  const tipo1   = TIPI[poke.types[0]] || { emoji: "⭐", ita: poke.types[0].toUpperCase() }
  const tipo2   = poke.types[1] ? TIPI[poke.types[1]] : null
  const tipoStr = tipo2
    ? `${tipo1.emoji} ${tipo1.ita} / ${tipo2.emoji} ${tipo2.ita}`
    : `${tipo1.emoji} ${tipo1.ita}`

  const movesStr = poke.moves
    .map((m, i) => `┃  ${["①","②","③","④"][i]} ${m}`)
    .join("\n")

  const dataRiga = dataC ? `\n┃  📅 Catturato il: ${dataC}` : ""

  return `
  #${padId(poke.id)}  ★ POKÉDEX CARD ★   
  ${poke.nameIT.padEnd(26)}
 ${tipoStr.padEnd(26)}
  ${rarita.stars}  ${rarita.label.padEnd(14)}

  📊 STATISTICHE BASE      
                            
 ❤️  HP   ${statBar(poke.hp)}
 ⚔️  ATK  ${statBar(poke.atk)}
 🛡️  DEF  ${statBar(poke.def)}
 💥  SPA  ${statBar(poke.spatk)}
 💨  VEL  ${statBar(poke.spd)}

  ⚡ MOSSE                  
${movesStr}${dataRiga}`
}

let handler = async (m, { conn, args, command }) => {
  const userId = m.sender
  const db     = loadDB()
  const utente = getUserDex(db, userId)

  if (command === 'cattura') {
    const ora       = Date.now()
    const cooldown  = 5 * 60 * 1000
    const rimanente = cooldown - (ora - utente.ultimaCattura)

    if (rimanente > 0) {
      const minuti = Math.ceil(rimanente / 60000)
      return m.reply(`⏳ Aspetta ancora *${minuti} minuto${minuti > 1 ? 'i' : ''}* prima di catturare un altro Pokémon!`)
    }

    const randomId = Math.floor(Math.random() * TOTAL_POKEMON) + 1
    let poke
    try {
      poke = await fetchPokemon(randomId)
    } catch {
      return m.reply("❌ Errore nel trovare un Pokémon. Riprova!")
    }

    const giaHai  = !!utente.catturati[poke.id]
    const dataC   = new Date().toLocaleDateString('it-IT')

    utente.catturati[poke.id] = {
      id:        poke.id,
      name:      poke.name,
      hp:        poke.hp,
      atk:       poke.atk,
      def:       poke.def,
      spatk:     poke.spatk,
      spd:       poke.spd,
      types:     poke.types,
      moves:     poke.moves,
      catturato: dataC,
    }
    utente.ultimaCattura = ora
    saveDB(db)

    const totale  = Object.keys(utente.catturati).length
    const carta   = buildCard(poke, dataC)
    const suffix  = giaHai
      ? `♻️ Hai già *${poke.nameIT}* nel Pokédex! Dati aggiornati.`
      : `🎉 Hai catturato *${poke.nameIT}*!`
    const caption = `${carta}\n\n${suffix}\n📦 Totale: *${totale}/${TOTAL_POKEMON}*`

    try {
      const imgRes = await fetch(poke.artworkUrl)
      const buffer = Buffer.from(await imgRes.arrayBuffer())
      await conn.sendMessage(m.chat, { image: buffer, caption, mimetype: "image/png" }, { quoted: m })
    } catch {
      await conn.sendMessage(m.chat, { text: caption }, { quoted: m })
    }
    return
  }

  if (command === 'pokedex') {
    const lista = Object.values(utente.catturati)

    if (!lista.length) {
      return m.reply("📭 Non hai ancora catturato nessun Pokémon!\nUsa *.cattura* per iniziare.")
    }

    lista.sort((a, b) => a.id - b.id)

    const righe  = lista.map(p => {
      const tipo1  = TIPI[p.types[0]] || { emoji: "⭐" }
      const rarita = getRarita(p.hp)
      return `${tipo1.emoji} #${padId(p.id)} *${p.name.toUpperCase()}* — ${rarita.stars}`
    })

    const testo =
      `\n` +
      `    📖 IL TUO POKÉDEX     \n` +
      `  ${lista.length}/${TOTAL_POKEMON} Pokémon         \n` +
      `\n\n` +
      righe.join("\n")

    return m.reply(testo)
  }

  if (command === 'pokemon') {
    if (!args[0]) {
      return m.reply("📖 *Uso:* .pokemon <nome>\n\nPuoi vedere solo i Pokémon catturati con *.cattura*!\nUsa *.pokedex* per vedere la tua collezione.")
    }

    const query   = args.join("-").toLowerCase()
    const trovato = Object.values(utente.catturati).find(p =>
      p.name.toLowerCase() === query || String(p.id) === query
    )

    if (!trovato) {
      return m.reply(`❌ Non hai ancora catturato *${query.toUpperCase()}*!\nUsa *.cattura* per trovarlo o *.pokedex* per vedere la tua collezione.`)
    }

    let poke
    try {
      poke = await fetchPokemon(trovato.id)
    } catch {
      return m.reply("❌ Errore nel caricare i dati. Riprova!")
    }

    const carta   = buildCard(poke, trovato.catturato)
    const caption = carta

    try {
      const imgRes = await fetch(poke.artworkUrl)
      const buffer = Buffer.from(await imgRes.arrayBuffer())
      await conn.sendMessage(m.chat, { image: buffer, caption, mimetype: "image/png" }, { quoted: m })
    } catch {
      await conn.sendMessage(m.chat, { text: caption }, { quoted: m })
    }
    return
  }
}

handler.help    = ["pokemon <nome>", "cattura", "pokedex"]
handler.tags    = ["fun", "game"]
handler.command = ["pokemon", "cattura", "pokedex"]

export default handler
