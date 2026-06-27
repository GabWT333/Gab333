//Plugin by Gab, Lucifero & 333 staff

import jimp from 'jimp'
import fs from 'fs'

let handler = async (m, { conn }) => {

    let who = m.mentionedJid?.[0] || m.quoted?.sender || m.sender

    let img = await jimp.read('./icone/bonk.png')

    let avatar
    try {
        avatar = await jimp.read(await conn.profilePictureUrl(who, 'image'))
    } catch {
        avatar = await jimp.read('./icone/default.png')
    }

    avatar.resize(128, 128)

    let bonk = await img
        .composite(avatar, 120, 90)
        .getBufferAsync('image/png')

    await conn.sendMessage(m.chat, { image: bonk }, { quoted: m })
}

handler.command = /^(bonk)$/i
handler.group = true

export default handler