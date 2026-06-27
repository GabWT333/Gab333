//Plugin by Gab, Lucifero & 333 staff



let handler = async (m, { conn }) => {
  const stats = global.db.data.stats || {}
  const users = global.db.data.users || {}
  const chats = global.db.data.chats || {}

  const totalCommands = Object.values(stats).reduce((a, s) => a + (s.total || 0), 0)
  const totalSuccess  = Object.values(stats).reduce((a, s) => a + (s.success || 0), 0)
  const totalUsers    = Object.keys(users).length
  const totalGroups   = Object.keys(chats).filter(k => k.endsWith('@g.us')).length
  const totalPlugins  = Object.keys(global.plugins || {}).length
  const activePlugins = Object.values(global.plugins || {}).filter(p => !p.disabled).length

  const topPlugins = Object.entries(stats)
    .sort(([,a], [,b]) => (b.total || 0) - (a.total || 0))
    .slice(0, 5)
    .map(([name, s], i) => {
      const short = name.replace(/^.*[\\/]/, '').replace('.js', '')
      return `┃ ${i + 1}. *${short}* — ${s.total} usi (${s.success} ok)`
    }).join('\n')

  const topUsers = Object.entries(users)
    .sort(([,a], [,b]) => (b.comandiEseguiti || 0) - (a.comandiEseguiti || 0))
    .slice(0, 5)
    .map(([jid, u], i) => {
      const num = jid.split('@')[0]
      return `┃ ${i + 1}. *+${num}* — ${u.comandiEseguiti || 0} comandi`
    }).join('\n')

  const uptime = process.uptime()
  const h = Math.floor(uptime / 3600)
  const min = Math.floor((uptime % 3600) / 60)
  const sec = Math.floor(uptime % 60)
  const uptimeStr = `${h}h ${min}m ${sec}s`

  const mem = process.memoryUsage()
  const memMB = (mem.rss / 1024 / 1024).toFixed(1)

  await m.reply(
`╔═ 📊 𝐁𝐎𝐓 𝐒𝐓𝐀𝐓𝐒 𝟑𝟑𝟑 ═╗
┃
┃ ⏱️ Uptime: *${uptimeStr}*
┃ 🧠 RAM: *${memMB} MB*
┃
┃ 👥 Utenti: *${totalUsers}*
┃ 💬 Gruppi: *${totalGroups}*
┃ 🔌 Plugin: *${activePlugins}/${totalPlugins}* attivi
┃
┃ ⚡ Comandi totali: *${totalCommands}*
┃ ✅ Successi: *${totalSuccess}*
┃ ❌ Errori: *${totalCommands - totalSuccess}*
┃
┃ 🏆 *Top 5 Plugin:*
${topPlugins || '┃ Nessun dato'}
┃
┃ 👑 *Top 5 Utenti:*
${topUsers || '┃ Nessun dato'}
┃
╚══════════════╝`)
}

handler.command = /^botstats$/i
handler.rowner = true
export default handler