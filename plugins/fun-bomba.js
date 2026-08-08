//Plugin by Gab, Lucifero & 333 staff



let bombaInCorso = {};

const playAgainButtons = () => [{
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({ display_text: 'Innesca un\'altra!', id: `.bomba` })
}];

let handler = async (m, { conn, text, command }) => {
    let chat = m.chat;

    if (command === 'bomba') {
        if (bombaInCorso[chat]) return m.reply('⚠️ C\'è già una bomba innescata! Scappa! 🏃‍♂️');

        const cooldownKey = `bomba_${chat}`;
        const lastGame = global.cooldowns?.[cooldownKey] || 0;
        const now = Date.now();
        if (now - lastGame < 5000) return m.reply(`⏳ Aspetta un attimo, la polvere da sparo deve ancora depositarsi!`);

        global.cooldowns = global.cooldowns || {};
        global.cooldowns[cooldownKey] = now;

        let durata = Math.floor(Math.random() * (35 - 15 + 1)) + 15; 
        let scadenza = Date.now() + (durata * 1000);

        bombaInCorso[chat] = {
            vittima: m.sender,
            passaggi: [],
            scadenza: scadenza,
            timer: setTimeout(() => esplosione(chat, conn, m), durata * 1000)
        };

        let pName = `@${m.sender.split('@')[0]}`;
        let startCaption = `╔════════════════════╗\n`;
        startCaption += `║      *333 BOT - BOMBA*      ║\n`;
        startCaption += `╚═══════════════════════╝\n\n`;
        startCaption += `💣 *BOMBA ATTIVATA!*\n\n`;
        startCaption += `👤 Vittima: ${pName}\n`;
        startCaption += `⏳ Tempo restante: *${durata}s*\n`;
        startCaption += `🧨 Usa: *passa @utente* o rispondi con *passa*\n`;
        startCaption += `❌ 333 BOT non può ricevere la bomba!`;

        return conn.sendMessage(chat, { text: startCaption, mentions: [m.sender], footer: '333 BOT' }, { quoted: m });
    }
};

handler.before = async function (m, { conn }) {
    let chat = m.chat;
    if (!bombaInCorso[chat] || !m.text) return;

    let b = bombaInCorso[chat];
    let contenuto = m.text.toLowerCase().trim();

    if (m.sender !== b.vittima) return; 
    if (!contenuto.startsWith('passa')) return;

    let target = null;
    if (m.mentionedJid && m.mentionedJid[0]) {
        target = m.mentionedJid[0];
    } else if (m.quoted && m.quoted.sender) {
        target = m.quoted.sender;
    }

    if (!target || target === m.sender) return; 
    if (target === conn.user.jid) return m.reply('❌ Il bot non accetta bombe.');

    clearTimeout(b.timer);
    let tempoRimanente = b.scadenza - Date.now();

    if (tempoRimanente <= 500) return;

    if (!b.passaggi.includes(m.sender)) b.passaggi.push(m.sender);

    b.vittima = target;
    let pName = `@${target.split('@')[0]}`;

    let conferma = `💣 *BOMBA PASSATA!* 💣\n\n`;
    conferma += `*L'ordigno è ora nelle mani di ${pName}!*\n`;
    conferma += `*🧨 Sbrigati! Il tempo scorre...*`;

    b.timer = setTimeout(() => esplosione(chat, conn, m), tempoRimanente);

    await conn.sendMessage(chat, { text: conferma, mentions: [target] }, { quoted: m });
    return true; 
};

async function esplosione(chatId, conn, m) {
    let b = bombaInCorso[chatId];
    if (!b) return;

    let vTag = `@${b.vittima.split('@')[0]}`;
    if (!global.db.data.users) global.db.data.users = {};

    let penale = 15;
    if (!global.db.data.users[b.vittima]) global.db.data.users[b.vittima] = { money: 0 };
    let saldoVittima = global.db.data.users[b.vittima].money || 0;
    global.db.data.users[b.vittima].money = Math.max(0, saldoVittima - penale);

    let finale = `╔════════════════════╗\n`;
    finale += `║      *BOOM*     ║\n`;
    finale += `╚═══════════════════════╝\n\n`;
    finale += `💥 *ESPLOSIONE!*\n\n`;
    finale += `💀 La bomba è scoppiata in mano a ${vTag}!\n`;
    finale += `💸 Hai perso: *-${penale}€*\n\n`;

    if (b.passaggi.length > 0) {
        finale += `🏆 *SOPRAVVISSUTI PREMIATI:*\n`;
        let premiati = [...new Set(b.passaggi)];
        for (let jid of premiati) {
            if (jid === b.vittima) continue;
            let premio = Math.floor(Math.random() * 20) + 10;

            if (!global.db.data.users[jid]) global.db.data.users[jid] = { money: 0 };
            global.db.data.users[jid].money = (global.db.data.users[jid].money || 0) + premio;

            finale += `• @${jid.split('@')[0]} +${premio}€\n`;
        }
        finale += `\n`;
    }

    await conn.sendMessage(chatId, { 
        text: finale, 
        mentions: [b.vittima, ...b.passaggi],
        footer: '*333 BOT*',
        interactiveButtons: playAgainButtons()
    });

    delete bombaInCorso[chatId];
}

handler.help = ['bomba'];
handler.tags = ['giochi'];
handler.command = /^(bomba)$/i;
handler.group = true;
handler.register = false;

export default handler;
