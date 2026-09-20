//Plugin by Gab, Lucifero & 333 staff



import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function normalize(str) {
    if (!str) return '';
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '').trim();
}

function cleanTitle(title) {
    if (!title) return '';
    return title.split(/(?:\s+feat\.|\s+ft\.|\s+con|\s+with|\s+\(|\s+-)/i)[0].trim();
}

const artistiItaliani = ["thasup", "sfera ebbasta", "geolier", "lazza", "rondodasosa", "simba la rue", "baby gang", "capo plaza", "paky", "shiva", "massimo pericolo", "madman", "gemitaiz", "nerissima serpe", "artie 5ive", "ghali", "marracash", "guè", "ernia", "frah quintale", "coeZ", "sick luke", "drefgold", "chiello", "tedua", "mambolosco", "vale pain", "neima ezza", "medy", "kid yugi", "tony boy", "villabanks", "mikush", "quentin40", "niko pandetta", "lele blade", "mv killa", "yung snapp", "rose villain", "salmo", "noyz narcos", "bresh", "side baby", "gigi dalessio", "gigi d'alessio"];

const gigiAlbums = [
    'Quando',
    'Non mollare mai',
    'Annare',
    'Mi aiuti',
    'La prima stella',
    'Maledetta primavera',
    'Il cammino dell\'età',
    'Notte di blu',
    'Questo sono io',
    'L\'amore che vorrei',
    'Amore e furto',
    'Posteggia e amore'
];

async function getRandomAlbum(artist = null) {
    let searchTerm = artist || artistiItaliani[Math.floor(Math.random() * artistiItaliani.length)];
    const isGigi = artist && artist.toLowerCase().includes('gigi');
    let found = null;
    let attempts = 0;
    let difficolta = 'medio';
    let premio = 100;
    
    while (!found && attempts < 10) {
        try {
            if (isGigi) {
                searchTerm = `${gigiAlbums[Math.floor(Math.random() * gigiAlbums.length)]} gigi dalessio`;
            }
            const res = await axios.get('https://api.deezer.com/search/album', {
                params: { q: searchTerm, limit: 25 },
                timeout: 5000
            });
            
            if (!res.data?.data?.length) {
                attempts++;
                continue;
            }
            
            const valid = res.data.data.filter(album => 
                album.cover_medium && album.title && album.artist?.name &&
                !album.title.toLowerCase().includes('remix') &&
                !album.title.toLowerCase().includes('deluxe')
            );
            
            if (valid.length > 0) {
                found = valid[Math.floor(Math.random() * valid.length)];
                const len = found.title.length;
                if (len < 10) {
                    difficolta = 'facile';
                    premio = Math.floor(Math.random() * 200) + 50;
                } else if (len < 20) {
                    difficolta = 'medio';
                    premio = Math.floor(Math.random() * 400) + 150;
                } else {
                    difficolta = 'difficile';
                    premio = Math.floor(Math.random() * 1000) + 500;
                }
            }
        } catch (e) {
            attempts++;
        }
    }
    
    if (!found) {
        const fallbackRes = await axios.get('https://api.deezer.com/chart/0/albums', { params: { limit: 20 }, timeout: 5000 });
        found = fallbackRes.data?.data?.[Math.floor(Math.random() * fallbackRes.data.data.length)];
        if (!found) throw new Error('Nessun album trovato');
        
        const len = found.title.length;
        if (len < 10) {
            difficolta = 'facile';
            premio = Math.floor(Math.random() * 200) + 50;
        } else if (len < 20) {
            difficolta = 'medio';
            premio = Math.floor(Math.random() * 400) + 150;
        } else {
            difficolta = 'difficile';
            premio = Math.floor(Math.random() * 1000) + 500;
        }
    }
    
    return {
        title: found.title,
        cleanTitle: cleanTitle(found.title),
        artist: found.artist.name,
        cover: found.cover_medium,
        difficolta: difficolta,
        premio: premio
    };
}

const activeGames = new Map();

const handler = async (m, { conn, command, args, isAdmin }) => {
    const chat = m.chat;
    
    if (command === 'skipalbum') {
        if (!activeGames.has(chat)) return m.reply('❌ *Nessuna partita in corso!*');
        if (!isAdmin && !m.fromMe) return m.reply('❌ *Comando disponibile solo per admin!*');
        
        const game = activeGames.get(chat);
        clearTimeout(game.timeout);
        
        const skipText = `╭─────────╮\n│ ⏩ 𝐏𝐀𝐑𝐓𝐈𝐓𝐀 𝐒𝐊𝐈𝐏𝐏𝐀𝐓𝐀\n━━━━━━━━━━━━━━\n✎ 𝐀𝐥𝐛𝐮𝐦: ${game.album.title}\n✎ 𝐀𝐫𝐭𝐢𝐬𝐭𝐚: ${game.album.artist}\n━━━━━━━━━━━━━━\n> 𝟥𝟥𝟥 𝔹𝕆𝕋 \n╰─────────╯`;
        
        await conn.sendMessage(chat, { text: skipText }, { quoted: m });
        activeGames.delete(chat);
        return;
    }
    
    if (command === 'indovinaalbum' || command === 'ica') {
        if (activeGames.has(chat)) {
            return m.reply('⚠️ *C\'è già una partita in corso!*');
        }
        
        if (!args.length) {
            return conn.sendMessage(chat, {
                text: `╭─────────╮\n│ 🎮 𝐈𝐍𝐃𝐎𝐕𝐈𝐍𝐀 𝐋'𝐀𝐋𝐁𝐔𝐌\n━━━━━━━━━━━━━━\n✎ *Scegli una modalità:*\n━━━━━━━━━━━━━━\n> 𝟥𝟥𝟥 𝔹𝕆𝕋 \n╰─────────╯`,
                buttons: [
                    { buttonId: '.ica generale', buttonText: { displayText: '🎲 Generale' }, type: 1 },
                    { buttonId: '.ica specifico', buttonText: { displayText: '🎤 Artista specifico' }, type: 1 }
                ],
                headerType: 1
            }, { quoted: m });
        }
        
        const firstArg = args[0].toLowerCase();
        
        if (firstArg === 'specifico') {
            if (args.length === 1) {
                return conn.sendMessage(chat, {
                    text: `╭─────────╮\n│ 🎤 𝐀𝐑𝐓𝐈𝐒𝐓𝐀 𝐒𝐏𝐄𝐂𝐈𝐅𝐈𝐂𝐎\n━━━━━━━━━━━━━━\n✎ *Esempio:* .ica thasup\n✎ *Artisti disponibili:*\n➥ thasup, geolier, lazza, shiva, simba la rue, baby gang, paky, massimo pericolo, madman, gemitaiz, ghali, marracash, guè, ernia, frah quintale, coez, sick luke, tedua, bresh\n━━━━━━━━━━━━━━\n> 𝟥𝟥𝟥 𝔹𝕆𝕋 \n╰─────────╯`
                }, { quoted: m });
            }
            
            const artistName = args.slice(1).join(' ');
            await startGame(m, conn, chat, artistName);
        } else if (firstArg === 'generale') {
            await startGame(m, conn, chat, null);
        } else {
            const artistName = args.join(' ');
            const artistExists = artistiItaliani.some(a => a.toLowerCase().includes(artistName.toLowerCase()) || artistName.toLowerCase().includes(a));
            if (artistExists) {
                await startGame(m, conn, chat, artistName);
            } else {
                await startGame(m, conn, chat, null);
            }
        }
    }
};

const startGame = async (m, conn, chat, artist = null) => {
    try {
        const album = await getRandomAlbum(artist);
        const currentArtist = artist;
        
        const imageRes = await axios.get(album.cover, { responseType: 'arraybuffer', timeout: 8000 });
        const imagePath = path.join(process.cwd(), 'tmp', `album_${Date.now()}.jpg`);
        if (!fs.existsSync(path.join(process.cwd(), 'tmp'))) fs.mkdirSync(path.join(process.cwd(), 'tmp'));
        fs.writeFileSync(imagePath, imageRes.data);
        
        const difficoltaEmoji = album.difficolta === 'facile' ? '🟢' : album.difficolta === 'medio' ? '🟡' : '🔴';
        
        const caption = `╭─────────╮\n│ 🖼️ 𝐈𝐍𝐃𝐎𝐕𝐈𝐍𝐀 𝐋'𝐀𝐋𝐁𝐔𝐌\n━━━━━━━━━━━━━━\n✎ 𝐀𝐫𝐭𝐢𝐬𝐭𝐚: ${album.artist}\n✎ 𝐃𝐢𝐟𝐟𝐢𝐜𝐨𝐥𝐭à: ${difficoltaEmoji} ${album.difficolta}\n✎ 𝐏𝐫𝐞𝐦𝐢𝐨: ${album.premio}€\n━━━━━━━━━━━━━━\n> 𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚𝐥 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨!\n> 𝟥𝟥𝟥 𝔹𝕆𝕋 \n╰─────────╯`;
        
        const fullMessage = await conn.sendMessage(chat, { 
            image: fs.readFileSync(imagePath), 
            caption: caption
        }, { quoted: m });
        
        fs.unlinkSync(imagePath);
        
        let answered = false;
        
        const timeout = setTimeout(async () => {
            if (!answered && activeGames.has(chat)) {
                activeGames.delete(chat);
                await conn.sendMessage(chat, { delete: fullMessage.key }).catch(() => {});
                
                let buttons = [{ buttonId: '.ica generale', buttonText: { displayText: '🔄 Nuova partita' }, type: 1 }];
                if (currentArtist) {
                    buttons.push({ buttonId: `.ica ${currentArtist}`, buttonText: { displayText: `🎤 Riprova con ${currentArtist}` }, type: 1 });
                }
                
                await conn.sendMessage(chat, { 
                    text: `╭─────────╮\n│ ⏰ 𝐓𝐄𝐌𝐏𝐎 𝐒𝐂𝐀𝐃𝐔𝐓𝐎\n━━━━━━━━━━━━━━\n✎ 𝐀𝐥𝐛𝐮𝐦: ${album.title}\n✎ 𝐀𝐫𝐭𝐢𝐬𝐭𝐚: ${album.artist}\n━━━━━━━━━━━━━━\n> 𝟥𝟥𝟥 𝔹𝕆𝕋 \n╰─────────╯`,
                    buttons: buttons,
                    headerType: 1
                }, { quoted: m });
            }
        }, 30000);
        
        activeGames.set(chat, { album, fullMessage, answered, timeout, currentArtist });
        
    } catch (error) {
        console.error('Errore:', error);
        conn.sendMessage(chat, { text: '❌ *Errore! Riprova.*' }, { quoted: m });
        activeGames.delete(chat);
    }
};

handler.before = async (m, { conn }) => {
    const chat = m.chat;
    const game = activeGames.get(chat);
    
    if (!game || game.answered) return;
    if (!m.quoted || m.quoted.id !== game.fullMessage.key.id) return;
    if (m.sender === conn.user.jid) return;
    
    const userAnswer = normalize(m.text || '');
    const correctOriginal = normalize(game.album.title);
    const correctClean = normalize(game.album.cleanTitle);
    
    let isCorrect = userAnswer === correctOriginal || userAnswer === correctClean;
    
    if (!isCorrect) {
        const wordsA = userAnswer.split(' ');
        const wordsB = correctOriginal.split(' ');
        const matches = wordsA.filter(wordA => wordsB.some(wordB => wordB.includes(wordA) || wordA.includes(wordB)));
        const similarity = matches.length / Math.max(wordsA.length, wordsB.length);
        isCorrect = similarity >= 0.7;
    }
    
    if (isCorrect) {
        game.answered = true;
        clearTimeout(game.timeout);
        activeGames.delete(chat);
        
        await conn.sendMessage(chat, { delete: game.fullMessage.key }).catch(() => {});
        
        const user = global.db.data.users[m.sender];
        if (user) {
            user.money = (user.money || 0) + game.album.premio;
            user.euro = (user.euro || 0) + game.album.premio;
        }
        
        let buttons = [{ buttonId: '.ica generale', buttonText: { displayText: '🎮 Nuova partita' }, type: 1 }];
        if (game.currentArtist) {
            buttons.push({ buttonId: `.ica ${game.currentArtist}`, buttonText: { displayText: `🎤 Gioca con ${game.currentArtist}` }, type: 1 });
        }
        
        await conn.sendMessage(chat, { 
            text: `╭─────────╮\n│ ✅ 𝐕𝐈𝐓𝐓𝐎𝐑𝐈𝐀!\n━━━━━━━━━━━━━━\n✎ @${m.sender.split('@')[0]} ha indovinato!\n✎ 𝐀𝐥𝐛𝐮𝐦: ${game.album.title}\n✎ 𝐀𝐫𝐭𝐢𝐬𝐭𝐚: ${game.album.artist}\n✎ 𝐕𝐢𝐧𝐜𝐢𝐭𝐚: ${game.album.premio}€\n━━━━━━━━━━━━━━\n> 𝟥𝟥𝟥 𝔹𝕆𝕋 \n╰─────────╯`,
            mentions: [m.sender],
            buttons: buttons,
            headerType: 1
        }, { quoted: m });
    }
};

handler.command = ['indovinaalbum', 'ica', 'skipalbum'];
handler.tags = ['game'];
handler.help = ['ica <artista>'];
handler.group = true;

export default handler;