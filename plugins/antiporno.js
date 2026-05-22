//Plugin by Gab, Lucifero & 333 staff

export async function before(m, { conn, isAdmin, isBotAdmin }) {
  if (m.isBaileys && m.fromMe) return true;
  if (!m.isGroup) return false;

  const chat = global.db.data.chats[m.chat];
  if (!chat.antiporno || chat.isBanned) return true;

  if (isAdmin || !isBotAdmin) return true;

  const text = (m.text || '').toLowerCase();
  const pornRegex = /(pornhub\.com|xvideos\.com|xnxx\.com|redtube\.com)/gi;

  if (!pornRegex.test(text)) return true;

  global.db.data.users[m.sender] = global.db.data.users[m.sender] || {};
  let user = global.db.data.users[m.sender];
  user.antiporno = (user.antiporno || 0) + 1;

  await conn.sendMessage(m.chat, {
    text: `🚫 @${m.sender.split('@')[0]} 𝐢 𝐥𝐢𝐧𝐤 𝐩𝐨𝐫𝐧𝐨 𝐧𝐨𝐧 𝐬𝐨𝐧𝐨 𝐜𝐨𝐧𝐬𝐞𝐧𝐭𝐢𝐭𝐢!! 𝐖𝐚𝐫𝐧: ${user.antiporno}/3`,
    mentions: [m.sender]
  });

  await conn.sendMessage(m.chat, {
    delete: {
      remoteJid: m.chat,
      fromMe: false,
      id: m.key.id,
      participant: m.sender
    }
  });

  if (user.antiporno >= 3) {
    try {
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
      await conn.sendMessage(m.chat, {
        text: `⚠️ @${m.sender.split('@')[0]} 𝐞𝐬𝐩𝐮𝐥𝐬𝐨 𝐩𝐞𝐫 𝐥𝐢𝐧𝐤 𝐩𝐨𝐫𝐧𝐨\n\n𝐰𝐚𝐫𝐧 𝐭𝐨𝐭𝐚𝐥𝐢: 𝟑/𝟑`,
        mentions: [m.sender]
      });
      user.antiporno = 0; 
    } catch (e) {
      console.log('Errore espulsione antiporno:', e);
    }
  }

  return false;
}