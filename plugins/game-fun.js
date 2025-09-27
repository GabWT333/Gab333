const gameSessions = {};
let cooldowns = {};

let handler = async (m, { conn, text, command, usedPrefix }) => {
    const tempoAttesa = 5; // secondi

    // Cooldown
    if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tempoAttesa * 1000) {
        let tempoRimanente = secondiAHMS(Math.ceil((cooldowns[m.sender] + tempoAttesa * 1000 - Date.now()) / 1000));
        return m.reply(`⏳ Hai già giocato di recente. Aspetta *${tempoRimanente}* prima di riprovare.`);
    }

    if (!text || ['testa', 'croce'].includes(text.toLowerCase())) {
        if (!gameSessions[m.chat]) {
            if (!text) {
                return conn.sendMessage(m.chat, {
                    text: `🎮 *Testa o Croce*\n\n🧑 Giocatore 1: @${m.sender.split('@')[0]}\n🕹️ In attesa del secondo giocatore...\n\nScrivi "testa" o "croce" per iniziare.`,
                    footer: 'Fai la tua scelta',
                    mentions: [m.sender],
                    headerType: 1
                }, { quoted: m });
            }

            gameSessions[m.chat] = {
                player1: m.sender,
                choice1: text.toLowerCase(),
                player2: null,
                choice2: null,
                status: 'waiting'
            };

            return conn.sendMessage(m.chat, {
                text: `🎮 *Testa o Croce*\n\n🧑 Giocatore 1: @${m.sender.split('@')[0]} ha scelto *${text.toLowerCase()}*\n🎯 In attesa di un altro giocatore...\n\nTocca a te! Scrivi "testa" o "croce".`,
                footer: 'Partecipa ora',
                mentions: [m.sender],
                headerType: 1
            }, { quoted: m });
        } else {
            let session = gameSessions[m.chat];

            if (session.status === 'waiting' && m.sender !== session.player1) {
                if (!['testa', 'croce'].includes(text.toLowerCase())) {
                    return conn.sendMessage(m.chat, {
                        text: `⚠️ Devi scegliere tra *testa* o *croce*! Scrivi la tua scelta.`,
                        footer: 'Seleziona testa o croce',
                        headerType: 1
                    }, { quoted: m });
                }

                session.player2 = m.sender;
                session.choice2 = text.toLowerCase();
                session.status = 'ready';

                const risultato = Math.random() < 0.5 ? 'testa' : 'croce';
                const vincitore1 = session.choice1 === risultato;
                const vincitore2 = session.choice2 === risultato;

                let messaggio = `🪙 *RISULTATO: ${risultato.toUpperCase()}*\n\n`;

                if (vincitore1) {
                    global.db.data.users[session.player1].limit += 500;
                    messaggio += `✅ @${session.player1.split('@')[0]} ha vinto 500 💶\n`;
                } else {
                    global.db.data.users[session.player1].limit -= 250;
                    messaggio += `❌ @${session.player1.split('@')[0]} ha perso 250 💶\n`;
                }

                if (vincitore2) {
                    global.db.data.users[session.player2].limit += 500;
                    messaggio += `✅ @${session.player2.split('@')[0]} ha vinto 500 💶\n`;
                } else {
                    global.db.data.users[session.player2].limit -= 250;
                    messaggio += `❌ @${session.player2.split('@')[0]} ha perso 250 💶\n`;
                }

                conn.sendMessage(m.chat, {
                    text: messaggio + `\n\nPer giocare di nuovo scrivi il comando ${usedPrefix + command}`,
                    mentions: [session.player1, session.player2],
                    footer: 'Gioca di nuovo',
                    headerType: 1
                }, { quoted: m });

                cooldowns[session.player1] = Date.now();
                cooldowns[session.player2] = Date.now();
                delete gameSessions[m.chat];
                return;
            }

            if (session.status === 'waiting' && m.sender === session.player1) {
                return m.reply(`Hai già scelto *${session.choice1}*. In attesa di un altro giocatore...`);
            }

            return conn.sendMessage(m.chat, {
                text: '❌ Partita non disponibile o comando non valido.\n\nPer iniziare una nuova partita scrivi il comando ' + usedPrefix + command,
                footer: 'Avvia una nuova partita',
                headerType: 1
            }, { quoted: m });
        }
    }

    return conn.sendMessage(m.chat, {
        text: '❌ Comando non valido. Scrivi "' + usedPrefix + command + '" o scegli "testa" o "croce".',
        footer: 'Avvia una nuova partita',
        headerType: 1
    }, { quoted: m });
};

function secondiAHMS(secondi) {
    return `${secondi % 60} secondi`;
}

handler.help = ['moneta'];
handler.tags = ['game'];
handler.command = ['cf', 'flip', 'moneta'];
handler.register = true;

export default handler;