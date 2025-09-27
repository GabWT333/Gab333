let cooldowns = {};

const rcanal = "default_value"; // Replace "default_value" with the appropriate value

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let punti = 300;
    let tempoAttesa = 5 * 1000;
    let user = global.db.data.users[m.sender];

    if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tempoAttesa) {
        let tempoRestante = secondiAHMS(Math.ceil((cooldowns[m.sender] + tempoAttesa - Date.now()) / 1000));
        return conn.reply(
            m.chat,
            `[ ✰ ] Hai già avviato una scommessa di recente, aspetta *⏱ ${tempoRestante}* per giocare di nuovo.`,
            m,
            rcanal
        );
    }

    cooldowns[m.sender] = Date.now();

    if (!text) {
        return conn.sendMessage(m.chat, {
            text: `[ ✰ ] Scegli un'opzione per iniziare il gioco:`,
            buttons: [
                { buttonId: `${usedPrefix + command} sasso`, buttonText: { displayText: "🪨 Sasso" }, type: 1 },
                { buttonId: `${usedPrefix + command} carta`, buttonText: { displayText: "📄 Carta" }, type: 1 },
                { buttonId: `${usedPrefix + command} forbice`, buttonText: { displayText: "✂️ Forbice" }, type: 1 }
            ]
        }, { quoted: m });
    }

    let opzioni = ['sasso', 'carta', 'forbice'];
    let astro = opzioni[Math.floor(Math.random() * opzioni.length)];

    if (!opzioni.includes(text)) {
        return conn.sendMessage(m.chat, {
            text: `[ ✰ ] Scegli un'opzione valida (sasso/carta/forbice) per iniziare il gioco:`,
            buttons: [
                { buttonId: `${usedPrefix + command} sasso`, buttonText: { displayText: "🪨 Sasso" }, type: 1 },
                { buttonId: `${usedPrefix + command} carta`, buttonText: { displayText: "📄 Carta" }, type: 1 },
                { buttonId: `${usedPrefix + command} forbice`, buttonText: { displayText: "✂️ Forbice" }, type: 1 }
            ]
        }, { quoted: m });
    }

    let risultato = '';
    let puntiOttenuti = 0;

    if (text === astro) {
        risultato = `[ ✿ ] È stato un pareggio!! Ricevi *100 💶 Unitycoins* come ricompensa.`;
        puntiOttenuti = 100;
    } else if (
        (text === 'sasso' && astro === 'forbice') ||
        (text === 'forbice' && astro === 'carta') ||
        (text === 'carta' && astro === 'sasso')
    ) {
        risultato = `[ ✰ ] HAI VINTO!! Hai appena guadagnato *300 💶 Unitycoins*.`;
        puntiOttenuti = punti;
    } else {
        risultato = `[ ✿ ] HAI PERSO!! Hai appena perso *300 💶 Unitycoins*.`;
        puntiOttenuti = -punti;
    }

    user.limit += puntiOttenuti;
    conn.sendMessage(m.chat, {
        text: risultato,
        buttons: [
            { buttonId: `${usedPrefix + command}`, buttonText: { displayText: "🔄 Riprova" }, type: 1 }
        ]
    }, { quoted: m });
};

handler.help = ['ppt'];
handler.tags = ['game'];
handler.command = ['scommessa'];
//handler.group = true
handler.register = true;

export default handler;

function secondiAHMS(secondi) {
    let minuti = Math.floor(secondi / 60);
    let secondiRimanenti = secondi % 60;
    return `${minuti}m ${secondiRimanenti}s`;
}