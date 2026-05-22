import { createCanvas, loadImage } from 'canvas';

let handler = async (m, { conn, usedPrefix, command }) => {
    if (!m.isGroup) return;
    
    let who = m.quoted?.sender || (Array.isArray(m.mentionedJid) ? m.mentionedJid[0] : m.mentionedJid) || null;
    if (!who) return m.reply(`Rispondi al messaggio di qualcuno o taggalo per fargli uno screenshot falso!\nEsempio: \`${usedPrefix + command}\` (in risposta a un messaggio).`);

    await m.react('📸');

    const name = conn.getName(who) || 'Utente';
    let pfp = await conn.profilePictureUrl(who, 'image').catch(() => 'https://ibb.co');

    const frasi = [
        "Faccio i tiktok credendomi vip (sono una fallita).",
        "Faccio i tiktok credendomi vip (sono un fallito).",
        "Voglio diventare suora",
        "Voglio diventare prete",
        "Passo 20 ore davanti al telefono invece che uscire di casa'.",
        "Mi tocco sulle foto di gerry scotti",
        "Mi fidanzo su whatsapp perchè dal vivo mi vergogno.",
        "Ho voglia di calippo 😏",
        "Quando scopo non mi si alza",
        "Vengo sempre in un minuto...anche meno",
        "Mi piacciono le bimbe",
        "Mi puzzano i piedi",
        "Ieri ho fatto un bocchino ad un cane",
        "Ho il culo sporco di merda",
        "Mi puzza l'alito e non me ne vergogno",
        "Ieri ho sognato di scrivermi con un gay.",
        "Esco le tette in chat a chi mi scrive.",
        "Esco il culo in chat a chi mi scrive.",
        "In discoteca mi limono ogni persona che vedo.",
        "Cerco milf sessantenne in privato.",
        "Cerco donne pelose in privato.",
        "Cerco uomini pelosi in privato.",
        "Tutte le persone di sto gruppo mi stanno sul cazzo'.",
        "La mamma di gab è la mia migliore amica.",
        "Ogni giorno alle 3 di notte lo prendo forte.",
        "Faccio sogni erotici sui pensionati.",
        "Ieri ho preso schiaffi fuori da scuola",
        "Mi masturbo più di 20 volte al giorno",
        "Raga segreto: non sono etero",
        "Ammetto che non mi faccio i peli",
        "Sono ancora vergine raga",
        "Oggi mi sento una troia",
        "Le Ragazze di nome Sara, Alessia, Sofia e Giulia sono le più troie."
    ];
    const testoCasuale = frasi[Math.floor(Math.random() * frasi.length)];

    const canvas = createCanvas(600, 400);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0b141a';
    ctx.fillRect(0, 0, 600, 400);

    ctx.fillStyle = '#1f2c34';
    ctx.fillRect(0, 0, 600, 70);

    try {
        const avatar = await loadImage(pfp);
        const size = Math.min(avatar.width, avatar.height);
        const sx = Math.max(0, (avatar.width - size) / 2);
        const sy = Math.max(0, (avatar.height - size) / 2);
        ctx.save();
        ctx.beginPath();
        ctx.arc(45, 35, 20, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, sx, sy, size, size, 25, 15, 40, 40);
        ctx.restore();
    } catch (e) {
        ctx.fillStyle = '#6349d8ff';
        ctx.beginPath();
        ctx.arc(45, 35, 20, 0, Math.PI * 2, true);
        ctx.fill();
    }

    ctx.fillStyle = '#e9edef';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(name, 80, 42);

    ctx.fillStyle = '#202c33';
    ctx.beginPath();
    ctx.roundRect(30, 110, 540, 85, 12);
    ctx.fill();

    ctx.fillStyle = '#8696a0';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(name, 48, 135);

    ctx.fillStyle = '#e9edef';
    ctx.font = '16px sans-serif';
    ctx.fillText(testoCasuale, 48, 165);

    const buffer = canvas.toBuffer('image/png');

    await conn.sendMessage(m.chat, { 
        image: buffer, 
        caption: `📸 *BECCATO IN CHAT*\n\n_Le telecamere di sicurezza hanno immortalato @${(who||'').split('@')[0]} mentre scriveva questo:_`,
        mentions: [who]
    }, { quoted: m });
};

handler.help = ['screenshot'];
handler.tags = ['fun'];
handler.group = true;
handler.command = ['screenshot', 'beccato'];

export default handler;