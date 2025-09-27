import fs from "fs";
import path from "path";

const PLAY_FOLDER = "./play"; // 📂 Cartella MP3

let handler = async (m, { conn, isAdmin, isOwner }) => {
    if (!isAdmin && !isOwner) {
        return conn.sendMessage(m.chat, { text: "❌ *Solo gli admin possono usare questo comando!*" }, { quoted: m });
    }

    if (!fs.existsSync(PLAY_FOLDER)) {
        return conn.sendMessage(m.chat, { text: "✅ *La cartella è già vuota!*" }, { quoted: m });
    }

    let files = fs.readdirSync(PLAY_FOLDER);
    if (files.length === 0) {
        return conn.sendMessage(m.chat, { text: "✅ *Nessun file da eliminare!*" }, { quoted: m });
    }

    // 🗑️ Elimina tutti i file MP3
    for (let file of files) {
        let filePath = path.join(PLAY_FOLDER, file);
        fs.unlinkSync(filePath);
    }

    await conn.sendMessage(m.chat, { 
        text: "🗑️ *Cartella Play svuotata con successo!*", 
        react: { text: "✅", key: m.key } 
    }, { quoted: m });
};

handler.command = /^(clearplay)$/i;
handler.group = true;
handler.admin = true;

export default handler;