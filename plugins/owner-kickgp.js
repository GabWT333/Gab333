//Plugin by Gab, Lucifero & 333 staff

const handler = async (m, { conn, text, usedPrefix, command }) => {
  let who;
  if (m.isGroup) {
    who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : false;
  } else {
    who = text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.quoted ? m.quoted.sender : false;
  }

  if (!who) return m.reply(`⚠️ Chi devo espellere globalmente?\n\nEsempio:\n${usedPrefix + command} @utente`);

  m.reply(`🔍 Recupero lista gruppi in corso...`);

  try {
    const groups = await conn.groupFetchAllParticipating();
    const groupIds = Object.keys(groups);

    if (!groupIds.length) return m.reply('⚠️ Il bot non è in nessun gruppo.');

    m.reply(`🚀 Analisi avviata su ${groupIds.length} gruppi per @${who.split('@')[0]}...`, null, { mentions: [who] });

    let successCount = 0;
    let failCount = 0;

    for (let jid of groupIds) {
      try {
        const group = groups[jid];
        const participants = group.participants || [];

        const isParticipant = participants.some(p => p.id === who);

        const bot = participants.find(p => p.id === (conn.user.id.split(':')[0] + '@s.whatsapp.net'));
        const isBotAdmin = bot?.admin || bot?.isSAdmin || false;

        if (isParticipant) {
          if (isBotAdmin) {
            await conn.groupParticipantsUpdate(jid, [who], 'remove');
            successCount++;
            await new Promise(res => setTimeout(res, 1200));
          } else {
            failCount++;
          }
        }
      } catch (err) {
        console.error(`Errore nel gruppo ${jid}:`, err.message);
      }
    }

    m.reply(`✅ Operazione conclusa.\n\n🏆 Espulso da: ${successCount} gruppi.\n❌ Fallito (Bot non admin): ${failCount} gruppi.`);

  } catch (e) {
    console.error('Errore fatale recupero gruppi:', e);
    m.reply('❌ Errore durante il recupero della lista gruppi.');
  }
};

handler.help = ['kickgp <@tag/risposta>'];
handler.tags = ['owner'];
handler.command = ['kickgp'];
handler.owner = true;

export default handler;