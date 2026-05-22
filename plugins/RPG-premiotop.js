//Plugin by Gab, Lucifero & 333 staff

import fetch from 'node-fetch';

let handler = async (m, { conn }) => {
    let chat = global.db.data.chats[m.chat] || {};
    chat.topUsers = chat.topUsers || {};


    let topUsers = Object.entries(chat.topUsers)
        .filter(([jid]) => jid !== m.chat && global.db.data.users[jid])
        .sort((a, b) => b[1] - a[1]);

    if (topUsers.length === 0) {
        return await conn.reply(m.chat, '🚫 Nessun messaggio registrato in questo gruppo.', m);
    }

    let primo = topUsers[0][0];

    if (m.sender !== primo) {
        return await conn.reply(m.chat, `🚫 Solo il primo della classifica può riscattare il premio! Oggi è: @${primo.split('@')[0]}`, m, { mentions: [primo] });
    }

    let user = global.db.data.users[m.sender] || { bank: 0, lastTopClaim: 0 };

    let currentTime = new Date();
    let timePassed = currentTime - (user.lastTopClaim || 0);

    if (timePassed < 24 * 60 * 60 * 1000) {
        let remainingTime = 24 * 60 * 60 * 1000 - timePassed;
        let remainingTimeString = msToTime(remainingTime);
        return await conn.reply(m.chat, `⏳ Devi aspettare ancora *${remainingTimeString}* prima di poter riscattare il premio giornaliero.`, m);
    }


    const premio = 5000;
    user.bank = (user.bank || 0) + premio;
    user.lastTopClaim = currentTime;

    global.db.data.users[m.sender] = user;

    let fkontak = {
        key: { participants: "0@s.whatsapp.net", remoteJid: "status@broadcast", fromMe: false, id: "Halo" },
        message: { contactMessage: { displayName: '𝐏𝐑𝐄𝐌𝐈𝐎 𝐓𝐎𝐏', vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` } },
        participant: "0@s.whatsapp.net"
    };

    let text = `🏆 Complimenti @${m.sender.split('@')[0]}!\nHai riscattato il premio di *${premio}€* per essere il primo della classifica del gruppo oggi!`;
    await conn.reply(m.chat, text, fkontak, { mentions: [m.sender] });
};

function msToTime(duration) {
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
    let minutes = Math.floor((duration / (1000 * 60)) % 60);
    let seconds = Math.floor((duration / 1000) % 60);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + " ore " + minutes + " min " + seconds + " sec";
}

handler.command = ['premiotop'];
handler.tags = ['group', 'economy'];
handler.group = true;
export default handler;