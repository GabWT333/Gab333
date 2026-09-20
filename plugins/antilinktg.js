//Plugin by Gab, Lucifero & 333 staff

export async function before(m, { conn, isAdmin, isBotAdmin }) {
  if (m.isBaileys && m.fromMe) return true;
  if (!m.isGroup) return false;

  const chat = global.db.data.chats[m.chat];
  if (!chat.antilinktg || chat.isBanned) return true;

  if (isAdmin || !isBotAdmin) return true;

  const text = (m.text || '').toLowerCase();
  const tgRegex = /(t\.me|telegram\.me|telegram\.dog)/gi;

  if (!tgRegex.test(text)) return true;

  await conn.sendMessage(m.chat, {
    delete: {
      remoteJid: m.chat,
      fromMe: false,
      id: m.key.id,
      participant: m.sender
    }
  });

  await conn.sendMessage(m.chat, {
    text: `🚫 @${m.sender.split('@')[0]} 𝐢 𝐥𝐢𝐧𝐤 𝐝𝐢 𝐓𝐞𝐥𝐞𝐠𝐫𝐚𝐦 𝐧𝐨𝐧 𝐬𝐨𝐧𝐨 𝐜𝐨𝐧𝐬𝐞𝐧𝐭𝐢𝐭𝐢!!\n\n𝐜𝐨𝐧𝐬𝐞𝐠𝐮𝐞𝐧𝐳𝐞: 𝐞𝐬𝐩𝐮𝐥𝐬𝐢𝐨𝐧𝐞 𝐝𝐚𝐥 𝐠𝐫𝐮𝐩𝐩𝐨.`,
    mentions: [m.sender]
  });

  try {
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
  } catch (e) {
    console.log('Errore durante espulsione Telegram:', e);
    await conn.sendMessage(m.chat, {
      text: '⚠️ Non sono riuscito ad espellere l\'utente. Assicurati che io sia admin.'
    });
  }

  return false;
}