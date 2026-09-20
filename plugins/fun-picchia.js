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

    if (!who) return m.reply(`𝐦𝐞𝐧𝐳𝐢𝐨𝐧𝐚 𝐥𝐚 𝐩𝐞𝐫𝐬𝐨𝐧𝐚 𝐝𝐚 𝐩𝐢𝐜𝐜𝐡𝐢𝐚𝐫𝐞 👊🏻`);

    const thumbnailUrl = "https://cdn.phototourl.com/free/2026-05-07-dc18e3f0-5cbf-4675-ad2b-0d953837d05e.jpg"; 
    const thumbnailBuffer = await (await fetch(thumbnailUrl)).buffer();
    const thumbnailText = "𝐏𝐈𝐂𝐂𝐇𝐈𝐀"; 

    let abrazo = await conn.sendMessage(m.chat, {
        text: `══════•⊰✰⊱•══════
@${who.split('@')[0]} 𝐡𝐚𝐢 𝐫𝐢𝐜𝐞𝐯𝐮𝐭𝐨 𝐮𝐧 𝐩𝐮𝐠𝐧𝐨 𝐢𝐧 𝐟𝐚𝐜𝐜𝐢𝐚 𝐝𝐚 @${m.sender.split('@')[0]} 
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

handler.command = ['picchia'];
handler.help = ['picchia @𝐭𝐚𝐠'];
handler.tags = ['fun'];

export default handler;