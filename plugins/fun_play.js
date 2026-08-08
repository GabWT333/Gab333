//Plugin by Gab, Lucifero & 333 staff



import yts from 'yt-search'
import { exec } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'

let pendingLyrics = {}
global.playChoice = global.playChoice || {}
global.playSelection = global.playSelection || {}

const getThumbnail = (video) => video?.thumbnail || video?.image || video?.images?.[0] || 'icone/333.jpg'

const execPromise = (cmd) => new Promise((resolve, reject) => {
  exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
    if (err) reject(new Error(stderr || err.message))
    else resolve(stdout)
  })
})

let handler = async (m, { conn, text, usedPrefix, command }) => {

  if (command === "play") {

    if (!text) return m.reply("🎧 𝐒𝐜𝐫𝐢𝐯𝐢 𝐢𝐥 𝐭𝐢𝐭𝐨𝐥𝐨!")

    let search = await yts(text)
    let results = search.videos.slice(0, 5)

    if (!results.length) return m.reply("❌ Nessun risultato")

    global.playSelection[m.sender] = results

    const selectionCards = results.map((video, index) => ({
      image: { url: getThumbnail(video) },
      title: `🎵 ${video.title.substring(0, 60)}${video.title.length > 60 ? '…' : ''}`,
      body: `🎵 *${video.title}*\n\n📺 ${video.author?.name || 'Sconosciuto'}\n⏱️ ${video.timestamp || '—'}\n👁️ ${video.views?.toLocaleString() || '—'}`,
      footer: '333 BOT',
      buttons: [{
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: `🎧 Seleziona ${index + 1}`,
          id: `.play_select ${index + 1}`
        })
      }]
    }))

    return conn.sendMessage(m.chat, {
      text: `🔎 𝐓𝐫𝐨𝐯𝐚𝐭𝐢 ${results.length} 𝐫𝐢𝐬𝐮𝐥𝐭𝐚𝐭𝐢 per "*${text}*".\n\nScrolla e scegli la canzone adatta alla tua richiesta.`,
      footer: '333 BOT',
      cards: selectionCards
    }, { quoted: m })
  }

  if (command === "play_select") {
    const index = Number((text || '').trim())
    const results = global.playSelection[m.sender]

    if (!results?.length) return m.reply("❌ Nessuna selezione attiva")
    if (!Number.isInteger(index) || index < 1 || index > results.length) {
      return m.reply("❌ Seleziona un numero valido tra i risultati mostrati")
    }

    const video = results[index - 1]
    if (!video) return m.reply("❌ Risultato non valido")

    global.playChoice[m.sender] = video
    delete global.playSelection[m.sender]

    const thumbnail = getThumbnail(video)

    const actionText = `🎶 *${video.title}*\n\n📺 Canale: ${video.author?.name || 'Sconosciuto'}\n⏱️ Durata: ${video.timestamp || '—'}\n👁️ Ascolti: ${video.views?.toLocaleString() || '—'}`

    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption: `${actionText}\n\n🎧 Scegli un'azione per questo brano:`,
      footer: '333 BOT',
      buttons: [
        {
          buttonId: '.play_audio',
          buttonText: { displayText: '🎧 Scegli audio' },
          type: 1
        },
        {
          buttonId: '.play_video',
          buttonText: { displayText: '🎥 Scegli video' },
          type: 1
        },
        {
          buttonId: '.add_queue',
          buttonText: { displayText: '🎵 Metti in coda' },
          type: 1
        }
      ],
      headerType: 1
    }, { quoted: m })

    return
  }

  let video = global.playChoice[m.sender]
  if (!video) return m.reply("❌ Nessuna richiesta attiva")

  if (command === "play_audio") {

    let infoMsg = `
ℹ️ 𝐑𝐢𝐬𝐮𝐥𝐭𝐚𝐭𝐨:

*${video.title}*

⌛️ 𝐒𝐜𝐚𝐫𝐢𝐜𝐨 𝐥’𝐚𝐮𝐝𝐢𝐨...

> 𝟥𝟥𝟥 𝔹𝕆𝕋 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐫
`
    await m.reply(infoMsg)

    let file = `./tmp_${Date.now()}.mp3`

    exec(`yt-dlp -x --audio-format mp3 -o "${file}" ${video.url}`, async (err) => {

      if (err) return m.reply("❌ Errore audio")

      await conn.sendMessage(m.chat, {
        audio: fs.readFileSync(file),
        mimetype: 'audio/mpeg'
      }, { quoted: m })

      fs.unlinkSync(file)

      global.lyricsRequest = global.lyricsRequest || {}
      global.lyricsRequest[m.sender] = video.title

      if (pendingLyrics[m.sender]) clearTimeout(pendingLyrics[m.sender])
      pendingLyrics[m.sender] = setTimeout(() => {
        delete pendingLyrics[m.sender]
        delete global.lyricsRequest[m.sender]
      }, 15000)

      const pulsanti = [
        ['✅ 𝐒𝐢', `${usedPrefix}lyrics_yes`]
      ];

      await conn.sendButton(
        m.chat,
        `📜 Vuoi il testo?\n\n*${video.title}*`,
        `Hai 15 secondi`,
        null,
        pulsanti,
        m
      );

      delete global.playChoice[m.sender]
    })
  }

  if (command === "play_video") {
    if (video.seconds > 480)
      return m.reply("❌ Max 8 minuti")

    await m.reply("🎬 𝐒𝐜𝐚𝐫𝐢𝐜𝐨 𝐯𝐢𝐝𝐞𝐨...\n> 𝟥𝟥𝟥 𝔹𝕆𝕋 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐫")

    const ts  = Date.now()
    const raw = path.join(os.tmpdir(), `vid_raw_${ts}.mp4`)
    const out = path.join(os.tmpdir(), `vid_out_${ts}.mp4`)

    try {

      await execPromise(
        `yt-dlp --no-playlist ` +
        `-f "bestvideo[vcodec^=avc1][height<=480]+bestaudio[acodec^=mp4a]/best[vcodec^=avc1][height<=480]/best[height<=480]" ` +
        `--merge-output-format mp4 --ffmpeg-location /usr/bin/ffmpeg ` +
        `--no-part --retries 3 ` +
        `-o "${raw}" "${video.url}"`
      )

      await execPromise(
        `/usr/bin/ffmpeg -y -i "${raw}" ` +
        `-c:v libx264 -preset ultrafast -crf 30 ` +
        `-vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ` +
        `-c:a aac -b:a 96k -movflags +faststart "${out}"`
      )

      fs.unlinkSync(raw)

      const sizeMB = fs.statSync(out).size / (1024 * 1024)
      if (sizeMB > 64) {
        fs.unlinkSync(out)
        return m.reply("❌ Video troppo pesante")
      }

      await conn.sendMessage(m.chat, {
        video: fs.readFileSync(out),
        mimetype: 'video/mp4',
        caption: `🎬 ${video.title}`
      }, { quoted: m })

      fs.unlinkSync(out)
      delete global.playChoice[m.sender]

    } catch (e) {
      console.log(e)
      m.reply("❌ Errore video")
    }
  }
}

handler.command = /^(play|play_audio|play_video|play_select)$/i
handler.help = ['play']
handler.tags = ['fun']

export default handler