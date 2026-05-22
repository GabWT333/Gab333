// Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn, participants, groupMetadata, args, isAdmin }) => {
  try {
    if (!m.isGroup) return m.reply('❌ Questo comando funziona solo nei gruppi.');
    if (!isAdmin) return m.reply('❌ Solo gli admin del gruppo possono usare questo comando.');

    global.giuriaCases = global.giuriaCases || new Map();
    const voteActions = ['colpevole', 'innocente', 'no', 'guilty', 'notguilty'];
    const caseId = args[0] || '';
    const voteAction = args[1]?.toLowerCase();
    const isVote = caseId.startsWith('giuria_') && voteActions.includes(voteAction);

    const groupAdmins = participants.filter(p => p?.admin === 'admin' || p?.admin === 'superadmin');
    const mentionList = groupAdmins.map(p => p.id).filter(Boolean);
    const groupOwnerId = groupMetadata?.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || null;
    const getMention = jid => `@${jid.split('@')[0]}`;

    const completeCase = async (id, chat) => {
      const caseData = global.giuriaCases.get(id);
      if (!caseData) return;
      clearTimeout(caseData.timeout);
      global.giuriaCases.delete(id);

      const guiltyCount = (caseData.colpevole || new Set()).size;
      const innocentCount = (caseData.innocente || new Set()).size;

      if (guiltyCount >= 3) {
        try {
          await conn.groupParticipantsUpdate(chat, [caseData.target], 'remove');
          return await conn.sendMessage(chat, {
            text: `⚖️ Processo concluso!\n\n${getMention(caseData.issuer)} ha avviato un processo contro ${getMention(caseData.target)}.\n\nRisultato: *COLPEVOLE*\n✅ Voti colpevole: ${guiltyCount}\n❌ Voti non colpevole: ${innocentCount}\n\n${getMention(caseData.target)} è stato rimosso dal gruppo.`,
            mentions: [caseData.issuer, caseData.target, ...mentionList, groupOwnerId].filter(Boolean),
            contextInfo: { mentionedJid: [caseData.issuer, caseData.target, ...mentionList, groupOwnerId].filter(Boolean) }
          });
        } catch (error) {
          console.error(error);
          return await m.reply('❌ Errore durante la rimozione del membro. Verifica che il bot sia admin.');
        }
      }

      return await conn.sendMessage(chat, {
        text: `⚖️ Processo concluso!\n\n${getMention(caseData.issuer)} ha avviato un processo contro ${getMention(caseData.target)}.\n\nRisultato: *NON COLPEVOLE*\n✅ Voti colpevole: ${guiltyCount}\n❌ Voti non colpevole: ${innocentCount}\n\n${getMention(caseData.target)} rimane nel gruppo.`,
        mentions: [caseData.issuer, caseData.target, ...mentionList, groupOwnerId].filter(Boolean),
        contextInfo: { mentionedJid: [caseData.issuer, caseData.target, ...mentionList, groupOwnerId].filter(Boolean) }
      });
    };

    if (isVote) {
      const caseData = global.giuriaCases.get(caseId);
      if (!caseData) return m.reply('❌ Questa giuria non esiste o è scaduta.');
      if (caseData.chat !== m.chat) return m.reply('❌ Questo voto non appartiene a questa chat.');
      if (!isAdmin) return m.reply('❌ Solo gli admin possono votare questa giuria.');

      const voter = participants.find(p => [p.id, p.jid].includes(m.sender));
      if (!voter || !(voter.admin === 'admin' || voter.admin === 'superadmin')) return m.reply('❌ Solo gli admin possono votare questa giuria.');

      const normalizedVote = voteAction === 'colpevole' || voteAction === 'guilty' ? 'colpevole' : 'innocente';
      const previousVote = caseData.voters.get(m.sender);
      if (previousVote === normalizedVote) return m.reply(`❌ Hai già votato *${normalizedVote}*.`);

      if (previousVote && caseData[previousVote] instanceof Set) caseData[previousVote].delete(m.sender);

      caseData.voters.set(m.sender, normalizedVote);
      if (!(caseData[normalizedVote] instanceof Set)) caseData[normalizedVote] = new Set();
      caseData[normalizedVote].add(m.sender);

      const guiltyCount = (caseData.colpevole || new Set()).size;
      const innocentCount = (caseData.innocente || new Set()).size;

      await m.reply(`🗳️ Voto registrato: *${normalizedVote}*\n\n✅ Colpevole: ${guiltyCount}\n❌ Non colpevole: ${innocentCount}`);

      if (guiltyCount >= 3) await completeCase(caseId, m.chat);
      return;
    }

    // normale apertura caso
    const target = m.mentionedJid?.[0] || m.quoted?.sender;
    if (!target) return m.reply('❌ Usa il comando così: .giuria @user motivo');
    if (target === m.sender) return m.reply('❌ Non puoi aprire un processo contro te stesso.');
    if (groupAdmins.some(p => p.id === target || p.jid === target)) return m.reply('❌ Non puoi aprire un processo contro un altro admin.');

    // blocca contro owner del bot (global.owner entries)
    const isBotOwnerTarget = (global.owner || []).some(([num]) => (`${num}@s.whatsapp.net` === target) || (num === target.split('@')[0]));
    if (isBotOwnerTarget) return m.reply('❌ Non puoi aprire un processo contro il proprietario del bot.');

    // Evita più processi contemporanei nello stesso gruppo
    for (const [, v] of global.giuriaCases) {
      if (v && v.chat === m.chat) return m.reply('❌ È già in corso un processo in questo gruppo. Attendi la sua conclusione.');
    }

    const reason = args.slice(m.mentionedJid?.length ? 1 : 0).join(' ').trim();
    if (!reason) return m.reply('❌ Devi specificare un motivo. Esempio: .giuria @user comportamento scorretto');

    const id = 'giuria_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    const caseData = {
      id,
      chat: m.chat,
      issuer: m.sender,
      target,
      reason,
      voters: new Map(),
      colpevole: new Set(),
      innocente: new Set(),
      timeout: null
    };

    caseData.timeout = setTimeout(async () => await completeCase(id, m.chat), 2 * 60 * 1000);
    global.giuriaCases.set(id, caseData);

    const adminsListText = groupAdmins.map((v, i) => `✧👑 ${i + 1}. @${v.id.split('@')[0]}`).join('\n');
    const mentionChat = [...new Set([m.sender, target, ...mentionList, groupOwnerId].filter(Boolean))];
    const text = `⚖️ *GIURIA AVVIATA*\n\n${getMention(m.sender)} ha avviato un processo contro ${getMention(target)}\n*Motivo:* ${reason}\n\n*Admin taggati:*\n${adminsListText}\n\n🕒 Tempo per votare: 2 minuti\n✅ 3 voti "Colpevole" per rimuovere\n❌ Altrimenti rimane\n\n🔔 Admin, votate con i pulsanti sotto.`;

    await conn.sendMessage(m.chat, {
      text,
      mentions: mentionChat,
      contextInfo: { mentionedJid: mentionChat },
      footer: 'Giuria amministrativa',
      buttons: [
        { buttonId: `.giuria ${id} colpevole`, buttonText: { displayText: 'Colpevole' }, type: 1 },
        { buttonId: `.giuria ${id} innocente`, buttonText: { displayText: 'Non colpevole' }, type: 1 }
      ]
    }, { quoted: m });
  } catch (e) {
    console.error(e);
    m.reply('❌ Errore interno nel comando giuria.');
  }
};

handler.command = ['giuria'];
handler.tags = ['admin'];
handler.help = ['giuria @user motivo'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
