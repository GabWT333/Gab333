//Plugin by Gab, Lucifero & 333 staff

import { sticker } from '../lib/sticker.js'
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'

const isUrl = (text) => {
    return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png)/, 'gi'))
}

let handler = async (m, { conn, args }) => {
    let stiker = false
    try {
        let q = m.quoted ? m.quoted : m

        if (q.viewOnce || q.msg?.viewOnce || q.ephemeralExpiration || m.viewOnce || m.msg?.viewOnce) {
            return m.reply('🚫 Impossibile fare sticker alle foto a una visualizzazione.')
        }

        let mime = (q.msg || q).mimetype || q.mediaType || ''

        const senderName = m.pushName || m.sender.split('@')[0] || 'Utente'
        const packname = `${senderName}`
        const author = `333 bot`

        if (args[0] && global.screenStickerMap && global.screenStickerMap[args[0]]) {
            m.reply('ⓘ 𝐂𝐫𝐞𝐨 𝐬𝐭𝐢𝐜𝐤𝐞𝐫...')
            try {
                const img = global.screenStickerMap[args[0]]
                delete global.screenStickerMap[args[0]]
                stiker = await sticker(img, false, packname, author)
            } catch (e) {
                console.error(e)
            }
        } else if (/webp|image|video/g.test(mime)) {
            if (/video/g.test(mime) && (q.msg || q).seconds > 9) return

            m.reply('ⓘ 𝐂𝐚𝐫𝐢𝐜𝐚𝐦𝐞𝐧𝐭𝐨 ...')
            let img = await q.download?.()
            if (!img) return

            let out
            try {
                stiker = await sticker(img, false, packname, author)
            } catch (e) {
                console.error(e)
            } finally {
                if (!stiker) {
                    if (/image|webp/g.test(mime)) out = await uploadImage(img)
                    else if (/video/g.test(mime)) out = await uploadFile(img)
                    if (typeof out !== 'string') out = await uploadImage(img)
                    stiker = sticker(false, out, packname, author)
                }
            }
        } else if (args[0]) {
            if (isUrl(args[0])) {
                stiker = await sticker(false, args[0], packname, author)
            } else return
        }
    } catch (e) {
        console.error(e)
        if (!stiker) stiker = e
    } finally {
        if (stiker) conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
        else return
    }
}

handler.help = ['stiker (caption|reply media)', 'stiker <url>', 'stikergif (caption|reply media)', 'stikergif <url>']
handler.tags = ['sticker']
handler.command = /^s(tic?ker)?(gif)?(wm)?$/i

export default handler