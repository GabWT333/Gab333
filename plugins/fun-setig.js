//Plugin by Gab, Lucifero & 333 staff

import fetch from "node-fetch";

let handler = async (m, { conn, text }) => {

  if (!text) {
    return conn.sendMessage(m.chat, {
      text: ` *Inserisci il tuo username Instagram*

*Uso:*
.setig tuo_username
.setig https://instagram.com/tuo_username`
    }, { quoted: m })
  }

  let username = text.trim()

  if (username.includes('instagram.com/')) {
    const match = username.match(/instagram\.com\/([^/?]+)/)
    if (match) username = match[1]
  }

  if (username.startsWith('@')) {
    username = username.substring(1)
  }

  global.db.data.users[m.sender].nomeinsta = username

  let profilePic
  try {
    profilePic = await conn.profilePictureUrl(m.sender, 'image')
  } catch {
    profilePic = null
  }

  const thumb = profilePic
    ? await (await fetch(profilePic)).buffer()
    : await (await fetch('https://telegra.ph/file/17e7701f8b0a63806e312.png')).buffer()

  const messageText = `✅ 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦 𝐢𝐦𝐩𝐨𝐬𝐭𝐚𝐭𝐨

Usa ''.rimuoviig'' per rimuoverlo

🤳🏻 instagram.com/${username}`

  await conn.sendMessage(m.chat, {
    text: messageText,
    contextInfo: {
      mentionedJid: [m.sender],
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363341274693350@newsletter',
        serverMessageId: '',
        newsletterName: global.nomebot || '333'
      },
      externalAdReply: {
        title: 'Instagram configurato ✅',
        body: 'Vai al canale 333',
        mediaType: 1,
        thumbnail: thumb,
        renderLargerThumbnail: false,
        sourceUrl: 'https://instagram.com/' + username
      }
    }
  })
}

handler.help = ['setig']
handler.tags = ['fun']
handler.command = ['setig', 'setinsta', 'setinstagram']

export default handler