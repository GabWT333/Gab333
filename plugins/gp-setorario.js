// Usa setTimeout/setInterval invece di node-schedule per la compatibilità senza dipendenze esterne

import fs from 'fs';
import path from 'path';

// Percorso del file di persistenza
const SCHEDULE_FILE = path.join(process.cwd(), 'group_schedule.json');

// Carica gli orari salvati o inizializza un oggetto vuoto
let groupSchedule = {};
try {
    if (fs.existsSync(SCHEDULE_FILE)) {
        groupSchedule = JSON.parse(fs.readFileSync(SCHEDULE_FILE, 'utf8'));
    }
} catch (error) {
    console.error('Errore nel caricamento degli orari:', error);
}

// Salva gli orari su file
function saveSchedule() {
    try {
        fs.writeFileSync(SCHEDULE_FILE, JSON.stringify(groupSchedule, null, 2));
    } catch (error) {
        console.error('Errore nel salvataggio degli orari:', error);
    }
}

function parseTimeToMs(timeStr) {
    // timeStr formato "HH:MM"
    const [h, m] = timeStr.split(':').map(Number);
    const now = new Date();
    let target = new Date(now);
    target.setHours(h, m, 0, 0);
    if (target < now) target.setDate(target.getDate() + 1); // se già passato, domani
    return target - now;
}

function scheduleGroupEvents(conn, groupId, openTimeStr, closeTimeStr) {
    // Cancella eventuali timer esistenti
    if (groupSchedule[groupId]?.openTimeout) clearTimeout(groupSchedule[groupId].openTimeout);
    if (groupSchedule[groupId]?.closeTimeout) clearTimeout(groupSchedule[groupId].closeTimeout);

    // Pianifica apertura
    function planOpen() {
        if (!groupSchedule[groupId]?.active) return;
        updateGroupSetting(
            conn,
            groupId,
            'not_announcement',
            '✅ Il gruppo è ora aperto. Tutti possono scrivere.'
        );
        groupSchedule[groupId].openTimeout = setTimeout(planOpen, 24 * 60 * 60 * 1000);
    }
    // Pianifica chiusura
    function planClose() {
        if (!groupSchedule[groupId]?.active) return;
        updateGroupSetting(
            conn,
            groupId,
            'announcement',
            '🔒 Il gruppo è ora chiuso. Solo gli amministratori possono scrivere.'
        );
        groupSchedule[groupId].closeTimeout = setTimeout(planClose, 24 * 60 * 60 * 1000);
    }

    // Avvia i timer
    groupSchedule[groupId].openTimeout = setTimeout(planOpen, parseTimeToMs(openTimeStr));
    groupSchedule[groupId].closeTimeout = setTimeout(planClose, parseTimeToMs(closeTimeStr));
}

async function updateGroupSetting(conn, groupId, setting, message) {
    try {
        // setting: 'not_announcement' (aperta) o 'announcement' (chiusa)
        // WhatsApp richiede che il bot sia admin per cambiare le impostazioni
        await conn.groupSettingUpdate(groupId, setting);
        await conn.sendMessage(groupId, { text: message });
    } catch (error) {
        // Se errore di permessi, avvisa il gruppo
        if (error?.output?.statusCode === 403 || (error?.message && error.message.includes('not admin'))) {
            await conn.sendMessage(groupId, { text: '❌ Non posso cambiare le impostazioni: non sono admin!' });
        } else {
            console.error(`[${new Date().toISOString()}] Errore nell'aggiornamento del gruppo ${groupId}:`, error);
        }
    }
}

// Ripristina tutti i job all'avvio
export function initSchedule(conn) {
    for (const [groupId, settings] of Object.entries(groupSchedule)) {
        if (settings.active) {
            scheduleGroupEvents(conn, groupId, settings.openTime, settings.closeTime);
        }
    }
}

