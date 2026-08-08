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

    if (!who) return m.reply(`𝐦𝐞𝐧𝐳𝐢𝐨𝐧𝐚 𝐥𝐚 𝐩𝐞𝐫𝐬𝐨𝐧𝐚 𝐝𝐚 𝐬𝐭𝐮𝐩𝐫𝐚𝐫𝐞`);


    const thumbnailUrl = "https://files.catbox.moe/eu24ui.png"; // URL dell'immagine in miniatura
    const thumbnailBuffer = await (await fetch(thumbnailUrl)).buffer();
    const thumbnailText = "𝐒𝐓𝐔𝐏𝐑𝐀"; // Testo miniatura compatibile

    let abrazo = await conn.sendMessage(m.chat, {
        text: `══════•⊰✰⊱•══════
@${who.split('@')[0]} 𝙨𝙚𝙞 𝙨𝙩𝙖𝙩𝙖 𝙨𝙩𝙪𝙥𝙧𝙖𝙩𝙖 𝙖 𝟵𝟬 𝐝𝐚 @${m.sender.split('@')[0]} 𝙚 𝙩𝙞 𝙝𝙖 𝙩𝙧𝙖𝙩𝙩𝙖𝙩𝙤 𝙘𝙤𝙢𝙚 𝙪𝙣𝙖 𝙥𝙪𝙩𝙩𝙖𝙣𝙖 𝙙𝙞 𝙢𝙚𝙧𝙙𝙖 " 𝐀𝐡𝐡𝐡.., 𝐀𝐚𝐚𝐚𝐡𝐡, 𝐬𝐢 𝐜𝐨𝐧𝐭𝐢𝐧𝐮𝐚, 𝐧𝐨𝐧 𝐟𝐞𝐫𝐦𝐚𝐫𝐭𝐢, 𝐧𝐨𝐧 𝐟𝐞𝐫𝐦𝐚𝐫𝐭𝐢 " 𝙚 𝙩𝙞 𝙝𝙖 𝙡𝙖𝙨𝙘𝙞𝙖𝙩𝙤 𝙘𝙤𝙨𝙞̀ 𝙜𝙤𝙣𝙛𝙞𝙖 𝙘𝙝𝙚 𝙣𝙤𝙣 𝙧𝙞𝙚𝙨𝙘𝙞 𝙣𝙚𝙢𝙢𝙚𝙣𝙤 𝙖 𝙧𝙚𝙜𝙜𝙚𝙧𝙩𝙞 𝙞𝙣 𝙥𝙞𝙚𝙙𝙞 𝙨𝙩𝙪𝙥𝙞𝙙𝙖 𝙩𝙧𝙤𝙞𝙖 𝙙𝙞 𝙢𝙚𝙧𝙙𝙖.
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

handler.command = ['stupra'];
handler.help = ['stupra @𝐭𝐚𝐠'];
handler.tags = ['fun'];

export default handler;