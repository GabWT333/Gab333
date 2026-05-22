//Plugin by Gab, Lucifero & 333 staff





import { Buffer } from 'buffer';

const DURATE = {
  '24h': 86400,
  '7g': 604800,
  '30g': 2592000,
};

const handler = async (m, { conn, args, command }) => {
  const isUnpin = ['unpin', 'defissa'].includes(command.toLowerCase());
  const isUnpinAll = ['unpinall', 'defissatutti'].includes(command.toLowerCase());
  const isFinalPin = command === 'pinfinal';
  const isPin = !isUnpin && !isFinalPin && !isUnpinAll;

  /*
  if (isUnpinAll) {
    try {
      await conn.sendMessage(m.chat, { pin: { type: 3 } });
      return m.reply('𝐓𝐮𝐭𝐭𝐢 𝐢 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐬𝐨𝐧𝐨 𝐬𝐭𝐚𝐭𝐢 𝐝𝐞𝐟𝐢𝐬𝐬𝐚𝐭𝐢');
    } catch (e) {
      console.error('Errore durante lo sblocco di tutti i messaggi:', e);
      return m.reply(`${global.errore}`);
    }
  }
  */

  if (isUnpin) {
    if (!m.quoted) return m.reply('𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚𝐥 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐝𝐚 𝐝𝐞𝐟𝐢𝐬𝐬𝐚𝐫𝐞');

    let key = null;

    if (m.quoted.key) {
      key = m.quoted.key;
    } else if (m.quoted.id) {
      key = {
        id: m.quoted.id,
        fromMe: m.quoted.fromMe || false,
        remoteJid: m.chat
      };
    }

    if (!key) {
      return m.reply(`${global.errore}`);
    }

    try {
      await conn.sendMessage(m.chat, { pin: { type: 2, key } });
      return m.reply('✅ 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐝𝐞𝐟𝐢𝐬𝐬𝐚𝐭𝐨 𝐜𝐨𝐧 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐨');
    } catch (e) {
      console.error('Errore durante lo sblocco:', e);
      return m.reply(`${global.errore}`);
    }
  }

  if (isFinalPin) {
    const [secondsRaw, base64Key] = args;
    const seconds = parseInt(secondsRaw);
    let key;

    try {
      if (isNaN(seconds)) throw new Error('Durata non valida.');
      if (!base64Key) throw new Error('Chiave del messaggio mancante (Base64).');
      const keyString = Buffer.from(base64Key, 'base64').toString('utf8');
      key = JSON.parse(keyString);
    } catch (e) {
      console.error('Errore nella decodifica della chiave o durata non valida:', e);
      return m.reply(`${global.errore}`);
    }

    try {
      await conn.sendMessage(m.chat, { pin: { type: 1, time: seconds, key } });
      const label = Object.entries(DURATE).find(([, s]) => s === seconds)?.[0] || `${seconds}s`;
      return m.reply(`📌 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐟𝐢𝐬𝐬𝐚𝐭𝐨 𝐩𝐞𝐫 ${label}.`);
    } catch (e) {
      console.error('Errore durante il pin finale:', e);
      return m.reply(`${global.errore}`);
    }
  }

  if (isPin) {
    const text = args.join(' ');
    if (m.quoted && !text) {
      let quotedKey = null;

      if (m.quoted.key) {
        quotedKey = m.quoted.key;
      } else if (m.quoted.id && m.quoted.sender) {
        quotedKey = {
          id: m.quoted.id,
          fromMe: m.quoted.fromMe || false,
          remoteJid: m.chat,
          participant: m.quoted.sender
        };
      } else if (m.quoted.id) {
        quotedKey = {
          id: m.quoted.id,
          fromMe: m.quoted.fromMe || false,
          remoteJid: m.chat
        };
      }

      if (!quotedKey) {
        return m.reply(`${global.errore}`);
      }

      return await inviaBottoniDurata(conn, m.chat, quotedKey);
    }
    else if (text) {
      try {
        const sent = await conn.sendMessage(m.chat, { text }, { quoted: m });
        if (!sent || !sent.key) throw new Error('Impossibile ottenere la chiave del messaggio inviato.');
        return await inviaBottoniDurata(conn, m.chat, sent.key);
      } catch (e) {
        console.error('Errore durante l\'invio del messaggio:', e);
        return m.reply(`${global.errore}`);
      }
    } else {
      return m.reply('𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚𝐝 𝐮𝐧 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐨 𝐬𝐜𝐫𝐢𝐯𝐢𝐥𝐨 𝐩𝐞𝐫 𝐟𝐢𝐬𝐬𝐚𝐫𝐥𝐨');
    }
  }
};

async function inviaBottoniDurata(conn, chat, key) {
  if (!key) {
    console.error('Errore: Chiave del messaggio non valida in inviaBottoniDurata.');
    return;
  }

  const keyString = JSON.stringify(key);
  const base64Key = Buffer.from(keyString).toString('base64');

  const buttons = Object.entries(DURATE).map(([label, seconds]) => ({
    buttonId: `.pinfinal ${seconds} ${base64Key}`,
    buttonText: { displayText: `⏱️ ${label}` },
    type: 1,
  }));

  try {
    await conn.sendMessage(chat, {
      text: '⏱️𝐏𝐞𝐫 𝐪𝐮𝐚𝐧𝐭𝐨 𝐭𝐞𝐦𝐩𝐨 𝐯𝐮𝐨𝐢 𝐟𝐢𝐬𝐬𝐚𝐫𝐞 𝐢𝐥 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨?',
      buttons,
      footer: '',
      headerType: 1,
    });
  } catch (e) {
    console.error('Errore durante l\'invio dei bottoni:', e);
  }
}

handler.command = ['pin', 'pinna', 'fissa', 'fissamsg', 'unpin', 'defissa', 'unpinall', 'defissatutti', 'pinfinal'];
handler.tags = ['gruppo'];
handler.help = ['fissa', 'unpin/unpinall'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;