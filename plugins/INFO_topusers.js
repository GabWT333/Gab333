//Plugin by Gab, Lucifero & 333 staff



let handler = async (m, { conn }) => {
    const chat = global.db.data.chats[m.chat];
    if (!chat?.topUsers || Object.keys(chat.topUsers).length === 0) {
        return await conn.sendMessage(m.chat, { text: 'Nessun messaggio registrato in questo gruppo.' });
    }

    const users = Object.entries(chat.topUsers)
        .filter(([jid]) => !jid.endsWith('@g.us') && jid !== conn.user.jid);

    if (users.length === 0) {
        return await conn.sendMessage(m.chat, { text: 'Nessun messaggio registrato in questo gruppo.' });
    }

    users.sort((a, b) => b[1] - a[1]);
    const top = users.slice(0, 10);

    const titles = [
        '𝐑𝐞 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨',
        '𝐍𝐞𝐫𝐝',
        '𝐍𝐞𝐫𝐝 𝐢𝐧𝐞𝐬𝐩𝐞𝐫𝐭𝐨',
        '𝐏𝐫𝐞𝐬𝐞𝐧𝐭𝐞 𝐭𝐫𝐚 𝐧𝐨𝐢',
        '𝐀 𝐯𝐨𝐥𝐭𝐞 𝐜’𝐞̀ 𝐚 𝐯𝐨𝐥𝐭𝐞 𝐧𝐨',
        '𝐄́ 𝐭𝐢𝐦𝐢𝐝𝐨',
        '𝐈𝐧𝐮𝐭𝐢𝐥𝐞',
        '𝐅𝐚 𝐟𝐢𝐧𝐭𝐚 𝐝𝐢 𝐬𝐜𝐫𝐢𝐯𝐞𝐫𝐞',
        '𝐂𝐨𝐧 𝐮𝐧𝐚 𝐯𝐢𝐭𝐚 𝐬𝐨𝐜𝐢𝐚𝐥𝐞',
        '𝐅𝐚𝐢 𝐩𝐫𝐢𝐦𝐚 𝐚 𝐪𝐮𝐢𝐭𝐭𝐚𝐫𝐞'
    ];

    chat.prevFirst = chat.prevFirst || null;
    const newFirst = top[0][0];

    if (chat.prevFirst && chat.prevFirst !== newFirst) {
        await conn.sendMessage(m.chat, {
            text: `🏆 @${newFirst.split('@')[0]} ha superato @${chat.prevFirst.split('@')[0]} ed è diventato primo!`,
            mentions: [newFirst, chat.prevFirst]
        });
    }

    chat.prevFirst = newFirst;

    let text = `🏆 𝐓𝐎𝐏 𝟏𝟎 𝐔𝐓𝐄𝐍𝐓𝐈 𝐏𝐈𝐔̀ 𝐀𝐓𝐓𝐈𝐕𝐈 𝐃𝐄𝐋 𝐆𝐑𝐔𝐏𝐏𝐎\n> 𝐬𝐞 𝐬𝐞𝐢 𝐢𝐥 𝐩𝐫𝐢𝐦𝐨 𝐫𝐢𝐜𝐨𝐫𝐝𝐚 𝐝𝐢 𝐫𝐢𝐬𝐜𝐚𝐭𝐭𝐚𝐫𝐞 𝐢𝐥 𝐭𝐮𝐨 𝐩𝐫𝐞𝐦𝐢𝐨 𝐜𝐨𝐧 ’’.𝐩𝐫𝐞𝐦𝐢𝐨𝐭𝐨𝐩’’!\n\n`;

    const posEmojis = ['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];

    for (let i = 0; i < top.length; i++) {
        const [jid, count] = top[i];
        const title = titles[i] || 'Chat member';
        text += `${posEmojis[i]} @${jid.split('@')[0]} — ${title} • ${count} messaggi\n`;
    }

    await conn.sendMessage(m.chat, {
    text,
    mentions: top.map(u => u[0]),
    buttons: [
        { buttonId: ".topgruppi", buttonText: { displayText: "🌍 𝐓𝐨𝐩 𝐠𝐫𝐮𝐩𝐩𝐢" }, type: 1 },
        { buttonId: ".statsgiornaliere", buttonText: { displayText: "📊 𝐒𝐭𝐚𝐭𝐢𝐬𝐭𝐢𝐜𝐡𝐞 𝐠𝐢𝐨𝐫𝐧𝐚𝐥𝐢𝐞𝐫𝐞" }, type: 1 },
    ],
    headerType: 1
});
};

handler.help = ['top10'];
handler.tags = ['group'];
handler.command = ['top'];

export default handler;