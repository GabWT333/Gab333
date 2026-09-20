const SECTIONS = [
  { title: '👥 STAFF', body: 'Scopri chi gestisce il bot', cmd: 'staff' },
  { title: '⚙️ FUNZIONI', body: 'Sicurezza nel gruppo', cmd: 'funzioni' },
  { title: '👑 ADMIN', body: 'Comandi di amministrazione gruppo', cmd: 'admin' },
  { title: '🎮 GIOCHI', body: 'Minigiochi e sfide', cmd: 'giochi' },
  { title: '🎰 RPG', body: 'Il mondo RPG di 333 BOT', cmd: 'rpg' },
  { title: '🔐 OWNER', body: 'Comandi riservati owner', cmd: 'owner' },
  { title: '🛠️ ASSISTENZA', body: 'Numeri, canale, supporto e sito', cmd: 'assistenza' }
];

let handler = async (m, { conn, usedPrefix }) => {
  const botName = global.db.data.nomedelbot || ' ꙰ 𝟥𝟥𝟥 𝔹𝕆𝕋  ꙰';
  const botVersion = global.db.data.version || '𝟏𝟎.𝟑';

  await conn.sendMessage(m.chat, {
    text: `⚡️ 𝐌𝐄𝐍Ù 𝐏𝐑𝐈𝐍𝐂𝐈𝐏𝐀𝐋𝐄 𝐃𝐈 ${botName}\n\nSeleziona una categoria per aprire il relativo submenu.\n\n🚀 ${botName} • v${botVersion}`,
    optionText: '📚 Tutti i menu',
    optionTitle: 'Seleziona una categoria',
    nativeFlow: [
      ...SECTIONS.map(section => ({
        text: section.title,
        id: `${usedPrefix}${section.cmd}`
      }))
    ]
  }, { quoted: m });
};

handler.help = ['menu'];
handler.tags = ['menu'];
handler.command = /^(menu|comandi)$/i;

export default handler;