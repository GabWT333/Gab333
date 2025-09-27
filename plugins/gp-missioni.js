import fs from 'fs';

const handler = async (m, { conn, usedPrefix, command, args }) => {
    const nomeDelBot = global.db.data.nomedelbot || 'ChatUnity Bot';
    const image = fs.existsSync('./chatunity.png') ? fs.readFileSync('./chatunity.png') : null;

    // Inizializzazione robusta del database
    if (!global.db.data) global.db.data = {};
    if (!global.db.data.users) global.db.data.users = {};
    
    const who = m.mentionedJid?.[0] || m.quoted?.sender || m.sender;
    
    // Struttura dati utente completa
    let user = global.db.data.users[who] || {
        money: 0,
        bank: 0,
        warn: 0,
        messaggi: 0,
        command: 0,
        totalMessaggi: 0,
        lastWarn: 0,
        lastCommand: 0,
        missions: {
            daily: { completed: 0, lastReset: Date.now(), current: [] },
            weekly: { completed: 0, lastReset: Date.now(), current: [] }
        }
    };

    // Inizializzazione missioni se mancante
    if (!user.missions) {
        user.missions = {
            daily: { completed: 0, lastReset: Date.now(), current: [] },
            weekly: { completed: 0, lastReset: Date.now(), current: [] }
        };
    }

    // Reset missioni giornaliere e settimanali
    const now = Date.now();
    const dailyResetNeeded = !user.missions.daily.current.length || 
                           now - user.missions.daily.lastReset >= 86400000;
    const weeklyResetNeeded = !user.missions.weekly.current.length || 
                            now - user.missions.weekly.lastReset >= 604800000;

    if (dailyResetNeeded) {
        user.missions.daily = {
            completed: 0,
            lastReset: now,
            current: generateDailyMissions()
        };
    }

    if (weeklyResetNeeded) {
        user.missions.weekly = {
            completed: 0,
            lastReset: now,
            current: generateWeeklyMissions()
        };
    }

    // Salva i dati aggiornati
    global.db.data.users[who] = user;

    // Gestione comandi
    if (!args[0]) {
        return showMainMenu(m, conn, usedPrefix, nomeDelBot, image, who);
    }

    switch (args[0].toLowerCase()) {
        case 'daily':
        case 'giornaliere':
            return showDailyMissions(m, conn, user, nomeDelBot, image, usedPrefix, who);
        case 'weekly':
        case 'settimanali':
            return showWeeklyMissions(m, conn, user, nomeDelBot, image, usedPrefix, who);
        case 'claim':
        case 'riscuoti':
            return claimRewards(m, conn, user, nomeDelBot, image, usedPrefix, who);
        default:
            return showMainMenu(m, conn, usedPrefix, nomeDelBot, image, who);
    }
};

/* ========== FUNZIONI DI VISUALIZZAZIONE ========== */
async function showMainMenu(m, conn, usedPrefix, nomeDelBot, image, who) {
    const user = global.db.data.users[who];
    const dailyCompleted = user.missions.daily.current.filter(m => m.completed).length;
    const weeklyCompleted = user.missions.weekly.current.filter(m => m.completed).length;

    const buttons = [
        { buttonId: `${usedPrefix}missioni daily`, buttonText: { displayText: '📅 GIORNALIERE' }, type: 1 },
        { buttonId: `${usedPrefix}missioni weekly`, buttonText: { displayText: '📆 SETTIMANALI' }, type: 1 },
        { buttonId: `${usedPrefix}missioni claim`, buttonText: { displayText: '💰 RISCUOTI' }, type: 1 }
    ];

    return conn.sendMessage(m.chat, {
        text: `🎯 *SISTEMA MISSIONI ${nomeDelBot.toUpperCase()}*\n\n` +
              `👤 Utente: @${who.split('@')[0]}\n` +
              `💰 Saldo: ${user.money} UC\n` +
              `🏦 Banca: ${user.bank} UC\n` +
              `📅 Daily: ${dailyCompleted}/${user.missions.daily.current.length} completate\n` +
              `📆 Weekly: ${weeklyCompleted}/${user.missions.weekly.current.length} completate\n\n` +
              `Seleziona il tipo di missioni:`,
        footer: 'Completa le missioni per guadagnare UnityCoins!',
        buttons: buttons,
        mentions: [who],
        headerType: 1,
        jpegThumbnail: image
    }, { quoted: m });
}

