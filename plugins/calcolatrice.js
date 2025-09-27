let handler = async (m, { conn, command, text, usedPrefix }) => {
    if (!text) {
    if (m.quoted && m.quoted.sender) {
        text = '@' + m.quoted.sender.split('@')[0];
    } else {
        return conn.reply(m.chat, `⚠️ Devi menzionare qualcuno o rispondere a un messaggio! Esempio: ${usedPrefix + command} @utente`, m);
    }
}

    let tag = text.replace(/[@]/g, '');
    let target = tag + '@s.whatsapp.net';
    let name = await conn.getName(target);
    let percentage = Math.floor(Math.random() * 100) + 1;

    // Personalizziamo le risposte per ogni comando
    let responses = {
        'lesbica': {
            emoji: '🏳️‍🌈',
            messages: [
                `@${tag} è ${percentage}% lesbica! ${percentage > 80 ? 'Sapphica al 100%' : ''}`,
                `Test completato: @${tag} è ${percentage}% amante delle donne!`,
                `💕 @${tag} preferisce le donne al ${percentage}%`
            ]
        },
        'pajero': {
            emoji: '✊💦',
            messages: [
                `@${tag} è ${percentage}% pajero! ${percentage > 80 ? 'Chiamate il blocco adulti!' : ''}`,
                `Risultato imbarazzante: @${tag} è ${percentage}% segaiolo`,
                `🍆 @${tag} pensa al sesso il ${percentage}% del tempo`
            ]
        },
        'puttana': {
            emoji: '🔞',
            messages: [
                `@${tag} è ${percentage}% puttana! ${percentage > 80 ? 'Quanto costa?' : ''}`,
                `Analisi completa: @${tag} è ${percentage}% di professione più antica`,
                `💰 @${tag} ha un prezzo: ${percentage}% sconto oggi!`
            ]
        }
    };

    let cmd = command.toLowerCase();
    let response = responses[cmd] || {
        emoji: '❓',
        messages: [`@${tag} è ${percentage}% ${cmd}!`]
    };

    let randomMessage = response.messages[Math.floor(Math.random() * response.messages.length)];

    await conn.sendMessage(m.chat, {
        text: `${response.emoji} ${randomMessage}`,
        mentions: [target]
    }, { quoted: m });
};

handler.help = ['gay', 'lesbica', 'puttana', 'prostituta', 'prostituto']
    .map(v => v + ' @tag | nome');
handler.tags = ['fun'];
handler.command = /^(lesbica|puttana|prostituta|prostituto)$/i;

export default handler;