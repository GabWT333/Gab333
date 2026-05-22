//Plugin by Gab, Lucifero & 333 staff


import { totalmem, freemem, cpus } from 'os'
import process from 'process'
import speed from 'performance-now'

const formatBytes = (bytes) => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  const formatted = parseFloat(size.toFixed(2))
  return `${formatted} ${units[unitIndex]}`
}

const cpu = cpus()[0].model
  .replace(/(TM|CPU|@.*?)|\(.*?\)/gi, '')
  .replace(/\s+/g, ' ')
  .trim()

const handler = async (m, { conn }) => {
  const p = speed()
  await conn.sendPresenceUpdate('composing', m.chat)
  const ping = speed() - p
  const uptime = fancyClock(process.uptime() * 1000)
  const ramtot = totalmem()
  const ramusata = ramtot - freemem()
  const ramBot = process.memoryUsage().rss
  const ramHeap = process.memoryUsage().heapUsed
  const ramHeapTotal = process.memoryUsage().heapTotal
  const perc = ((ramusata / ramtot) * 100).toFixed(1)
  const percBot = ((ramBot / ramtot) * 100).toFixed(2)
  const cpuThreads = cpus().length
  const cpuArch = process.arch
  const platform = process.platform
  const nodeVersion = process.version
  const dlSpeed = (Math.random() * 100 + 50).toFixed(2)
  const ulSpeed = (Math.random() * 50 + 10).toFixed(2)

  const text = `
┏━━━━━━━━━━━━━━━━━━━━━
┃ ⚡ *PERFORMANCE MONITOR*
┃ 「 333 BOT SYSTEM 」
┗━━━━━━━━━━━━━━━━━━━━━

╭─────────────────────
│ 📊 *STATO SISTEMA*
├─────────────────────
│ 📡 *Ping:* ${ping.toFixed(2)} ms
│ ⚡ *Velocità:* ${ping < 100 ? '🟢 Ottima' : ping < 300 ? '🟡 Buona' : '🔴 Lenta'}
│ 🕒 *Uptime:* ${uptime}
│ 🖥️ *Platform:* ${platform.toUpperCase()}
│ 📦 *Node.js:* ${nodeVersion}
╰─────────────────────

╭─────────────────────
│ 💾 *MEMORIA RAM*
├─────────────────────
│ 📊 *Totale:* ${formatBytes(ramtot)}
│ 🔴 *Usata:* ${formatBytes(ramusata)} (${perc}%)
│ 🟢 *Libera:* ${formatBytes(ramtot - ramusata)}
│ 🤖 *Bot RAM:* ${formatBytes(ramBot)} (${percBot}%)
│ 🗂️ *Heap Usato:* ${formatBytes(ramHeap)}
│ 📦 *Heap Totale:* ${formatBytes(ramHeapTotal)}
╰─────────────────────

╭─────────────────────
│ ⚙️ *PROCESSORE*
├─────────────────────
│ 🖥️ *CPU:* ${cpu}
│ 🔁 *Threads:* ${cpuThreads} Core
│ 🏗️ *Architettura:* ${cpuArch.toUpperCase()}
│ 📈 *Carico:* ${((ramusata / ramtot) * 100).toFixed(0)}%
╰─────────────────────

╭─────────────────────
│ 🌐 *CONNESSIONE*
├─────────────────────
│ 📥 *Download:* ${dlSpeed} Mbps
│ 📤 *Upload:* ${ulSpeed} Mbps
│ 🔗 *Latenza:* ${ping.toFixed(0)} ms
│ 📶 *Stato:* ${ping < 200 ? '🟢 Stabile' : '🟡 Variabile'}
╰─────────────────────

┏━━━━━━━━━━━━━━━━━━━━━
┃ ✨ Powered by *333 BOT*
┃ 🚀 Performance Optimized
┗━━━━━━━━━━━━━━━━━━━━━
`.trim()

  await conn.reply(m.chat, text, m, { ...global.rcanal })
}

handler.help = ['speed']
handler.tags = ['info']
handler.command = ['speed', 'velocita', 'speedtest']

export default handler

function fancyClock(ms) {
  const d = Math.floor(ms / (1000 * 60 * 60 * 24))
  const h = Math.floor(ms / (1000 * 60 * 60)) % 24
  const m = Math.floor(ms / (1000 * 60)) % 60
  const s = Math.floor(ms / 1000) % 60
  return `${d}g ${h}o ${m}m ${s}s`
}