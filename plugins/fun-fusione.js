//Plugin by Gab, Lucifero & 333 staff

import jimp from 'jimp'

let handler = async (m, { conn }) => {

  let users = m.mentionedJid || []
  if (users.length < 2)
    return m.reply("Tagga 2 persone")

  let [u1, u2] = users

  let img1 = await conn.profilePictureUrl(u1, 'image').catch(_ => null)
  let img2 = await conn.profilePictureUrl(u2, 'image').catch(_ => null)

  if (!img1 || !img2)
    return m.reply("❌ Errore immagini")

  let a = await jimp.read(img1)
  let b = await jimp.read(img2)

  a.resize(256, 256)
  b.resize(256, 256)

  let fused = new jimp(256, 256)

  for (let x = 0; x < 256; x++) {
    for (let y = 0; y < 256; y++) {

      let p1 = jimp.intToRGBA(a.getPixelColor(x, y))
      let p2 = jimp.intToRGBA(b.getPixelColor(x, y))

      let ratio = x / 256

      let r = p1.r * (1 - ratio) + p2.r * ratio
      let g = p1.g * (1 - ratio) + p2.g * ratio
      let bcol = p1.b * (1 - ratio) + p2.b * ratio

      let color = jimp.rgbaToInt(r, g, bcol, 255)
      fused.setPixelColor(color, x, y)
    }
  }

  fused.blur(1).contrast(0.2)

  let buffer = await fused.getBufferAsync(jimp.MIME_PNG)

  let frasi = [
    "🧬 questo è il vostro figlio… chiedete scusa",
    "👶 sembra umano ma non garantisco",
    "💀 genetica: discutibile ma funzionante",
    "😂 è uscito meglio del previsto… purtroppo",
    "🧠 il cervello ha provato",
    "🫠 fusione riuscita, dignità no",
    "👀 inquietante ma realistico",
    "📉 downgrade genetico leggero",
    "🧪 esperimento quasi riuscito",
    "🤡 sembra un filtro ma è reale"
  ]

  let frase = frasi[Math.floor(Math.random() * frasi.length)]

  await conn.sendMessage(m.chat, {
    image: buffer,
    caption: `🧬 *FUSIONE REALE*\n\n@${u1.split('@')[0]} + @${u2.split('@')[0]}\n\n${frase}`,
    mentions: [u1, u2]
  })
}

handler.command = ['fusione']
handler.group = true

export default handler