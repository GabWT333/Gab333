//Plugin by Gab, Lucifero & 333 staff


const parole =

[
  "pizza","gelato","gabfrocio","biscotto","panino","hamburger","lasagna","pasta","risotto","mozzarella",
  "nutella","focaccia","tavolo","sedia","lampada","quaderno","penna","matita","libro",
  "telefono","computer","mouse","tastiera","monitor","zaino","occhiali","orologio","microfono",
  "televisione","cuscino","borsa","portafoglio","maglietta","giacca","scarpa","pantalone",
  "calzino","cappello","stivale","camicia","bicicletta","motore","treno","barca","aereo",
  "torino","milano","roma","napoli","genova","bologna","londra","parigi","berlino","madrid",
  "barcellona","tokyo","newyork","rap","trap","canto","canzone","chitarra","pianoforte",
  "batteria","album","playlist","calcio","basket","tennis","rugby","nuoto","pallavolo","ciclismo",
  "universo","galassia","pianeta","cometa","satellite","arcobaleno","montagna","oceano","deserto",
  "foresta","isola","castello","drago","ninja","pirata","robot","vampiro","fantasma","samurai"
];

global.gameScramble = global.gameScramble || {};
global.scramblePoints = global.scramblePoints || {}; 

const handler = async (m, { conn, usedPrefix, args }) => {
  const chatId = m.chat;
  const player = m.sender;

  if (!global.scramblePoints[chatId]) global.scramblePoints[chatId] = {};

  if (args.length === 0) {
    if (global.gameScramble[chatId]) {
      const oldGame = global.gameScramble[chatId];
      if (Date.now() < oldGame.endTime) throw "⚠️ 𝐔𝐧𝐚 𝐩𝐚𝐫𝐭𝐢𝐭𝐚 𝐞̀ 𝐠𝐢𝐚 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨!";
      else delete global.gameScramble[chatId];
    }

    const parola = parole[Math.floor(Math.random() * parole.length)];
    const scrambled = parola.split("").sort(() => 0.5 - Math.random()).join("");

    global.gameScramble[chatId] = {
      parola,
      scrambled,
      startTime: Date.now(),
      endTime: Date.now() + 120000, // 2 minuti
      tentativi: {}, // tentativi per giocatore
      blocked: [],
      playerSolved: false,
      starter: player
    };

    await conn.sendMessage(chatId, {
      text: `🎮 𝐒𝐂𝐑𝐀𝐌𝐁𝐋𝐄 𝐀𝐕𝐕𝐈𝐀𝐓𝐎!\n\n𝐏𝐚𝐫𝐨𝐥𝐚: *${scrambled}*\n\n𝐓𝐞𝐦𝐩𝐨: 𝟐 𝐦𝐢𝐧𝐮𝐭𝐢\n\n𝟓 𝐭𝐞𝐧𝐭𝐚𝐭𝐢𝐯𝐢 𝐚 𝐭𝐞𝐬𝐭𝐚.\n\n𝐒𝐜𝐫𝐢𝐯𝐢 .𝐬𝐜𝐫𝐚𝐦𝐛𝐥𝐞 <𝐩𝐚𝐫𝐨𝐥𝐚> 𝐩𝐞𝐫 𝐩𝐫𝐨𝐯𝐚𝐫𝐞!`
    });

    const interval = setInterval(async () => {
      const game = global.gameScramble[chatId];
      if (!game) return clearInterval(interval);
      const tempoRestante = Math.max(0, Math.floor((game.endTime - Date.now()) / 1000));
      if (tempoRestante <= 0 && !game.playerSolved) {
        const starter = game.starter;
        global.scramblePoints[chatId][starter] = (global.scramblePoints[chatId][starter] || 0) - 5;

        await conn.sendMessage(chatId, {
          text: `⏳ @${starter.split("@")[0]} 𝐓𝐞𝐦𝐩𝐨 𝐬𝐜𝐚𝐝𝐮𝐭𝐨! 𝐇𝐚𝐢 𝐩𝐞𝐫𝐬𝐨 𝟓 𝐩𝐮𝐧𝐭𝐢.\n𝐋𝐚 𝐩𝐚𝐫𝐨𝐥𝐚 𝐞𝐫𝐚: *${game.parola}* `,
          contextInfo: { mentionedJid: [starter] }
        });
        delete global.gameScramble[chatId];
        clearInterval(interval);
      }
    }, 1000);

    return;
  }

  const game = global.gameScramble[chatId];
  if (!game) return m.reply("❌ 𝐍𝐞𝐬𝐬𝐮𝐧𝐚 𝐩𝐚𝐫𝐭𝐢𝐭𝐚 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨, 𝐮𝐬𝐚 ’’.𝐬𝐜𝐫𝐚𝐦𝐛𝐥𝐞’’ 𝐩𝐞𝐫 𝐚𝐯𝐯𝐢𝐚𝐫𝐧𝐞 𝐮𝐧𝐚!");
  if (game.playerSolved) return;
  if (game.blocked.includes(player)) return; 

  const guess = args.join(" ").toLowerCase();
  game.tentativi[player] = game.tentativi[player] || 0;

  if (guess === game.parola.toLowerCase()) {
    game.playerSolved = true;
    global.scramblePoints[chatId][player] = (global.scramblePoints[chatId][player] || 0) + 10;

    await conn.sendMessage(chatId, {
      text: `🏆 @${player.split("@")[0]} 𝐇𝐚 𝐢𝐧𝐝𝐨𝐯𝐢𝐧𝐚𝐭𝐨!\n𝐋𝐚 𝐩𝐚𝐫𝐨𝐥𝐚 𝐞𝐫𝐚: *${game.parola}*\n𝐇𝐚𝐢 𝐠𝐮𝐚𝐝𝐚𝐠𝐧𝐚𝐭𝐨 𝟏𝟎 𝐩𝐮𝐧𝐭𝐢!\n> 𝐮𝐬𝐚 ’’.𝐭𝐨𝐩𝐬𝐜𝐫𝐚𝐦𝐛𝐥𝐞’’ 𝐩𝐞𝐫 𝐯𝐞𝐝𝐞𝐫𝐞 𝐥𝐚 𝐜𝐥𝐚𝐬𝐬𝐢𝐟𝐢𝐜𝐚.`,
      contextInfo: { mentionedJid: [player] }
    });

    delete global.gameScramble[chatId];
    return;
  }

  game.tentativi[player]++;
  const tentativiRimasti = 5 - game.tentativi[player];
  const tempoRestante = Math.max(0, Math.floor((game.endTime - Date.now()) / 1000));
  const minuti = Math.floor(tempoRestante / 60);
  const secondi = tempoRestante % 60;
  const tempoDisplay = `${minuti}:${secondi.toString().padStart(2,"0")}`;

  if (tentativiRimasti <= 0) {

    global.scramblePoints[chatId][player] = (global.scramblePoints[chatId][player] || 0) - 5;
    game.blocked.push(player);

    await conn.sendMessage(chatId, {
      text: `❌ @${player.split("@")[0]} 𝐓𝐞𝐧𝐭𝐚𝐭𝐢𝐯𝐢 𝐞𝐬𝐚𝐮𝐫𝐢𝐭𝐢, 𝐡𝐚𝐢 𝐩𝐞𝐫𝐬𝐨 𝟓 𝐩𝐮𝐧𝐭𝐢!\n𝐏𝐚𝐫𝐨𝐥𝐚: *${game.scrambled}*\n⏳ 𝐓𝐞𝐦𝐩𝐨 𝐫𝐢𝐦𝐚𝐧𝐞𝐧𝐭𝐞: *${tempoDisplay}* `,
      contextInfo: { mentionedJid: [player] }
    });
  } else if (tentativiRimasti === 1) {
    await conn.sendMessage(chatId, {
      text: `❌ @${player.split("@")[0]} 𝐏𝐚𝐫𝐨𝐥𝐚 𝐬𝐛𝐚𝐠𝐥𝐢𝐚𝐭𝐚! 𝐇𝐚𝐢 𝐚𝐧𝐜𝐨𝐫𝐚 𝐮𝐧 𝐮𝐥𝐭𝐢𝐦𝐨 𝐭𝐞𝐧𝐭𝐚𝐭𝐢𝐯𝐨.\n𝐏𝐚𝐫𝐨𝐥𝐚: *${game.scrambled}*\n⏳ 𝐓𝐞𝐦𝐩𝐨 𝐫𝐢𝐦𝐚𝐧𝐞𝐧𝐭𝐞: *${tempoDisplay}* `,
      contextInfo: { mentionedJid: [player] }
    });
  } else {
    await conn.sendMessage(chatId, {
      text: `❌ @${player.split("@")[0]} 𝐏𝐚𝐫𝐨𝐥𝐚 𝐬𝐛𝐚𝐠𝐥𝐢𝐚𝐭𝐚! 𝐇𝐚𝐢 𝐚𝐧𝐜𝐨𝐫𝐚 *${tentativiRimasti}* 𝐭𝐞𝐧𝐭𝐚𝐭𝐢𝐯𝐢.\n𝐏𝐚𝐫𝐨𝐥𝐚: ${game.scrambled}\n⏳ 𝐓𝐞𝐦𝐩𝐨 𝐫𝐢𝐦𝐚𝐧𝐞𝐧𝐭𝐞: ${tempoDisplay}`,
      contextInfo: { mentionedJid: [player] }
    });
  }
};

handler.command = /^scramble$/i;
handler.group = true;
export default handler;