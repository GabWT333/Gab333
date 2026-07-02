let handler = async (m, { conn, usedPrefix, command }) => {
 
  if (!m.isGroup) return m.reply('⚠️ Le fiamme ardono solo nei gruppi!');


  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null);

  if (!who) {
    return m.reply(`🔥 *FLAME ACTIVATED* 🔥\n\nTaggala persona o rispondi a un suo messaggio per iniziare!\n\nEsempio: ${usedPrefix + command} @utente`);
  }


  const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
  if (who === botNumber) return m.reply('😏 Non puoi flammare me. Finiresti arrosto prima di subito!');


  const victimName = '@' + who.split('@')[0];
  const attackerName = '@' + m.sender.split('@')[0];

  const startMsg = `
╔══════════════════════╗
   🔥 *FLAME WAR INIZIATA* 🔥
╚══════════════════════╝

👊 *Sfidante:* ${attackerName}
🎯 *Vittima:* ${victimName}

⏱️ *Durata:* 3 minuti
💬 *Il bot attacca per primo!*`;

  await conn.sendMessage(m.chat, {
    text: startMsg,
    mentions: [m.sender, who]
  }, { quoted: m });


  let flameCount = 0;
  let battleActive = true;

  const generateFlame = (target) => {
    const flames = [
      `🔊 ${target}, scrivi così piano che i tuoi messaggi arrivano via fax?`,
      `🎭 ${target}, sembri un bug di sistema... inutile e fastidioso!`,
      `📱 ${target}, la tua sfiga prende sempre il 5G, complimenti!`,
      `⚡ ${target}, se la stupidità fosse energia, saresti una centrale elettrica!`,
      `🤡 ${target}, il circo ha chiamato, dicono che manchi solo tu!`,
      `⚰️ ${target}, il tuo senso dell'umorismo è morto e sepolto!`,
      `📡 ${target}, il segnale è arrivato, ma il tuo cervello è ancora in roaming?`,
      `💅 ${target}, anche i sassi hanno conversazioni più interessanti delle tue!`,
      `📉 ${target}, la tua dignità sta scendendo più velocemente delle azioni di una banca in crisi!`,
      `🧟 ${target}, ti hanno mai detto che hai il carisma di un router spento?`
    ];
    return flames[Math.floor(Math.random() * flames.length)];
  };


  const battleHandler = async (chatUpdate) => {
    if (!battleActive) return;
    const m2 = chatUpdate.messages[0];
    if (!m2.message || m2.key.fromMe) return;

    const sender = m2.key.participant || m2.key.remoteJid;

    
    if (sender === who && m2.key.remoteJid === m.chat) {
      flameCount++;
      const reply = generateFlame(victimName);

      await new Promise(res => setTimeout(res, 1000)); 
      await conn.sendMessage(m.chat, { text: reply, mentions: [who] }, { quoted: m2 });
    }
  };

  
  conn.ev.on('messages.upsert', battleHandler);


  setTimeout(() => {
    if (battleActive) conn.sendMessage(m.chat, { text: generateFlame(victimName), mentions: [who] });
  }, 2000);


  setTimeout(async () => {
    if (battleActive) {
      battleActive = false;
      conn.ev.off('messages.upsert', battleHandler); 
      const endMsg = `
╔══════════════════════╗
   ⏱️ *TEMPO SCADUTO!* ⏱️
╚══════════════════════╝
🥊 Il bot vince per KO tecnico!
📊 Insulti totali scagliati: ${flameCount + 1}

*Vuoi scappare?* Corri per 2,5km (ovvero **3.750 passi**)!`;

      await conn.sendMessage(m.chat, { text: endMsg, mentions: [who] });
    }
  }, 180000);
};

handler.help = ['flame'];
handler.tags = ['giochi'];
handler.command = /^(flame)$/i;
handler.group = true;

export default handler;