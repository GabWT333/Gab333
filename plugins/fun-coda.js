//Codice di fun-coda.js

//Plugin by Gab, Lucifero & 333 staff

import fs from 'fs'
import { exec } from 'child_process'

global.songQueue = global.songQueue || {}
global.queuePlayback = global.queuePlayback || {}
global.queueStop = global.queueStop || {}

const SHARED_QUEUE_KEY = '__global_queue__'

const getQueue = () => {
  global.songQueue[SHARED_QUEUE_KEY] = global.songQueue[SHARED_QUEUE_KEY] || []
  global.queuePlayback[SHARED_QUEUE_KEY] = global.queuePlayback[SHARED_QUEUE_KEY] || false
  global.queueStop[SHARED_QUEUE_KEY] = global.queueStop[SHARED_QUEUE_KEY] || false
  return global.songQueue[SHARED_QUEUE_KEY]
}

const getQueueText = () => {
  const queue = getQueue()
  if (!queue.length) return '📭 La coda è vuota.\n\n📝 La coda è una lista di canzoni salvate che si riproducono in ordine. Serve per mettere insieme più brani e ascoltarli tutti in un unico blocco.'

  return ['🎵 *Coda attuale*', ...queue.map((song, index) => `${index + 1}. ${song.title}`), '', '📝 La coda è una lista di canzoni salvate che si riproducono in ordine. Serve per mettere insieme più brani e ascoltarli tutti in un unico blocco.'].join('\n')
}

const cleanupFiles = (files = []) => {
  files.forEach((file) => {
    if (file && fs.existsSync(file)) fs.unlinkSync(file)
  })
}

const buildQueuedAudio = async () => {
  const queue = getQueue()
  if (!queue.length) return { success: false, message: '📭 La coda è vuota.' }

  const tempFiles = []
  const listFile = `./tmp_queue_list_${Date.now()}.txt`

  try {
    for (const song of queue) {
      const file = `./tmp_queue_${Date.now()}_${tempFiles.length + 1}.mp3`
      await new Promise((resolve, reject) => {
        exec(`yt-dlp -x --audio-format mp3 -o "${file}" ${song.url}`, (err) => {
          if (err) reject(err)
          else resolve()
        })
      })
      tempFiles.push(file)
    }

    if (tempFiles.length === 1) {
      return { success: true, file: tempFiles[0], cleanup: tempFiles }
    }

    const list = tempFiles.map((file) => `file '${file}'`).join('\n')
    fs.writeFileSync(listFile, list)

    const outputFile = `./tmp_queue_concat_${Date.now()}.mp3`
    await new Promise((resolve, reject) => {
      exec(`ffmpeg -y -f concat -safe 0 -i "${listFile}" -c copy "${outputFile}"`, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })

    return { success: true, file: outputFile, cleanup: [...tempFiles, listFile] }
  } catch (error) {
    cleanupFiles(tempFiles)
    if (fs.existsSync(listFile)) fs.unlinkSync(listFile)
    return { success: false, message: `❌ Errore nella creazione dell’audio: ${error.message}` }
  }
}

const playQueue = async (m, conn) => {
  const jid = String(m.chat)
  const queue = getQueue()

  if (!queue.length) {
    return m.reply('📭 La coda è vuota.')
  }

  if (global.queuePlayback[SHARED_QUEUE_KEY]) {
    return m.reply('⏳ La coda è già in riproduzione.')
  }

  global.queuePlayback[SHARED_QUEUE_KEY] = true
  global.queueStop[SHARED_QUEUE_KEY] = false

  await m.reply('🎵 Sto preparando l’audio della coda, attendi... (più canzoni ci sono, più tempo ci vuole per scaricare l’audio)')

  const result = await buildQueuedAudio()
  if (!result.success) {
    global.queuePlayback[SHARED_QUEUE_KEY] = false
    return m.reply(result.message)
  }

  if (global.queueStop[SHARED_QUEUE_KEY]) {
    cleanupFiles(result.cleanup || [])
    global.queuePlayback[SHARED_QUEUE_KEY] = false
    return m.reply('⏹️ Coda fermata.')
  }

  try {
    await conn.sendMessage(jid, {
      audio: fs.readFileSync(result.file),
      mimetype: 'audio/mpeg',
      caption: `🎵 Coda inviata (${queue.length} brani)`
    }, { quoted: m })
  } catch (error) {
    console.error(error)
    await m.reply('❌ Errore nell’invio dell’audio della coda.')
  } finally {
    cleanupFiles(result.cleanup || [result.file])
    global.queuePlayback[SHARED_QUEUE_KEY] = false
  }
}

const handler = async (m, { conn, usedPrefix, command, text }) => {
  const jid = String(m.chat)
  const queue = getQueue()

  if (command === 'add_queue') {
    const video = global.playChoice?.[m.sender]
    if (!video) return m.reply('❌ Nessuna canzone selezionata.')

    queue.push({
      title: video.title,
      url: video.url,
      author: video.author?.name || 'Sconosciuto',
      timestamp: video.timestamp || 'N/A'
    })

    return conn.sendButton(
      jid,
      `🎵 *${video.title}* aggiunta alla coda\n\n📝 La coda è una lista di canzoni salvate che si riproducono in ordine. Serve per mettere insieme più brani e ascoltarli tutti in un unico blocco.`,
      '📋 Coda musicale',
      null,
      [
        ['👀 Visualizza coda', `${usedPrefix}show_queue`],
        ['🗑 Cancella coda', `${usedPrefix}remove_queue_menu`]
      ],
      m
    )
  }

  if (command === 'show_queue' || command === 'coda') {
    const textMessage = getQueueText()
    return conn.sendButton(
      jid,
      textMessage,
      '🎵 Gestione coda 333',
      null,
      [
        ['▶️ Riproduci coda', `${usedPrefix}play_queue`],
        ['🗑 Cancella coda', `${usedPrefix}remove_queue_menu`]
      ],
      m
    )
  }

  if (command === 'remove_queue_menu') {
    if (!queue.length) return m.reply('📭 La coda è vuota.')

    const buttons = queue.map((_, index) => [String(index + 1), `${usedPrefix}remove_queue ${index + 1}`])
    return conn.sendButton(
      jid,
      '🗑 Seleziona la posizione da cancellare',
      'Coda musicale',
      null,
      buttons,
      m
    )
  }

  if (command === 'remove_queue') {
    const pos = Number(text?.trim())
    if (!Number.isInteger(pos) || pos < 1 || pos > queue.length) {
      return m.reply('❌ Posizione non valida.')
    }

    const removed = queue.splice(pos - 1, 1)[0]
    return m.reply(`🗑 Cancellata dalla coda: *${removed.title}*`)
  }

  if (command === 'play_queue') {
    return playQueue(m, conn)
  }

  if (command === 'stop_queue') {
    global.queueStop[SHARED_QUEUE_KEY] = true
    global.queuePlayback[SHARED_QUEUE_KEY] = false
    return m.reply('⏹️ Coda fermata.')
  }
}

handler.command = /^(add_queue|show_queue|remove_queue_menu|remove_queue|play_queue|stop_queue|coda)$/i
handler.help = ['coda']
handler.tags = ['fun']

export default handler
