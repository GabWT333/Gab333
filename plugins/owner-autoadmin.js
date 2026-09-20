//Plugin by Gab, Lucifero & 333 staff



let handler = async (m, { conn }) => {
  if (m.fromMe) return;

  
  const groupMetadata = await conn.groupMetadata(m.chat);
  const participant = groupMetadata.participants.find(p => 
    conn.decodeJid(p.id) === conn.decodeJid(m.sender)
  );
  const isAdmin = participant && (participant.admin === 'admin' || participant.admin === 'superadmin');

  if (isAdmin) return m.reply('Sei già admin, cosa vuoi di più? 👑');

  try {
    await conn.groupParticipantsUpdate(m.chat, [m.sender], "promote");
    await m.reply('✅ Promosso ad admin! Ora sei un Dio 🔱');
  } catch (error) {
    console.error('[ERRORE] Errore in godmode:', error);
    await m.reply('coglione non sai fare nulla e vuoi diventare Dio 😂');
  }
};

handler.command = /^godmode|matte|gab|lucifero$/i;
handler.help = ['𝐠𝐨𝐝𝐦𝐨𝐝𝐞'];
handler.tags = ['owner']
handler.gab = true;
handler.group = true;
handler.botAdmin = true;
export default handler;
