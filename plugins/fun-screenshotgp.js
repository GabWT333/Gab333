// Plugin by Lucifero & 333 Staff
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

const ICON_PATH = path.join(process.cwd(), 'icone', 'Whatsapp.jpeg')
const FONT_FILES = [
  '/usr/share/fonts/truetype/ancient-scripts/Symbola_hint.ttf',
  '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
]
const FONT_FILE = FONT_FILES.find((f) => fs.existsSync(f)) || FONT_FILES[1]

const escapeFfmpeg = (text) => {
  return String(text || '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/:/g, '\\:')
    .replace(/,/g, '\\,')
    .replace(/=/g, '\\=')
    .replace(/%/g, '\\%')
    .replace(/\n/g, '\\n')
}

const wrapText = (text, maxLen = 34) => {
  const words = String(text || '').split(' ')
  const lines = []
  let line = ''

  const pushWord = (word) => {
    if (word.length <= maxLen) {
      if (!line) line = word
      else if ((line + ' ' + word).length <= maxLen) line += ' ' + word
      else {
        lines.push(line)
        line = word
      }
      return
    }

    if (line) {
      lines.push(line)
      line = ''
    }

    let start = 0
    while (start < word.length) {
      lines.push(word.slice(start, start + maxLen))
      start += maxLen
    }
  }

  for (const w of words) {
    pushWord(w)
  }
  if (line) lines.push(line)
  return lines.slice(0, 10)
}

const renderPreview = async (name, message, profileUrl) => {
  const nameTxt = escapeFfmpeg(name)
  const msgLines = wrapText(message, 34).slice(0, 10)
  const lineCount = msgLines.length
  const fontSpec = `fontfile='${FONT_FILE}'`

  const nameFontSize = nameTxt.length > 22 ? 64 : nameTxt.length > 16 ? 72 : 80
  let msgFontSize = 74
  if (lineCount > 4) msgFontSize = 62
  if (lineCount > 6) msgFontSize = 56
  if (lineCount > 8) msgFontSize = 50

  const msgDrawtext = msgLines.map((line, idx) =>
    `drawtext=${fontSpec}:text='${escapeFfmpeg(line)}':fontcolor=white:fontsize=${msgFontSize}:x=390:y=(main_h/2)+20+${idx * (msgFontSize + 10)}:box=1:boxcolor=black@0.4:boxborderw=6`
  ).join(',')

  const filter =
  `[1:v]scale=280:280,format=rgba[avatar_scaled];` +

  `color=c=black:s=280x280,format=rgba,` +
  `geq=r='if(lte(hypot(X-140,Y-140),140),255,0)':` +
  `g='if(lte(hypot(X-140,Y-140),140),255,0)':` +
  `b='if(lte(hypot(X-140,Y-140),140),255,0)'[mask];` +

  `[avatar_scaled][mask]alphamerge[avatar_round];` +

  `[0:v][avatar_round]overlay=70:(main_h-280)/2:format=auto,` +

  `drawtext=${fontSpec}:` +
  `text='${nameTxt}':` +
  `fontcolor=white:` +
  `fontsize=${nameFontSize}:` +
  `x=390:` +
  `y=(main_h/2)-100,` +

  `${msgDrawtext}`

  const inputs = [ICON_PATH, profileUrl || ICON_PATH]
  const args = ['-y', '-i', inputs[0], '-i', inputs[1], '-filter_complex', filter, '-frames:v', '1', '-f', 'image2', 'pipe:1']

  const buf = await new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', args)
    const chunks = []
    let stderr = ''
    ff.stdout.on('data', (chunk) => chunks.push(chunk))
    ff.stderr.on('data', (chunk) => { stderr += chunk.toString() })
    ff.on('error', reject)
    ff.on('close', (code) => {
      if (code !== 0) return reject(new Error(`ffmpeg exit code ${code}: ${stderr}`))
      resolve(Buffer.concat(chunks))
    })
  })

  if (buf && buf.length) return buf
  throw new Error('Impossibile generare anteprima: ffmpeg drawtext fallito')
}

