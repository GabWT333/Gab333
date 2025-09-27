let handler = async (m, { conn, text }) => {
    // Controlla se è stato taggato qualcuno o se si sta rispondendo a un messaggio
    let user = m.mentionedJid?.[0] || m.quoted?.sender;

    // Se non c'è testo né risposta a un messaggio, errore
    if (!user) throw '❗ Tagga un utente o rispondi a un suo messaggio per usare questo comando.';

    let target = user.split('@')[0];
    let sender = m.sender.split('@')[0];

    // Messaggio provocante
    let message = `*🔥 @${sender} sta scatenando la passione con @${target}... 💋*`;

    // Invia messaggio con menzione
    await conn.reply(m.chat, message, m, { mentions: [user, m.sender] });

    // Invia reazione
    await conn.sendMessage(m.chat, {
        react: {
            text: '💦',
            key: m.key
        }
    });
};

// Comando personalizzato (non è un handler.command)
handler.customPrefix = /^\.scopa$/i;
handler.command = new RegExp; // per compatibilità
export default handler;