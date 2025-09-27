import jimp from 'jimp';

let handler = async (m, { conn, text }) => {
    try {
        let who = m.mentionedJid?.[0] || m.quoted?.sender || m.sender;
        let avatarUrl = await conn.profilePictureUrl(who, 'image').catch(() => null);

        // Verifica se l'utente ha una foto profilo
        if (!avatarUrl) {
            return conn.reply(m.chat, '⚠️ Questo comando non funziona per utenti senza foto profilo.', m);
        }

        let img = await jimp.read('https://i.imgur.com/nav6WWX.png');
        let avatar = await jimp.read(avatarUrl);

        let bonk = await img.composite(avatar.resize(128, 128), 120, 90, {
            mode: 'dstOver',
            opacitySource: 1,
            opacityDest: 1
        }).getBufferAsync('image/png');

        conn.sendMessage(m.chat, { image: bonk }, { quoted: m });

    } catch (error) {
        console.error(error);
        conn.reply(m.chat, '❌ Si è verificato un errore durante l\'esecuzione del comando.', m);
    }
};

handler.command = /^(bonk)$/i;

export default handler;