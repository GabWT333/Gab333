let handler = async (message, { conn, text }) => {
    if (!text && !message.mentionedJid?.[0] && !message.quoted) {
        return conn.reply(message.chat, '❗ Tagga, rispondi o scrivi il numero (es: 3934xxxxxxx)', message);
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
    users[target].banned = false;

    let fakeMsg = {
        key: {
            participants: "0@s.whatsapp.net",
            fromMe: false,
            id: "Halo"
        },
        message: {
            locationMessage: {
                name: "Utente sbloccato",
                jpegThumbnail: await (await fetch("https://telegra.ph/file/592a9dbbe01cfaecbefb8.png")).buffer(),
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

    conn.reply(message.chat, "✅ 𝐐𝐮𝐞𝐬𝐭𝐨 𝐮𝐭𝐞𝐧𝐭𝐞 𝐩𝐨𝐭𝐫𝐚' 𝐞𝐬𝐞𝐠𝐮𝐢𝐫𝐞 𝐝𝐢 𝐧𝐮𝐨𝐯𝐨 𝐢 𝐜𝐨𝐦𝐚𝐧𝐝𝐢", fakeMsg);
};

handler.command = /^unbanuser|unban$/i;
handler.rowner = true;

export default handler;