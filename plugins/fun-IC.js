//Plugin by Gab, Lucifero & 333 staff

import yts from 'yt-search'
import { exec } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'

const songs = [
  { title: 'Non Mollare Mai', artist: 'Gigi D\'Alessio' },
  { title: 'Annare', artist: 'Gigi D\'Alessio' },
  { title: 'Un Nuovo Bacio', artist: 'Gigi D\'Alessio' },
  { title: 'Il Cammino dell\'età', artist: 'Gigi D\'Alessio' },
  { title: 'Mi Aiuti', artist: 'Gigi D\'Alessio' },
    { title: 'La prima stella', artist: 'Gigi D\'Alessio' },
    { title: 'Quando', artist: 'Gigi D\'Alessio' },
    { title: 'Tu Che Ne Sai', artist: 'Gigi D\'Alessio' },
    { title: 'Malaterra', artist: 'Gigi D\'Alessio' },
    { title: 'Non Dirgli Mai', artist: 'Gigi D\'Alessio' },
  { title: 'Vida Loca', artist: 'Izi' },
  { title: 'Finestre', artist: 'Izi' },
  { title: 'Cane Nero', artist: 'Izi' },
  { title: 'Blu', artist: 'Lazza' },
  { title: 'Tarantelle', artist: 'Lazza' },
  { title: 'Boss', artist: 'Lazza' },
  { title: 'Mangano Flow', artist: 'Lazza' },
  { title: 'Sciroppo', artist: 'Sfera Ebbasta' },
  { title: 'Cupido', artist: 'Sfera Ebbasta' },
  { title: 'Batman', artist: 'Sfera Ebbasta' },
  { title: 'Tran Tran', artist: 'Sfera Ebbasta' },
  { title: 'Kyrie', artist: 'Sfera Ebbasta' },
  { title: 'Cara Italia', artist: 'Ghali' },
  { title: 'Good Times', artist: 'Ghali' },
  { title: 'Ninna Nanna', artist: 'Mahmood' },
  { title: 'Soldi', artist: 'Mahmood' },
  { title: 'I love you', artist: 'Ghali' },
  { title: 'Brividi', artist: 'Blanco' },
  { title: 'Mi fai impazzire', artist: 'Blanco & Sfera Ebbasta' },
  { title: 'Paraocchi', artist: 'Blanco' },
  { title: 'Sheriff', artist: 'Blanco' },
  { title: 'Balla per me', artist: 'Coez' },
  { title: 'È sempre bello', artist: 'Coez' },
  { title: 'La musica non c\'è', artist: 'Coez' },
  { title: 'Faccio un casino', artist: 'Coez' },
  { title: 'Dove e quando', artist: 'Benji & Fede' },
  { title: 'La stessa lingua', artist: 'Boomdabash' },
  { title: 'Per un milione', artist: 'Boomdabash' },
  { title: 'Tutto per una ragione', artist: 'Fabri Fibra' },
  { title: 'Tranne Te', artist: 'Fabri Fibra' },
  { title: 'Applausi per Fibra', artist: 'Fabri Fibra' },
  { title: 'Niente di special', artist: 'Ghali' },
  { title: 'Luna', artist: 'Mahmood' },
  { title: 'La stessa', artist: 'Ariete' },
  { title: 'Dolcenera', artist: 'Travis' },
  { title: "L'Immensità", artist: 'Måneskin' },
  { title: 'Zitti e buoni', artist: 'Måneskin' },
  { title: 'Torna a casa', artist: 'Måneskin' },
  { title: 'Musica leggerissima', artist: 'Colapesce Dimartino' },
  { title: 'La canzone nostra', artist: 'Marracash feat. J-Ax & Elodie' },
  { title: 'Senza una donna', artist: 'Zucchero' },
  { title: 'Azzurro', artist: 'Adriano Celentano' },
  { title: 'Sogni', artist: 'Francesco Gabbani' },
  { title: 'Viceversa', artist: 'Francesco Gabbani' },
  { title: 'La prima stella', artist: 'Gigi D\'Alessio' },
  { title: 'Belvedere', artist: 'Gigi D\'Alessio' },
  { title: 'Luce', artist: 'Laura Pausini' },
  { title: 'La solitudine', artist: 'Laura Pausini' },
  { title: 'Sei nell\'anima', artist: 'Gianna Nannini' },
  { title: 'Ti amo', artist: 'Umberto Tozzi' },
  { title: 'Maledetta primavera', artist: 'Loretta Goggi' },
  { title: 'Volare', artist: 'Domenico Modugno' },
  { title: 'O sole mio', artist: 'Luciano Pavarotti' },
  { title: 'Notti magiche', artist: 'Italy 90' },
  { title: "L'Essenziale", artist: 'Marco Mengoni' },
  { title: 'Guerriero', artist: 'Michele Bravi' },
  { title: 'Sere nere', artist: 'Tiziano Ferro' },
  { title: 'Il regalo più grande', artist: 'Tiziano Ferro' },
  { title: 'Una vita in vacanza', artist: 'Lo Stato Sociale' },
  { title: 'Penso positivo', artist: 'Jovanotti' },
  { title: 'A te', artist: 'Jovanotti' },
  { title: 'Sono solo parole', artist: 'Noemi' },
  { title: "L'amore esiste", artist: 'Francesco De Gregori' }
]

