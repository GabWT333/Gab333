//Plugin by Gab, Lucifero & 333 staff


const parole = [


  "telefono","computer","mouse","tastiera","monitor","scrivania","sedia",
  "cuffie","microfono","televisione","lampada","zaino","portafoglio",
  "occhiali","orologio","quaderno","penna","matita","libro",


  "pizza","carbonara","lasagna","tiramisù","panino","hamburger","kebab",
  "cioccolato","biscotto","cornetto","gelato","pasta","risotto",
  "mozzarella","nutella","patatine","focaccia","aragosta",


  "torino","milano","roma","napoli","palermo","genova","bologna",
  "londra","parigi","berlino","madrid","barcellona","tokyo","newyork",


  "rap","trap","melodia","concerto","canzone","chitarra","pianoforte",
  "batteria","microfono","playlist","spotify","album","strofa",


  "calcio","basket","tennis","formulauno","motogp","nuoto",
  "atletica","pallavolo","ciclismo","rugby",


  "universo","galassia","pianeta","cometa","satellite","astronave",
  "tempesta","fulmine","arcobaleno","montagna","oceano","deserto",
  "foresta","isola","castello","mistero","leggenda","ombra",
  "energia","velocita","potenza","strategia","missione","squadra",
  "impero","gladiatore","drago","samurai","ninja","pirata",
  "fantasma","vampiro","mostro","robot","androide","cyborg",


  "programmatore","sviluppatore","infrastruttura","configurazione",
  "autenticazione","amministratore","responsabilita",
  "organizzazione","implementazione","ottimizzazione",
  "personalizzazione","interazione","comunicazione",
  "distribuzione","aggiornamento","manutenzione",
  "visualizzazione","simulazione","documentazione"

]

global.gameImpiccato = global.gameImpiccato || {}
global.gameImpiccatoScore = global.gameImpiccatoScore || {}

const handler = async (m, { conn }) => {
  const chatId = m.chat

  if (!global.gameImpiccatoScore[chatId]) global.gameImpiccatoScore[chatId] = {}

  if (global.gameImpiccato[chatId]) {
    const oldGame = global.gameImpiccato[chatId]
    if (Date.now() > oldGame.endTime) delete global.gameImpiccato[chatId]
    else throw "⚠️ 𝐂’𝐞̀ 𝐠𝐢𝐚̀ 𝐮𝐧𝐚 𝐩𝐚𝐫𝐭𝐢𝐭𝐚 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨!"
  }

  const parola = parole[Math.floor(Math.random() * parole.length)]

  global.gameImpiccato[chatId] = {
    parola,
    lettere: [],
    errori: 0,
    player: m.sender,
    startTime: Date.now(),
    endTime: Date.now() + 180000 // 3 minuti
  }

  const parolaFormattata = formatParola(parola, [])

  await conn.sendMessage(chatId, {
    text:
`🎮 𝐈𝐌𝐏𝐈𝐂𝐂𝐀𝐓𝐎 𝐀𝐕𝐕𝐈𝐀𝐓𝐎!

${ascii(0)}

🔤 𝐏𝐚𝐫𝐨𝐥𝐚 𝐝𝐚 𝐢𝐧𝐝𝐨𝐯𝐢𝐧𝐚𝐫𝐞:
${parolaFormattata}

⏳ 𝐇𝐚𝐢 𝟑 𝐦𝐢𝐧𝐮𝐭𝐢 𝐝𝐢 𝐭𝐞𝐦𝐩𝐨!

𝐒𝐜𝐫𝐢𝐯𝐢 𝐮𝐧𝐚 𝐥𝐞𝐭𝐭𝐞𝐫𝐚 𝐩𝐞𝐫 𝐭𝐞𝐧𝐭𝐚𝐫𝐞!`
  })

  setTimeout(() => {
    if (global.gameImpiccato[chatId]) {
      const game = global.gameImpiccato[chatId]

      if (!global.gameImpiccatoScore[chatId][game.player]) global.gameImpiccatoScore[chatId][game.player] = 0
      global.gameImpiccatoScore[chatId][game.player] -= 5

      const scoreArr = Object.entries(global.gameImpiccatoScore[chatId])
        .sort((a,b) => b[1]-a[1])
        .map(([user, pts], i) => `${i+1}. @${user.split("@")[0]} ${pts} punti`)
        .join("\n")

      conn.sendMessage(chatId, {
        text:
`⏳ 𝐓𝐄𝐌𝐏𝐎 𝐒𝐂𝐀𝐃𝐔𝐓𝐎!

𝐋𝐚 𝐩𝐚𝐫𝐨𝐥𝐚 𝐞𝐫𝐚: *${game.parola}*

𝐇𝐚𝐢 𝐩𝐞𝐫𝐬𝐨 𝟓 𝐩𝐮𝐧𝐭𝐢.
━━━━━━━━━━━━━━
📊 𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐀 𝐆𝐑𝐔𝐏𝐏𝐎:
${scoreArr}`,
        mentions: Object.keys(global.gameImpiccatoScore[chatId])
      })
      delete global.gameImpiccato[chatId]
    }
  }, 180000)
}

handler.command = /^impiccato$/i

