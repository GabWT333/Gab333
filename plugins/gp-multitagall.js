let handler = async (m, { conn, text, participants }) => {
    try {
      // Funzione per il ritardo
      const delay = (time) => new Promise((res) => setTimeout(res, time));
  
      // Estrai il messaggio che vuoi inviare dal comando
      let customMessage = text.trim(); // Prendi tutto il testo dopo il comando
  
      if (!customMessage) {
        // Se non c'è messaggio, ritorna un errore
        return m.reply("𝐒𝐜𝐫𝐢𝐯𝐢 𝐢𝐥 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐢𝐧𝐬𝐢𝐞𝐦𝐞 𝐚𝐥 𝐜𝐨𝐦𝐚𝐧𝐝𝐨!");
      }
  
      // Ottieni gli utenti del gruppo (per il hidetag)
      let users = participants.map((u) => conn.decodeJid(u.id));
  
      // Funzione per inviare messaggio con "hidetag"
      const sendHidetagMessage = async (message) => {
        let more = String.fromCharCode(0); // Carattere invisibile
        let masss = more.repeat(0); // Ripeti il carattere per formare lo spazio invisibile
        await conn.relayMessage(m.chat, {
          extendedTextMessage: {
            text: `${masss}\n${message}\n`,
            contextInfo: { mentionedJid: users }, // Menziona gli utenti, se necessario
          },
        }, {});
      };
  
      const maxMessageLength = 200;
      let messageChunks = [];
  
      while (customMessage.length > maxMessageLength) {
        messageChunks.push(customMessage.slice(0, maxMessageLength));
        customMessage = customMessage.slice(maxMessageLength);
      }
      messageChunks.push(customMessage); // Aggiungi il resto del messaggio
  
      // Invia i messaggi "flood" con il ritardo e il hidetag
      for (let i = 0; i < 10; i++) {
        for (let chunk of messageChunks) {
          await sendHidetagMessage(chunk); // Invia il messaggio con hidetag
          await delay(2000); // Ritardo di 2 secondi tra ogni messaggio
        }
      }
    } catch (e) {
      console.error(e);
    }
  };
  
  handler.command = /^(bigtag)$/i; // Cambia il comando a ".bigtag"
  handler.group = true; // Funziona solo nei gruppi
  handler.rowner = true; // Solo il proprietario del bot può usarlo
  export default handler;