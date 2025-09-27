let handler = async (m, { args }) => {
  const sport = args[0]?.toLowerCase();
  const valid = ['calcio', 'basket', 'tennis', 'formula1', 'mma', 'ciclismo'];

  if (!valid.includes(sport)) return m.reply('❌ Sport non valido.');

  global.db.data.users[m.sender] = global.db.data.users[m.sender] || {};
  global.db.data.users[m.sender].preferredSport = sport;

  return m.reply(`✅ Hai scelto *${sport.toUpperCase()}* come sport preferito!\nUsa ora il comando *.news* per leggere le notizie.`);
};

handler.command = /^sportselect$/i;
handler.help = ['sportselect'];
handler.tags = ['settings'];
export default handler;