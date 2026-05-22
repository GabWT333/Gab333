//Plugin by Gab, Lucifero & 333 staff

import fs from 'fs'
import path, { join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const protectedPluginNames = new Set(['crediti'])

let handler = async (m, { text }) => {
  if (!text) throw 'Inserisci il nome del plugin da salvare'
  if (!m.quoted?.text) throw 'Rispondi al messaggio che contiene il codice del plugin da salvare'

  const pluginName = text.trim().replace(/\.js$/i, '').replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase()
  if (!pluginName) throw 'Nome plugin non valido'
  if (protectedPluginNames.has(pluginName)) return m.reply('Questo plugin è protetto e non può essere salvato o sovrascritto.')

  const pluginPath = join(__dirname, `${pluginName}.js`)
  fs.writeFileSync(pluginPath, m.quoted.text, 'utf8')
  await m.reply(`Plugin salvato: ${pluginName}.js`)
}

handler.help = ['saveplugin <nome>']
handler.tags = ['owner']
handler.command = /^(saveplugin|salvar)$/i
handler.rowner = true

export default handler
