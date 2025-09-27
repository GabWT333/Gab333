let handler = async (message, { conn, participants, groupMetadata }) => {
    const groupAdmins = participants.filter(member => member.admin);
    const adminList = groupAdmins.map(admin => `• @${admin.id.split('@')[0]}`).join('\n');
    const groupOwner = groupMetadata.owner || (groupAdmins.find(admin => admin.admin === 'superadmin')?.id) || message.chat.split('-')[0] + '@s.whatsapp.net';

    const infoMessage = `
『💬』 ══ •⊰✰⊱• ══ 『💬』
🪢 Info - Stato:
✧ Benvenuto (👑)
✧ SoloGruppo (👑)
✧ SoloPrivato (👑)
✧ soloadmin (👑)
✧ Gruppo Ban (👤)
✧ Restrict sul bot (👤 -❗️)
✧ Anti - Paki (👑)
✧ Anti - Call (👤)
✧ Anti - Elimina (👑)
✧ Anti - Link (👑)
✧ Anti - Insta (👑)
✧ Anti - TikTok (👑)
『💬』 ══ •⊰✰⊱• ══ 『💬』
✧ INFO
(👑) Comando eseguibile da admin e owner
(👤) Comando eseguibile solo da un owner
(❗️) Tenere sempre attivo
『💬』 ══ •⊰✰⊱• ══ 『💬』
    `.trim();

    const mentions = participants.map(member => member.id).concat(groupOwner);

    await conn.sendMessage(message.chat, { text: infoMessage, mentions }, { quoted: message });
};

handler.help = ['infostato', 'info-stato'];
handler.tags = ['group'];
handler.command = /^(infostato|stato)$/i;
handler.group = true;

export default handler;