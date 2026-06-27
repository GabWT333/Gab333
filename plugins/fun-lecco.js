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
    if (!who) return m.reply(`Menziona chi vuoi leccare 😅`);


    let abrazo = await conn.reply(m.chat, `@${m.sender.split('@')[0]} 𝐬𝐭𝐚 𝐥𝐞𝐜𝐜𝐚𝐧𝐝𝐨 𝐥𝐞 𝐩𝐚𝐥𝐥𝐞 𝐝𝐢  @${who.split('@')[0]} 👅`, m, { mentions: [who, m.sender] });


    conn.sendMessage(m.chat, { react: { text: '😛', key: abrazo.key } });
};

handler.command = ['lecco'];
handler.help = ['𝐥𝐞𝐜𝐜𝐨 @𝐭𝐚𝐠'];
handler.tags = ['fun'];
export default handler;