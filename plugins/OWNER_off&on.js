//Plugin by Gab, Lucifero & 333 staff



let handler = async (m, { text, command }) => {
  const cmd = command?.toLowerCase()

  if (!text?.trim())
    return m.reply(
`❌ Uso:
*.disablepl nomeplugin* — disabilita un plugin
*.enablepl nomeplugin* — riabilita un plugin

Esempio: *.disablepl fun-cur*`)

  const query = text.trim().toLowerCase().replace('.js', '')
  const match = Object.keys(global.plugins || {}).find(name => {
    const short = name.replace(/^.*[\\/]/, '').replace('.js', '').toLowerCase()
    return short === query || name.toLowerCase().includes(query)
  })

  if (!match)
    return m.reply(`❌ Plugin *${query}* non trovato.\nUsa *.pluginlist* per vedere tutti i plugin.`)

  const short = match.replace(/^.*[\\/]/, '').replace('.js', '')

  if (cmd === 'disablepl') {
    if (global.plugins[match].disabled)
      return m.reply(`⚠️ Il plugin *${short}* è già disabilitato.`)
    global.plugins[match].disabled = true
    return m.reply(`🚫 Plugin *${short}* disabilitato.\nUsa *.enablepl ${short}* per riabilitarlo.`)
  }

  if (cmd === 'enablepl') {
    if (!global.plugins[match].disabled)
      return m.reply(`⚠️ Il plugin *${short}* è già attivo.`)
    global.plugins[match].disabled = false
    return m.reply(`✅ Plugin *${short}* riabilitato.`)
  }
}

handler.command = /^(disablepl|enablepl)$/i
handler.rowner = true
export default handler