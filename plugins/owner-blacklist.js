import fs from 'fs';

// Percorso del file blacklist
const path = './blacklist.json';

// Carica la blacklist
let blacklist = fs.existsSync(path) ? JSON.parse(fs.readFileSync(path, 'utf-8')) : [];

const handler = async (m, { conn, usedPrefix, text, isOwner }) => {
    if (!isOwner) return m.reply("❌ Solo l'owner può gestire la blacklist!");

    let args = text.split(" ");
    let command = args[0]?.toLowerCase();
    let number = args[1]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net';

    if (!command) {
        return m.reply(`⚠ *Usa il comando così:*\n\n${usedPrefix}blacklist add @utente\n${usedPrefix}blacklist remove @utente\n${usedPrefix}blacklist list`);
    }

    if (command === 'add') {
        if (!number) return m.reply("❌ Devi menzionare un utente!");
        if (blacklist.includes(number)) return m.reply("⚠ L'utente è già in blacklist!");

        blacklist.push(number);
        fs.writeFileSync(path, JSON.stringify(blacklist, null, 2));
        return m.reply("✅ *Utente aggiunto alla blacklist!* 🚫");
    }

    if (command === 'remove') {
        if (!number) return m.reply("❌ Devi menzionare un utente!");
        if (!blacklist.includes(number)) return m.reply("⚠ L'utente non è in blacklist!");

        blacklist = blacklist.filter(u => u !== number);
        fs.writeFileSync(path, JSON.stringify(blacklist, null, 2));
        return m.reply("✅ *Utente rimosso dalla blacklist!*");
    }

    if (command === 'list') {
        if (blacklist.length === 0) return m.reply("📃 La blacklist è vuota!");

        let list = blacklist.map((u, i) => `${i + 1}. @${u.split('@')[0]}`).join("\n");
        return conn.sendMessage(m.chat, { text: `📌 *Blacklist utenti:*\n\n${list}`, mentions: blacklist }, { quoted: m });
    }

    return m.reply("❌ Comando non valido!");
};

handler.command = /^(blacklist)$/i;
handler.owner = true;

export default handler;