const handler = async (msg, { conn, args, isAdmin }) => {
    const groupId = msg.key.remoteJid;
    const isGroup = groupId.endsWith('@g.us');
    if (!isGroup) {
        return conn.sendMessage(groupId, { text: '❌ Questo comando può essere usato solo nei gruppi.' });
    }
    if (!isAdmin) {
        return conn.sendMessage(groupId, { text: '❌ Solo gli amministratori possono usare questo comando.' });
    }
    const command = args[0]?.toLowerCase();

    if (!command) {
        return conn.sendMessage(groupId, {
            text: '❓ Comandi disponibili:\n\n' +
                '• *#setorario set <orario apertura> <orario chiusura>* - Imposta gli orari\n' +
                '• *#setorario disable* - Disattiva gli orari automatici\n' +
                '• *#setorario status* - Mostra gli orari attuali\n\n' +
                'Esempio: *#setorario set 08:00 22:00*'
        });
    }

    switch (command) {
        case 'set':
            if (args.length < 3) {
                return conn.sendMessage(groupId, {
                    text: '❌ Usa il comando correttamente:\n\n*#setorario set <orario_apertura> <orario_chiusura>*\nEsempio: *#setorario set 08:00 22:00*'
                });
            }
            const [openTime, closeTime] = args.slice(1);
            if (!/^\d{2}:\d{2}$/.test(openTime) || !/^\d{2}:\d{2}$/.test(closeTime)) {
                return conn.sendMessage(groupId, {
                    text: '❌ Gli orari devono essere nel formato HH:MM (esempio: 08:00).'
                });
            }
            groupSchedule[groupId] = { openTime, closeTime, active: true };
            scheduleGroupEvents(conn, groupId, openTime, closeTime);
            saveSchedule();
            return conn.sendMessage(groupId, {
                text: `✅ Orari impostati con successo:\n- Apertura: ${openTime}\n- Chiusura: ${closeTime}\n\nIl gruppo si aprirà e chiuderà automaticamente ogni giorno.`
            });

        case 'disattiva':
            if (!groupSchedule[groupId]) {
                return conn.sendMessage(groupId, {
                    text: '❌ Non ci sono orari configurati per questo gruppo.'
                });
            }
            groupSchedule[groupId].active = false;
            if (groupSchedule[groupId].openTimeout) clearTimeout(groupSchedule[groupId].openTimeout);
            if (groupSchedule[groupId].closeTimeout) clearTimeout(groupSchedule[groupId].closeTimeout);
            saveSchedule();
            return conn.sendMessage(groupId, {
                text: '✅ Gli orari automatici sono stati disattivati per questo gruppo.'
            });

        case 'status':
            const scheduleInfo = groupSchedule[groupId];
            if (!scheduleInfo) {
                return conn.sendMessage(groupId, {
                    text: '❌ Non ci sono orari configurati per questo gruppo.'
                });
            }
            return conn.sendMessage(groupId, {
                text:
                    `📅 Orari configurati per questo gruppo:\n` +
                    `- Apertura: ${scheduleInfo.openTime}\n` +
                    `- Chiusura: ${scheduleInfo.closeTime}\n` +
                    `- Stato: ${scheduleInfo.active ? '✅ Attivo' : '❌ Disattivato'}\n\n` +
                    `Per modificare: *#setorario set <orario_apertura> <orario_chiusura>*`
            });

        default:
            return conn.sendMessage(groupId, {
                text: '❓ Comando non riconosciuto. Usa uno dei seguenti:\n\n' +
                    '• *#setorario set <orario_apertura> <orario_chiusura>* - Imposta gli orari\n' +
                    '• *#setorario disable* - Disattiva gli orari automatici\n' +
                    '• *#setorario status* - Mostra gli orari attuali\n\n' +
                    'Esempio: *#setorario set 08:00 22:00*'
            });
    }
};

handler.command = ['setorario', '#setorario'];
handler.tags = ['group'];
handler.help = [
    'setorario set <orario_apertura> <orario_chiusura> - Imposta orari apertura/chiusura automatica',
    'setorario disable - Disattiva gli orari automatici',
    'setorario status - Mostra gli orari attuali'
];
handler.group = true;
handler.admin = true;

export default handler;