//Plugin by Gab, Lucifero & 333 staff

export async function before(m, { conn, isAdmin, isBotAdmin }) {
  if (m.isBaileys && m.fromMe) return true;
  if (!m.isGroup) return false;

  const chat = global.db.data.chats[m.chat];
  if (!chat.antilinkig || chat.isBanned) return true;

  if (isAdmin || !isBotAdmin) return true;

  const text = (m.text || '').toLowerCase();
  const igRegex = /(instagram\.com|instagr\.am)/gi;

  if (!igRegex.test(text)) return true;

  let user = global.db.data.users[m.sender];
  if (!user) global.db.data.users[m.sender] = { warnIg: 0 };

  let warn = global.db.data.users[m.sender].warnIg || 0;

  await conn.sendMessage(m.chat, {
    delete: {
      remoteJid: m.chat,
      fromMe: false,
      id: m.key.id,
      participant: m.sender
    }
  });

  warn++;
  global.db.data.users[m.sender].warnIg = warn;

  if (warn < 3) {
    await conn.sendMessage(m.chat, {
      text: `⚠️ @${m.sender.split('@')[0]} 𝐢 𝐥𝐢𝐧𝐤 𝐝𝐢 𝐢𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦 𝐧𝐨𝐧 𝐬𝐨𝐧𝐨 𝐜𝐨𝐧𝐬𝐞𝐧𝐭𝐢𝐭𝐢!!\n\n➣ 𝐖𝐚𝐫𝐧: ${warn} / 3`,
      mentions: [m.sender]
    });
  } else {
    global.db.data.users[m.sender].warnIg = 0;

    await conn.sendMessage(m.chat, {
      text: `🚫 @${m.sender.split('@')[0]} 𝐞𝐬𝐩𝐮𝐥𝐬𝐨 𝐩𝐞𝐫 𝐥𝐢𝐧𝐤 𝐢𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦!!\n\n𝐰𝐚𝐫𝐧 𝐭𝐨𝐭𝐚𝐥𝐢: 𝟑/𝟑`,
      mentions: [m.sender]
    });

    try {
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
    } catch (e) {
      console.log(e);
    }
  }

  return false;
}