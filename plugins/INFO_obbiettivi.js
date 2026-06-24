//Plugin by Gab, Lucifero & 333 staff

import { createHash } from 'crypto';
import PhoneNumber from 'awesome-phonenumber';

const handler = async (m, { conn, usedPrefix, command }) => {
  const mention = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.quoted;
  const who = mention ? mention : m.sender;
  const user = global.db.data.users[who] || {};
  let prova = { "key": {"participants":"0@s.whatsapp.net", "fromMe": false, "id": "Halo"
            }, "message": { 
        "locationMessage": {
        name: `𝐎𝐁𝐁𝐈𝐄𝐓𝐓𝐈𝐕𝐈`,
        jpegThumbnail: fs.readFileSync('./icone/bal.png'),
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
      }
    },
    "participant": "0@s.whatsapp.net"
  };

  let pic;
  try {
    pic = await conn.profilePictureUrl(who, 'image');
  } catch (error) {
    pic = null;
  }

  conn.sendMessage(m.chat, {
    text: `══════•⊰✦⊱•══════
➣ 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢: ${user.messaggi > 0 ? '✅' : '❌'}
➣ 𝐑𝐚𝐠𝐠𝐢𝐮𝐧𝐠𝐢 𝐢 𝟏𝟎.𝟎𝟎𝟎 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢: ${user.messaggi > 10000 ? '✅' : '❌'}
➣ 𝐁𝐞𝐬𝐭𝐞𝐦𝐦𝐢𝐞: ${user.blasphemy > 0 ? '✅' : '❌'}
➣ 𝐑𝐚𝐠𝐠𝐢𝐮𝐧𝐠𝐢 𝐥𝐞 𝟏𝟎𝟎𝟎 𝐛𝐞𝐬𝐭𝐞𝐦𝐦𝐢𝐞: ${user.blasphemy > 1000 ? '✅' : '❌'}
➣ 𝐄𝐬𝐞𝐠𝐮𝐢 𝟏𝟎𝟎𝟎 𝐜𝐨𝐦𝐚𝐧𝐝𝐢: ${user.command > 1000 ? '✅' : '❌'}
══════•⊰✦⊱•══════`,
    contextInfo: {
      mentionedJid: [who],
      externalAdReply: {
        title: `${user.name && user.name.trim(who) !== '' ? user.name : 'Sconosciuto'}`,
        sourceUrl: "https://wa.me/" + (mention ? mention.split("@")[0] : m.sender.split("@")[0]),
        thumbnail: pic ? await (await fetch(pic)).buffer() : await (await fetch('https://telegra.ph/file/17e7701f8b0a63806e312.png')).buffer()
      }
    }
  }, { quoted: prova });
};

handler.command = ['obbiettivo','obbiettivi'];
export default handler;