//Plugin by Gab, Lucifero & 333 staff

const stopWords = new Set(["e","a","o","che","il","la","lo","gli","le","un","uno","una","con","per","da","di","del","della","dei","delle","nel","nella","nei","nelle","sul","sulla","sui","sulle","al","allo","ai","agli","allo","hai","ha","ho","sei","si","ci","mi","ti","ne","ma","se","anche","anche","come","dove","quando","quale","quali","questo","questa","questi","quelle","sono","era","stato","stata","stati","state","fatto","fare","farete","faremo","farei","può","puoi","potrei","deve","devo","dovrebbe","sono","sta","quello","quella","queste","ogni","più","meno","non","nel","nella"]);

const getTextFromMessage = (msg) => {
  const message = msg?.message || {};
  if (!message || typeof message !== 'object') return '';

  if (message.conversation) return String(message.conversation);
  if (message.extendedTextMessage?.text) return String(message.extendedTextMessage.text);
  if (message.imageMessage?.caption) return String(message.imageMessage.caption);
  if (message.videoMessage?.caption) return String(message.videoMessage.caption);
  if (message.documentMessage?.caption) return String(message.documentMessage.caption);
  if (message.audioMessage?.caption) return String(message.audioMessage.caption);
  if (message.listResponseMessage?.singleSelectReply?.selectedRowId) return `Selezionato: ${message.listResponseMessage.singleSelectReply.selectedRowId}`;
  if (message.buttonsResponseMessage?.selectedButtonId) return `Bottone: ${message.buttonsResponseMessage.selectedButtonId}`;
  if (message.templateButtonReplyMessage?.selectedId) return `Template: ${message.templateButtonReplyMessage.selectedId}`;
  if (message.contactMessage?.displayName) return `Contatto: ${message.contactMessage.displayName}`;
  if (message.locationMessage?.name) return `Posizione: ${message.locationMessage.name}`;
  if (message.liveLocationMessage) return 'Posizione live';
  if (message.stickerMessage) return 'Sticker';
  if (message.productMessage?.product?.title) return `Prodotto: ${message.productMessage.product.title}`;
  if (message.pollCreationMessage?.name) return `Sondaggio: ${message.pollCreationMessage.name}`;
  if (message.protocolMessage) return 'Messaggio di sistema';

  return '';
};

const MAX_HISTORY_PER_GROUP = 150;

const normalizeSender = (jid) => {
  if (!jid || typeof jid !== 'string') return jid || 'Utente';
  return jid.replace(/@.+$/, '').replace(/[^0-9a-zA-Z_]/g, '');
};

const ensureRiassuntoDb = () => {
  if (!global.db?.data) return false;
  if (!global.db.data.riassuntoHistory) global.db.data.riassuntoHistory = {};
  return true;
};

const getRiassuntoHistory = (chat) => {
  if (!ensureRiassuntoDb()) return [];
  return global.db.data.riassuntoHistory[chat] || [];
};

const saveRiassuntoEntry = (chat, entry) => {
  if (!ensureRiassuntoDb()) return;
  const history = global.db.data.riassuntoHistory[chat] || (global.db.data.riassuntoHistory[chat] = []);
  if (history.some(item => item.id === entry.id)) return;
  history.push(entry);
  if (history.length > MAX_HISTORY_PER_GROUP) history.splice(0, history.length - MAX_HISTORY_PER_GROUP);
};

const saveRiassuntoMessage = (msg) => {
  if (!msg?.key?.remoteJid || !msg.key.remoteJid.endsWith('@g.us')) return;
  if (msg.key?.fromMe) return;
  const text = getTextFromMessage(msg)?.trim();
  if (!text) return;

  const sender = msg.key.participant || msg.key.remoteJid;
  const entry = {
    id: msg.key.id,
    sender,
    text,
    timestamp: Number(msg.messageTimestamp || msg.message?.timestamp || Date.now())
  };

  if (!global.rpRiassuntoHistory) global.rpRiassuntoHistory = {};
  const inMemory = global.rpRiassuntoHistory[msg.key.remoteJid] || (global.rpRiassuntoHistory[msg.key.remoteJid] = []);
  if (!inMemory.some(item => item.id === entry.id)) {
    inMemory.push(entry);
    if (inMemory.length > MAX_HISTORY_PER_GROUP) inMemory.splice(0, inMemory.length - MAX_HISTORY_PER_GROUP);
  }

  saveRiassuntoEntry(msg.key.remoteJid, entry);
};