async function showDailyMissions(m, conn, user, nomeDelBot, image, usedPrefix, who) {
    let text = `📅 *MISSIONI GIORNALIERE* @${who.split('@')[0]}\n\n`;
    const resetTime = 86400000 - (Date.now() - user.missions.daily.lastReset);
    text += `⏳ Reset tra: ${formatTime(resetTime)}\n\n`;

    user.missions.daily.current.forEach((mission, i) => {
        const progress = getProgress(user, mission.type);
        const isReady = progress >= mission.target && !mission.completed;
        text += `▢ *${i+1}. ${mission.title}*\n`;
        text += `➠ Progresso: ${progress}/${mission.target}\n`;
        text += `➠ Ricompensa: ${mission.reward} UC\n`;
        text += `➠ Stato: ${mission.completed ? '✅ RISCOSSA' : isReady ? '💰 PRONTA' : '❌ IN CORSO'}\n\n`;
    });

    const buttons = [
        { buttonId: `${usedPrefix}missioni claim`, buttonText: { displayText: '💰 RISCUOTI' }, type: 1 },
        { buttonId: `${usedPrefix}missioni weekly`, buttonText: { displayText: '📆 SETTIMANALI' }, type: 1 },
        { buttonId: `${usedPrefix}missioni`, buttonText: { displayText: '🔙 INDIETRO' }, type: 1 }
    ];

    return conn.sendMessage(m.chat, {
        text: text,
        footer: `Usa "${usedPrefix}missioni claim" per riscuotere le ricompense!`,
        buttons: buttons,
        mentions: [who],
        headerType: 1,
        jpegThumbnail: image
    }, { quoted: m });
}

async function showWeeklyMissions(m, conn, user, nomeDelBot, image, usedPrefix, who) {
    let text = `📆 *MISSIONI SETTIMANALI* @${who.split('@')[0]}\n\n`;
    const resetTime = 604800000 - (Date.now() - user.missions.weekly.lastReset);
    text += `⏳ Reset tra: ${formatTime(resetTime)}\n\n`;

    user.missions.weekly.current.forEach((mission, i) => {
        const progress = getProgress(user, mission.type);
        const isReady = progress >= mission.target && !mission.completed;
        text += `▢ *${i+1}. ${mission.title}*\n`;
        text += `➠ Progresso: ${progress}/${mission.target}\n`;
        text += `➠ Ricompensa: ${mission.reward} UC\n`;
        text += `➠ Stato: ${mission.completed ? '✅ RISCOSSA' : isReady ? '💰 PRONTA' : '❌ IN CORSO'}\n\n`;
    });

    const buttons = [
        { buttonId: `${usedPrefix}missioni claim`, buttonText: { displayText: '💰 RISCUOTI' }, type: 1 },
        { buttonId: `${usedPrefix}missioni daily`, buttonText: { displayText: '📅 GIORNALIERE' }, type: 1 },
        { buttonId: `${usedPrefix}missioni`, buttonText: { displayText: '🔙 INDIETRO' }, type: 1 }
    ];

    return conn.sendMessage(m.chat, {
        text: text,
        footer: `Missioni settimanali - Ricompense maggiori!`,
        buttons: buttons,
        mentions: [who],
        headerType: 1,
        jpegThumbnail: image
    }, { quoted: m });
}

/* ========== FUNZIONI DI GESTIONE ========== */
function generateDailyMissions() {
    return [
        { 
            title: "Invia 50 messaggi", 
            type: "messaggi", 
            target: 50, 
            reward: 500,
            completed: false
        },
        { 
            title: "Esegui 10 comandi", 
            type: "command", 
            target: 10, 
            reward: 300,
            completed: false
        },
        { 
            title: "Rimani senza warn", 
            type: "no_warn", 
            target: 1, 
            reward: 700,
            completed: false
        }
    ];
}

