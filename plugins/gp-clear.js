//Plugin by Gab, Lucifero & 333 staff

const MAX_MESSAGES_PER_CHAT = 150;

const initClearHistoryListener = () => {
  if (global.rpClearListenerSet) return;
  global.rpClearListenerSet = true;
  if (!global.rpClearHistory) global.rpClearHistory = {};

  const attach = () => {
    if (!global.conn?.ev?.on) return false;
    global.conn.ev.on('messages.upsert', async ({ messages }) => {
      for (const msg of messages) {
        try {
          if (!msg?.key?.remoteJid) continue;
          
          const chat = msg.key.remoteJid;
          if (!global.rpClearHistory[chat]) {
            global.rpClearHistory[chat] = [];
          }

          const inMemory = global.rpClearHistory[chat];
          if (!inMemory.some(item => item.key?.id === msg.key?.id)) {
            inMemory.push(msg);
            if (inMemory.length > MAX_MESSAGES_PER_CHAT) {
              inMemory.splice(0, inMemory.length - MAX_MESSAGES_PER_CHAT);
            }
          }
        } catch (e) {
          console.error('[gp-clear] Errore nel salvataggio messaggi:', e);
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

initClearHistoryListener();

let handler = async (m, { conn, args, text }) => {
  
  if (!text || isNaN(text)) {
    return m.reply(`🧹 𝐂𝐎𝐌𝐀𝐍𝐃𝐎 𝐂𝐋𝐄𝐀𝐑

❌ Devi specificare il numero di messaggi da eliminare!

📌 Utilizzo:
• .clear 5
• .clear 10
• .clear 30

⚠️ Massimo 30 messaggi per volta
📝 I messaggi vengono eliminati dal più recente`);
  }

  let count = parseInt(text);

  if (count <= 0) {
    return m.reply("❌ Il numero deve essere maggiore di 0!");
  }

  if (count > 30) {
    return m.reply("❌ Il massimo è 30 messaggi per volta!");
  }

  try {
    let messages = (global.rpClearHistory && global.rpClearHistory[m.chat]) || [];

    if (!messages || messages.length === 0) {
      const chatData = conn?.chats?.[m.chat] || global.conn?.chats?.[m.chat];
      if (chatData?.messages) {
        messages = Object.values(chatData.messages);
      } else if (Array.isArray(conn?.messages?.[m.chat])) {
        messages = conn.messages[m.chat];
      } else if (Array.isArray(global.store?.messages?.[m.chat])) {
        messages = global.store.messages[m.chat];
      }
    }

    if (!messages || messages.length === 0) {
      return m.reply("❌ Non ci sono messaggi da eliminare nella memoria!");
    }

    const recentMessages = messages.slice(-count);

    if (recentMessages.length === 0) {
      return m.reply(`❌ Non ci sono abbastanza messaggi da eliminare! (Disponibili: ${messages.length})`);
    }

    let deleted = 0;

    for (const message of recentMessages) {
      try {
        if (message && message.key) {
          await conn.sendMessage(m.chat, { delete: message.key });
          deleted++;
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (err) {
        console.error(`Errore nell'eliminazione del messaggio:`, err);
      }
    }

    if (deleted > 0) {
      await conn.sendMessage(m.chat, { 
        text: `✅ *MESSAGGI ELIMINATI*\n\n📊 Eliminati: *${deleted}/${count}* messaggi\n🧹 La chat è stata ripulita!`
      }, { quoted: m });
    } else {
      m.reply("❌ Nessun messaggio è stato eliminato!");
    }

  } catch (err) {
    console.error("Errore nel comando clear:", err);
    m.reply("❌ Errore durante l'eliminazione dei messaggi!");
  }
};

handler.help = ['clear <numero>'];
handler.tags = ['admin'];
handler.command = /^clear$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
