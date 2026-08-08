//Plugin by Gab, Lucifero & 333 staff




const RUOLI_SPECIALI = ['developer', 'staff']

let handler = async (m, { text, mentionedJid }) => {
  const args = text?.trim().split(/\s+/)
  if (!args || args.length < 2)
    return m.reply('❌ Uso: *addperms @numero nome-plugin/ruolo*\n\nRuoli disponibili: *developer, staff*\n\nEsempio plugin: .addperms @user menu\n\n.addperms @user developer\n\n.addperms @user staff')

  let rawNumber = ''
  if (mentionedJid && mentionedJid.length > 0) {
    rawNumber = mentionedJid[0].split('@')[0]
  } else {
    rawNumber = args[0].replace(/[^0-9]/g, '')
    args.shift()
  }

  if (!rawNumber) return m.reply('❌ Numero non valido')

  const permName = args
    .filter(a => !/^\d+$/.test(a) && !a.startsWith('@'))
    .join(' ')
    .toLowerCase()
    .trim()

  if (!permName) return m.reply('❌ Nome plugin o ruolo non specificato')

  const jid = rawNumber + '@s.whatsapp.net'

  if (!global.db.data.pluginPerms) global.db.data.pluginPerms = {}
  if (!global.db.data.pluginPerms[jid]) global.db.data.pluginPerms[jid] = []

  if (global.db.data.pluginPerms[jid].includes(permName))
    return m.reply(`⚠️ *${rawNumber}* ha già il permesso *${permName}*`)

  global.db.data.pluginPerms[jid].push(permName)


  if (permName === 'staff') {
    return m.reply(
`✅ *${rawNumber}* è ora uno *Staff* 👮

Può:
• Gestire comandi base
• Supportare utenti
• Usare strumenti admin limitati

⚠️ Privilegi sotto controllo owner.`)
  }


  if (permName === 'developer') {
    return m.reply(
`✅ *${rawNumber}* è ora un *Developer* 🛠️

Può usare:
• .devsave
• .devedit
• .devdp

⚠️ Ogni azione richiede approvazione di un owner.`)
  }

  m.reply(`✅ *${rawNumber}* può ora usare il plugin *${permName}*`)
}

handler.command = /^addperms$/i
handler.rowner = true
export default handler