// Plugin By 333 Staff
 
let richiestaInAttesa = {};

let handler = async (m, { conn, isAdmin, isBotAdmin, args, usedPrefix, command }) => {
  if (!m.isGroup) return;

  const groupId = m.chat;

  if (richiestaInAttesa[m.sender]) {
    const pending = await conn.groupRequestParticipantsList(groupId);
    const input = (m.text || '').trim();
    delete richiestaInAttesa[m.sender];

    if (/^\d+$/.test(input)) {
      const numero = parseInt(input);
      if (numero <= 0) return m.reply("❌ Numero non valido. Usa un numero > 0.");
      const daAccettare = pending.slice(0, numero);
      let accettati = 0;
      try {
        const jidList = daAccettare.map(p => p.jid);
        await conn.groupRequestParticipantsUpdate(groupId, jidList, 'approve');
        accettati = jidList.length;
      } catch {}
      return m.reply(`✅ richieste accettate: ${accettati}.`);
    }

    if (input === '39' || input === '+39') {
      const daAccettare = pending.filter(p => p.jid.startsWith('39'));
      let accettati = 0;
      try {
        const jidList = daAccettare.map(p => p.jid);
        await conn.groupRequestParticipantsUpdate(groupId, jidList, 'approve');
        accettati = jidList.length;
      } catch {}
      return m.reply(`✅ Accettate ${accettati} richieste con prefisso italiano.`);
    }

    return m.reply("❌ Input non valido. Invia un numero o '39'.");
  }

  if (!isBotAdmin) return m.reply("❌ Devo essere admin per funzionare.");
  if (!isAdmin) return m.reply("❌ Solo gli admin del gruppo possono usare questo comando.");

  const pending = await conn.groupRequestParticipantsList(groupId);
  if (!pending.length) return m.reply("✅ Non ci sono richieste in sospeso.");

  if (!args[0]) {
    const text = `📨 Richieste in sospeso: ${pending.length}\nSeleziona un'opzione:`;
    return conn.sendMessage(m.chat, {
      text,
      footer: 'Gestione richieste gruppo',
      buttons: [
        { buttonId: `${usedPrefix}${command} accetta`, buttonText: { displayText: "✅ Accetta tutte" }, type: 1 },
        { buttonId: `${usedPrefix}${command} rifiuta`, buttonText: { displayText: "❌ Rifiuta tutte" }, type: 1 },
        { buttonId: `${usedPrefix}${command} accetta39`, buttonText: { displayText: "🇮🇹 Accetta +39" }, type: 1 },
        { buttonId: `${usedPrefix}${command} gestisci`, buttonText: { displayText: "📥 Gestisci richieste" }, type: 1 }
      ],
      headerType: 1,
      viewOnce: true
    }, { quoted: m });
  }

  if (args[0] === 'accetta') {
    const numero = parseInt(args[1]);
    const daAccettare = isNaN(numero) || numero <= 0 ? pending : pending.slice(0, numero);
    let accettati = 0;
    try {
      const jidList = daAccettare.map(p => p.jid);
      await conn.groupRequestParticipantsUpdate(groupId, jidList, 'approve');
      accettati = jidList.length;
    } catch {}
    return m.reply(`✅ Accettate ${accettati} richieste.`);
  }

  if (args[0] === 'accettane') {
    const numero = parseInt(args[1]);
    if (isNaN(numero) || numero <= 0) return m.reply("❌ Numero non valido. Usa un numero maggiore di 0.");
    const daAccettare = pending.slice(0, numero);
    let accettati = 0;
    try {
      const jidList = daAccettare.map(p => p.jid);
      await conn.groupRequestParticipantsUpdate(groupId, jidList, 'approve');
      accettati = jidList.length;
    } catch {}
    return m.reply(`✅ Accettate ${accettati} richieste su ${numero}.`);
  }

  if (args[0] === 'rifiuta') {
    let rifiutati = 0;
    try {
      const jidList = pending.map(p => p.jid);
      await conn.groupRequestParticipantsUpdate(groupId, jidList, 'reject');
      rifiutati = jidList.length;
    } catch {}
    return m.reply(`❌ Richieste rifiutate: ${rifiutati}.`);
  }

  if (args[0] === 'accetta39') {
    const daAccettare = pending.filter(p => p.jid.startsWith('39'));
    let accettati = 0;
    try {
      const jidList = daAccettare.map(p => p.jid);
      await conn.groupRequestParticipantsUpdate(groupId, jidList, 'approve');
      accettati = jidList.length;
    } catch {}
    return m.reply(`✅ Accettate ${accettati} richieste con prefisso italiano.`);
  }

  if (args[0] === 'gestisci') {
    return conn.sendMessage(m.chat, {
      text: `📥 Quante richieste vuoi accettare?\n\nScegli una quantità qui sotto oppure scrivi manualmente:\n\n*.${command} accettane <numero>*\nEsempio: *.${command} accettane 333*`,
      footer: 'Gestione personalizzata richieste',
      buttons: [
        { buttonId: `${usedPrefix}${command} accettane 10`, buttonText: { displayText: "10" }, type: 1 },
        { buttonId: `${usedPrefix}${command} accettane 20`, buttonText: { displayText: "20" }, type: 1 },
        { buttonId: `${usedPrefix}${command} accettane 50`, buttonText: { displayText: "50" }, type: 1 },
        { buttonId: `${usedPrefix}${command} accettane 100`, buttonText: { displayText: "100" }, type: 1 },
        { buttonId: `${usedPrefix}${command} accettane 200`, buttonText: { displayText: "200" }, type: 1 },
      ],
      headerType: 1,
      viewOnce: true
    }, { quoted: m });
  }
};

handler.command = ['richieste'];
handler.tags = ['gruppo'];
handler.help = ['richieste'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;