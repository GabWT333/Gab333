//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn, args }) => {
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