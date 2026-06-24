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

    if (!who) return m.reply(`𝐦𝐞𝐧𝐳𝐢𝐨𝐧𝐚 𝐥𝐚 𝐩𝐞𝐫𝐬𝐨𝐧𝐚 𝐝𝐚 𝐬𝐩𝐚𝐫𝐚𝐫𝐞 🔫`);

    const thumbnailUrl = "https://cdn.phototourl.com/free/2026-05-07-6bcb47a5-00d2-485b-9507-47b4536e15c5.jpg"; 
    const thumbnailBuffer = await (await fetch(thumbnailUrl)).buffer();
    const thumbnailText = "𝐒𝐏𝐀𝐑𝐀"; 

    let abrazo = await conn.sendMessage(m.chat, {
        text: `══════•⊰✰⊱•══════
@${who.split('@')[0]} 𝐬𝐞𝐢 𝐬𝐭𝐚𝐭𝐨/𝐚 𝐬𝐩𝐚𝐫𝐚𝐭𝐨/𝐚 𝐝𝐚 @${m.sender.split('@')[0]} (𝐡𝐚 𝐮𝐧𝐚 𝐦𝐢𝐫𝐚 𝐝𝐢 𝐦𝐞𝐫𝐝𝐚)
══════•⊰✰⊱•══════`,
        mentions: [who, m.sender],
    }, {
        quoted: {
            key: {
                participants: "0@s.whatsapp.net",
                fromMe: false,
                id: "Halo",
            },
            message: {
                locationMessage: {
                    name: thumbnailText, 
                    jpegThumbnail: thumbnailBuffer, 
                },
            },
            participant: "0@s.whatsapp.net",
        },
    });

    conn.sendMessage(m.chat, { react: { text: '', key: abrazo.key } });
};

handler.command = ['shot'];
handler.help = ['shot @𝐭𝐚𝐠'];
handler.tags = ['fun'];

export default handler;