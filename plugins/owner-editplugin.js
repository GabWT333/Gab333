import fs from 'fs'
import path from 'path'

const _fs = fs.promises
const PROTECTED_PLUGIN_NAMES = new Set(['crediti', 'crediti.js'])

if (!global.editPluginCache) {
  global.editPluginCache = {}
}

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

let handler = async (message, { text, usedPrefix, command, __dirname }) => {
  if (!text) throw '𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐢 𝐢𝐥 𝐧𝐨𝐦𝐞 𝐝𝐞𝐥 𝐩𝐥𝐮𝐠𝐢𝐧 𝐝𝐚 𝐞𝐝𝐢𝐭𝐚𝐫𝐞'

  const cacheKey = `${message.chat}_${message.sender}`
  let codiceDaInserire = ''

  if (message.quoted && message.quoted.text) {
    global.editPluginCache[cacheKey] = message.quoted.text
    codiceDaInserire = message.quoted.text
  } else if (global.editPluginCache[cacheKey]) {
    codiceDaInserire = global.editPluginCache[cacheKey]
  } else {
    throw '𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚𝐥 𝐦𝐞𝐬𝐬𝐚𝐠𝐢𝐨 𝐜𝐡𝐞 𝐜𝐨𝐧𝐭𝐢𝐞𝐧𝐞 𝐢𝐥 𝐧𝐮𝐨𝐯𝐨 𝐜𝐨𝐝𝐢𝐜𝐞 𝐝𝐚 𝐢𝐧𝐬𝐞𝐫𝐢𝐫𝐞'
  }

  const targetDir = __dirname || './plugins'
  const cleanInput = text.trim().replace(/plugins?\//i, '')
  const filename = cleanInput + (/\.js$/i.test(cleanInput) ? '' : '.js')
  const pluginPath = path.join(targetDir, filename)

  const pluginNameLower = filename.replace(/\.js$/i, '').toLowerCase()
  if (PROTECTED_PLUGIN_NAMES.has(pluginNameLower) || PROTECTED_PLUGIN_NAMES.has(filename.toLowerCase())) {
    delete global.editPluginCache[cacheKey]
    throw 'Questo plugin è protetto e non può essere modificato.'
  }

  const esiste = await _fs.access(pluginPath).then(() => true).catch(() => false)

  if (!esiste) {
    const simili = await cercaFileSimili(cleanInput, targetDir)

    if (simili.length === 0) {
      delete global.editPluginCache[cacheKey]
      return message.reply(
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
      `📝 Modifica ${x.file}`,
      `${usedPrefix + command} ${x.file}`
    ])

    return await conn.sendButton(message.chat,
`╔═ 🔍 𝐅𝐈𝐋𝐄 𝐍𝐎𝐍 𝐓𝐑𝐎𝐕𝐀𝐓𝐎 ═╗
┃
┃ ❓ Cercavi: *${filename}*
┃
┃ 🎯 *Plugin simili trovati:*
┃
${barre}
┃
┃ 👆 Tocca un bottone per correggere e modificare subito!
╚══════════════╝`,
    '333 File Manager', null, buttons, message)
  }

  await _fs.writeFile(pluginPath, codiceDaInserire, 'utf8')
  delete global.editPluginCache[cacheKey]

  let responseMessage = {
    key: {
      participants: '0@s.whatsapp.net',
      fromMe: false,
      id: 'EditPlugin'
    },
    message: {
      locationMessage: {
        name: 'Plugin Editato',
        jpegThumbnail: await (await fetch('https://telegra.ph/file/876cc3f192ec040e33aba.png')).buffer(),
        vcard: 'BEGIN:VCARD\nVERSION:3.0\nN:;Plugin;;;\nFN:Plugin\nEND:VCARD'
      }
    },
    participant: '0@s.whatsapp.net'
  }

  conn.reply(message.chat, `𝐈𝐥 𝐩𝐥𝐮𝐠𝐢𝐧 "${filename}" 𝐞̀ 𝐬𝐭𝐚𝐭𝐨 𝐞𝐝𝐢𝐭𝐚𝐭𝐨 𝐜𝐨𝐧 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐨`, responseMessage)
}

handler.tags = ['owner']
handler.help = ['editplugin']
handler.command = /^editplugin$/i
handler.rowner = true

export default handler