const initRiassuntoHistoryListener = () => {
  if (global.rpRiassuntoListenerSet) return;
  global.rpRiassuntoListenerSet = true;
  if (!global.rpRiassuntoHistory) global.rpRiassuntoHistory = {};

  const attach = () => {
    if (!global.conn?.ev?.on) return false;
    global.conn.ev.on('messages.upsert', async ({ messages }) => {
      for (const msg of messages) {
        try {
          saveRiassuntoMessage(msg);
        } catch (e) {
          console.error('[gp-riassunto] saveRiassuntoMessage error', e);
        }
      }
    });
    return true;
  };

  if (!attach()) {
    const interval = setInterval(() => {
      if (attach()) clearInterval(interval);
    }, 1000);
  }
};

initRiassuntoHistoryListener();

const getDisplayName = (jid, conn) => {
  if (!jid) return 'Utente';
  const contact = conn?.contacts?.[jid] || global.conn?.contacts?.[jid];
  if (contact) return contact.name || contact.notify || contact.vname || normalizeSender(jid);
  return normalizeSender(jid);
};

const collectKeywords = (texts) => {
  const counts = new Map();
  const tokens = texts
    .join(' ')
    .toLowerCase()
    .replace(/[\d]+/g, ' ')
    .replace(/["'“”‘’\[\]{}()!?.,;:<>\/\\|@#\$%\^&\*=_+~`]/g, ' ')
    .split(/\s+/)
    .filter(w => w && w.length > 3 && !stopWords.has(w));

  for (const token of tokens) {
    counts.set(token, (counts.get(token) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);
};

const buildSenderSummary = (senderName, texts) => {
  const sentences = texts
    .map(text => text.replace(/[\r\n]+/g, ' ').trim())
    .filter(Boolean);
  if (!sentences.length) return '';

  const snippet = sentences[0].length > 70 ? `${sentences[0].slice(0, 67)}...` : sentences[0];
  const topics = collectKeywords(sentences).slice(0, 3);
  const count = sentences.length;

  if (count === 1) {
    return `@${senderName} ha scritto 1 messaggio: "${snippet}"`;
  }

  if (topics.length) {
    return `@${senderName} ha inviato ${count} messaggi, parlando di ${topics.join(' • ')} e ha detto: "${snippet}"`;
  }

  return `@${senderName} ha inviato ${count} messaggi, ad esempio: "${snippet}"`;
};

const normalizeRawMessage = (msg, conn) => {
  const sender = msg?.key?.participant || msg?.key?.remoteJid || 'unknown';
  const text = getTextFromMessage(msg).trim();
  if (!text) return null;
  return {
    id: msg.key.id,
    sender,
    senderName: getDisplayName(sender, conn),
    text,
    timestamp: Number(msg.messageTimestamp || msg.message?.timestamp || 0)
  };
};

const handler = async (m, { conn, args }) => {
  const requested = args?.[0] ? parseInt(args[0], 10) : NaN;
  if (!requested || isNaN(requested)) {
    return await conn.sendMessage(m.chat, {
      text: '⚠️ Seleziona una quantità di messaggi da riassumere (max 150). Esempio: *.riassunto 20*'
    }, { quoted: m });
  }

  const count = Math.max(1, Math.min(requested, MAX_HISTORY_PER_GROUP));
  const chat = m.chat;

  const historyFromDb = getRiassuntoHistory(chat);
  let storedMessages = Array.isArray(historyFromDb) ? [...historyFromDb] : [];

  const chatData = conn?.chats?.[chat] || global.conn?.chats?.[chat];
  let fallbackMessages = [];
  if (chatData?.messages) {
    fallbackMessages = Object.values(chatData.messages)
      .map(msg => normalizeRawMessage(msg, conn))
      .filter(Boolean);
  } else if (Array.isArray(conn?.messages?.[chat])) {
    fallbackMessages = conn.messages[chat]
      .map(msg => normalizeRawMessage(msg, conn))
      .filter(Boolean);
  } else if (Array.isArray(global.store?.messages?.[chat])) {
    fallbackMessages = global.store.messages[chat]
      .map(msg => normalizeRawMessage(msg, conn))
      .filter(Boolean);
  }

  const knownIds = new Set(storedMessages.map(item => item.id));
  for (const msg of fallbackMessages) {
    if (!knownIds.has(msg.id)) {
      storedMessages.push(msg);
      knownIds.add(msg.id);
      saveRiassuntoEntry(chat, msg);
    }
  }

  if (!storedMessages || storedMessages.length === 0) {
    return await conn.sendMessage(chat, { text: '⚠️ Non è possibile recuperare la cronologia dei messaggi in questo momento.' }, { quoted: m });
  }

  const history = storedMessages
    .slice()
    .sort((a, b) => a.timestamp - b.timestamp);

  const commandIndex = history.findIndex(item => item.id === m.key?.id && m.key?.fromMe);
  if (commandIndex !== -1) history.splice(commandIndex, 1);

  const selected = history.slice(-count);
  if (!selected.length) {
    return await conn.sendMessage(chat, { text: '⚠️ Non ho trovato messaggi da riassumere.' }, { quoted: m });
  }

  const parsed = selected.map(msg => {
    const text = (typeof msg.text === 'string' ? msg.text : getTextFromMessage(msg)).trim();
    const sender = msg.sender || msg?.key?.participant || msg?.key?.remoteJid || 'unknown';
    return {
      sender,
      senderName: msg.senderName || getDisplayName(sender, conn),
      text,
      timestamp: msg.timestamp || Number(msg?.messageTimestamp || msg?.message?.timestamp || 0)
    };
  }).filter(entry => entry.text.length > 0);

  if (!parsed.length) {
    return await conn.sendMessage(chat, { text: '⚠️ Non ci sono contenuti testuali negli ultimi messaggi selezionati.' }, { quoted: m });
  }

  const groups = parsed.reduce((acc, entry) => {
    const key = entry.senderName;
    if (!acc[key]) acc[key] = { texts: [], jids: new Set() };
    acc[key].texts.push(entry.text);
    if (entry.sender) acc[key].jids.add(entry.sender);
    return acc;
  }, {});

  const senders = Object.entries(groups)
    .sort((a, b) => b[1].texts.length - a[1].texts.length)
    .slice(0, 5);

  const senderSummaries = senders
    .map(([senderName, data]) => buildSenderSummary(senderName, data.texts))
    .filter(Boolean);

  const mentionJids = [...new Set(senders.flatMap(([, data]) => [...data.jids]))];
  const keywords = collectKeywords(parsed.map(p => p.text)).slice(0, 6);
  const actualCount = parsed.length;
  const totalMessages = Math.min(count, history.length);

  let summary = `📝 *Riassunto chat*\n`;
  summary += `• *Messaggi analizzati:* ${actualCount} su ${count} richiesti\n`;
  summary += `• *Partecipanti rilevanti:* ${senders.map(([senderName, data]) => `@${senderName} (${data.texts.length})`).join(' • ')}\n`;
  summary += `• *Argomenti principali:* ${keywords.length ? keywords.join(' • ') : 'Nessuno chiaro'}\n\n`;
  summary += `💬 *Sintesi:*\n${senderSummaries.map((line, idx) => `${idx + 1}. ${line}`).join('\n\n')}`;

  if (actualCount < count) {
    summary += `\n\n⚠️ Ho usato solo ${actualCount} messaggi disponibili per questa chat.`;
  }

  summary += `\n\nℹ️ Questo riassunto è creato dai messaggi memorizzati e disponibili nel gruppo.`;

  await conn.sendMessage(chat, {
    text: summary,
    contextInfo: { mentionedJid: mentionJids }
  }, { quoted: m });
};

handler.help = ['riassunto <numero>'];
handler.tags = ['utility'];
handler.admin = true
handler.command = ['riassunto'];
export default handler;
