import os from 'os';
import { execSync } from 'child_process';

const formatBytes = (bytes, decimali = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimali < 0 ? 0 : decimali;
    const misure = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + misure[i];
};

const getSpazioDisco = () => {
    try {
        const stdout = execSync('df -h | grep -E "^/dev/root|^/dev/sda1"').toString();
        const [ , dimensione, usato, disponibile, percentuale ] = stdout.split(/\s+/);
        return { dimensione, usato, disponibile, percentuale };
    } catch (error) {
        console.error('✧ Errore nel recupero spazio disco:', error);
        return null;
    }
};

const handler = async (m, { conn }) => {
    const memoriaTotale = os.totalmem();
    const memoriaLibera = os.freemem();
    const memoriaUsata = memoriaTotale - memoriaLibera;
    const _tempoAttivo = process.uptime() * 1000;
    const tempoAttivo = formatoOrario(_tempoAttivo);
    const nomeHost = os.hostname();
    const piattaforma = os.platform();
    const architettura = os.arch();
    const usoNode = process.memoryUsage();
    const spazioDisco = getSpazioDisco();

    const messaggio = `✅️ *STATO DEL SISTEMA*

🚩 *Host ⪼* ${nomeHost}
🏆 *Piattaforma ⪼* ${piattaforma}
💫 *Architettura ⪼* ${architettura}
🥷 *RAM Totale ⪼* ${formatBytes(memoriaTotale)}
🚀 *RAM Libera ⪼* ${formatBytes(memoriaLibera)}
⌛️ *RAM Usata ⪼* ${formatBytes(memoriaUsata)}
🕒 *Tempo di Attività ⪼* ${tempoAttivo}

🪴 *Utilizzo Memoria Node.js:* 
→ RSS: ${formatBytes(usoNode.rss)}
→ Heap Totale: ${formatBytes(usoNode.heapTotal)}
→ Heap Usato: ${formatBytes(usoNode.heapUsed)}
→ Memoria Esterna: ${formatBytes(usoNode.external)}
→ Array Buffer: ${formatBytes(usoNode.arrayBuffers)}
${spazioDisco ? `

☁️ *Spazio su Disco:*
→ Dimensione Totale: ${spazioDisco.dimensione}
→ Usato: ${spazioDisco.usato}
→ Disponibile: ${spazioDisco.disponibile}
→ Percentuale Utilizzo: ${spazioDisco.percentuale}` : 'Errore nel rilevamento.'}
`;

    const rcanal = {}; // Definisci o inizializza 'rcanal' appropriatamente
    await conn.reply(m.chat, messaggio.trim(), m, rcanal);
};

handler.help = ['sistema'];
handler.tags = ['info'];
handler.command = ['system', 'sistema'];
handler.register = true;

export default handler;

function formatoOrario(ms) {
    let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000);
    let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
    let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':');
}