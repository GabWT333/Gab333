let cooldowns = {};

let handler = async (m, { conn, text, command, usedPrefix }) => {
  let users = global.db.data.users;

  const senderId = m.sender;
  const senderName = await conn.getName(senderId);

  // Trova il target: da menzione o messaggio citato
  let targetId = m.mentionedJid?.[0] || m.quoted?.sender;

  if (!targetId) {
    return m.reply(`🧠 Tagga qualcuno o rispondi a un messaggio per rubare.\n\n📌 Esempio:\n${usedPrefix + command} @utente`);
  }

  if (targetId === senderId) {
    return m.reply('🤡 Non puoi rubare a te stesso.');
  }

  // Inizializza utenti se non esistono
  if (!users[senderId]) users[senderId] = { limit: 10 };
  if (!users[targetId]) users[targetId] = { limit: 10 };

  // Cooldown 5 minuti
  const cooldownTime = 5 * 60 * 1000;
  if (cooldowns[senderId] && Date.now() - cooldowns[senderId] < cooldownTime) {
    let tempoRimanente = formattaTempo(Math.ceil((cooldowns[senderId] + cooldownTime - Date.now()) / 1000));
    return m.reply(`🚨 Hai già rubato di recente! Riprova tra ⏱ *${tempoRimanente}*`);
  }

  cooldowns[senderId] = Date.now();

  const minRubare = 50;
  const maxRubare = 100;
  const quantita = Math.floor(Math.random() * (maxRubare - minRubare + 1)) + minRubare;

  const esito = Math.floor(Math.random() * 3); // 0 = successo, 1 = catturato, 2 = parziale

  switch (esito) {
    case 0: // Successo
      users[senderId].limit += quantita;
      users[targetId].limit = Math.max(0, users[targetId].limit - quantita);
      await conn.sendMessage(m.chat, {
        text: `💰 Colpo riuscito! Hai rubato *${quantita} 💶 UC* da @${targetId.split("@")[0]}.\n\n*+${quantita} 💶* aggiunti al tuo saldo.`,
        mentions: [targetId]
      }, { quoted: m });
      break;

    case 1: // Catturato
      let multa = Math.min(Math.floor(Math.random() * (users[senderId].limit - minRubare + 1)) + minRubare, maxRubare);
      multa = Math.max(0, multa);
      users[senderId].limit = Math.max(0, users[senderId].limit - multa);
      await conn.reply(m.chat, `🚓 Sei stato arrestato! Multa di *-${multa} 💶 UC* per ${senderName}.`, m);
      break;

    case 2: // Parziale
      let parziale = Math.min(Math.floor(Math.random() * (users[targetId].limit / 2 - minRubare + 1)) + minRubare, maxRubare);
      parziale = Math.max(0, parziale);
      users[senderId].limit += parziale;
      users[targetId].limit = Math.max(0, users[targetId].limit - parziale);
      await conn.sendMessage(m.chat, {
        text: `💸 Hai rubato solo *${parziale} 💶 UC* da @${targetId.split("@")[0]}.\n\n*+${parziale} 💶* aggiunti al tuo saldo.`,
        mentions: [targetId]
      }, { quoted: m });
      break;
  }

  global.db.write();
};

handler.help = ['ruba @utente', 'rapina'];
handler.tags = ['rpg'];
handler.command = ['ruba', 'rapina'];
handler.register = true;
handler.group = true;

function formattaTempo(secondi) {
  let minuti = Math.floor(secondi / 60);
  let secondiRimanenti = Math.floor(secondi % 60);
  return `${minuti}m ${secondiRimanenti}s`;
}

export default handler;