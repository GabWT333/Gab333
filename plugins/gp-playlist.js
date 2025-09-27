import yts from 'yt-search';
import fs from 'fs';
import path from 'path';

// ==================== 🎨 DESIGN & EMOJIS ====================
const BOT_THEME = {
  FRAME: {
    TOP: '╭〔*🎵 PLAYLIST MANAGER*〕┈⊷',
    MIDDLE: '┃◈╭─────────·๏',
    LINE: '┃◈┃•',
    BOTTOM: '┃◈└───────┈⊷\n╰━━━━━━━━━┈·๏',
    SIGNATURE: '꙰ 𝗖𝗿𝗲𝗮𝘇𝗶𝗼𝗻𝗲 𝗚𝗮𝗯𝟯𝟯𝟯 ꙰'
  },
  EMOJIS: {
    ERROR: '⚠️',
    SUCCESS: '✅',
    LOADING: '⌛',
    MUSIC: '🎵',
    VIDEO: '🎬',
    INFO: 'ℹ️',
    PLAYLIST: '📋',
    SAVE: '💾',
    DELETE: '🗑️',
    HEART: '❤️',
    BACK: '🔙'
  }
};

// ==================== 🎵 MUSIC MANAGER ====================
class MusicPlayer {
  static async search(query) {
    const result = await yts(query);
    return result.all.length ? result.all[0] : null;
  }

  static formatSong(song) {
    return `${BOT_THEME.EMOJIS.MUSIC} *${song.title}*\n` +
           `⏳ ${song.timestamp || 'N/A'} | 📺 ${song.author?.name || 'Sconosciuto'}`;
  }
}

// ==================== 📁 DATABASE ====================
const DB = {
  PATH: path.join('./database', 'Musica.json'),

  init() {
    if (!fs.existsSync('./database')) fs.mkdirSync('./database', { recursive: true });
    if (!fs.existsSync(this.PATH)) fs.writeFileSync(this.PATH, '{}');
  },

  read() {
    try {
      return JSON.parse(fs.readFileSync(this.PATH));
    } catch {
      return {};
    }
  },

  write(data) {
    fs.writeFileSync(this.PATH, JSON.stringify(data, null, 2));
  },

  update(userId, updater) {
    const data = this.read();
    // Assicurati che l'array esista
    if (!Array.isArray(data[userId])) data[userId] = [];
    updater(data[userId]);
    this.write(data);
  }
};

