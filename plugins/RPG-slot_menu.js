//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  let money = user.money || 0
  const bet = (x) => money >= x ? `.slotplay ${x}` : `no_${x}`

  await conn.sendMessage(m.chat, {
    text:
`╔═🎰 𝐒𝐋𝐎𝐓 ═╗
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
handler.command = /^slot$/i
export default handler