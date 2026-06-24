//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { text }) => {

  if (!text) {
    return m.reply(`🧠 𝐂𝐀𝐋𝐂𝐎𝐋𝐀𝐓𝐑𝐈𝐂𝐄

✍🏻 Scrivi un'operazione

📌 Esempi:
• .calcola 2+2
• .calcola 10*5
• .calcola (20+5)/5`)
  }

  try {
    if (!/^[0-9+\-*/().\s]+$/.test(text)) {
      return m.reply("❌ Espressione non valida")
    }

    let result = eval(text)

    if (result === Infinity || isNaN(result)) {
      return m.reply("❌ Operazione non valida")
    }

    m.reply(`╔═🧮 𝐂𝐀𝐋𝐂𝐎𝐋𝐎═╗
┃
┃ 📥 Input:
┃ ${text}
┃
┃ 📤 Risultato:
┃ *${result}*
┃
╚══════════╝`)

  } catch (e) {
    m.reply("❌ Errore nel calcolo")
  }
}

handler.command = /^calcola$/i
handler.tags = ['utility']
handler.help = ['calcola <operazione>']

export default handler