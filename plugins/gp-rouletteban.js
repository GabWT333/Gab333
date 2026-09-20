//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn, isAdmin, groupMetadata, participants }) => {
  if (!m.isGroup) return m.reply('❌ Questo comando funziona solo nei gruppi.');
  if (!isAdmin) return m.reply('❌ Solo gli admin del gruppo possono usare questo comando.');
  if (!conn.user) return m.reply('❌ Non posso ottenere il mio id.');

  const decode = (jid) => (typeof conn.decodeJid === 'function' ? conn.decodeJid(jid || '') : jid || '');
  const botId = decode(conn.user.jid || conn.user.id || '');
  const ownerJid = (jid) => global.owner?.some(([number]) => decode(jid)?.includes(number));

  const allParticipants = participants || groupMetadata?.participants || [];
  const adminIds = new Set(
    allParticipants
      .filter(p => p?.admin === 'admin' || p?.admin === 'superadmin')
      .map(p => decode(p.id || p.jid))
      .filter(Boolean)
  );

  const members = allParticipants
    .map(p => decode(p.id || p.jid))
    .filter(Boolean)
    .filter(jid => jid !== botId)
    .filter(jid => !ownerJid(jid))
    .filter(jid => !adminIds.has(jid));

  if (!members.length) return m.reply('❌ Non ci sono membri non admin rimuovibili.');

  const suspense = await conn.sendMessage(m.chat, {
    text: `🎲 Roulette ban attivata...\n🕐 Preparati, tra 3 secondi verrà rimosso un membro a caso dal gruppo!`
  }, { quoted: m });

  await new Promise(resolve => setTimeout(resolve, 1000));
  await conn.sendMessage(m.chat, { text: '⏳ 3...' }, { quoted: suspense });
  await new Promise(resolve => setTimeout(resolve, 1000));
  await conn.sendMessage(m.chat, { text: '⏳ 2...' }, { quoted: suspense });
  await new Promise(resolve => setTimeout(resolve, 1000));
  await conn.sendMessage(m.chat, { text: '⏳ 1...' }, { quoted: suspense });
  await new Promise(resolve => setTimeout(resolve, 1000));

  const target = members[Math.floor(Math.random() * members.length)];
  if (!target) return m.reply('❌ Errore nel selezionare un membro.');

  try {
    await conn.groupParticipantsUpdate(m.chat, [target], 'remove');
    const targetName = conn.getName ? await conn.getName(target) : null;
    const mentionText = targetName ? targetName.replace(/[@\r\n]+/g, ' ').trim() : target.split('@')[0];
    return conn.sendMessage(m.chat, {
      text: `🔫 Lo sfigato del giorno è: @${mentionText}`,
      mentions: [target]
    }, { quoted: suspense });
  } catch (error) {
    console.error(error);
    return m.reply('❌ Non sono riuscito a rimuovere il membro. Assicurati che il bot sia admin.');
  }
};

handler.command = ['rouletteban'];
handler.tags = ['group', 'admin', 'fun'];
handler.help = ['rouletteban'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