// ==================== 🎛️ HANDLER PRINCIPALE ====================
const handler = async (m, { conn, text, args, command, usedPrefix }) => {
  DB.init();
  const userId = m.sender;
  // Forza sempre la playlist personale quando il comando arriva da bottone
  const isButton = !!m?.key?.id && !text;
  const targetUser = isButton ? userId : (m.quoted?.sender && m.quoted.sender !== userId ? m.quoted.sender : userId);
  const userName = (m.quoted?.sender && m.quoted.sender !== userId) ? (m.quoted.pushName || 'Utente') : null;

  // Gestione comando playlist anche se text è vuoto (bottone)
  if (command === 'playlist' && (!text || text.trim() === '')) {
    const songs = DB.read()[targetUser] || [];

    if (!songs.length) {
      return m.reply(`${BOT_THEME.EMOJIS.INFO} ${userName ? `${userName} non ha brani salvati` : 'La tua playlist è vuota!'}`);
    }

    let message = `${BOT_THEME.FRAME.TOP}\n` +
                 `${BOT_THEME.FRAME.MIDDLE}\n` +
                 `${BOT_THEME.FRAME.LINE} ${BOT_THEME.EMOJIS.PLAYLIST} ${userName ? `Playlist di ${userName}` : 'La tua playlist'}\n`;

    songs.slice(0, 10).forEach((song, index) => {
      message += `${BOT_THEME.FRAME.LINE} ${index + 1}. ${song.title}\n` +
                `${BOT_THEME.FRAME.LINE} ⏳ ${song.timestamp} | 📺 ${song.channel}\n`;
    });

    if (songs.length > 10) {
      message += `${BOT_THEME.FRAME.LINE} ...e altri ${songs.length - 10} brani\n`;
    }

    message += `${BOT_THEME.FRAME.BOTTOM}\n\n` +
               `${BOT_THEME.EMOJIS.HEART} ${BOT_THEME.FRAME.SIGNATURE}`;

    const buttons = [
      ...songs.slice(0, 5).map((song, i) => (
        { buttonId: `${usedPrefix}play ${song.title}`, buttonText: { displayText: `${i + 1}🎵 ${song.title.slice(0, 20)}` }, type: 1 }
      )),
      { buttonId: `${usedPrefix}salva`, buttonText: { displayText: `${BOT_THEME.EMOJIS.SAVE} Salva nuovo` }, type: 1 }
    ];

    if (!userName) {
      buttons.push(
        { buttonId: `${usedPrefix}elimina`, buttonText: { displayText: `${BOT_THEME.EMOJIS.DELETE} Elimina` }, type: 1 }
      );
    }
    buttons.push(
      { buttonId: `${usedPrefix}menu`, buttonText: { displayText: `${BOT_THEME.EMOJIS.BACK} Indietro` }, type: 1 }
    );

    return conn.sendMessage(m.chat, {
      text: message,
      buttons: buttons,
      footer: 'Seleziona un brano da riprodurre',
      viewOnce: true,
      headerType: 4
    }, { quoted: m });
  }

  try {
    // 🎵 SALVA CANZONE
    if (command === 'salva') {
      if (!text) return m.reply(`${BOT_THEME.EMOJIS.ERROR} Specifica un brano da cercare`);

      const loadingMsg = await m.reply(`${BOT_THEME.FRAME.TOP}\n` +
        `${BOT_THEME.FRAME.MIDDLE}\n` +
        `${BOT_THEME.FRAME.LINE} ${BOT_THEME.EMOJIS.LOADING} Cerco "${text}"...\n` +
        `${BOT_THEME.FRAME.BOTTOM}`);

      const song = await MusicPlayer.search(text);
      if (!song) {
        await conn.sendMessage(m.chat, { delete: loadingMsg.key });
        return m.reply(`${BOT_THEME.EMOJIS.ERROR} Nessun risultato trovato`);
      }

      let exists = false;
      DB.update(userId, songs => {
        exists = songs.some(s => s.url === song.url);
        if (!exists) songs.push({
          title: song.title,
          url: song.url,
          timestamp: song.timestamp,
          channel: song.author?.name,
          addedAt: new Date().toISOString()
        });
      });

      await conn.sendMessage(m.chat, { delete: loadingMsg.key });

      if (exists) {
        return m.reply(`${BOT_THEME.EMOJIS.ERROR} Canzone già in playlist! Usa .playlist per vedere i brani salvati.`);
      }

      return conn.sendMessage(m.chat, {
        text: `${BOT_THEME.FRAME.TOP}\n` +
              `${BOT_THEME.FRAME.MIDDLE}\n` +
              `${BOT_THEME.FRAME.LINE} ${BOT_THEME.EMOJIS.SUCCESS} *Canzone salvata!*\n` +
              `${BOT_THEME.FRAME.LINE} ${MusicPlayer.formatSong(song)}\n` +
              `${BOT_THEME.FRAME.BOTTOM}\n\n` +
              `${BOT_THEME.EMOJIS.HEART} ${BOT_THEME.FRAME.SIGNATURE}`,
        buttons: [
          { buttonId: `${usedPrefix}playlist`, buttonText: { displayText: `${BOT_THEME.EMOJIS.PLAYLIST} Vedi Playlist` }, type: 1 },
          { buttonId: `${usedPrefix}play ${song.title}`, buttonText: { displayText: `${BOT_THEME.EMOJIS.MUSIC} Riproduci` }, type: 1 },
          { buttonId: `${usedPrefix}elimina`, buttonText: { displayText: `${BOT_THEME.EMOJIS.DELETE} Elimina` }, type: 1 }
        ],
        viewOnce: true,
        headerType: 4
      }, { quoted: m });
    }

    // 📋 VISUALIZZA PLAYLIST
    if (command === 'playlist') {
      const songs = DB.read()[targetUser] || [];

      if (!songs.length) {
        return m.reply(`${BOT_THEME.EMOJIS.INFO} ${userName ? `${userName} non ha brani salvati` : 'La tua playlist è vuota!'}`);
      }

      let message = `${BOT_THEME.FRAME.TOP}\n` +
                   `${BOT_THEME.FRAME.MIDDLE}\n` +
                   `${BOT_THEME.FRAME.LINE} ${BOT_THEME.EMOJIS.PLAYLIST} ${userName ? `Playlist di ${userName}` : 'La tua playlist'}\n`;

      songs.slice(0, 10).forEach((song, index) => {
        message += `${BOT_THEME.FRAME.LINE} ${index + 1}. ${song.title}\n` +
                  `${BOT_THEME.FRAME.LINE} ⏳ ${song.timestamp} | 📺 ${song.channel}\n`;
      });

      if (songs.length > 10) {
        message += `${BOT_THEME.FRAME.LINE} ...e altri ${songs.length - 10} brani\n`;
      }

      message += `${BOT_THEME.FRAME.BOTTOM}\n\n` +
                 `${BOT_THEME.EMOJIS.HEART} ${BOT_THEME.FRAME.SIGNATURE}`;

      const buttons = songs.slice(0, 5).map((song, i) => (
        { buttonId: `${usedPrefix}play ${song.title}`, buttonText: { displayText: `${i + 1}🎵 ${song.title.slice(0, 20)}` }, type: 1 }
      ));

      if (!userName) {
        buttons.push(
          { buttonId: `${usedPrefix}elimina`, buttonText: { displayText: `${BOT_THEME.EMOJIS.DELETE} Elimina` }, type: 1 }
        );
      }

      return conn.sendMessage(m.chat, {
        text: message,
        buttons: [
          ...buttons,
          { buttonId: `${usedPrefix}menu`, buttonText: { displayText: `${BOT_THEME.EMOJIS.BACK} Indietro` }, type: 1 },
          { buttonId: `${usedPrefix}salva`, buttonText: { displayText: `${BOT_THEME.EMOJIS.SAVE} Salva nuovo` }, type: 1 }
        ],
        viewOnce: true,
        headerType: 4
      }, { quoted: m });
    }

    // 🗑️ ELIMINA CANZONE
    if (command === 'elimina') {
      const index = parseInt(args[0]) - 1;
      const songs = DB.read()[userId] || [];

      if (isNaN(index)) {
        let message = `${BOT_THEME.FRAME.TOP}\n` +
                      `${BOT_THEME.FRAME.MIDDLE}\n` +
                      `${BOT_THEME.FRAME.LINE} ${BOT_THEME.EMOJIS.DELETE} *Seleziona brano da eliminare*\n`;

        songs.slice(0, 10).forEach((song, i) => {
          message += `${BOT_THEME.FRAME.LINE} ${i + 1}. ${song.title}\n`;
        });

        message += `${BOT_THEME.FRAME.BOTTOM}\n\n` +
                   `Usa: .elimina <numero>\n` +
                   `${BOT_THEME.EMOJIS.HEART} ${BOT_THEME.FRAME.SIGNATURE}`;

        const buttons = songs.slice(0, 5).map((_, i) => (
          { buttonId: `${usedPrefix}elimina ${i + 1}`, buttonText: { displayText: `${i + 1}🗑️ Elimina` }, type: 1 }
        ));

        buttons.push(
          { buttonId: `${usedPrefix}playlist`, buttonText: { displayText: `${BOT_THEME.EMOJIS.BACK} Indietro` }, type: 1 }
        );

        return conn.sendMessage(m.chat, { 
          text: message,
          buttons: buttons,
          viewOnce: true,
          headerType: 4
        }, { quoted: m });
      }

      if (index < 0 || index >= songs.length) {
        return m.reply(`${BOT_THEME.EMOJIS.ERROR} Numero non valido!`);
      }

      const [deletedSong] = songs.splice(index, 1);
      DB.update(userId, s => s.splice(index, 1));

      return conn.sendMessage(m.chat, {
        text: `${BOT_THEME.FRAME.TOP}\n` +
              `${BOT_THEME.FRAME.MIDDLE}\n` +
              `${BOT_THEME.FRAME.LINE} ${BOT_THEME.EMOJIS.SUCCESS} *Brano eliminato!*\n` +
              `${BOT_THEME.FRAME.LINE} 🎵 ${deletedSong.title}\n` +
              `${BOT_THEME.FRAME.BOTTOM}\n\n` +
              `${BOT_THEME.EMOJIS.HEART} ${BOT_THEME.FRAME.SIGNATURE}`,
        buttons: [
          { buttonId: `${usedPrefix}playlist`, buttonText: { displayText: `${BOT_THEME.EMOJIS.PLAYLIST} Vedi Playlist` }, type: 1 },
          { buttonId: `${usedPrefix}salva ${deletedSong.title}`, buttonText: { displayText: `${BOT_THEME.EMOJIS.SAVE} Ripristina` }, type: 1 },
          { buttonId: `${usedPrefix}salva`, buttonText: { displayText: `${BOT_THEME.EMOJIS.SAVE} Salva nuovo` }, type: 1 }
        ],
        viewOnce: true,
        headerType: 4
      }, { quoted: m });
    }

  } catch (error) {
    console.error('Handler error:', error);
    return m.reply(`${BOT_THEME.EMOJIS.ERROR} Errore: ${error.message}`);
  }
};

handler.help = [
  'salva <titolo> - Aggiunge un brano alla playlist',
  'playlist - Mostra la tua playlist',
  'playlist (rispondi) - Mostra playlist altrui',
  'elimina <n> - Rimuove un brano'
];
handler.tags = ['music'];
handler.command = ['salva', 'playlist', 'elimina'];

export default handler;