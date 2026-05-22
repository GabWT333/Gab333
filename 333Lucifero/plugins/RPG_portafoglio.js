//Plugin by Gab, Lucifero & 333 staff

import { createCanvas, loadImage } from 'canvas'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const renderCard = async ({
  userName,
  bank,
  wallet,
  stolen,
  cardNumber,
  iban,
  cardImg
}) => {

  const bg = await loadImage(cardImg)
  const W = bg.width
  const H = bg.height

  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext('2d')

  ctx.drawImage(bg, 0, 0, W, H)

  const GOLD = '#D4AF37'
  const GLDL = '#EECD5A'
  const WHITE = 'rgba(255,255,255,0.93)'
  const RED = 'rgba(210,75,65,0.95)'

  const txt = (text, x, y, font, color, skew = 0) => {
    ctx.save()

    ctx.transform(1, 0, skew, 1, 0, 0)

    const rx = x - skew * y

    ctx.font = font

    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.fillText(text, rx + 2, y + 2)

    ctx.fillStyle = color
    ctx.fillText(text, rx, y)

    ctx.restore()
  }

  const SK = -0.15
  const SK2 = -0.15

  txt(
    userName,
    560,
    255,
    '500 44px sans-serif',
    GLDL,
    SK
  )

  const x = 620
  const cy = 360

  txt(
    'IN BANCA',
    x,
    cy,
    '400 40px sans-serif',
    GOLD,
    SK
  )

  txt(
    `€ ${Number(bank).toLocaleString('it-IT')}`,
    x,
    cy + 28,
    '700 30px sans-serif',
    WHITE,
    SK
  )

  txt(
    'PORTAFOGLIO',
    x,
    cy + 82,
    '400 40px sans-serif',
    GOLD,
    SK
  )

  txt(
    `€ ${Number(wallet).toLocaleString('it-IT')}`,
    x,
    cy + 110,
    '700 30px sans-serif',
    WHITE,
    SK
  )

  txt(
    'TOTALE RUBATO',
    x,
    cy + 164,
    '400 40px sans-serif',
    RED,
    SK
  )

  txt(
    `€ ${Number(stolen).toLocaleString('it-IT')}`,
    x,
    cy + 188,
    '700 30px sans-serif',
    RED,
    SK
  )

  txt(
    cardNumber,
    400,
    810,
    '700 27px monospace',
    WHITE,
    SK2
  )

  txt(
    iban,
    400,
    852,
    '400 25px monospace',
    GLDL,
    SK2
  )

  return canvas.toBuffer('image/jpeg')
}

const handler = async (m, { conn, args }) => {

  const who = m.sender
  const userName = m.pushName || 'Utente'

  const users = global.db.data.users

  if (!users[m.sender]) {
    users[m.sender] = {
      pin: null
    }
  }

  if (!users[who]) {
    users[who] = {
      money: 0,
      bank: 0,
      furti: 0,
      rubati: 0,
      datafurto: 'Nessuno',
      iban: null,
      card: null
    }
  }

  const me = users[m.sender]
  const user = users[who]

  if (!me.pin) {
    return m.reply(
      '🔐 Imposta prima un PIN con .impostapin'
    )
  }

  if (!args[0]) {
    return m.reply(
      '🔐 Scrivi il PIN così:\n.portafoglio 1234'
    )
  }

  if (args[0] !== me.pin) {
    return m.reply('❌ PIN ERRATO')
  }

  if (!user.card) {

    user.card = Array
      .from(
        { length: 16 },
        () => Math.floor(Math.random() * 10)
      )
      .join('')
      .replace(/(.{4})/g, '$1 ')
      .trim()
  }

  const money = Number(user.money) || 0
  const bank = Number(user.bank) || 0
  const stolen = Number(user.rubati) || 0

  const iban = user.iban ?? 'Non assegnato'

  await conn.sendMessage(
    m.chat,
    {
      text:
`💳 Accesso alla carta...
👤 ${userName}`,
      mentions: [who]
    },
    { quoted: m }
  )

  await new Promise(r => setTimeout(r, 2000))

  const cardImgPath = path.join(
    __dirname,
    '..',
    'icone',
    '333bank.jpg'
  )

  if (!fs.existsSync(cardImgPath)) {

    return conn.reply(
      m.chat,
`💳 *PORTAFOGLIO*

👤 ${userName}
🏦 Banca: ${bank} €
👛 Tasca: ${money} €
🥷 Rubato: ${stolen} €
💳 Carta: ${user.card}
🏦 IBAN: ${iban}`,
      m
    )
  }

  try {

    const imgBuffer = await renderCard({
      userName,
      bank,
      wallet: money,
      stolen,
      cardNumber: user.card,
      iban,
      cardImg: cardImgPath
    })

    await conn.sendMessage(
      m.chat,
      {
        image: imgBuffer,
        mimetype: 'image/jpeg',
        caption: `💳 *333 Bank* — @+${userName}`,
        mentions: [who]
      },
      { quoted: m }
    )

  } catch (e) {

    conn.reply(
      m.chat,
      `❌ Errore rendering: ${e.message}`,
      m
    )
  }
}

handler.command = /^portafoglio|budget|soldi|tasca|cash$/i

export default handler