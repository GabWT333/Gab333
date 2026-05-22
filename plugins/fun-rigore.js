//Plugin by Gab, Lucifero & 333 staff

global.rigori = global.rigori || {}

let handler = async (m, { conn, command }) => {

  let user = global.db.data.users[m.sender]
  if (!user) return

  user.rigori = user.rigori || { goal: 0 }

  if (command === "rigore") {

    global.rigori[m.sender] = true

    return conn.sendMessage(m.chat, {
      text:
`╔═⚽ 𝐑𝐈𝐆𝐎𝐑𝐄 ═╗
┃ Scegli dove tirare
┃
┃ 🟢 Sinistra
┃ ⚪ Centro
┃ 🔴 Destra
╚══════════════╝`,
      buttons: [
        { buttonId: ".tira sinistra", buttonText: { displayText: "🟢 Sinistra" }, type: 1 },
        { buttonId: ".tira centro", buttonText: { displayText: "⚪ Centro" }, type: 1 },
        { buttonId: ".tira destra", buttonText: { displayText: "🔴 Destra" }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }

  if (command === "tira") {

    if (!global.rigori[m.sender])
      return m.reply("❌ Usa prima .rigore")

    let scelta = m.text.split(" ")[1]

    let portiere = ["sinistra", "centro", "destra"][
      Math.floor(Math.random() * 3)
    ]

    let gol = scelta !== portiere

    let text = ""

    if (gol) {
      user.rigori.goal += 1

      text =
`╔═⚽ 𝐆𝐎𝐋 ═╗
┃ 🥅 Il portiere va ${portiere}
┃ Tu tiri ${scelta}
┃
┃ ⚽ SEGNI!
┃ Totale gol: *${user.rigori.goal}*
╚══════════════╝`
    } else {
      text =
`╔═🧤 𝐏𝐀𝐑𝐀𝐓𝐀 ═╗
┃ 🧤 Il portiere legge tutto
┃ Vai ${scelta} pure tu
┃
┃ 💀 Che figura
╚══════════════╝`
    }

    delete global.rigori[m.sender]

    return conn.sendMessage(m.chat, {
      text,
      buttons: [
        { buttonId: ".rigore", buttonText: { displayText: "⚽ Riprova" }, type: 1 },
        { buttonId: ".toprigori", buttonText: { displayText: "🏆 Classifica" }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }

  if (command === "toprigori") {

    let users = Object.entries(global.db.data.users)
      .map(([jid, data]) => ({
        jid,
        goal: data.rigori?.goal || 0
      }))
      .filter(u => u.goal > 0)
      .sort((a, b) => b.goal - a.goal)
      .slice(0, 10)

    if (!users.length)
      return m.reply("❌ Nessun gol registrato")

    let text = "🏆 𝐓𝐎𝐏 𝐑𝐈𝐆𝐎𝐑𝐈\n\n"

    users.forEach((u, i) => {
      text += `${i + 1}. @${u.jid.split("@")[0]} — *${u.goal} gol*\n`
    })

    return conn.sendMessage(m.chat, {
      text,
      mentions: users.map(u => u.jid),
      buttons: [
        { buttonId: ".rigore", buttonText: { displayText: "⚽ Gioca" }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }
}

handler.command = /^(rigore|tira|toprigori)$/i
export default handler