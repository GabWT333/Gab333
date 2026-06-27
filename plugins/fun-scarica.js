//Plugin by Gab, Lucifero & 333 staff

import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {

  if (!text) {
    return m.reply('❌ Inserisci un link TikTok')
  }

  if (
    !text.includes('tiktok.com') &&
    !text.includes('vm.tiktok.com')
  ) {
    return m.reply('❌ Link TikTok non valido')
  }

  await m.reply(
`⏳ 𝐒𝐜𝐚𝐫𝐢𝐜𝐨 𝐢𝐥 𝐯𝐢𝐝𝐞𝐨...

> 𝟥𝟥𝟥 𝔹𝕆𝕋 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐫`
  )

  try {

    const api = `https://www.tikwm.com/api/?url=${encodeURIComponent(text)}`

    const res = await fetch(api)

    const json = await res.json()

    if (!json.data || !json.data.play) {
      return m.reply('❌ Impossibile scaricare il video')
    }

    await conn.sendMessage(m.chat, {
      video: { url: json.data.play },
      mimetype: 'video/mp4',
      caption:
`🎬 𝐕𝐢𝐝𝐞𝐨 𝐬𝐜𝐚𝐫𝐢𝐜𝐚𝐭𝐨

🎵 ${json.data.title || 'TikTok Video'}

> 𝟥𝟥𝟥 𝔹𝕆𝕋 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐫`
    }, { quoted: m })

  } catch (e) {
    console.error('[fun-scarica] Errore download TikTok:', e || 'Errore non specificato')
    m.reply(`❌ Errore download TikTok`)
  }
}

handler.command = /^(tt|tiktok|scarica)$/i
handler.help = ['tt <link>']
handler.tags = ['downloader']

export default handler