//Plugin by Gab, Lucifero & 333 staff



import yts from 'yt-search'
import { exec } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'

const { promises: fsPromises } = fs;
let pendingLyrics = {}
global.playChoice = global.playChoice || {}

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
    let video = search.videos[0]

    if (!video) return m.reply("❌ Nessun risultato")

    global.playChoice[m.sender] = video

    return conn.sendMessage(m.chat, {
      text:
`🎶 *${video.title}*

╭─────────╮
┃📺 𝐂𝚲𝐍𝚲𝐋𝚵: *${video.author.name}*
┃⏱️ 𝐃𝐔𝐑𝚲𝐓𝚲: *${video.timestamp}*
┃👁️ 𝐕𝕀𝐒𝐔𝚲𝐋: *${video.views.toLocaleString()}*
╰─────────╯

𝐕𝐮𝐨𝐢 𝐚𝐮𝐝𝐢𝐨 𝐨  𝐯𝐢𝐝𝐞𝐨🎥?`,
      buttons: [
        { buttonId: ".play_audio", buttonText: { displayText: "🎧 𝐀𝐮𝐝𝐢𝐨" }, type: 1 },
        { buttonId: ".play_video", buttonText: { displayText: "🎥 𝐕𝐢𝐝𝐞𝐨" }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
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

      try {
        await conn.sendMessage(m.chat, {
          audio: await fsPromises.readFile(file),
          mimetype: 'audio/mpeg'
        }, { quoted: m })
      } finally {
        try {
          await fsPromises.unlink(file)
        } catch {}
      }

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

      await fsPromises.unlink(raw)

      const sizeMB = (await fsPromises.stat(out)).size / (1024 * 1024)
      if (sizeMB > 64) {
        await fsPromises.unlink(out)
        return m.reply("❌ Video troppo pesante")
      }

      try {
        await conn.sendMessage(m.chat, {
          video: await fsPromises.readFile(out),
          mimetype: 'video/mp4',
          caption: `🎬 ${video.title}`
        }, { quoted: m })
      } finally {
        try {
          await fsPromises.unlink(out)
        } catch {}
      }
      delete global.playChoice[m.sender]

    } catch (e) {
      console.error('[fun_play] Errore video:', e || 'Errore non specificato')
      m.reply("❌ Errore video")
    }
  }
}

handler.command = /^(play|play_audio|play_video)$/i
handler.help = ['play']
handler.tags = ['fun']

export default handler