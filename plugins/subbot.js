import {
  useMultiFileAuthState,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion
} from '@realvare/baileys';
import QRCode from 'qrcode';
import NodeCache from 'node-cache';
import fs from 'fs';
import pino from 'pino';
import { makeWASocket } from '../lib/simple.js';

if (!Array.isArray(global.conns)) {
  global.conns = [];
}

const MSG_QR = `🤖 *𝟑𝟑𝟑 𝐁𝐎𝐓 - 𝐒𝐔𝐁𝐁𝐎𝐓 𝐒𝐘𝐒𝐓𝐄𝐌*\n\nScansiona questo codice QR con un altro dispositivo per attivare il tuo SubBot personalizzato.\n\n1. Apri WhatsApp sul telefono secondario\n2. Vai su Impostazioni > Dispositivi connessi\n3. Inquadra questo codice`;
const MSG_CODE = `🤖 *𝟑𝟑𝟑 𝐁𝐎𝐓 - 𝐏𝐀𝐈𝐑𝐈𝐍𝐆 𝐂𝐎𝐃𝐄*\n\nUsa il codice di accoppiamento che riceverai a breve per collegare il tuo SubBot.`;

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let parentConn = conn;
  let targetNumber = m.sender.split('@')[0];

  if (command === 'delsession' || command === 'delsb') {
    let activeSock = global.conns.find(s => s.user && s.user.id.split(':')[0].split('@')[0] === targetNumber);
    
    if (activeSock) {
      try { activeSock.logout().catch(() => null); } catch (e) {}
      try { activeSock.end().catch(() => null); } catch (e) {}
      let idx = global.conns.indexOf(activeSock);
      if (idx > -1) global.conns.splice(idx, 1);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const pathSession = './jadibts/' + targetNumber;
    if (fs.existsSync(pathSession)) {
      try {
        fs.rmSync(pathSession, { recursive: true, force: true });
        return m.reply('✅ Sessione ed i dati del tuo SubBot sono stati eliminati definitivamente dal server.');
      } catch (e) {
        return m.reply('❌ Errore durante la rimozione dei file. Riprova tra qualche istante.');
      }
    } else {
      return m.reply('ⓘ Non hai nessuna sessione attiva o salvata sul server.');
    }
  }

  if (command === 'listsubbot' || command === 'listsb') {
    if (!global.conns || global.conns.length === 0) {
      return m.reply('ⓘ Al momento non ci sono SubBot attivi nel sistema.');
    }
    let text = `🤖 *𝟑𝟑𝟑 𝐁𝐎𝐓 - 𝐒𝐔𝐁𝐁𝐎𝐓 𝐒𝐘𝐒𝐓𝐄𝐌*\n\nLista dei terminali attualmente connessi:\n\n`;
    let mentions = [];
    global.conns.forEach((sock, i) => {
      if (sock.user) {
        let num = sock.user.id.split(':')[0].split('@')[0];
        let jid = num + '@s.whatsapp.net';
        text += `${i + 1}. @${num}\n`;
        mentions.push(jid);
      }
    });
    return parentConn.sendMessage(m.chat, { text: text, mentions: mentions }, { quoted: m });
  }

  if (!args[0]) {
    const buttons = [
      { buttonId: `${usedPrefix + command} code`, buttonText: { displayText: '🔑 Codice di Accoppiamento' }, type: 1 },
      { buttonId: `${usedPrefix + command} qr`, buttonText: { displayText: '📷 Codice QR' }, type: 1 }
    ];

    await parentConn.sendMessage(m.chat, {
      text: `🤖 *𝟑𝟑𝟑 𝐁𝐎𝐓 - 𝐌𝐄𝐍𝐔 𝐒𝐔𝐁𝐁𝐎𝐓*\n\nSeleziona una delle opzioni sottostanti per scegliere come configurare ed avviare il tuo SubBot:`,
      buttons: buttons,
      headerType: 1
    }, { quoted: m }).catch(() => null);
    return;
  }

  const useCode = /(--code|code)/i.test(args[0].trim());
  const useQR = /(--qr|qr)/i.test(args[0].trim());

  if (!useCode && !useQR) return;

  if (useCode) {
    if (!args[1]) {
      return m.reply(`🤖 *𝟑𝟑𝟑 𝐁𝐎𝐓 - 𝐏𝐀𝐈𝐑𝐈𝐍𝐆*\n\nPer generare il codice, devi specificare il numero di telefono comprensivo di prefisso internazionale (senza spazi e senza il segno +).\n\n*Esempio d'uso:* \n\`${usedPrefix + command} code 393XXXXXXXXX\``);
    }
    targetNumber = args[1].replace(/[^0-9]/g, '');
    if (targetNumber.length < 10) {
      return m.reply('❌ Il numero inserito non è valido. Assicurati di includere il prefisso internazionale corretto (es. 39 per l\'Italia).');
    }
  }

  if (global.conns.some(s => s.user && s.user.id.split(':')[0].split('@')[0] === targetNumber)) {
    return m.reply('ⓘ Questo numero ha già una sessione SubBot attiva ed in esecuzione.');
  }

  const pathSession = './jadibts/' + targetNumber;

  if (!fs.existsSync(pathSession)) {
    fs.mkdirSync(pathSession, { recursive: true });
  }

  let qrSent = false;
  let codeSent = false;

  async function startSubBot() {
    const { version } = await fetchLatestBaileysVersion();
    const msgRetryCounterCache = new NodeCache();
    const { state, saveCreds } = await useMultiFileAuthState(pathSession);

    const socketConfig = {
      printQRInTerminal: false,
      logger: pino({ level: 'silent' }),
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
      },
      msgRetryCache: msgRetryCounterCache,
      version: version || [2, 3000, 1015901827],
      syncFullHistory: false,
      browser: useCode ? ['Ubuntu', 'Chrome', '20.0.0'] : ['333 Bot', 'Chrome', '2.0.0'],
      getMessage: async (key) => {
        if (global.store) {
          const msg = global.store.loadMessage(key.remoteJid, key.id);
          return msg?.message || undefined;
        }
        return { conversation: '333 Bot Active' };
      }
    };

    let sock = makeWASocket(socketConfig);
    sock.isInit = false;

    async function onConnectionUpdate(update) {
      const { connection, lastDisconnect, qr } = update;

      if (qr && useQR && !qrSent) {
        qrSent = true;
        await parentConn.sendMessage(
          m.chat,
          { image: await QRCode.toBuffer(qr, { scale: 8 }), caption: MSG_QR },
          { quoted: m }
        ).catch(() => { qrSent = false; });
      }

      if (qr && useCode && !codeSent) {
        codeSent = true;
        await parentConn.sendMessage(m.chat, { text: MSG_CODE }, { quoted: m }).catch(() => null);
        await new Promise((resolve) => setTimeout(resolve, 4000));
        try {
          let code = await sock.requestPairingCode(targetNumber);
          await m.reply(code.match(/.{1,4}/g)?.join('-') || code);
        } catch (e) {
          codeSent = false;
          await m.reply('ⓘ Errore durante la generazione del codice. Riprova.');
        }
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
        
        let idx = global.conns.indexOf(sock);
        if (idx > -1) global.conns.splice(idx, 1);

        if (!sock.isInit || statusCode === DisconnectReason.loggedOut || statusCode === 405) {
          try { fs.rmSync(pathSession, { recursive: true, force: true }); } catch (e) {}
          return parentConn.sendMessage(m.chat, { text: 'ⓘ Sessione terminata o codice scaduto. Richiedi un nuovo menu se desideri riprovare.' }, { quoted: m }).catch(() => null);
        } else {
          setTimeout(() => startSubBot(), 5000);
        }
      }

      if (connection === 'open') {
        sock.isInit = true;
        global.conns.push(sock);
        
        await parentConn.sendMessage(
          m.chat,
          { text: `✅ *𝟑𝟑𝟑 𝐁𝐎𝐓* collegato correttamente!\n\nTutti i plugin del bot principale sono ora attivi sul numero @${targetNumber}.` },
          { quoted: m }
        ).catch(() => null);
      }
    }

    sock.ev.on('connection.update', onConnectionUpdate);
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (chatUpdate) => {
      if (!chatUpdate || !chatUpdate.messages) return;
      let msg = chatUpdate.messages[0];
      if (!msg || (msg.key && msg.key.remoteJid === 'status@broadcast')) return;

      let mParsed = msg;
      try {
        const simpleMod = await import('../lib/simple.js').catch(() => null);
        if (simpleMod && typeof simpleMod.smsg === 'function') {
          mParsed = simpleMod.smsg(sock, msg, global.store);
        } else if (typeof sock.serializeM === 'function') {
          mParsed = sock.serializeM(msg);
        }
      } catch (e) {}

      try {
        let runHandler = global.handler;
        if (!runHandler) {
          let handlerModule = await import('../handler.js?update=' + Date.now()).catch(() => null);
          runHandler = handlerModule?.handler || handlerModule?.default;
        }
        if (typeof runHandler === 'function') {
          await runHandler.call(sock, mParsed, chatUpdate);
        }
      } catch (err) {
        console.error(err);
      }
    });
  }

  startSubBot();
};

handler.command = ['serbot', 'jadibot', 'delsession', 'delsb', 'listsubbot', 'listsb'];
handler.tags = ['jadibot'];
handler.help = ['serbot', 'jadibot', 'delsession', 'listsubbot'];
handler.private = true;

export default handler;