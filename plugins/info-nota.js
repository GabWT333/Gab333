//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn, text, command }) => {
  let users = global.db.data.users
  let user = users[m.sender]

  if (!user) users[m.sender] = {}
  if (!user.note) user.note = []

  if (command === "nota") {
    if (!text) return m.reply("✍️ Scrivi qualcosa da salvare")

    user.note.push(text)

    return m.reply(`✅ Nota salvata\n📌 Totale note: ${user.note.length}`)
  }

  if (command === "note") {
    if (user.note.length === 0)
      return m.reply("📭 Non hai note")

    let txt = `📒 *LE TUE NOTE*\n\n`
    user.note.forEach((n, i) => {
      txt += `${i + 1}. ${n}\n`
    })

    return conn.sendMessage(m.chat, {
      text: txt,
      buttons: [
        { buttonId: ".rimuovinota 0", buttonText: { displayText: "🗑️ Rimuovi nota" }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }

  if (command === "rimuovinota") {
    if (user.note.length === 0)
      return m.reply("📭 Non hai note da eliminare")

    let page = parseInt(text) || 0
    let perPage = 3
    let start = page * perPage
    let end = start + perPage

    let slice = user.note.slice(start, end)

    let buttons = slice.map((_, i) => ({
      buttonId: `.delnota ${start + i + 1}`,
      buttonText: { displayText: `${start + i + 1}` },
      type: 1
    }))

    if (page > 0) {
      buttons.push({
        buttonId: `.rimuovinota ${page - 1}`,
        buttonText: { displayText: "⬅️ Indietro" },
        type: 1
      })
    }

    if (end < user.note.length) {
      buttons.push({
        buttonId: `.rimuovinota ${page + 1}`,
        buttonText: { displayText: "➡️ Avanti" },
        type: 1
      })
    }

    return conn.sendMessage(m.chat, {
      text: `🗑️ Quale nota vuoi rimuovere?\n📄 Pagina ${page + 1}`,
      buttons,
      headerType: 1
    }, { quoted: m })
  }

  if (command === "delnota") {
    let index = parseInt(text) - 1

    if (isNaN(index)) return m.reply("❌ Numero non valido")
    if (!user.note[index]) return m.reply("❌ Nota inesistente")

    let rimossa = user.note.splice(index, 1)

    return m.reply(`🗑️ Nota rimossa:\n"${rimossa}"`)
  }
}

handler.command = /^(nota|note|rimuovinota|delnota)$/i
export default handler