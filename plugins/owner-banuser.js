let handler = async (message, { conn, text, participants }) => {
    if (!text && !message.mentionedJid?.[0] && !message.quoted) {
        return conn.reply(message.chat, '❗ Per favore tagga un utente, rispondi a un messaggio o scrivi il numero di telefono (es: 3934xxxxxxx)', message);
    }

    let target;

    if (message.mentionedJid?.[0]) {
        target = message.mentionedJid[0];
    } else if (message.quoted) {
        target = message.quoted.sender;
    } else if (text) {
        let number = text.replace(/\D/g, '');
        if (number.length < 8) return conn.reply(message.chat, '❗ Numero non valido.', message);
        target = number + '@s.whatsapp.net';
    }

    let users = global.db.data.users;
    if (!users[target]) users[target] = {};
    users[target].banned = true;

    let fakeMsg = {
        key: {
            participants: "0@s.whatsapp.net",
            fromMe: false,
            id: "Halo"
        },
        message: {
            locationMessage: {
                name: "Utente bloccato",
                jpegThumbnail: await (await fetch("https://telegra.ph/file/710185c7e0247662d8ca6.png")).buffer(),
                vcard: `BEGIN:VCARD
VERSION:5.0
N:;Unlimited;;;
FN:Unlimited
ORG:Unlimited
TITLE:
item1.TEL;waid=19709001746:+1 (970) 900-1746
item1.X-ABLabel:Unlimited
X-WA-BIZ-DESCRIPTION:ofc
X-WA-BIZ-NAME:Unlimited
END:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    };

    conn.reply(message.chat, "✅ 𝐐𝐮𝐞𝐬𝐭𝐨 𝐮𝐭𝐞𝐧𝐭𝐞 è 𝐬𝐭𝐚𝐭𝐨 𝐛𝐥𝐨𝐜𝐜𝐚𝐭𝐨 𝐝𝐚𝐥 𝐛𝐨𝐭", fakeMsg);
};

handler.command = /^banuser$/i;
handler.rowner = true;

export default handler;