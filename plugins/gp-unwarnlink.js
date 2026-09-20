//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn }) => {
    const who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null;

    if (!who) return m.reply('❗ Menziona la persona a cui togliere il warn!');

    if (!global.db.data.users[who]) return m.reply('Utente non trovato nel database');

    const warnIg = global.db.data.users[who].warnIg || 0
    const warnTiktok = global.db.data.users[who].warnTiktok || 0
    const warnAntiporno = global.db.data.users[who].antiporno || 0

    if (warnIg === 0 && warnTiktok === 0 && warnAntiporno === 0) {
        return m.reply(`ℹ️ @${who.split('@')[0]} non ha warn da rimuovere`, null, { mentions: [who] });
    }

    const username = who.split('@')[0]
    const infoText = `👤 *@${username}* - Scegli quale warn togliere:\n\n` +
        `📸 IG: ${warnIg} / 3\n` +
        `🎵 TikTok: ${warnTiktok} / 3\n` +
        `🚫 Porno & Gore: ${warnAntiporno} / 5`

    const buttons = [
        { buttonId: `unwarnlink_ig_${who}`, buttonText: { displayText: '📸 IG' }, type: 1 },
        { buttonId: `unwarnlink_tiktok_${who}`, buttonText: { displayText: '🎵 TikTok' }, type: 1 },
        { buttonId: `unwarnlink_porno_${who}`, buttonText: { displayText: '🚫 Porno&Gore' }, type: 1 }
    ]

    const buttonMessage = {
        text: infoText,
        footer: '333 Bot',
        buttons: buttons,
        headerType: 1
    }

    await conn.sendMessage(m.chat, buttonMessage, { quoted: m, mentions: [who] })
};

handler.command = ['unwarnlink'];
handler.tags = ['admin'];
handler.help = ['unwarnlink @utente'];
handler.admin = true;
handler.botAdmin = true;

export default handler;