handler.before = async (m, { conn }) => {
  const game = global.gameImpiccato[m.chat]
  if (!game) return
  if (m.sender !== game.player) return
  if (!m.text) return
  if (m.text.startsWith(".")) return
  if (m.text.length !== 1) return

  const lettera = m.text.toLowerCase()
  if (game.lettere.includes(lettera)) return

  game.lettere.push(lettera)
  if (!game.parola.includes(lettera)) game.errori++

  const parolaFormattata = formatParola(game.parola, game.lettere)
  const indovinate = game.lettere.filter(l => game.parola.includes(l))
  const sbagliate = game.lettere.filter(l => !game.parola.includes(l))
  const tempoRestante = Math.max(0, Math.floor((game.endTime - Date.now()) / 1000))
  const minuti = Math.floor(tempoRestante / 60)
  const secondi = tempoRestante % 60
  const tempoDisplay = `${minuti}:${secondi.toString().padStart(2,"0")}`

  if (!parolaFormattata.includes("_")) {
    if (!global.gameImpiccatoScore[m.chat][m.sender]) global.gameImpiccatoScore[m.chat][m.sender] = 0
    global.gameImpiccatoScore[m.chat][m.sender] += 10

    const scoreArr = Object.entries(global.gameImpiccatoScore[m.chat])
      .sort((a,b) => b[1]-a[1])
      .map(([user, pts], i) => `${i+1}. @${user.split("@")[0]} ${pts} punti`)
      .join("\n")

    await conn.sendMessage(m.chat, {
      text:
`🏆 𝐇𝐀𝐈 𝐕𝐈𝐍𝐓𝐎!

𝐏𝐚𝐫𝐨𝐥𝐚: *${game.parola}*

𝐇𝐚𝐢 𝐠𝐮𝐚𝐝𝐚𝐠𝐧𝐚𝐭𝐨 𝟏𝟎 𝐩𝐮𝐧𝐭𝐢
━━━━━━━━━━━━━━
📊 𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐀 𝐆𝐑𝐔𝐏𝐏𝐎:
${scoreArr}`,
      mentions: Object.keys(global.gameImpiccatoScore[m.chat])
    })
    delete global.gameImpiccato[m.chat]
    return
  }

  if (game.errori >= 6) {
    if (!global.gameImpiccatoScore[m.chat][m.sender]) global.gameImpiccatoScore[m.chat][m.sender] = 0
    global.gameImpiccatoScore[m.chat][m.sender] -= 5

    const scoreArr = Object.entries(global.gameImpiccatoScore[m.chat])
      .sort((a,b) => b[1]-a[1])
      .map(([user, pts], i) => `${i+1}. @${user.split("@")[0]} ${pts} punti`)
      .join("\n")

    await conn.sendMessage(m.chat, {
      text:
`💀 𝐒𝐄𝐈 𝐒𝐓𝐀𝐓𝐎 𝐈𝐌𝐏𝐈𝐂𝐂𝐀𝐓𝐎!

𝐋𝐚 𝐩𝐚𝐫𝐨𝐥𝐚 𝐞𝐫𝐚: *${game.parola}*

𝐇𝐚𝐢 𝐩𝐞𝐫𝐬𝐨 𝟓 𝐩𝐮𝐧𝐭𝐢.
━━━━━━━━━━━━━━
📊 𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐀 𝐆𝐑𝐔𝐏𝐏𝐎:
${scoreArr}`,
      mentions: Object.keys(global.gameImpiccatoScore[m.chat])
    })
    delete global.gameImpiccato[m.chat]
    return
  }

  await conn.sendMessage(m.chat, {
    text:
`🎮 𝐈𝐌𝐏𝐈𝐂𝐂𝐀𝐓𝐎 ꙰  𝟥𝟥𝟥 𝔹𝕆𝕋  ꙰

${ascii(game.errori)}

🔤 𝐏𝐚𝐫𝐨𝐥𝐚:
 *${parolaFormattata}*

✅ 𝐋𝐞𝐭𝐭𝐞𝐫𝐞 𝐢𝐧𝐝𝐨𝐯𝐢𝐧𝐚𝐭𝐞:
 *${indovinate.length ? indovinate.join(" ") : "𝐍𝐞𝐬𝐬𝐮𝐧𝐚"}*

❌ 𝐋𝐞𝐭𝐭𝐞𝐫𝐞 𝐬𝐛𝐚𝐠𝐥𝐢𝐚𝐭𝐞:
 *${sbagliate.length ? sbagliate.join(" ") : "𝐍𝐞𝐬𝐬𝐮𝐧𝐚"}*

⏳ 𝐓𝐞𝐦𝐩𝐨 𝐫𝐢𝐦𝐚𝐧𝐞𝐧𝐭𝐞: *${tempoDisplay}*`
  })
}

export default handler

function formatParola(parola, lettere) {
  return parola.split("").map(l => lettere.includes(l) ? l : "_").join(" ")
}

function ascii(errori) {
  const stages = [
`  +---+
  |    |
       |
       |
       |
       |
=========`,
`  +---+
  |    |
  O    | 
       |
       |
       |
=========`,
`  +---+
  |    |
  O    |
  |    |
       |
       |
=========`,
`  +---+
  |    |
  O    |
 /|    |
       |
       |
=========`,
`  +---+
  |    |
  O    |
 /|\   |
       |
       |
=========`,
`  +---+
  |    |
  O    |
 /|\\   |
 /     |
       |
=========`,
`  +---+
  |    |
  O    |
 /|\\   |
 / \\   |
       |
=========`
  ]
  return stages[errori]
}