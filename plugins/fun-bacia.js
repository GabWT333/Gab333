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


    if (!who) return m.reply(`𝐦𝐞𝐧𝐳𝐢𝐨𝐧𝐚 𝐥𝐚 𝐩𝐞𝐫𝐬𝐨𝐧𝐚 𝐝𝐚 𝐛𝐚𝐜𝐢𝐚𝐫𝐞 💋`);


    const thumbnailUrl = "https://telegra.ph/file/c38c74851520adb48b684.png"; // URL dell'immagine in miniatura
    const thumbnailBuffer = await (await fetch(thumbnailUrl)).buffer();
    const thumbnailText = "𝐁𝐀𝐂𝐈𝐎"; // Testo miniatura compatibile


    let abrazo = await conn.sendMessage(m.chat, {
        text: `══════•⊰✰⊱•══════
@${who.split('@')[0]} 𝐬𝐞𝐢 𝐬𝐭𝐚𝐭𝐨/𝐚 𝐛𝐚𝐜𝐢𝐚𝐭𝐨/𝐚 𝐝𝐚 @${m.sender.split('@')[0]}
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

handler.command = ['bacia'];
handler.help = ['𝐛𝐚𝐜𝐢𝐚 @𝐭𝐚𝐠'];
handler.tags = ['fun'];

export default handler;