const getMentionedUser = (msg) => {
  if (!msg) return null
  if (msg.quoted?.sender) return msg.quoted.sender
  if (Array.isArray(msg.mentionedJid) && msg.mentionedJid.length) return msg.mentionedJid[0]
  if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) return msg.message.extendedTextMessage.contextInfo.mentionedJid[0]
  if (Array.isArray(msg.mentioned) && msg.mentioned.length) return msg.mentioned[0]
  return null
}

const removeMentionText = (text, msg) => {
  if (!text) return ''
  let cleaned = String(text)
  const mentions = new Set()

  if (Array.isArray(msg.mentionedJid)) {
    msg.mentionedJid.forEach((jid) => mentions.add(`@${jid.split('@')[0]}`))
  }
  const extendedMentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid
  if (Array.isArray(extendedMentions)) {
    extendedMentions.forEach((jid) => mentions.add(`@${jid.split('@')[0]}`))
  }
  if (Array.isArray(msg.mentioned)) {
    msg.mentioned.forEach((mention) => mentions.add(mention))
  }

  mentions.forEach((mention) => {
    const escaped = mention.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')
    cleaned = cleaned.replace(new RegExp(escaped, 'g'), '')
  })

  cleaned = cleaned.replace(/^\s*@\+?[0-9]{4,}\s*/, '')
  cleaned = cleaned.replace(/^\s*@[^^\s]+\s*/, '')

  return cleaned.replace(/\s{2,}/g, ' ').trim()
}

const getMessageText = (msg, args) => {
  const raw = Array.isArray(args) && args.length > 0 ? args.join(' ').trim() : ''
  let content = raw

  if (!content) {
    if (msg.quoted?.text) content = msg.quoted.text
    else if (msg.quoted?.caption) content = msg.quoted.caption
    else if (msg.quoted?.conversation) content = msg.quoted.conversation
    else content = String(msg.text || msg.body || '').replace(/^\.(?:prova|test)\b\s*/i, '').trim()
  }

  return removeMentionText(content, msg)
}

let handler = async (m, { conn, args, groupMetadata }) => {
  try {
    groupMetadata = groupMetadata || await conn.groupMetadata?.(m.chat).catch(() => null)
    const who = getMentionedUser(m)
    const messageRaw = getMessageText(m, args)

    if (!who) {
      return m.reply('⚠️ Tagga o rispondi a una persona con il messaggio da usare.\nEsempio: .screenshotgp @utente ciao')
    }

    if (!messageRaw) {
      return m.reply('⚠️ Scrivi il testo da mostrare.\nEsempio: .screenshotgp @utente ciao')
    }

    await m.reply('⏳ Genero l\'immagine...')

    let authorName = null
    if (conn.getName) {
      try {
        authorName = await Promise.resolve(conn.getName(who))
      } catch (e) {
        authorName = null
      }
    }
    authorName = authorName || who.split('@')[0]

    const groupName = groupMetadata?.subject || (m.chat || '').split('@')[0] || 'Gruppo'
    const messageText = `${authorName}: ${messageRaw}`

    let groupIconUrl = ICON_PATH
    try {
      groupIconUrl = await conn.profilePictureUrl(m.chat, 'image')
    } catch {
      groupIconUrl = ICON_PATH
    }

    const img = await renderPreview(groupName, messageText, groupIconUrl)
    if (!img) return m.reply('Errore nella generazione dell\'anteprima')

    await conn.sendFile(m.chat, img, 'anteprima.png', '', m)
  } catch (e) {
    console.error('fun-screenshotgp handler error:', e)
    try { await m.reply('Errore: ' + (e.message || e)) } catch {}
  }
}

handler.tags = ['fun']
handler.command = ['screenshotgp']
export default handler
