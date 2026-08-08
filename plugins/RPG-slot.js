//Plugin by Gab, Lucifero & 333 staff

global.casinoRateLimit = global.casinoRateLimit || {}

const checkRateLimit = (userId, commandName) => {
  const key = `${userId}_${commandName}`
  const now = Date.now()
  const lastUse = global.casinoRateLimit[key]
  
  if (lastUse && now - lastUse < 120000) {
    const timeLeft = Math.ceil((120000 - (now - lastUse)) / 1000)
    return { allowed: false, timeLeft }
  }
  
  global.casinoRateLimit[key] = now
  return { allowed: true }
}

let handler = async (m, { conn, args }) => {
  const rateCheck = checkRateLimit(m.sender, 'slot')
  if (!rateCheck.allowed) {
    return m.reply(`⏳ *Devi aspettare ${rateCheck.timeLeft} secondi* prima di giocare di nuovo alle slot!`)
  }

  let bet = parseInt(args[0])
  let user = global.db.data.users[m.sender]

  if (user.money < bet) return m.reply(`💸 Devi avere almeno ${bet}€`)

  let s = ["🍒","🍋","💎","7️⃣"]
  let r = () => s[Math.floor(Math.random()*s.length)]

  let a=r(), b=r(), c=r()

  let text

  if (a===b && b===c) {
    user.money += bet*2
    text =
`╔═🎰 𝐒𝐋𝐎𝐓 ═╗
┃ ${a} ${b} ${c}
┃ 💎 JACKPOT +${bet*2}€
┃
┃ 💼 Saldo: ${user.money}€
╚══════╝`
  } else {
    user.money -= bet
    text =
`╔═🎰 𝐒𝐋𝐎𝐓 ═╗
┃ ${a} ${b} ${c}
┃ 💀 Perso -${bet}€
┃
┃ 💼 Saldo: ${user.money}€
╚══════╝`
  }

  await conn.sendMessage(m.chat, {
    text,
    buttons: [
      { buttonId: ".slot", buttonText: { displayText: "🔁 Gioca di nuovo" }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.command = /^slotplay$/i
export default handler