const TMP_DIR = os.tmpdir()

const execPromise = cmd => new Promise((resolve, reject) => {
  exec(cmd, { maxBuffer: 1024 * 1024 * 20 }, (err, stdout, stderr) => {
    if (err) reject(new Error(stderr || err.message))
    else resolve(stdout)
  })
})

const normalize = text =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]/g, '')

const getRandomSong = () => songs[Math.floor(Math.random() * songs.length)]

let handler = async (m, { conn, command }) => {
  if (command !== 'ic') return

  let chat = m.chat
  global.activeIC = global.activeIC || {}
  if (global.activeIC[chat])
    return m.reply('⏳ C\'è già una partita di IC in corso qui. Aspetta che finisca.')

  let song = getRandomSong()
  let prize = 30 + Math.floor(Math.random() * 41)
  let answer = normalize(song.title)

  let query = `${song.title} ${song.artist} audio`
  let search = await yts(query)
  let video = search.videos && search.videos[0]

  if (!video) return m.reply('❌ Non ho trovato l\'audio per questa canzone, riprova più tardi.')

  let clipFile = path.join(TMP_DIR, `ic_clip_${Date.now()}.mp3`)

  try {
    await conn.sendMessage(chat, { text: '⏳ Scarico e preparo l\'audio, attendi...' }, { quoted: m })

    await execPromise(`yt-dlp -x --audio-format mp3 --postprocessor-args "-ss 30 -t 30" -o "${clipFile}" "${video.url}"`)
  } catch (e) {
    try { if (fs.existsSync(clipFile)) fs.unlinkSync(clipFile) } catch {}
    return m.reply('❌ Errore durante il recupero dell\'audio. Riprova.')
  }

  let intro = `🎧 *IC - Indovina Canzone*\n\n`
  intro += `🎤 Artista: *${song.artist}*\n`
  intro += `🎵 Ascolta 30 secondi e rispondi a questo audio con il titolo esatto.\n`
  intro += `⏱ Hai 30 secondi.\n`
  intro += `💰 Premio: *${prize}€* sul portafoglio`

  await conn.sendMessage(chat, { text: intro }, { quoted: m })

  let sent = await conn.sendMessage(chat, {
    audio: fs.readFileSync(clipFile),
    mimetype: 'audio/mpeg',
    ptt: true
  }, { quoted: m })

  if (fs.existsSync(clipFile)) fs.unlinkSync(clipFile)

    global.activeIC[chat] = {
      answer,
      title: song.title,
      artist: song.artist,
      prize,
      audioId: sent.key.id,
      attempts: {},
      maxAttempts: 3,
      timeout: setTimeout(() => finishIC(chat, conn), 30 * 1000)
    }
}

handler.before = async function (m, { conn }) {
  let chat = m.chat
  let game = global.activeIC?.[chat]
  if (!game || !m.text) return
  if (m.sender === conn.user.jid) return

  const isReplyToAudio = m.quoted && (m.quoted.id === game.audioId || m.quoted.key?.id === game.audioId)
  if (!isReplyToAudio) return

  const user = m.sender
  game.attempts = game.attempts || {}
  const used = game.attempts[user] || 0
  if (used >= (game.maxAttempts || 3))
    return m.reply(`❌ Hai esaurito i ${game.maxAttempts || 3} tentativi.`)

  let guess = normalize(m.text)
  if (guess !== game.answer) {
    game.attempts[user] = used + 1
    const remaining = (game.maxAttempts || 3) - game.attempts[user]
    if (remaining <= 0) return m.reply(`❌ Risposta errata. Hai esaurito i ${game.maxAttempts || 3} tentativi.`)
    return m.reply(`❌ Risposta errata. Tentativi rimasti: ${remaining}`)
  }


  clearTimeout(game.timeout)
  delete global.activeIC[chat]

  if (!global.db.data.users) global.db.data.users = {}
  if (!global.db.data.users[user]) global.db.data.users[user] = {}
  global.db.data.users[user].money = (global.db.data.users[user].money || 0) + game.prize

  let response = `✅ *RISPOSTA CORRETTA!*\n\n`
  response += `🎉 Complimenti @${user.split('@')[0]}\n`
  response += `🎤 Canzone: *${game.title}*\n`
  response += `🎵 Artista: *${game.artist}*\n`
  response += `💶 Hai guadagnato *${game.prize}€* nel tuo portafoglio!`

  return conn.sendMessage(chat, { text: response, mentions: [user] }, { quoted: m })
}

function finishIC(chat, conn) {
  let game = global.activeIC?.[chat]
  if (!game) return

  delete global.activeIC[chat]
  conn.sendMessage(chat, {
    text: `⏰ *Tempo scaduto!*\n\nLa canzone era:\n🎤 *${game.artist}*\n🎵 *${game.title}*\n\nProva di nuovo con *.ic*`,
  })
}

handler.command = /^ic$/i
handler.help = ['ic']
handler.tags = ['giochi']
handler.group = true
handler.register = false

export default handler
