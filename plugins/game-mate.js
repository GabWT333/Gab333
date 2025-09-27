// Inizializza activeGame come un array vuoto o un oggetto
let activeGame = [] // oppure {} se preferisci un oggetto

let handler = async (m, { conn, args, usedPrefix, command }) => {
  conn.math = conn.math ? conn.math : {}
  
  if (args.length < 1) {
      throw `
🧮 *Livelli di difficoltà disponibili:* 
${Object.keys(modes).map(v => `▢ ${v}`).join('\n')}

📌 Esempio: ${usedPrefix + command} normale
`.trim()
  }

  let mode = args[0].toLowerCase()
  if (!(mode in modes)) {
      throw `
🧮 *Livelli di difficoltà disponibili:* 
${Object.keys(modes).map(v => `▢ ${v}`).join('\n')}

📌 Esempio: ${usedPrefix + command} normale
`.trim()
  }
  
  let id = m.chat // Usa l'ID della chat come identificativo unico

  if (activeGame.length > 0) { // Verifica se c'è un gioco attivo
      let remainingTime = ((activeGame[1].time - (Date.now() - activeGame[2])) / 1000)
      return conn.reply(m.chat, 
          `⚠️ C'è già una domanda attiva in questa chat!\n\n` +
          `Domanda: *${activeGame[1].str}*\n` +
          `Tempo rimanente: ${remainingTime.toFixed(1)} secondi`, 
          activeGame[0])
  }

  // ... il resto del codice

  

  let math = genMath(mode)
  let startTime = Date.now()
  
  conn.math[id] = [
    await conn.reply(m.chat, 
        `▢ *QUANTO FA* ${math.str}?\n\n` +
        `⏳ Tempo: ${(math.time / 1000).toFixed(0)} secondi\n` +
        `💰 Premio: ${math.bonus} XP`, 
        m),
    math,
    startTime,
    setTimeout(() => {
        if (conn.math[id]) {
            conn.reply(m.chat, 
                `⏰ Tempo scaduto!\n` +
                `La risposta era: *${math.result}*`, 
                conn.math[id][0])
            delete conn.math[id]
        }
    }, math.time)
]
  
  // Handler per verificare le risposte
  let answerHandler = async ({ messages }) => {
      let msg = messages[0]
      if (!msg.message || !conn.math[id] || msg.key.remoteJid !== id) return
      
      let text = msg.message.conversation || ''
      if (text === math.result.toString()) {
          let timeTaken = (Date.now() - startTime) / 1000
          let score = Math.max(1, Math.floor(math.bonus * (1 - timeTaken / (math.time / 1000))))
          
          await conn.reply(m.chat, 
              `✅ *RISPOSTA CORRETTA!*\n\n` +
              `Hai impiegato: ${timeTaken.toFixed(2)} secondi\n` +
              `Punteggio: ${score} XP`, 
              msg)
          
          clearTimeout(conn.math[id][3])
          delete conn.math[id]
          conn.ev.off('messages.upsert', answerHandler)
      } else if (/^\d+$/.test(text)) {
          await conn.reply(m.chat, `❌ Risposta sbagliata! Riprova`, msg)
      }
  }
  
  conn.ev.on('messages.upsert', answerHandler)
}

handler.help = ['mate <livello>']
handler.tags = ['game']
handler.command = ['mate', 'math', 'calcolo'] 

let modes = {
  principiante: [-3, 3, -3, 3, '+-', 15000, 100],
  facile: [-10, 10, -10, 10, '*/+-', 20000, 400],
  normale: [-40, 40, -20, 20, '*/+-', 40000, 700],
  difficile: [-100, 100, -70, 70, '*/+-', 30000, 800],
  estremo: [-999999, 999999, -999999, 999999, '*/', 99999, 4500]
}

let operators = {
  '+': '+',
  '-': '-',
  '*': '×',
  '/': '÷'
}

function genMath(mode) {
  let [a1, a2, b1, b2, ops, time, bonus] = modes[mode]
  let a = randomInt(a1, a2)
  let b = randomInt(b1, b2)
  let op = pickRandom([...ops])
  
  // Evita divisioni per zero
  if (op === '/' && b === 0) b = 1
  
  let result = (new Function(`return ${a} ${op.replace('/', '*')} ${b < 0 ? `(${b})` : b}`))()
  if (op == '/') [a, result] = [result, a]
  
  // Arrotonda i risultati delle divisioni
  if (op === '/') result = Math.round(result * 100) / 100
  
  return {
      str: `${a} ${operators[op]} ${b}`,
      mode,
      time,
      bonus,
      result
  }
}

function randomInt(from, to) {
  if (from > to) [from, to] = [to, from]
  from = Math.floor(from)
  to = Math.floor(to)
  return Math.floor((to - from) * Math.random() + from)
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

handler.modes = modes

export default handler