//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn, args }) => {
  let bet = parseInt(args[0])
  let choice = args[1] // rosso o nero

  let user = global.db.data.users[m.sender]

  if (!bet || bet < 50) return m.reply("💸 Puntata minima 50€")
  if (user.money < bet) return m.reply(`💸 Devi avere almeno ${bet}€`)

  if (!choice) {
    return conn.sendMessage(m.chat, {
      text:
`🎰 *ROULETTE*

💰 Puntata: ${bet}€

Scegli dove puntare:`,
      buttons: [
        { buttonId: `.rouletteplay ${bet} rosso`, buttonText: { displayText: "🔴 Rosso" }, type: 1 },
        { buttonId: `.rouletteplay ${bet} nero`, buttonText: { displayText: "⚫ Nero" }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }


  let result = Math.random() < 0.5 ? "rosso" : "nero"

  let win = choice.toLowerCase() === result

  let text

  if (win) {
    user.money += bet
    text =
`╔═🎰 𝐑𝐎𝐔𝐋𝐄𝐓𝐓𝐄 ═╗
┃ 🎯 Risultato: *${result.toUpperCase()}*
┃ 🟢 Hai vinto!
┃ 💰 Guadagno: +${bet}€
┃
┃ 💼 Saldo: ${user.money}€
╚══════╝`
  } else {
    user.money -= bet
    if (user.money < 0) user.money = 0

    text =
`╔═🎰 𝐑𝐎𝐔𝐋𝐄𝐓𝐓𝐄 ═╗
┃ 🎯 Risultato: *${result.toUpperCase()}*
┃ 🔴 Hai perso!
┃ 💸 Perso: -${bet}€
┃
┃ 💼 Saldo: ${user.money}€
╚══════╝`
  }

  await conn.sendMessage(m.chat, {
    text,
    buttons: [
      { buttonId: `.rouletteplay ${bet}`, buttonText: { displayText: "🔁 Gioca di nuovo" }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.command = /^rouletteplay$/i
export default handler