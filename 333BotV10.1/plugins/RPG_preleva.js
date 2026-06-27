//Plugin by Gab, Lucifero & 333 staff



global.prelievi = global.prelievi || {}

let handler = async (m, { conn, command, text }) => {
  let users = global.db.data.users
  const who = m.sender

  if (!users[who]) users[who] = {}

  users[who].bank = Number(users[who].bank) || 0
  users[who].money = Number(users[who].money) || 0

  if (command === "confermaprelievo") {
    let data = global.prelievi[who]
    if (!data) return m.reply("❌ Nessun prelievo in corso")

    let amount = Number(data) || 0

    if (amount > users[who].bank)
      return m.reply("🏦 Fondi insufficienti")

    users[who].bank -= amount
    users[who].money += amount
    users[who].ultimoprelievo = amount

    delete global.prelievi[who]

    let testo = `══════ •⊰✦⊱• ══════
𝐇𝐚𝐢 𝐩𝐫𝐞𝐥𝐞𝐯𝐚𝐭𝐨 ${amount} €

💰𝐂𝐨𝐧𝐭𝐚𝐧𝐭𝐢: ${users[who].money} €
🏦 𝐁𝐚𝐧𝐜𝐚: ${users[who].bank} €
══════ •⊰✦⊱• ══════`

    return conn.reply(m.chat, testo, m)
  }

  if (command === "annullaprelievo") {
    delete global.prelievi[who]
    return m.reply("❌ Prelievo annullato")
  }

  if (!text) throw '𝐐𝐮𝐚𝐧𝐭𝐢 𝐬𝐨𝐥𝐝𝐢 𝐯𝐮𝐨𝐢 𝐩𝐫𝐞𝐥𝐞𝐯𝐚𝐫𝐞?'

  const prelievo = parseInt(text)

  if (isNaN(prelievo)) throw "𝐍𝐨𝐧 𝐡𝐚𝐢 𝐢𝐧𝐬𝐞𝐫𝐢𝐭𝐨 𝐮𝐧 𝐧𝐮𝐦𝐞𝐫𝐨"
  if (prelievo < 0) throw "𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐩𝐫𝐞𝐥𝐞𝐯𝐚𝐫𝐞 soldi negativi"
  if (prelievo > users[who].bank)
    throw "🏦 Non hai abbastanza soldi"

  global.prelievi[who] = prelievo

  await conn.sendMessage(m.chat, {
    text: `💸 Sei sicuro di voler prelevare *${prelievo}€*?`,
    buttons: [
      { buttonId: ".confermaprelievo", buttonText: { displayText: "✅ SI" }, type: 1 },
      { buttonId: ".annullaprelievo", buttonText: { displayText: "❌ NO" }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.command = /^(preleva|prelievo|ritira|confermaprelievo|annullaprelievo)$/i
handler.tags = ['RPG']

export default handler