function generateWeeklyMissions() {
    return [
        { 
            title: "Invia 300 messaggi", 
            type: "messaggi", 
            target: 300, 
            reward: 2500,
            completed: false
        },
        { 
            title: "Esegui 50 comandi", 
            type: "command", 
            target: 50, 
            reward: 1500,
            completed: false
        },
        { 
            title: "Rimani 7 giorni senza warn", 
            type: "no_warn_week", 
            target: 1, 
            reward: 3500,
            completed: false
        },
        { 
            title: "Raggiungi 1000 messaggi totali", 
            type: "total_messaggi", 
            target: 1000, 
            reward: 5000,
            completed: false
        }
    ];
}

function getProgress(user, type) {
    switch(type) {
        case 'messaggi':
            return user.messaggi || 0;
        case 'command':
            return user.command || 0;
        case 'no_warn':
            return user.warn > 0 ? 0 : 1;
        case 'no_warn_week':
            const weekAgo = Date.now() - 604800000;
            return (user.warn > 0 || (user.lastWarn && user.lastWarn > weekAgo)) ? 0 : 1;
        case 'total_messaggi':
            return user.totalMessaggi || user.messaggi || 0;
        default:
            return 0;
    }
}

async function claimRewards(m, conn, user, nomeDelBot, image, usedPrefix, who) {
    let total = 0;
    let claimed = 0;
    let details = [];

    // Controlla missioni giornaliere
    for (const mission of user.missions.daily.current) {
        const progress = getProgress(user, mission.type);
        if (progress >= mission.target && !mission.completed) {
            total += mission.reward;
            claimed++;
            mission.completed = true;
            user.missions.daily.completed++;
            details.push(`✅ ${mission.title}: +${mission.reward} UC`);
        }
    }

    // Controlla missioni settimanali
    for (const mission of user.missions.weekly.current) {
        const progress = getProgress(user, mission.type);
        if (progress >= mission.target && !mission.completed) {
            total += mission.reward;
            claimed++;
            mission.completed = true;
            user.missions.weekly.completed++;
            details.push(`✅ ${mission.title}: +${mission.reward} UC`);
        }
    }

    if (claimed === 0) {
        return conn.reply(m.chat, `@${who.split('@')[0]} non hai missioni completate da riscuotere!`, m, { mentions: [who] });
    }

    // Assegna le ricompense
    user.money = (user.money || 0) + total;
    global.db.data.users[who] = user; // Salva le modifiche

    const buttons = [
        { buttonId: `${usedPrefix}portafoglio`, buttonText: { displayText: '💰 PORTAFOGLIO' }, type: 1 },
        { buttonId: `${usedPrefix}missioni`, buttonText: { displayText: '🎯 MISSIONI' }, type: 1 }
    ];

    await conn.sendMessage(m.chat, {
        text: `🎉 @${who.split('@')[0]} hai riscosso *${total} UnityCoins*!\n\n` +
              `${details.join('\n')}\n\n` +
              `💰 Nuovo saldo: *${user.money} UC*\n` +
              `🏦 Banca: *${user.bank} UC*`,
        footer: 'Usa .portafoglio per vedere il saldo completo',
        buttons: buttons,
        mentions: [who],
        headerType: 1,
        jpegThumbnail: image
    }, { quoted: m });

    // Backup opzionale su file
    try {
        fs.writeFileSync('./db_users_backup.json', JSON.stringify(global.db.data.users, null, 2));
    } catch (e) {
        console.error('Errore backup:', e);
    }
}

/* ========== FUNZIONI DI UTILITY ========== */
function formatTime(ms) {
    if (ms <= 0) return '00:00:00';
    
    const seconds = Math.floor(ms / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

handler.help = ['missioni'];
handler.tags = ['rpg'];
handler.command = ['missioni', 'missions', 'daily', 'weekly'];
handler.register = true;

export default handler;