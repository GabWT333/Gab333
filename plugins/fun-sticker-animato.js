//Codice di fun-stickeranimato.js

//Plugin by Gab, Lucifero & 333 staff

import { sticker } from '../lib/sticker.js'
import { createCanvas } from '@napi-rs/canvas'
import pkg from 'gifenc'
const { GIFEncoder, quantize, applyPalette } = pkg

// Word wrap generico, ritorna array di righe
const wrapText = (ctx, text, maxWidth) => {
    const lines = []
    let line = ''
    for (let word of text.split(' ')) {
        const testLine = line + (line ? ' ' : '') + word
        if (ctx.measureText(testLine).width > maxWidth && line) {
            lines.push(line)
            line = word
        } else {
            line = testLine
        }
    }
    if (line) lines.push(line)
    return lines
}

// Disegna lo stato "fino alla riga upTo" (0-indexed, inclusa) nel canvas
const drawFrame = (ctx, allWrappedLines, upTo, author) => {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 500, 300)

    ctx.fillStyle = '#000000'
    ctx.font = 'bold 40px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const visible = allWrappedLines.slice(0, upTo + 1)
    const lineHeight = 50
    const totalHeight = visible.length * lineHeight
    let startY = (300 - totalHeight) / 2

    for (let l of visible) {
        ctx.fillText(l, 250, startY)
        startY += lineHeight
    }

    ctx.font = 'bold 14px Arial'
    ctx.fillStyle = '#666666'
    ctx.textAlign = 'right'
    ctx.fillText(`By: ${author}`, 480, 285)
}

// Crea GIF animata: ogni riga appare sotto la precedente
const createAnimatedTextGif = async (rawLines, author) => {
    try {
        const canvas = createCanvas(500, 300)
        const ctx = canvas.getContext('2d')
        ctx.font = 'bold 40px Arial'

        let wrapped = []
        for (let raw of rawLines) {
            wrapped.push(...wrapText(ctx, raw, 450))
        }

        const gif = GIFEncoder()

        for (let i = 0; i < wrapped.length; i++) {
            drawFrame(ctx, wrapped, i, author)
            const { data } = ctx.getImageData(0, 0, 500, 300)
            const palette = quantize(data, 256)
            const index = applyPalette(data, palette)
            const isLast = i === wrapped.length - 1
            gif.writeFrame(index, 500, 300, { palette, delay: isLast ? 1500 : 700 })
        }

        gif.finish()
        return Buffer.from(gif.bytes())
    } catch (e) {
        console.error('Errore GIF animata:', e)
        return null
    }
}

let handler = async (m, { conn, args }) => {
    if (!args.length) return m.reply('ⓘ Uso: .st Test ciao (ogni parola/riga separata da spazio, oppure usa | per righe con più parole)')

    const senderName = m.pushName || m.sender.split('@')[0] || 'Utente'
    const packname = `${senderName}`
    const author = `333 bot`

    const text = args.join(' ')
    let parts = text.includes('|')
        ? text.split('|').map(s => s.trim()).filter(Boolean)
        : args.filter(Boolean)

    if (!parts.length) parts = [text]

    m.reply('ⓘ 𝐂𝐫𝐞𝐨 𝐬𝐭𝐢𝐜𝐤𝐞𝐫 𝐚𝐧𝐢𝐦𝐚𝐭𝐨...')

    let stiker = false
    try {
        const gif = await createAnimatedTextGif(parts, author)
        if (gif) stiker = await sticker(gif, false, packname, author)
    } catch (e) {
        console.error(e)
    }

    if (stiker) conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
}

handler.help = ['st <parola1> <parola2> ...', 'st <riga1>|<riga2> (sticker animato, nero su bianco, righe progressive)']
handler.tags = ['sticker']
handler.command = /^st$/i

export default handler