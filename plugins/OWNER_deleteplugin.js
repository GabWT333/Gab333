import fs from 'fs'
import path from 'path'

const _fs = fs.promises
const PROTECTED_PLUGIN_NAMES = new Set(['crediti', 'crediti.js'])

function normalizza(str) {
  return str
    .toLowerCase()
    .replace(/[\-_\.\s]+/g, '')
    .replace(/\.js$/i, '')
}

function levenshtein(a, b) {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)])
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
  return dp[m][n]
}

function scoreSomiglianza(query, filename) {
  const q = normalizza(query)
  const f = normalizza(filename)
  if (q === f) return 100
  if (f.includes(q) || q.includes(f)) {
    const ratio = Math.min(q.length, f.length) / Math.max(q.length, f.length)
    return Math.round(85 + ratio * 10)
  }
  const dist = levenshtein(q, f)
  const maxLen = Math.max(q.length, f.length)
  return Math.max(0, Math.round((1 - dist / maxLen) * 100))
}

async function cercaFileSimili(query, dir, top = 5) {
  let files = []
  try { files = await _fs.readdir(dir) } catch { return [] }
  return files
    .filter(f => f.endsWith('.js'))
    .map(f => ({ file: f, score: scoreSomiglianza(query, f) }))
    .filter(x => x.score > 25)
    .sort((a, b) => b.score - a.score)
    .slice(0, top)
}

let handler = async (m, { conn, usedPrefix, command, __dirname, text, args }) => {
  if (!text) throw `📌 *_Esempio uso:_*\n*${usedPrefix + command} Menu-official*`

  const targetDir = __dirname || './plugins'
  const cleanInput = args[0].trim().replace(/plugins?\//i, '')
  const filename = cleanInput + (/\.js$/i.test(cleanInput) ? '' : '.js')
  const pluginPath = path.join(targetDir, filename)

  const pluginNameLower = filename.replace(/\.js$/i, '').toLowerCase()
  if (PROTECTED_PLUGIN_NAMES.has(pluginNameLower) || PROTECTED_PLUGIN_NAMES.has(filename.toLowerCase())) {
    throw 'Questo plugin è protetto e non può essere eliminato.'
  }

  const esiste = await _fs.access(pluginPath).then(() => true).catch(() => false)

  if (!esiste) {
    const simili = await cercaFileSimili(cleanInput, targetDir)

    if (simili.length === 0) {
      return m.reply(
`╔═ ❌ 𝐅𝐈𝐋𝐄 𝐍𝐎𝐍 𝐓𝐑𝐎𝐕𝐀𝐓𝐎 ═╗
┃
┃ 📂 Plugin cercato:
┃ *${filename}*
┃
┃ 😕 Nessun file simile trovato.
┃
╚══════════════╝`
      )
    }

    const barre = simili.map((x, i) => {
      const filled = Math.round(x.score / 10)
      const bar    = '█'.repeat(filled) + '░'.repeat(10 - filled)
      return `┃ ${i + 1}. [${bar}] ${x.score}%\n┃    ${x.file}`
    }).join('\n')

    const buttons = simili.map(x => [
      `🗑️ Elimina ${x.file}`,
      `${usedPrefix + command} ${x.file}`
    ])

    return await conn.sendButton(m.chat,
`╔═ 🔍 𝐅𝐈𝐋𝐄 𝐍𝐎𝐍 𝐓𝐑𝐎𝐕𝐀𝐓𝐎 ═╗
┃
┃ ❓ Cercavi: *${filename}*
┃
┃ 🎯 *Plugin simili trovati:*
┃
${barre}
┃
┃ 👆 Tocca un bottone per eliminarlo direttamente!
╚══════════════╝`,
    '333 File Manager', null, buttons, m)
  }

  await _fs.unlink(pluginPath)

  let prova = {
    "key": {
      "participants": "0@s.whatsapp.net",
      "fromMe": false,
      "id": "Halo"
    },
    "message": {
      "locationMessage": {
        name: '𝐏𝐥𝐮𝐠𝐢𝐧 𝐞𝐥𝐢𝐦𝐢𝐧𝐚𝐭𝐨 ✓',
        "jpegThumbnail": await (await fetch('https://telegra.ph/file/6d491d5823b5778921229.png')).buffer(),
        "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
      }
    },
    "participant": "0@s.whatsapp.net"
  }

  conn.reply(m.chat, `_plugins/${filename}_ eliminato con successo.`, prova, m)
}

handler.help = ['deleteplugin <nome>']
handler.tags = ['owner']
handler.command = /^(deleteplugin|dp)$/i
handler.owner = true

export default handler