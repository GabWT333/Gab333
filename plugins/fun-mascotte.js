//Plugin by Gab, Lucifero & 333 staff

import fs from 'fs';
import path from 'path';

let handler = async (m, { conn }) => {
  const videoPath = path.join(process.cwd(), 'media', 'mascotte.mp4'); // percorso locale

  if (!fs.existsSync(videoPath)) {
    return conn.sendMessage(m.chat, { text: '❌ Video mascotte non trovato!' }, { quoted: m });
  }

  await conn.sendMessage(m.chat, {
    video: { url: videoPath },
    caption: '🎉 𝐄𝐜𝐜𝐨 𝐚 𝐯𝐨𝐢 𝐥𝐚 𝐦𝐚𝐬𝐜𝐨𝐭𝐭𝐞 𝐝𝐢 𝟑𝟑𝟑 𝐛𝐨𝐭!'
  }, { quoted: m });
};

handler.command = /^mascotte$/i;
handler.tags = ['fun'];
handler.help = ['mascotte'];
export default handler;