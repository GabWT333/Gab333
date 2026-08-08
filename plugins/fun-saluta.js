//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn, usedPrefix, command, text }) => {
    let who;

    if (m.isGroup) {
        who = m.mentionedJid[0] 
            ? m.mentionedJid[0] 
            : m.quoted ? m.quoted.sender 
            : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' 
            : false;
    } else {
        who = text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.chat;
    }

    let user = global.db.data.users[who];
    if (!who) return m.reply(`𝐌𝐞𝐧𝐳𝐢𝐨𝐧𝐚 𝐥𝐚 𝐩𝐞𝐫𝐬𝐨𝐧𝐚 𝐝𝐚 𝐬𝐚𝐥𝐮𝐭𝐚𝐫𝐞 👋`);

    let abrazo = await conn.reply(m.chat, `𝐇𝐞𝐲 𝐜𝐢𝐚𝐨 @${who.split('@')[0]}, 𝐟𝐢𝐧𝐢𝐭𝐨 𝐝𝐢 𝐟𝐚𝐫𝐭𝐢 𝐢 𝐜𝐚𝐳𝐳𝐢 𝐭𝐮𝐨𝐢? 𝐒𝐜𝐫𝐢𝐯𝐢 𝐬𝐮𝐥 𝐠𝐫𝐮𝐩𝐩𝐨, 𝐚𝐥𝐭𝐫𝐢𝐦𝐞𝐧𝐭𝐢 @${m.sender.split('@')[0]} 𝐬𝐢 𝐨𝐟𝐟𝐞𝐧𝐝𝐞!! 😡`, m, { mentions: [who, m.sender] });

    conn.sendMessage(m.chat, { react: { text: '', key: abrazo.key } });
};

handler.command = ['saluta'];
handler.help = ['saluta @𝐭𝐚𝐠'];
handler.tags = ['fun'];
export default handler;