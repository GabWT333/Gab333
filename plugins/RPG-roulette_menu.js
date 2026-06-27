//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  let money = user.money || 0

  const bet = (x) => money >= x ? `.rouletteplay ${x}` : `no_${x}`

  await conn.sendMessage(m.chat, {
    text:
`╔═🎰 𝐑𝐎𝐔𝐋𝐄𝐓𝐓𝐄 ═╗
┃ 💰 Portafoglio: *${money}€*
┃
┃ Scegli la puntata
╚══════╝`,
    buttons: [
      { buttonId: bet(100), buttonText: { displayText: "100€" }, type: 1 },
      { buttonId: bet(200), buttonText: { displayText: "200€" }, type: 1 },
      { buttonId: bet(500), buttonText: { displayText: "500€" }, type: 1 },
      { buttonId: bet(1000), buttonText: { displayText: "1000€" }, type: 1 },
      { buttonId: bet(10000), buttonText: { displayText: "10000€" }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m })
}
handler.command = /^roulette$/i
export default handler