//Plugin by Gab, Lucifero & 333 staff

global.basket = global.basket || {}

let handler = async (m, { conn, command }) => {

  let user = global.db.data.users[m.sender]
  if (!user) return

  user.basket = user.basket || { score: 0 }

  if (command === "basket") {

    global.basket[m.sender] = true

    return conn.sendMessage(m.chat, {
      text:
`╔═🏀 𝐁𝐀𝐒𝐊𝐄𝐓 ═╗
┃ Scegli il tiro
┃
┃ 🟢 Leggero
┃ 🟡 Medio 
┃ 🔴 Forte
╚══════════════╝`,
      buttons: [
        { buttonId: ".tiro facile", buttonText: { displayText: "🟢 Leggero" }, type: 1 },
        { buttonId: ".tiro medio", buttonText: { displayText: "🟡 Medio" }, type: 1 },
        { buttonId: ".tiro tripla", buttonText: { displayText: "🔴 Forte" }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }

  if (command === "tiro") {

    if (!global.basket[m.sender])
      return m.reply("❌ Usa prima .basket")

    let tipo = m.text.split(" ")[1]
    let rand = Math.random()
    let canestro = false

    if (tipo === "facile") canestro = rand < 0.8
    if (tipo === "medio") canestro = rand < 0.5
    if (tipo === "tripla") canestro = rand < 0.3

    let text = ""

    if (canestro) {
      user.basket.score += 1

      text =
`╔═🏀 𝐂𝐀𝐍𝐄𝐒𝐓𝐑𝐎 ═╗
┃ 🏀 SWISH!
┃ Totale canestri: *${user.basket.score}*
╚══════════════╝`
    } else {
      text =
`╔═🧱 𝐄𝐑𝐑𝐎𝐑𝐄 ═╗
┃ 🧱 Ferro pieno
┃ Riprova campione
╚══════════════╝`
    }

    delete global.basket[m.sender]

    return conn.sendMessage(m.chat, {
      text,
      buttons: [
        { buttonId: ".basket", buttonText: { displayText: "🏀 Gioca di nuovo" }, type: 1 },
        { buttonId: ".topbasket", buttonText: { displayText: "🏆 Classifica" }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }

  if (command === "topbasket") {

    let users = Object.entries(global.db.data.users)
      .map(([jid, data]) => ({
        jid,
        score: data.basket?.score || 0
      }))
      .filter(u => u.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)

    if (!users.length)
      return m.reply("❌ Nessun canestro registrato")

    let text = "🏆 𝐓𝐎𝐏 𝐁𝐀𝐒𝐊𝐄𝐓\n\n"

    users.forEach((u, i) => {
      text += `${i + 1}. @${u.jid.split("@")[0]} — *${u.score}*\n`
    })

    return conn.sendMessage(m.chat, {
      text,
      mentions: users.map(u => u.jid),
      buttons: [
        { buttonId: ".basket", buttonText: { displayText: "🏀 Gioca" }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }
}

handler.command = /^(basket|tiro|topbasket)$/i
export default handler