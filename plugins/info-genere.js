const setgenereHandler = async (m, { conn, usedPrefix, command, text }) => {
  const who = m.sender; // L'utente che invia il comando

  // Se il comando è .setgenere
  if (command === 'setgenere') {
    // Se l'utente non fornisce un genere valido, rispondi con un errore
    if (!text || !['maschio', 'femmina'].includes(text.toLowerCase())) {
      return conn.reply(m.chat, `𝐔𝐬𝐨 𝐝𝐞𝐥 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐜𝐨𝐫𝐫𝐞𝐭𝐭𝐨. 𝐃𝐢𝐠𝐢𝐭𝐚:\n.𝐬𝐞𝐭𝐠𝐞𝐧𝐞𝐫𝐞 𝐦𝐚𝐬𝐜𝐡𝐢𝐨 / .𝐬𝐞𝐭𝐠𝐞𝐧𝐞𝐫𝐞 𝐟𝐞𝐦𝐦𝐢𝐧𝐚`, m);
    }

    // Impostazione dell'emoji del genere
    const emoji = text.toLowerCase() === 'maschio' ? '🚹' : '🚺';

    // Aggiungi il genere nel database dell'utente
    global.db.data.users[who].genere = text.trim().toLowerCase();

    // Risposta di conferma con il genere e l'emoji aggiornati
    conn.reply(m.chat, `✓ 𝐆𝐞𝐧𝐞𝐫𝐞 𝐢𝐦𝐩𝐨𝐬𝐭𝐚𝐭𝐨 𝐜𝐨𝐦𝐞: ${text.trim().toLowerCase()} ${emoji}`, m);
  }

  // Se il comando è .eliminagenere
  if (command === 'eliminagenere') {
    // Rimuovi il genere dal database dell'utente
    delete global.db.data.users[who].genere;

    // Risposta di conferma con l'eliminazione del genere
    conn.reply(m.chat, `𝐆𝐞𝐧𝐞𝐫𝐞 𝐫𝐢𝐦𝐨𝐬𝐬𝐨 ✓`, m);
  }
}

// Aggiungi i comandi .setgenere ed .eliminagenere
setgenereHandler.command = /^(setgenere|eliminagenere)$/i;
export default setgenereHandler;