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

    if (!who) return m.reply(`𝐦𝐞𝐧𝐳𝐢𝐨𝐧𝐚 𝐥𝐚 𝐩𝐞𝐫𝐬𝐨𝐧𝐚 𝐝𝐚 𝐬𝐜𝐨𝐩𝐚𝐫𝐞`);


    const thumbnailUrl = "https://files.catbox.moe/eu24ui.png"; 
    const thumbnailBuffer = await (await fetch(thumbnailUrl)).buffer();
    const thumbnailText = "SCOPA"; 

    let abrazo = await conn.sendMessage(m.chat, {
        text: `══════•⊰✰⊱•══════
@${who.split('@')[0]} 𝐬𝐞𝐢 𝐬𝐭𝐚𝐭𝐚 𝐬𝐜𝐨𝐩𝐚𝐭𝐚 𝐢𝐧 𝐦𝐨𝐝𝐨 𝐯𝐢𝐨𝐥𝐞𝐧𝐭𝐨 𝐝𝐚 @${m.sender.split('@')[0]}, 𝐭𝐢 𝐡𝐚 𝐩𝐫𝐞𝐬𝐚, 𝐭𝐢 𝐡𝐚 𝐬𝐛𝐚𝐭𝐭𝐮𝐭𝐚 𝐚 𝐥𝐞𝐭𝐭𝐨 𝐞 𝐡𝐚 𝐢𝐧𝐢𝐳𝐢𝐚𝐭𝐨 𝐚 𝐬𝐟𝐨𝐧𝐝𝐚𝐫𝐭𝐢 𝐦𝐞𝐧𝐭𝐫𝐞 𝐮𝐫𝐥𝐚𝐯𝐢 𝐢𝐥 𝐬𝐮𝐨 𝐧𝐨𝐦𝐞, 𝐝𝐨𝐩𝐨 𝐬𝐨𝐥𝐢 𝟐𝟎 𝐬𝐞𝐜𝐨𝐧𝐝𝐢 𝐭𝐢 𝐯𝐢𝐞𝐧𝐞 𝐢𝐧 𝐠𝐨𝐥𝐚.
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
                    name: thumbnailText, // Scritta in miniatura compatibile
                    jpegThumbnail: thumbnailBuffer, // Immagine in miniatura
                },
            },
            participant: "0@s.whatsapp.net",
        },
    });

    conn.sendMessage(m.chat, { react: { text: '', key: abrazo.key } });
};

handler.command = ['scopa'];
handler.help = ['stupra @𝐭𝐚𝐠'];
handler.tags = ['fun'];

export default handler;