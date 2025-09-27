const setetaHandler = async (m, { conn, command, text }) => {
  const who = m.sender; // L'utente che invia il comando

  if (command === 'setanni') {
    // Controllo input valido
    const eta = parseInt(text);
    if (!eta || isNaN(eta) || eta < 10 || eta > 80) {
      return conn.reply(m.chat, `𝐔𝐭𝐢𝐥𝐢𝐳𝐳𝐚 .𝐬𝐞𝐭𝐚𝐧𝐧𝐢 𝐨 .𝐞𝐥𝐢𝐦𝐢𝐧𝐚𝐚𝐧𝐧𝐢\n> 𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐮𝐧'𝐞𝐭𝐚̀ 𝐯𝐚𝐥𝐢𝐝𝐚.\n> 𝐋'𝐞𝐭𝐚̀ 𝐯𝐚𝐥𝐢𝐝𝐚 𝐞̀ 𝐝𝐚 10 𝐚 80 𝐚𝐧𝐧𝐢.`, m);
    }

    // Salvataggio nel database
    global.db.data.users[who].eta = eta;

    // Messaggio di conferma
    conn.reply(m.chat, `✓ 𝐄𝐭𝐚̀ 𝐢𝐦𝐩𝐨𝐬𝐭𝐚𝐭𝐚 𝐜𝐨𝐦𝐞: ${eta} 𝐚𝐧𝐧𝐢.`, m);
  }

  if (command === 'eliminaanni') {
    // Rimuove l'età
    delete global.db.data.users[who].eta;

    // Messaggio di conferma
    conn.reply(m.chat, `✓ 𝐄𝐭𝐚̀ 𝐫𝐢𝐦𝐨𝐬𝐬𝐚.`, m);
  }
};

// Aggiunta comandi
setetaHandler.command = /^(setanni|eliminaanni)$/i;
export default setetaHandler;