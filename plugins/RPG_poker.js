//Plugin by Gab, Lucifero & 333 staff




const SEMI = ['♠️', '♥️', '♦️', '♣️']
const VALORI = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
const VALORE_NUM = { '2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,'J':11,'Q':12,'K':13,'A':14 }

function creaMazzo() {
  const mazzo = []
  for (const seme of SEMI)
    for (const val of VALORI)
      mazzo.push({ val, seme, num: VALORE_NUM[val] })
  return mazzo
}

function mescola(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function cartaStr(c) { return `${c.val}${c.seme}` }

function valutaMano(mano) {
  const nums = mano.map(c => c.num).sort((a, b) => a - b)
  const semi = mano.map(c => c.seme)
  const conteggioVal = {}
  for (const n of nums) conteggioVal[n] = (conteggioVal[n] || 0) + 1
  const gruppi = Object.values(conteggioVal).sort((a, b) => b - a)
  const flush = semi.every(s => s === semi[0])
  const scala = nums[4] - nums[0] === 4 && new Set(nums).size === 5
  const scalaReale = flush && scala && nums[0] === 10

  if (scalaReale)                          return { nome: '🏆 Scala Reale',      mult: 50 }
  if (flush && scala)                      return { nome: '🎖️ Scala a Colore',   mult: 20 }
  if (gruppi[0] === 4)                     return { nome: '💥 Poker',             mult: 10 }
  if (gruppi[0] === 3 && gruppi[1] === 2)  return { nome: '🏠 Full House',        mult: 5  }
  if (flush)                               return { nome: '🌊 Colore',            mult: 4  }
  if (scala)                               return { nome: '📈 Scala',             mult: 3  }
  if (gruppi[0] === 3)                     return { nome: '3️⃣ Tris',              mult: 2  }
  if (gruppi[0] === 2 && gruppi[1] === 2)  return { nome: '2️⃣ Doppia Coppia',     mult: 1.5}
  if (gruppi[0] === 2)                     return { nome: '1️⃣ Coppia',            mult: 1  }
  return                                          { nome: '💀 Carta Alta',        mult: 0  }
}

let handler = async (m, { conn, text }) => {
  const user = global.db.data.users[m.sender]
  if (!user) return m.reply('❌ Non sei registrato')

  const puntata = parseInt(text?.trim())
  if (!puntata || puntata <= 0) {
    return await conn.sendMessage(m.chat, {
      text:
`╔═ ♠️ 𝐏𝐎𝐊𝐄𝐑 𝟑𝟑𝟑 ═╗
┃
┃ 🎴 *Poker a 5 carte*
┃ *Vinci in base alla mano!*
┃
┃ 💰 *Puntate minime:* 10€
┃ 💼 *Tuoi soldi:* ${user.money || 0}€
┃
┃ 📊 *Pagamenti:*
┃ 1️⃣ Coppia      → x1
┃ 2️⃣ Doppia      → x1.5
┃ 3️⃣ Tris        → x2
┃ 📈 Scala        → x3
┃ 🌊 Colore       → x4
┃ 🏠 Full House   → x5
┃ 💥 Poker        → x10
┃ 🎖️ Scala Col.  → x20
┃ 🏆 Scala Reale  → x50
┃
╚══════════════╝`,
      footer: "𝟑𝟑𝟑 𝐂𝐀𝐒𝐈𝐍𝐎",
      buttons: [
        { buttonId: ".poker 10",  buttonText: { displayText: "💸 Punta 10€"  }, type: 1 },
        { buttonId: ".poker 50",  buttonText: { displayText: "💰 Punta 50€"  }, type: 1 },
        { buttonId: ".poker 100", buttonText: { displayText: "🤑 Punta 100€" }, type: 1 },
        { buttonId: ".casino",    buttonText: { displayText: "🔙 Torna al Casino" }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }

  if (puntata < 10) return m.reply('❌ Puntata minima: *10€*')
  if ((user.money || 0) < puntata) return m.reply(`❌ Non hai abbastanza soldi! Hai *${user.money || 0}€*`)

  const mazzo = mescola(creaMazzo())
  const mano = mazzo.slice(0, 5)
  const { nome, mult } = valutaMano(mano)
  const carteStr = mano.map(cartaStr).join('  ')

  let vincita = 0
  let esito = ''

  if (mult === 0) {
    user.money -= puntata
    esito = `❌ *Hai perso ${puntata}€!*`
  } else {
    vincita = Math.floor(puntata * mult)
    user.money += vincita
    esito = `✅ *Hai vinto ${vincita}€!*`
  }

  await conn.sendMessage(m.chat, {
    text:
`╔═ ♠️ 𝐏𝐎𝐊𝐄𝐑 𝟑𝟑𝟑 ═╗
┃
┃ 🎴 *Le tue carte:*
┃ ${carteStr}
┃
┃ 🏅 *${nome}*
┃ 💵 Puntata: ${puntata}€
┃ ${esito}
┃
┃ 💼 Saldo: *${user.money}€*
┃
╚══════════════╝`,
    footer: "𝟑𝟑𝟑 𝐂𝐀𝐒𝐈𝐍𝐎",
    buttons: [
      { buttonId: `.poker ${puntata}`, buttonText: { displayText: "🔄 Gioca ancora" }, type: 1 },
      { buttonId: ".casino",           buttonText: { displayText: "🔙 Torna al Casino" }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.command = /^poker$/i
handler.group = true
export default handler