//Plugin by Gab, Lucifero & 333 staff

import fs from 'fs'
const PROTECTED_PLUGIN_NAMES = new Set(['crediti', 'crediti.js']);
let handler = async (m, { text, usedPrefix, command }) => {
    if (!text) throw `uhm.. che nome do al plugin?`
    const pluginName = text.trim().replace(/\.js$/i, '').toLowerCase();
    if (PROTECTED_PLUGIN_NAMES.has(pluginName)) throw 'Questo plugin è protetto e non può essere salvato o sovrascritto.';
    if (!m.quoted?.text) throw `Rispondi al msg!`
    let path = `plugins/${text}.js`
    await fs.writeFileSync(path, m.quoted.text)
  let prova = { "key": {"participants":"0@s.whatsapp.net", "fromMe": false, "id": "Halo"
  }, "message": { 
  "locationMessage": { name: '𝐏𝐥𝐮𝐠𝐢𝐧 𝐬𝐚𝐥𝐯𝐚𝐭𝐨 ✓',
"jpegThumbnail": await(await fetch('https://telegra.ph/file/876cc3f192ec040e33aba.png')).buffer(),
  "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
  }}, "participant": "0@s.whatsapp.net"}
    conn.reply(m.chat, `${path}`, prova)}
handler.help = ['saveplugin'].map(v => v + ' <nombre>')
handler.tags = ['owner']
handler.command = ["salvar", "saveplugin"]

handler.rowner = true
export default handler

