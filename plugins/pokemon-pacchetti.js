let handler = async (m, { conn }) => {
  const user = m.sender;
  global.db.data.users[user] = global.db.data.users[user] || {};
  const data = global.db.data.users[user];

  data.packInventory = data.packInventory || { base: 0, imperium: 0, premium: 0 };

  const { base, imperium, premium } = data.packInventory;

  const message = `
📂 I TUOI PACCHETTI

• 📦 Base: ${base}
• 👑 Imperium: ${imperium}
• 🌌 Premium: ${premium}

🎁 Usa i bottoni per aprire un pacchetto subito!
`.trim();

  const buttons = [];

  if (base > 0) {
    buttons.push({ buttonId: '.apri base', buttonText: { displayText: '📦 Apri Base' }, type: 1 });
  }
  if (imperium > 0) {
    buttons.push({ buttonId: '.apri imperium', buttonText: { displayText: '👑 Apri Imperium' }, type: 1 });
  }
  if (premium > 0) {
    buttons.push({ buttonId: '.apri premium', buttonText: { displayText: '🌌 Apri Premium' }, type: 1 });
  }

  if (buttons.length === 0) {
    buttons.push({ buttonId: '.pacchetti', buttonText: { displayText: '➕ Compra Pacchetti' }, type: 1 });
  }

  await conn.sendMessage(m.chat, {
    text: message,
    footer: '✨ Colleziona carte rare e crea il tuo team!',
    buttons,
  }, { quoted: m });
};

handler.help = ['imieiPacchetti'];
handler.tags = ['pokemon'];
handler.command = /^imiei(pacchetti)?$/i;

export default handler;