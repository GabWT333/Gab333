//Plugin by Gab, Lucifero & 333 staff

import fs from 'fs';

const PROTECTED_PLUGIN_NAMES = new Set(['crediti', 'crediti.js']);

let handler = async (message, { text, usedPrefix, command }) => {
  if (!text) throw '𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐢 𝐢𝐥 𝐧𝐨𝐦𝐞 𝐝𝐞𝐥 𝐩𝐥𝐮𝐠𝐢𝐧 𝐝𝐚 𝐞𝐝𝐢𝐭𝐚𝐫𝐞';
  if (!message.quoted || !message.quoted.text) throw '𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚𝐥 𝐦𝐞𝐬𝐬𝐚𝐠𝐢𝐨 𝐜𝐡𝐞 𝐜𝐨𝐧𝐭𝐢𝐞𝐧𝐞 𝐢𝐥 𝐧𝐮𝐨𝐯𝐨 𝐜𝐨𝐝𝐢𝐜𝐞 𝐝𝐚 𝐢𝐧𝐬𝐞𝐫𝐢𝐫𝐞';

  const pluginName = text.trim().replace(/\.js$/i, '').toLowerCase();
  if (PROTECTED_PLUGIN_NAMES.has(pluginName)) throw 'Questo plugin è protetto e non può essere modificato.';

  let pluginPath = `plugins/${text}.js`;


  if (!fs.existsSync(pluginPath)) throw '𝐈𝐥 𝐩𝐥𝐮𝐠𝐢𝐧 𝐧𝐨𝐧 𝐞𝐬𝐢𝐬𝐭𝐞';


  fs.writeFileSync(pluginPath, message.quoted.text);

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
  };

  conn.reply(message.chat, `𝐈𝐥 𝐩𝐥𝐮𝐠𝐢𝐧 "${text}" 𝐞̀ 𝐬𝐭𝐚𝐭𝐨 𝐞𝐝𝐢𝐭𝐚𝐭𝐨 𝐜𝐨𝐧 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐨`, responseMessage);
};

handler.tags = ['owner'];
handler.help = ['𝐞𝐝𝐢𝐭𝐩𝐥𝐮𝐠𝐢𝐧'];
handler.command = /^editplugin$/i;
handler.rowner = true;

export default handler;