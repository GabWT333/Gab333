//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn }) => {
  const mention = m.mentionedJid ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null)
  const who = mention

  if (!who) throw "❌ 𝐓𝐚𝐠𝐠𝐚 𝐥𝐚 𝐩𝐞𝐫𝐬𝐨𝐧𝐚 𝐚 𝐜𝐮𝐢 𝐫𝐮𝐛𝐚𝐫𝐞 𝐢 𝐬𝐨𝐥𝐝𝐢!"

  if (who === m.sender) throw "❌ 𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐫𝐮𝐛𝐚𝐫𝐞 𝐚 𝐭𝐞 𝐬𝐭𝐞𝐬𝐬𝐨!"

  const users = global.db.data.users

  if (!users[who]) {
    users[who] = { money: 0, bank: 0, rubati: 0, furti: 0, datafurto: 'Nessuno', warn: 0 }
  }

  if (!users[m.sender]) {
    users[m.sender] = { money: 0, bank: 0, rubati: 0, furti: 0, datafurto: 'Nessuno', warn: 0 }
  }

  const uSender = users[m.sender]
  const uVictim = users[who]

  uSender.furti = uSender.furti || 0
  uSender.rubati = uSender.rubati || 0
  uSender.datafurto = uSender.datafurto || 'Nessuno'
  uSender.money = uSender.money || 0
  uSender.bank = uSender.bank || 0
  uVictim.money = uVictim.money || 0
  uVictim.bank = uVictim.bank || 0

  const senderTotalFunds = uSender.bank + uSender.money
  if (senderTotalFunds < 1000)
    throw "🏦 𝐃𝐞𝐯𝐢 𝐚𝐯𝐞𝐫𝐞 𝐚𝐥𝐦𝐞𝐧𝐨 *1000€* 𝐢𝐧 𝐛𝐚𝐧𝐜𝐚 𝐨 𝐧𝐞𝐥 𝐩𝐨𝐫𝐭𝐚𝐟𝐨𝐠𝐥𝐢𝐨 𝐩𝐞𝐫 𝐟𝐚𝐫𝐞 𝐮𝐧𝐚 𝐫𝐚𝐩𝐢𝐧𝐚!"

  const payFine = (amount) => {
    let usedBank = Math.min(uSender.bank, amount)
    uSender.bank -= usedBank
    let remaining = amount - usedBank
    let usedMoney = 0
    if (remaining > 0) {
      usedMoney = Math.min(uSender.money, remaining)
      uSender.money -= usedMoney
      remaining -= usedMoney
    }
    return { usedBank, usedMoney, remaining }
  }

  const formatFineSource = ({ usedBank, usedMoney }) => {
    const parts = []
    if (usedBank > 0) parts.push(`*${usedBank}€* dalla banca`)
    if (usedMoney > 0) parts.push(`*${usedMoney}€* dal portafoglio`)
    return parts.join(' e ')
  }

  if (uVictim.money <= 0) {
    let multa = Math.floor(Math.random() * 60) + 40
    const paid = payFine(multa)
    uSender.warn = (uSender.warn || 0) + 1
    const sourceText = formatFineSource(paid) || '*0€*'

    return conn.reply(
      m.chat,
      `🚨 @${who.split('@')[0]} 𝐧𝐨𝐧 𝐡𝐚 𝐬𝐨𝐥𝐝𝐢!\n𝐒𝐞𝐢 𝐬𝐭𝐚𝐭𝐨 𝐦𝐮𝐥𝐭𝐚𝐭𝐨 𝐝𝐢 *${multa}€* (${sourceText})`,
      null,
      { mentions: [who] }
    )
  }

  let percentuale = Math.floor(Math.random() * 21) + 5

  const fallisce = Math.random() * 100 < 40

  let testo = ""

  if (fallisce) {
    let multa = Math.floor(Math.random() * 50) + 20
    const paid = payFine(multa)
    uSender.warn = (uSender.warn || 0) + 1
    const sourceText = formatFineSource(paid) || '*0€*'

    testo = `🚨 𝐒𝐞𝐢 𝐬𝐭𝐚𝐭𝐨 𝐬𝐜𝐨𝐩𝐞𝐫𝐭𝐨!\n𝐋𝐚 𝐩𝐨𝐥𝐢𝐳𝐢𝐚 𝐭𝐢 𝐡𝐚 𝐦𝐮𝐥𝐭𝐚𝐭𝐨 𝐝𝐢 *${multa}€* (${sourceText})`
  } else {
    let rubato = Math.floor((uVictim.money * percentuale) / 100)
    rubato = Math.min(rubato, uVictim.money)

    uVictim.money -= rubato
    uSender.money += rubato

    uSender.furti += 1
    uSender.rubati += rubato
    uSender.datafurto = new Date().toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    testo = `💰 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐎!\n𝐇𝐚𝐢 𝐫𝐮𝐛𝐚𝐭𝐨 *${rubato}€* (${percentuale}%) 𝐚 @${who.split('@')[0]}`
  }

  conn.reply(m.chat, testo, null, { mentions: [who] })
}

handler.command = /^ruba$/i
export default handler