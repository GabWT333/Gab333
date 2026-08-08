//Plugin by Gab, Lucifero & 333 staff







import yts from 'yt-search';
import fs from 'fs';
import path from 'path';
import { generateWAMessageFromContent } from '@realvare/baileys';

const EMOJIS = {
  ERROR: '⚠️',
  SUCCESS: '✅',
  LOADING: '⌛',
  MUSIC: '🎵',
  VIDEO: '🎬',
  INFO: 'ℹ️',
  PLAYLIST: '📋',
  SAVE: '💾',
  DELETE: '🗑️'
};

const BOT_SIGNATURE = '333⇝𝐁Ꮻ𝐓';

const DB_FOLDER = './database';
const PLAYLIST_FILE = path.join(DB_FOLDER, 'Musica.json');

const initDatabase = () => {
  if (!fs.existsSync(DB_FOLDER)) {
    fs.mkdirSync(DB_FOLDER, { recursive: true });
  }
  if (!fs.existsSync(PLAYLIST_FILE)) {
    fs.writeFileSync(PLAYLIST_FILE, JSON.stringify({}, null, 2));
  }
};

const readDatabase = () => {
  try {
    const data = fs.readFileSync(PLAYLIST_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Errore nella lettura del database:', error);
    return {};
  }
};

const writeDatabase = (data) => {
  try {
    fs.writeFileSync(PLAYLIST_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Errore nella scrittura del database:', error);
    return false;
  }
};

const saveSong = async (userId, songTitle) => {
  try {
    const search = await yts(songTitle);
    if (!search.all.length) {
      return { success: false, message: `${EMOJIS.ERROR} Nessun risultato trovato per "${songTitle}".` };
    }

    const song = search.all[0];
    const { title, url, timestamp, author } = song;

    const db = readDatabase();

    if (!db[userId]) {
      db[userId] = [];
    }

    const songExists = db[userId].some(item => item.url === url);
    if (songExists) {
      return { success: false, message: `${EMOJIS.ERROR} Questa canzone è già nella tua playlist!` };
    }

    db[userId].push({
      title,
      url,
      timestamp,
      channel: author.name,
      addedAt: new Date().toISOString()
    });

    if (writeDatabase(db)) {
      return { 
        success: true, 
        message: `${EMOJIS.SUCCESS} *Salvata con successo! (digita .playlist per vedere la tua playlist)*\n\n` +
                 `${EMOJIS.MUSIC} *${title}*\n` +
                 `⏳ Durata: ${timestamp}\n` +
                 `📺 Canale: ${author.name}` 
                  };
    } else {
      return { success: false, message: `${EMOJIS.ERROR} Errore nel salvataggio. Riprova più tardi.` };
    }
  } catch (error) {
    console.error('Errore nel salvataggio della canzone:', error);
    return { success: false, message: `${EMOJIS.ERROR} Errore: ${error.message}` };
  }
};

const getPlaylist = (userId, userName = null) => {
  try {
    const db = readDatabase();

    if (!db[userId] || db[userId].length === 0) {
      return { 
        success: false, 
        message: userName 
          ? `${EMOJIS.INFO} La playlist di ${userName} è vuota!` 
          : `${EMOJIS.INFO} La tua playlist è vuota!` 
      };
    }

    let message = userName 
      ? `${EMOJIS.PLAYLIST} *Playlist di ${userName}*\n\n`
      : `${EMOJIS.PLAYLIST} *La tua playlist*\n\n`;

    db[userId].forEach((song, index) => {
      message += `*${index + 1}.* ${song.title}\n`;
      message += `⏳ ${song.timestamp} | 📺 ${song.channel}\n\n`;
    });

    message += `\nPer riprodurre una canzone, usa il comando .play seguito dal titolo.`;

    return { success: true, message, songs: db[userId] };
  } catch (error) {
    console.error('Errore nel recupero della playlist:', error);
    return { success: false, message: `${EMOJIS.ERROR} Errore: ${error.message}` };
  }
};

const deleteSong = (userId, index) => {
  try {
    const db = readDatabase();

    if (!db[userId] || db[userId].length === 0) {
      return { success: false, message: `${EMOJIS.INFO} La tua playlist è vuota!` };
    }

    if (index < 0 || index >= db[userId].length) {
      return { success: false, message: `${EMOJIS.ERROR} Indice non valido!` };
    }

    const deletedSong = db[userId][index].title;
    db[userId].splice(index, 1);

    if (writeDatabase(db)) {
      return { success: true, message: `${EMOJIS.DELETE} Rimossa "${deletedSong}" dalla playlist.` };
    } else {
      return { success: false, message: `${EMOJIS.ERROR} Errore nella rimozione. Riprova più tardi.` };
    }
  } catch (error) {
    console.error('Errore nella rimozione della canzone:', error);
    return { success: false, message: `${EMOJIS.ERROR} Errore: ${error.message}` };
  }
};

const handler = async (m, { conn, text, args, command }) => {
  try {
    initDatabase();

    
    const isReply = m.quoted ? true : false;
    const userId = isReply && command === 'playlist' ? m.quoted.sender : m.sender || m.chat;
    let userName = null;
    
   
    if (isReply && command === 'playlist') {
      try {
        l
        userName = m.quoted.pushName || m.quoted.name || 'utente';
      } catch (e) {
        console.error('Errore nel recupero del nome utente:', e);
        userName = 'utente';
      }
    }

    if (command === 'salva') {
      if (!text.trim()) {
        return m.reply(`${EMOJIS.ERROR} Inserisci il titolo della canzone da salvare.`);
      }

      const loadingMsg = await conn.sendMessage(String(m.chat), {
        text: `${BOT_SIGNATURE}\n\n${EMOJIS.LOADING} Sto cercando e salvando "${text}"...`
      }, { quoted: m });

      const result = await saveSong(userId, text);

      await conn.sendMessage(String(m.chat), {
        delete: loadingMsg.key
      }).catch(() => {});

      return m.reply(result.message);
    }

    if (command === 'playlist') {
      const result = getPlaylist(userId, isReply ? userName : null);

      if (!result.success) {
        return m.reply(result.message);
      }

      const buttons = result.songs.slice(0, 6).map((song, index) => {
        return [`${index + 1}. ${song.title.substring(0, 18)}`, `.play ${song.title}`];
      });

      if (!isReply) {
        buttons.push([`${EMOJIS.DELETE} Elimina`, `.elimina`]);
      }

      const prep = generateWAMessageFromContent(String(m.chat), {
        viewOnceMessage: {
          message: {
            interactiveMessage: {
              body: { text: result.message },
              footer: { text: '333 BOT - Playlist' },
              header: {
                hasMediaAttachment: false
              },
              nativeFlowMessage: {
                buttons: buttons.map(([title, id]) => ({
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ 
                    display_text: title, 
                    id: id 
                  })
                })),
                messageParamsJson: ''
              }
            }
          }
        }
      }, { quoted: m });

      return await conn.relayMessage(String(m.chat), prep.message, { 
        messageId: prep.key.id 
      });
    }

    if (command === 'elimina') {
      
      if (isReply && m.quoted.sender !== m.sender) {
        return m.reply(`${EMOJIS.ERROR} Per eliminare una canzone digita .elimina seguito dal numero della canzone (esempio .elimina 1).`);
      }
      
      if (args.length && /^\d+$/.test(args[0])) {
        const index = parseInt(args[0]) - 1;
        const result = deleteSong(userId, index);
        return m.reply(result.message);
      } else {
        const result = getPlaylist(userId);

        if (!result.success) {
          return m.reply(result.message);
        }

        let message = `${EMOJIS.DELETE} *Seleziona il numero della canzone da eliminare*\n\n`;

        result.songs.forEach((song, index) => {
          message += `*${index + 1}.* ${song.title}\n`;
        });

        message += `\nPer eliminare, usa il comando .elimina seguito dal numero.`;

        return m.reply(message);
      }
    }
  } catch (error) {
    return m.reply(`${EMOJIS.ERROR} Errore: ${error.message}`);
  }
};

handler.command = ['salva', 'playlist', 'elimina'];
handler.tags = ['fun'];
handler.help = ['𝐬𝐚𝐥𝐯𝐚 <𝐭𝐢𝐭𝐨𝐥𝐨 𝐜𝐚𝐧𝐳𝐨𝐧𝐞>', '𝐩𝐥𝐚𝐲𝐥𝐢𝐬𝐭', '𝐞𝐥𝐢𝐦𝐢𝐧𝐚 <𝐧𝐮𝐦𝐞𝐫𝐨>'];

export default handler;