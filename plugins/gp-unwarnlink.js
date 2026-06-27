//Plugin by Gab, Lucifero & 333 staff


let handler = async (m, { conn }) => {
    const who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null;

    if (!who) return m.reply('❗ 𝐌𝐞𝐧𝐳𝐢𝐨𝐧𝐚 𝐥𝐚 𝐩𝐞𝐫𝐬𝐨𝐧𝐚 𝐚 𝐜𝐮𝐢 𝐭𝐨𝐠𝐥𝐢𝐞𝐫𝐞 𝐢𝐥 𝐰𝐚𝐫𝐧 𝐥𝐢𝐧𝐤!');

    if (!global.db.data.users[who]) return m.reply('Utente non trovato nel database');

    if ((global.db.data.users[who].warnIg || 0) === 0 && (global.db.data.users[who].warnTiktok || 0) === 0) {
        return m.reply(`ℹ️ @${who.split('@')[0]} non ha warn da rimuovere`, null, { mentions: [who] });
    }

    if ((global.db.data.users[who].warnIg || 0) > 0) global.db.data.users[who].warnIg--;
    if ((global.db.data.users[who].warnTiktok || 0) > 0) global.db.data.users[who].warnTiktok--;

    await m.reply(
        `✅ 𝐔𝐧 𝐰𝐚𝐫𝐧 𝐫𝐢𝐦𝐨𝐬𝐬𝐨 𝐚 @${who.split('@')[0]}\n\n` +
        `𝐖𝐚𝐫𝐧 𝐚𝐭𝐭𝐮𝐚𝐥𝐢:\n𝐈𝐆: ${global.db.data.users[who].warnIg || 0} / 3,\n𝐓𝐢𝐤𝐓𝐨𝐤: ${global.db.data.users[who].warnTiktok || 0} / 3`,
        null,
        { mentions: [who] }
    );
};

handler.command = ['unwarnlink'];
handler.tags = ['admin'];
handler.help = ['unwarnlink @utente'];
handler.admin = true;
handler.botAdmin = true;

export default handler;