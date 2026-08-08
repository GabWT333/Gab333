//Plugin by Gab, Lucifero & 333 staff

import { existsSync, promises as fsPromises } from 'fs';
import path from 'path';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const handler = async (message, { conn, usedPrefix }) => {
  if (global.conn.user.jid !== conn.user.jid) {
    return conn.sendMessage(message.chat, {
      text: "*🚨 𝐔𝐭𝐢𝐥𝐢𝐳𝐳𝐢 𝐪𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐝𝐢𝐫𝐞𝐭𝐭𝐚𝐦𝐞𝐧𝐭𝐞 𝐧𝐞𝐥 𝐧𝐮𝐦𝐞𝐫𝐨 𝐝𝐞𝐥 𝐛𝐨𝐭.*"
    }, { quoted: message });
  }

  try {
    const sessionFolder = "./333BotSession/";

    if (!existsSync(sessionFolder)) {
      return await conn.sendMessage(message.chat, {
        text: "*❌ 𝐋𝐚 𝐜𝐚𝐫𝐭𝐞𝐥𝐥𝐚 𝐝𝐞𝐥𝐥𝐞 𝐬𝐞𝐬𝐬𝐢𝐨𝐧𝐢 𝐞̀ 𝐯𝐮𝐨𝐭𝐚 o 𝐧𝐨𝐧 𝐞𝐬𝐢𝐬𝐭𝐞.*"
      }, { quoted: message });
    }

    const sessionFiles = await fsPromises.readdir(sessionFolder);
    let deletedCount = 0;

    for (const file of sessionFiles) {
      if (file !== "creds.json") {
        await fsPromises.unlink(path.join(sessionFolder, file));
        deletedCount++;
      }
    }

    await conn.sendMessage(message.chat, {
      text: `💨 𝐇𝐨 𝐫𝐢𝐦𝐨𝐬𝐬𝐨 ${deletedCount} 𝐬𝐞𝐬𝐬𝐢𝐨𝐧𝐢 𝐜𝐨𝐧 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐨! 𝐛𝐨𝐭 𝐯𝐞𝐥𝐨𝐜𝐢𝐳𝐳𝐚𝐭𝐨 🚀.`
    }, { quoted: message });

  } catch (error) {
    console.error('⚠️ Errore:', error);
    await conn.sendMessage(message.chat, { text: "❌ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐝𝐢 𝐞𝐥𝐢𝐦𝐢𝐧𝐚𝐳𝐢𝐨𝐧𝐞!" }, { quoted: message });
  }

};

handler.help = ['.𝐝𝐬'];
handler.tags = ["admin"];
handler.command = /^(deletession|ds|clearallsession)$/i;
handler.admin = true;

export default handler;