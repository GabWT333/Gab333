//Plugin by Gab, Lucifero & 333 staff

import fetch from 'node-fetch';
import fs from 'fs';

let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  const userName = m.pushName || 'Utente';

  const imgBuffer = fs.readFileSync('icone/333.jpg');

  const fake = {
    key: {
      participants: '0@s.whatsapp.net',
      fromMe: false,
      id: '333Attiva'
    },
    message: {
      locationMessage: {
        name: '⚙️ 𝐒𝐢𝐬𝐭𝐞𝐦𝐚 𝐅𝐮𝐧𝐳𝐢𝐨𝐧𝐢',
        jpegThumbnail: imgBuffer.toString('base64'),
        vcard: 'BEGIN:VCARD\nVERSION:3.0\nN:;333;;;\nFN:333\nEND:VCARD'
      }
    },
    participant: '0@s.whatsapp.net'
  }

  let isEnable = /true|enable|attiva|(turn)?on|1/i.test(command);
  if (/disable|disattiva|off|0/i.test(command)) isEnable = false;

  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {};
  global.db.data.users[m.sender] = global.db.data.users[m.sender] || {};
  let chat = global.db.data.chats[m.chat];
  let user = global.db.data.users[m.sender];
  let bot = global.db.data.settings[conn.user.jid] || {};

  const catalogs = {
    security: ['antilink', 'modoadmin','antispam','antimedia','antitoxic','antiBot','antivoip','antioneview','antitrava','antibusiness','slowmode','antinuke'],
    protezione: ['antispam', 'antitoxic', 'antiBot', 'antivoip', 'antioneview', 'antitrava', 'antibusiness'],
    media: ['antimedia'],
    full: ['antilink', 'antispam', 'antitoxic', 'antiBot', 'antivoip', 'antioneview', 'antimedia', 'antilinktg', 'antilinkig', 'antilinktiktok', 'modoadmin', 'antitrava', 'antibusiness', 'slowmode']
  };

  const adminFeatures = [
    { key: 'welcome', name: 'Welcome', desc: 'Messaggio di benvenuto' },
    { key: 'antimedia', name: 'AntiMedia', desc: 'Blocca foto e video a più visual' },
    { key: 'goodbye', name: 'Addio', desc: 'Messaggio di addio' },
    { key: 'antispam', name: 'Antispam', desc: 'Antispam' },
    { key: 'antibusiness', name: 'AntiBusiness', desc: 'Rimuove account business non admin' },
    { key: 'antitrava', name: 'AntiTrava', desc: 'Blocca messaggi trava e crash' },
    { key: 'antitoxic', name: 'Antitossici', desc: 'Avverte e rimuove per parolacce/insulti' },
    { key: 'antiBot', name: 'Antibot', desc: 'Rimuove eventuali bot indesiderati' },
    { key: 'antioneview', name: 'Antiviewonce', desc: 'Antiviewonce' },
    { key: 'rileva', name: 'Rileva', desc: 'Rileva eventi gruppo' },
    { key: 'antinuke', name: 'AntiNuke', desc: 'Blocca cambi di admin non autorizzati' },
    
    { key: 'modoadmin', name: 'Soloadmin', desc: 'Solo gli admin possono usare i comandi' },
    { key: 'slowmode', name: 'Slowmode', desc: 'Limita i messaggi troppo ravvicinati' },
    { key: 'ai', name: 'IA', desc: 'Intelligenza artificiale' },
    { key: 'vocali', name: 'Siri', desc: 'Risponde con audio agli audio e msg ricevuti' },
    { key: 'antivoip', name: 'Antivoip', desc: 'Antivoip' },
    { key: 'antilinktg', name: 'AntiTelegram', desc: 'Blocca link Telegram con espulsione immediata' },
    { key: 'antilinkig', name: 'AntiInstagram', desc: 'Blocca link Instagram con warn' },
    { key: 'antilinktiktok', name: 'AntiTikTok', desc: 'Blocca link TikTok con warn' },
    { key: 'antilink', name: 'antilink', desc: 'antilink whatsapp' },
    { key: 'reaction', name: 'Reazioni', desc: 'Reazioni automatiche' },
    { key: 'bestemmiometro', name: 'Bestemmiometro', desc: 'Rileva e conta le bestemmie' },
    { key: 'taglia', name: 'Taglia', desc: 'Attiva le taglie casuali nei gruppi' },
    { key: 'parola', name: 'Parola', desc: 'Attiva il gioco casuale delle parole nei gruppi' }
  ];

  const ownerFeatures = [
    { key: 'antiprivato', name: 'Antiprivato', desc: 'Blocca chiunque scrive in pv al bot' },
    { key: 'antiban', name: 'Antiban', desc: 'Simula la scrittura e ritarda i comandi di 3 secondi' },
    { key: 'soloCreatore', name: 'Solocreatore', desc: 'Solo il creatore puo usare i comandi' },
    { key: 'jadibotmd', name: 'Subbots', desc: 'Subbots' },
    { key: 'read', name: 'Lettura', desc: 'Il bot legge automaticamente i messaggi' },
    { key: 'anticall', name: 'Antichiamate', desc: 'Rifiuta automaticamente le chiamate' }
  ];

  const featureExplanations = {
    welcome: ['Verranno inviati i messaggi di benvenuto ai nuovi membri.', 'Non verranno inviati messaggi di benvenuto ai nuovi membri.'],
    goodbye: ['Verranno inviati i messaggi di addio quando un membro lascia il gruppo.', 'Non verranno inviati messaggi di addio quando un membro lascia il gruppo.'],
    antiprivato: ['I messaggi privati al bot verranno bloccati.', 'I messaggi privati al bot non verranno più bloccati.'],
    antiban: ['I comandi verranno ritardati per ridurre il rischio di ban.', 'I comandi non verranno più ritardati per ridurre il rischio di ban.'],
    antilinkig: ['I link Instagram verranno rilevati e gestiti automaticamente.', 'I link Instagram non verranno più rilevati automaticamente.'],
    antilinktg: ['I link Telegram verranno eliminati e l’autore verrà espulso.', 'I link Telegram non verranno più eliminati e l’autore non verrà espulso automaticamente.'],
    antilinktiktok: ['I link TikTok verranno rilevati e gestiti automaticamente.', 'I link TikTok non verranno più rilevati automaticamente.'],
    read: ['Il bot leggerà automaticamente i messaggi ricevuti.', 'Il bot non leggerà più automaticamente i messaggi ricevuti.'],
    anticall: ['Le chiamate ricevute dal bot verranno rifiutate automaticamente.', 'Le chiamate ricevute dal bot non verranno più rifiutate automaticamente.'],
    soloCreatore: ['Solo il creatore del bot potrà usare i comandi.', 'Anche gli utenti autorizzati potranno usare i comandi del bot.'],
    modoadmin: ['Solo gli admin potranno usare i comandi nel gruppo.', 'Gli utenti non admin potranno usare i comandi consentiti nel gruppo.'],
    antimedia: ['Foto e video inviati a più visual verranno bloccati.', 'Foto e video inviati a più visual non verranno più bloccati.'],
    antiBot: ['I bot indesiderati verranno rimossi dal gruppo.', 'I bot indesiderati non verranno più rimossi automaticamente.'],
    antivoip: ['Gli utenti con numeri VoIP verranno bloccati.', 'Gli utenti con numeri VoIP non verranno più bloccati automaticamente.'],
    antitoxic: ['Parolacce e insulti verranno rilevati e gestiti automaticamente.', 'Parolacce e insulti non verranno più rilevati automaticamente.'],
    antioneview: ['I contenuti visualizzabili una sola volta verranno gestiti automaticamente.', 'I contenuti visualizzabili una sola volta non verranno più gestiti automaticamente.'],
    reaction: ['Il bot invierà reazioni automatiche ai messaggi.', 'Il bot non invierà più reazioni automatiche ai messaggi.'],
    bestemmiometro: ['Le bestemmie verranno rilevate e conteggiate.', 'Le bestemmie non verranno più rilevate né conteggiate.'],
    antispam: ['I messaggi inviati troppo rapidamente verranno gestiti come spam.', 'I messaggi inviati troppo rapidamente non verranno più gestiti come spam.'],
    antibusiness: ['Gli account business non admin verranno rimossi.', 'Gli account business non admin non verranno più rimossi automaticamente.'],
    antitrava: ['I messaggi trava e i messaggi potenzialmente dannosi verranno bloccati.', 'I messaggi trava e i messaggi potenzialmente dannosi non verranno più bloccati.'],
    antinuke: ['I cambiamenti rischiosi agli admin del gruppo verranno bloccati.', 'I cambiamenti agli admin del gruppo non verranno più bloccati automaticamente.'],
    slowmode: ['I messaggi troppo ravvicinati verranno limitati.', 'I messaggi troppo ravvicinati non verranno più limitati.'],
    taglia: ['Il bot potrà proporre taglie casuali nel gruppo.', 'Il bot non proporrà più taglie casuali nel gruppo.'],
    parola: ['Il bot potrà avviare il gioco casuale della parola nel gruppo.', 'Il bot non avvierà più il gioco casuale della parola nel gruppo.'],
    ai: ['Il bot potrà rispondere alle richieste tramite intelligenza artificiale.', 'Il bot non risponderà più alle richieste tramite intelligenza artificiale.'],
    vocali: ['Il bot potrà rispondere con audio ai messaggi ricevuti.', 'Il bot non risponderà più con audio ai messaggi ricevuti.'],
    jadibotmd: ['I subbot potranno essere avviati.', 'I subbot non potranno più essere avviati.'],
    rileva: ['Il bot rileverà automaticamente gli eventi del gruppo.', 'Il bot non rileverà più automaticamente gli eventi del gruppo.'],
    antiLink: ['I link dei gruppi WhatsApp verranno eliminati automaticamente.', 'I link dei gruppi WhatsApp non verranno più eliminati automaticamente.']
  };

  const toggleFeature = (type) => {
    let result = { type, status: '', success: false };
    const adminCheck = m.isGroup && !(isAdmin || isOwner || isROwner);
    const ownerOnly = !isOwner && !isROwner;

    const adminGuard = () => { result.status = '𝐂𝐨𝐦𝐚𝐧𝐝𝐨 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞 𝐬𝐨𝐥𝐨 𝐩𝐞𝐫 𝐚𝐝𝐦𝐢𝐧'; };
    const ownerGuard = () => { result.status = '𝐒𝐨𝐥𝐨 𝐩𝐞𝐫 𝐨𝐰𝐧𝐞𝐫!'; };
    const groupGuard = () => { result.status = '𝐂𝐨𝐦𝐚𝐧𝐝𝐨 𝐮𝐭𝐢𝐥𝐢𝐳𝐳𝐚𝐛𝐢𝐥𝐞 𝐬𝐨𝐥𝐨 𝐧𝐞𝐢 𝐠𝐫𝐮𝐩𝐩𝐢'; };

    const setChat = (key) => {
      if (chat[key] === isEnable) { result.status = isEnable ? '𝐞̀ 𝐠𝐢𝐚̀ 𝐚𝐭𝐭𝐢𝐯𝐨.' : '𝐞̀ 𝐠𝐢𝐚̀ 𝐝𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨.'; return; }
      chat[key] = isEnable;
      result.status = isEnable ? '𝐀𝐭𝐭𝐢𝐯𝐚𝐭𝐨' : '𝐃𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨';
      result.explanation = featureExplanations[key]?.[isEnable ? 0 : 1];
      result.success = true;
    };
    const setBot = (key) => {
      if (bot[key] === isEnable) { result.status = isEnable ? '𝐞̀ 𝐠𝐢𝐚̀ 𝐚𝐭𝐭𝐢𝐯𝐨.' : '𝐞̀ 𝐠𝐢𝐚̀ 𝐝𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨.'; return; }
      bot[key] = isEnable;
      result.status = isEnable ? '𝐀𝐭𝐭𝐢𝐯𝐚𝐭𝐨' : '𝐃𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨';
      result.explanation = featureExplanations[key]?.[isEnable ? 0 : 1];
      result.success = true;
    };

    switch (type) {
      case 'welcome': case 'benvenuto':
        if (!m.isGroup && !isOwner) { groupGuard(); break; }
        if (m.isGroup && !isAdmin && !isOwner && !isROwner) { adminGuard(); break; }
        setChat('welcome'); break;
      case 'goodbye': case 'addio':
        if (!m.isGroup && !isOwner) { groupGuard(); break; }
        if (m.isGroup && !isAdmin && !isOwner && !isROwner) { adminGuard(); break; }
        setChat('goodbye'); break;
      case 'antiprivato': case 'antipriv':
        if (ownerOnly) { ownerGuard(); break; }
        setBot('antiprivato'); break;
      case 'antiban':
        if (!m.isGroup) { groupGuard(); break; }
        if (ownerOnly) { ownerGuard(); break; }
        setChat('antiban'); break;
      case 'antilinkig':
        if (adminCheck) { adminGuard(); break; }
        setChat('antilinkig'); break;
      case 'antilinktg':
        if (adminCheck) { adminGuard(); break; }
        setChat('antilinktg'); break;
      case 'antilinktiktok':
        if (adminCheck) { adminGuard(); break; }
        setChat('antilinktiktok'); break;
      case 'read': case 'lettura':
        if (ownerOnly) { ownerGuard(); break; }
        setBot('read'); break;
      case 'anticall': case 'antichiamate':
        if (ownerOnly) { ownerGuard(); break; }
        setBot('anticall'); break;
      case 'solocreatore': case 'creatore':
        if (ownerOnly) { ownerGuard(); break; }
        setBot('soloCreatore'); break;
      case 'modoadmin': case 'soloadmin':
        if (adminCheck) { adminGuard(); break; }
        setChat('modoadmin'); break;
      case 'antimedia':
        if (!m.isGroup) { groupGuard(); break; }
        if (adminCheck) { adminGuard(); break; }
        setChat('antimedia'); break;
      case 'antibot':
        if (adminCheck) { adminGuard(); break; }
        setChat('antiBot'); break;
      case 'antivoip':
        if (adminCheck) { adminGuard(); break; }
        setChat('antivoip'); break;
      case 'antitoxic': case 'antitossici':
        if (adminCheck) { adminGuard(); break; }
        setChat('antitoxic'); break;
      case 'antioneview': case 'antiviewonce':
        if (adminCheck) { adminGuard(); break; }
        setChat('antioneview'); break;
      case 'reaction': case 'reazioni':
        if (adminCheck) { adminGuard(); break; }
        setChat('reaction'); break;
      case 'bestemmiometro': case 'bestemmie':
        if (adminCheck) { adminGuard(); break; }
        setChat('bestemmiometro'); break;
      case 'antispam':
        if (adminCheck) { adminGuard(); break; }
        setChat('antispam'); break;
      case 'antibusiness': case 'antibiz':
        if (!m.isGroup && !isOwner) { groupGuard(); break; }
        if (adminCheck) { adminGuard(); break; }
        setChat('antibusiness'); break;
      case 'antitrava':
        if (!m.isGroup && !isOwner) { groupGuard(); break; }
        if (adminCheck) { adminGuard(); break; }
        setChat('antitrava'); break;
      // antiporno and antigore removed
      case 'antinuke': case 'anti-nuke':
        if (!m.isGroup) { groupGuard(); break; }
        {
          const metadata = conn.chats?.[m.chat]?.metadata || global.groupCache?.get(m.chat) || null
          const groupOwnerJid = metadata?.owner ? (conn.decodeJid ? conn.decodeJid(metadata.owner) : metadata.owner) : null
          const isGroupOwner = groupOwnerJid ? groupOwnerJid === m.sender : false
          if (!(isGroupOwner || isOwner || isROwner)) { result.status = '𝐒𝐨𝐥𝐨 𝐢𝐥 𝐩𝐫𝐨𝐩𝐫𝐢𝐞𝐭𝐚𝐫𝐢𝐨 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 𝐨 𝐥\'𝐨𝐰𝐧𝐞𝐫 𝐝𝐞𝐥 𝐛𝐨𝐭 𝐩𝐮𝐨̀ 𝐚𝐭𝐭𝐢𝐯𝐚𝐫𝐞/𝐝𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐫𝐞 𝐚𝐧𝐭𝐢𝐧𝐮𝐤𝐞'; break; }
          setChat('antinuke')
        }
        break;
      case 'slowmode':
        if (adminCheck) { adminGuard(); break; }
        setChat('slowmode'); break;
      case 'taglia':
        if (!m.isGroup) { groupGuard(); break; }
        if (adminCheck) { adminGuard(); break; }
        setChat('taglia'); break;
      case 'parola':
        if (!m.isGroup) { groupGuard(); break; }
        if (adminCheck) { adminGuard(); break; }
        setChat('parola'); break;
      
      case 'ia': case 'ai':
        if (!m.isGroup && !isOwner) { groupGuard(); break; }
        if (m.isGroup && !isAdmin && !isOwner && !isROwner) { adminGuard(); break; }
        setChat('ai'); break;
      case 'vocali': case 'siri':
        if (!m.isGroup && !isOwner) { groupGuard(); break; }
        if (m.isGroup && !isAdmin && !isOwner && !isROwner) { adminGuard(); break; }
        setChat('vocali'); break;
      case 'subbots':
        if (ownerOnly) { ownerGuard(); break; }
        setBot('jadibotmd'); break;
      case 'detect': case 'rileva':
        if (!m.isGroup && !isOwner) { groupGuard(); break; }
        if (m.isGroup && !isAdmin && !isOwner && !isROwner) { adminGuard(); break; }
        setChat('rileva'); break;
      case 'antilink': case 'nolink':
        if (adminCheck) { adminGuard(); break; }
        setChat('antiLink'); break;
      default:
        result.status = '𝐂𝐨𝐦𝐚𝐧𝐝𝐨 𝐧𝐨𝐧 𝐫𝐢𝐜𝐨𝐧𝐨𝐬𝐜𝐢𝐮𝐭𝐨, 𝐩𝐞𝐫 𝐯𝐞𝐝𝐞𝐫𝐞 𝐥𝐚 𝐥𝐢𝐬𝐭𝐚 𝐝𝐞𝐢 𝐜𝐨𝐦𝐚𝐧𝐝𝐢 𝐟𝐚𝐫𝐞 \'\'.𝐟𝐮𝐧𝐳𝐢𝐨𝐧𝐢\'\''; break;
    }
    return result;
  };

  const buildMessage = (result) => {
    let icon = result.success ? (isEnable ? '🟢' : '🔴') : result.status.includes('𝐠𝐢𝐚̀') ? '🟡' : '⚠️';
    let displayStatus = result.success ? (isEnable ? '𝐀𝐓𝐓𝐈𝐕𝐀𝐓𝐀' : '𝐃𝐈𝐒𝐀𝐓𝐓𝐈𝐕𝐀𝐓𝐀') : result.status;
    const explanation = result.explanation ? `\n║ ℹ️ ${result.explanation}` : '';
    return `╔═══「 𝐂𝐎𝐍𝐅𝐄𝐑𝐌𝐀 」═══✧\n║ 📌 *Funzione:* ${result.type}\n║ ${icon} *Stato:* ${displayStatus}${explanation}\n║ 👤 *Admin:* ${userName}\n╚════════════════✧\n\n`;
  };

  const createSections = (features) => [
    { title: 'Attiva', rows: features.map(f => ({ title: f.name, description: f.desc, id: `${usedPrefix}attiva ${f.key}` })) },
    { title: 'Disattiva', rows: features.map(f => ({ title: f.name, description: f.desc, id: `${usedPrefix}disattiva ${f.key}` })) }
  ];

  if (!args.length) {
    return conn.sendMessage(m.chat, {
      text: `Scrivi le funzioni da attivare o disabilitare (controlla dal menù funzioni).\nEsempio: ${usedPrefix}attiva antilink & antispam & antitrava`
    }, { quoted: fake })
  }

  const joinedArgs = args.join(' ').trim();
  const firstArg = args[0] ? args[0].toLowerCase() : '';
  if (catalogs[firstArg]) {
    if (m.isGroup && !(isAdmin || isOwner || isROwner)) {
      return conn.sendMessage(m.chat, { text: '𝐂𝐨𝐦𝐚𝐧𝐝𝐨 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞 𝐬𝐨𝐥𝐨 𝐩𝐞𝐫 𝐚𝐝𝐦𝐢𝐧' }, { quoted: fake });
    }
    const results = catalogs[firstArg].map(key => toggleFeature(key));
    const msg = results.map(buildMessage).join('').trim();
    return conn.sendMessage(m.chat, { text: msg }, { quoted: fake });
  }
  // Support multiple features separated by '&' in a single message, e.g.:
  // .attiva antilink & antispam & antitrava
  let featureArgs = [];
  if (joinedArgs.includes('&')) {
    featureArgs = joinedArgs.split('&').map(s => s.trim()).filter(Boolean);
  } else {
    featureArgs = args.map(a => a.trim()).filter(Boolean);
  }

  const results = featureArgs.map(arg => toggleFeature(arg.toLowerCase()));
  const summaryMessage = results.map(buildMessage).join('').trim();
  await conn.sendMessage(m.chat, { text: summaryMessage }, { quoted: fake });
};

handler.help = ['attiva', 'disabilita'];
handler.tags = ['main'];
handler.command = ['enable', 'disable', 'attiva', 'disabilita', 'on', 'off'];

export default handler;