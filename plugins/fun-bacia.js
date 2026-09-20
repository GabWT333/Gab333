//Plugin by Gab, Lucifero & 333 staff

const frasiBacio = [
    '𝐬𝐞𝐢 𝐬𝐭𝐚𝐭𝐨/𝐚 𝐥𝐢𝐦𝐨𝐧𝐚𝐭𝐨/𝐚',
    '𝐬𝐞𝐢 𝐬𝐭𝐚𝐭𝐨/𝐚 𝐛𝐚𝐜𝐢𝐚𝐭𝐨/𝐚 𝐬𝐞𝐧𝐬𝐮𝐚𝐥𝐦𝐞𝐧𝐭𝐞',
    '𝐬𝐞𝐢 𝐬𝐭𝐚𝐭𝐨/𝐚 𝐛𝐚𝐜𝐢𝐚𝐭𝐨/𝐚 𝐢𝐧 𝐦𝐨𝐝𝐨 𝐬𝐜𝐡𝐢𝐟𝐚𝐭𝐨',
    '𝐬𝐞𝐢 𝐬𝐭𝐚𝐭𝐨/𝐚 𝐛𝐚𝐜𝐢𝐚𝐭𝐨/𝐚 𝐢𝐧 𝐦𝐨𝐝𝐨 𝐞𝐜𝐜𝐢𝐭𝐚𝐧𝐭𝐞',
    '𝐬𝐞𝐢 𝐬𝐭𝐚𝐭𝐨/𝐚 𝐛𝐚𝐜𝐢𝐚𝐭𝐨/𝐚 𝐚 𝐬𝐭𝐚𝐦𝐩𝐨'
];

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
    const fraseBacio = frasiBacio[Math.floor(Math.random() * frasiBacio.length)];


    let abrazo = await conn.sendMessage(m.chat, {
        text: `══════•⊰✰⊱•══════
@${who.split('@')[0]} ${fraseBacio} 𝐝𝐚 @${m.sender.split('@')[0]}
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