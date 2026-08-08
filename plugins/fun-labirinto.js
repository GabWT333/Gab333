//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn, command }) => {

  global.labirinti = global.labirinti || {}

  let user = m.sender

  if (command === "labirinto") {

    if (global.labirinti[user]) {
      return m.reply("🧩 Sei già dentro un labirinto, genio.")
    }

    const mosse = ["up", "down", "left", "right"]
    let path = []
    for (let i = 0; i < 5; i++) {
      path.push(mosse[Math.floor(Math.random() * mosse.length)])
    }

    global.labirinti[user] = {
      path,
      step: 0
    }

    return conn.sendMessage(m.chat, {
      text: `🧩 @${user.split("@")[0]} sei bloccato nel labirinto!\n\nScegli la direzione giusta per uscire...`,
      mentions: [user],
      buttons: [
        { buttonId: ".move up", buttonText: { displayText: "⬆️" }, type: 1 },
        { buttonId: ".move down", buttonText: { displayText: "⬇️" }, type: 1 },
        { buttonId: ".move left", buttonText: { displayText: "⬅️" }, type: 1 },
        { buttonId: ".move right", buttonText: { displayText: "➡️" }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }

  if (command === "move") {

    let game = global.labirinti[user]
    if (!game) return

    let scelta = (m.text.split(" ")[1] || "").toLowerCase()

    if (!["up","down","left","right"].includes(scelta)) return

    if (m.sender !== user) return m.reply("❌ Questo labirinto non è tuo.")

    let corretta = game.path[game.step]

    if (scelta !== corretta) {
      delete global.labirinti[user]
      return m.reply("💀 Strada sbagliata... sei finito in un vicolo cieco.")
    }

    game.step++

    if (game.step >= game.path.length) {
      delete global.labirinti[user]

      let reward = Math.floor(Math.random() * 500) + 200
      global.db.data.users[user].money += reward

      return m.reply(`🏆 Sei uscito dal labirinto!\n💰 Guadagni ${reward}€`)
    }

    return conn.sendMessage(m.chat, {
      text: `🧩 Step ${game.step}/${game.path.length}\nContinua...`,
      buttons: [
        { buttonId: ".move up", buttonText: { displayText: "⬆️" }, type: 1 },
        { buttonId: ".move down", buttonText: { displayText: "⬇️" }, type: 1 },
        { buttonId: ".move left", buttonText: { displayText: "⬅️" }, type: 1 },
        { buttonId: ".move right", buttonText: { displayText: "➡️" }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }
}

handler.command = /^(labirinto|move)$/i
export default handler