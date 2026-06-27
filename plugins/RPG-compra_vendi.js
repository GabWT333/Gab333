//Plugin by Gab, Lucifero & 333 staff

const confirmation = {}

const MERCI = [
  { nome: "Oro", min: 1000, max: 2000 },
  { nome: "Argento", min: 1000, max: 1500 },
  { nome: "Quadri antichi", min: 500, max: 1000 },
  { nome: "Gioielli", min: 3000, max: 5000 },
  { nome: "Vini pregiati", min: 2000, max: 4000 },
  { nome: "Pacco segreto", min: 100, max: 5000 },
  { nome: "Armi", min: 4000, max: 6000 },
  { nome: "Contrabbando", min: 500, max: 1000 }
]

async function handler(m, { conn, command }) {
  const users = global.db.data.users

  if (!users[m.sender]) {
    users[m.sender] = {
      money: 0,
      bank: 0,
      magazzino: [],
      buyHistory: [],
      sellHistory: []
    }
  }

  const user = users[m.sender]
  const now = Date.now()

  user.magazzino = user.magazzino || []
  user.buyHistory = user.buyHistory || []
  user.sellHistory = user.sellHistory || []

  const WINDOW = 30 * 60 * 1000
  const MAX_BUYS = 3
  const MAX_SELLS = 3

  user.buyHistory = user.buyHistory.filter(t => now - t < WINDOW)
  user.sellHistory = user.sellHistory.filter(t => now - t < WINDOW)

  if (command === 'compra') {
    if (user.buyHistory.length >= MAX_BUYS)
      return m.reply("⏳ Hai finito gli acquisti disponibili, torna tra poco!")

    if (user.money < 5000)
      return m.reply("❌ Servono almeno 5000€")

    user.money -= 5000

    const item = MERCI[Math.floor(Math.random() * MERCI.length)]
    const valore = Math.floor(Math.random() * (item.max - item.min + 1)) + item.min
    const quantità = Math.floor(Math.random() * 5) + 1

    user.magazzino.push({ nome: item.nome, valore, quantità })
    user.buyHistory.push(now)

    return conn.sendMessage(m.chat, {
      text:
`📦 Acquisto completato

🧾 ${quantità}x ${item.nome}
💰 valore unitario: ${valore}€`
    }, { quoted: m })
  }

  if (command === 'vendi') {
    if (user.magazzino.length === 0)
      return m.reply("❌ Magazzino vuoto")

    if (user.sellHistory.length >= MAX_SELLS)
      return m.reply("⏳ Limite vendite raggiunto, torna tra poco!")

    if (confirmation[m.sender])
      return m.reply("❌ Hai già una vendita attiva")

    confirmation[m.sender] = {
      sender: m.sender,
      chat: m.chat,
      timeout: setTimeout(() => {
        delete confirmation[m.sender]
        conn.sendMessage(m.chat, {
          text: "⏳ Vendita annullata (timeout)"
        })
      }, 60000)
    }

    return conn.sendMessage(m.chat, {
      text:
`💼 Confermi la vendita di tutto il magazzino?`,
      buttons: [
        {
          buttonId: ".yes",
          buttonText: { displayText: "✔ CONFERMA" },
          type: 1
        },
        {
          buttonId: ".rifiuta",
          buttonText: { displayText: "✖ RIFIUTA" },
          type: 1
        }
      ],
      headerType: 1
    }, { quoted: m })
  }
}

handler.before = async function (m, { conn }) {
  let buttonId = (m.message && m.message.buttonsResponseMessage && m.message.buttonsResponseMessage.selectedButtonId) ||
                 (m.msg && m.msg.selectedButtonId) ||
                 m.text

  if (!buttonId && m.message && m.message.interactiveResponseMessage && m.message.interactiveResponseMessage.nativeFlowResponseMessage && m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson) {
    try {
      const params = JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson)
      buttonId = params.id
    } catch (e) {
      console.error('Errore parsing paramsJson compra_vendi:', e)
    }
  }

  if (!buttonId || (buttonId !== '.yes' && buttonId !== '.rifiuta')) return
  if (!confirmation[m.sender]) return

  const data = confirmation[m.sender]
  clearTimeout(data.timeout)
  delete confirmation[m.sender]

  const users = global.db.data.users
  const user = users[m.sender]
  const bankBalance = Number(user.bank) || 0
  const cardBalance = Number(user.money) || 0

  if (buttonId === '.rifiuta') {
    return conn.sendMessage(m.chat, {
      text: "❌ Vendita annullata"
    }, { quoted: m })
  }

  let totale = 0
  for (const item of user.magazzino) {
    totale += item.valore * item.quantità
  }

  const polizia = Math.random() < 0.4

  if (polizia) {
    let multa = 0
    if (bankBalance > 0) {
      multa = Math.floor(bankBalance * 0.2)
      user.bank = Math.max(0, bankBalance - multa)
    } else if (cardBalance > 0) {
      multa = Math.floor(cardBalance * 0.2)
      user.money = Math.max(0, cardBalance - multa)
    }

    user.magazzino = []
    user.sellHistory.push(Date.now())

    return conn.sendMessage(m.chat, {
      text:
`🚨 POLIZIA!

Ti hanno sgamato.
💸 Multa: ${multa}€
📦 Magazzino confiscato`
    }, { quoted: m })
  }

  user.money += totale
  user.magazzino = []
  user.sellHistory.push(Date.now())

  return conn.sendMessage(m.chat, {
    text:
`💰 Vendita completata!

Guadagno totale: ${totale}€`
  }, { quoted: m })
}

handler.command = ['compra', 'vendi']
export default handler