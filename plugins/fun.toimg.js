import fetch from 'node-fetch'
import { webp2png } from '../lib/webp2png.js'

let handler = async (m, { conn }) => {
  try {
    let q = m.quoted ? m.quoted : m
    if (!q) return m.reply('Rispondi ad uno sticker.')

    let mime = (q.msg || q).mimetype || q.mediaType || ''
    if (!/webp|sticker/.test(mime) && !(q.msg && q.msg.stickerMessage)) return m.reply('Rispondi ad uno sticker.')

    m.reply('⏳ Converto sticker in immagine...')

    let webpBuffer = await q.download?.()
    if (!webpBuffer) return m.reply('Errore nel download dello sticker.')

    let pngUrl
    try {
      pngUrl = await webp2png(webpBuffer)
    } catch (e) {
      console.error('webp2png error', e)
      return m.reply('Errore nella conversione dello sticker.')
    }

    const res = await fetch(pngUrl)
    const pngBuffer = await res.buffer()

    await conn.sendFile(m.chat, pngBuffer, 'sticker.png', '', m)
  } catch (e) {
    console.error(e)
    m.reply('Errore durante la conversione dello sticker.')
  }
}

handler.help = ['toimg', 'sticker2img']
handler.tags = ['sticker']
handler.command = /^(toimg|sticker2img|st2img|s2img)$/i

export default handler
