let handler = async (m, { conn }) => {
  const user = m.sender;
  global.db.data.users[user] = global.db.data.users[user] || {};

  const sports = [
    { name: '⚽ Calcio', value: 'calcio' },
    { name: '🏀 Basket', value: 'basket' },
    { name: '🎾 Tennis', value: 'tennis' },
    { name: '🏎️ Formula 1', value: 'formula1' },
    { name: '🥊 MMA', value: 'mma' },
    { name: '🚴‍♂️ Ciclismo', value: 'ciclismo' }
  ];

  const buttons = sports.map(s => ({
    buttonId: `.chooseSport ${s.value}`,
    buttonText: { displayText: s.name },
    type: 1
  }));

  return await conn.sendMessage(m.chat, {
    text: `🏅 *Scegli il tuo sport preferito:*`,
    footer: '📌 Verrà salvato nel tuo profilo',
    buttons,
    headerType: 1
  }, { quoted: m });
};

handler.command = /^setsport$/i;
handler.help = ['setsport'];
handler.tags = ['settings'];

export default handler;