//Plugin by Gab, Lucifero & 333 staff

import fs from 'fs';
import path from 'path';

let handler = async (message, { text, usedPrefix, command }) => {
  if (!text) throw '𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐢𝐥 𝐩𝐚𝐭𝐡 𝐝𝐞𝐥 𝐟𝐢𝐥𝐞 𝐝𝐚 𝐞𝐝𝐢𝐭𝐚𝐫𝐞';
  if (!message.quoted || !message.quoted.text) throw '𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚𝐥 𝐦𝐞𝐬𝐬𝐚𝐠𝐢𝐨 𝐜𝐡𝐞 𝐜𝐨𝐧𝐭𝐢𝐞𝐧𝐞 𝐢𝐥 𝐧𝐮𝐨𝐯𝐨 𝐜𝐨𝐧𝐭𝐞𝐧𝐮𝐭𝐨 𝐝𝐞𝐥 𝐟𝐢𝐥𝐞';
  
  let filePath = text;
  const normalized = path.normalize(filePath).replace(/\\/g, '/');
  if (normalized.includes('/plugins/crediti.js') || normalized.includes('.protected_plugins'))
    throw 'Questo file è protetto e non può essere modificato.';
  

  if (!fs.existsSync(filePath)) throw '𝐈𝐥 𝐟𝐢𝐥𝐞 𝐧𝐨𝐧 𝐞𝐬𝐢𝐬𝐭𝐞';
  

  fs.writeFileSync(filePath, message.quoted.text);

  let responseMessage = {
    key: {
      participants: '0@s.whatsapp.net',
      fromMe: false,
      id: 'EditFile'
    },
    message: {
      locationMessage: {
        name: 'File Editato',
        jpegThumbnail: await (await fetch('https://telegra.ph/file/876cc3f192ec040e33aba.png')).buffer(),
        vcard: 'BEGIN:VCARD\nVERSION:3.0\nN:;File;;;\nFN:File\nEND:VCARD'
      }
    },
    participant: '0@s.whatsapp.net'
  };
  
  conn.reply(message.chat, `𝐈𝐥 𝐟𝐢𝐥𝐞 "${text}" 𝐞̀ 𝐬𝐭𝐚𝐭𝐨 𝐞𝐝𝐢𝐭𝐚𝐭𝐨 𝐜𝐨𝐧 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐨`, responseMessage);
};

handler.tags = ['owner'];
handler.help = ['𝐞𝐝𝐢𝐭𝐟𝐢𝐥𝐞'];
handler.command = /^editfile$/i;
handler.rowner = true;

export default handler;