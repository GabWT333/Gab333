//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn, text }) => {
    let users = [];


    if (m.mentionedJid.length) {
        users = m.mentionedJid; // Aggiungi gli utenti taggati
    } else if (m.quoted) {
        users.push(m.quoted.sender); // Aggiungi l'utente del messaggio citato
    } else if (text) {
        let numbers = text.split(/\s+/).filter(v => v.length > 0); // Dividi input in numeri separati da spazi
        for (let number of numbers) {
            if (isNaN(number)) {
                if (number.includes('@')) {
                    users.push(number.split`@`[1] + '@s.whatsapp.net');
                }
            } else {
                users.push(number + '@s.whatsapp.net');
            }
        }
    }


    if (users.length === 0) return;


    for (let user of users) {
        await conn.groupParticipantsUpdate(m.chat, [user], 'demote');
    }
};

handler.help = ['*593xxx*', '*@usuario*', '*responder chat*'].map(v => 'demote ' + v);
handler.tags = ['group'];
handler.command = /^(demote|retrocedi|togliadmin|r)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;
handler.fail = null;

export default handler;