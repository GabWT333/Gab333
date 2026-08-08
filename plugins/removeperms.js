//Plugin by Gab, Lucifero & 333 staff



const RUOLI_SPECIALI = ['developer']

let handler = async (m, { text, mentionedJid }) => {
  const args = text?.trim().split(/\s+/)
  if (!args || args.length < 1)
    return m.reply('❌ Uso: *removeperms @numero nome-plugin/ruolo*\nSenza specificare nulla, rimuove TUTTI i permessi')

  let rawNumber = ''
  if (mentionedJid && mentionedJid.length > 0) {
    rawNumber = mentionedJid[0].split('@')[0]
  } else {
    rawNumber = args[0].replace(/[^0-9]/g, '')
    args.shift()
  }

  if (!rawNumber) return m.reply('❌ Numero non valido')

  const jid = rawNumber + '@s.whatsapp.net'
  const permName = args.filter(a => !/^\d+$/.test(a) && !a.startsWith('@')).join(' ').toLowerCase().trim()

  if (!global.db.data.pluginPerms?.[jid] || global.db.data.pluginPerms[jid].length === 0)
    return m.reply(`⚠️ *${rawNumber}* non ha nessun permesso assegnato`)

  if (!permName) {
    delete global.db.data.pluginPerms[jid]
    return m.reply(`✅ Rimossi *tutti* i permessi di *${rawNumber}*`)
  }

  const idx = global.db.data.pluginPerms[jid].indexOf(permName)
  if (idx === -1) return m.reply(`⚠️ *${rawNumber}* non ha il permesso *${permName}*`)

  global.db.data.pluginPerms[jid].splice(idx, 1)
  if (global.db.data.pluginPerms[jid].length === 0) delete global.db.data.pluginPerms[jid]

  if (permName === 'developer')
    return m.reply(`✅ Rimosso il ruolo *Developer* da *${rawNumber}*\n🚫 Non potrà più usare devsave, devedit, devdp.`)

  m.reply(`✅ Rimosso il permesso *${permName}* da *${rawNumber}*`)
}

handler.command = /^removeperms$/i
handler.rowner = true
export default handler