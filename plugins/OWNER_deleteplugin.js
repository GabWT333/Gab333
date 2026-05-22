//Plugin by Gab, Lucifero & 333 staff

import { tmpdir } from 'os'
import path, { join } from 'path'
import {
  readdirSync,
  statSync,
  unlinkSync,
  existsSync,
  readFileSync,
  watch
} from 'fs'
let handler = async (m, { conn, usedPrefix: _p, __dirname, args, text }) => {

  const requestedPlugin = args[0]?.replace(/\.js$/i, '').toLowerCase();
  const PROTECTED_PLUGIN_NAMES = new Set(['crediti', 'crediti.js']);
  if (PROTECTED_PLUGIN_NAMES.has(requestedPlugin)) throw 'Questo plugin è protetto e non può essere eliminato.';

  let ar = Object.keys(plugins)
  let ar1 = ar.map(v => v.replace('.js', ''))
  if (!text) throw `📌 *_Esempio uso:_*\n*#deleteplugin Menu-official*`
  if (!ar1.includes(args[0])) return m.reply(`*🗃️ non esiste questo plugin!*\n•••••••••••••••••••••••••••••••••••••••••••••••••••••••\n\n${ar1.map((v, i) => `${i + 1}. ${v}`).join('\n')}`)
  const file = join(__dirname, '../plugins/' + args[0] + '.js')
  unlinkSync(file)
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
  conn.reply(m.chat, `_plugins/${args[0]}.js_`, prova, m)

}
handler.help = ['deleteplugin <nombre>']
handler.tags = ['owner']
handler.command = /^(deleteplugin|dp)$/i

handler.owner = true

export default handler
