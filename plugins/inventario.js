let handler = async (m, { conn, args }) => {
  const user = m.sender;
  global.db.data.users[user] = global.db.data.users[user] || {};
  const data = global.db.data.users[user];
  data.pokemons = data.pokemons || [];

  const total = data.pokemons.length;
  if (total === 0) return m.reply('📦 Il tuo inventario è vuoto! Usa *.apri base* per ottenere il tuo primo Pokémon.');

  const page = Math.max(1, parseInt(args[0]) || 1);
  const perPage = 50;
  const totalPages = Math.ceil(total / perPage);
  if (page > totalPages) return m.reply(`❌ Pagina non valida. Scegli tra 1 e ${totalPages}`);

  const rarityEmojis = {
    'Comune': '⚪', 'Non Comune': '🟢',
    'Raro': '🔵', 'Leggendario': '🟣',
    'Misterioso': '🌌', 'Darkness': '🌑'
  };

  const typeEmojis = {
    'Fuoco': '🔥', 'Acqua': '💧', 'Erba': '🍃', 'Elettro': '⚡',
    'Psico': '🧠', 'Buio': '🌑', 'Normale': '🔘', 'Drago': '🐉',
    'Fata': '✨', 'Roccia': '🪨', 'Spettro': '👻', 'Lotta': '🥊',
    'Acciaio': '⚙️', 'Terra': '🌍', 'Veleno': '☠️'
  };

  const start = (page - 1) * perPage;
  const end = start + perPage;

  let header = `
╭━━━🗂️ *INVENTARIO POKÉMON* 🗂️━━━╮
┃ 👤 *Allenatore:* @${user.split('@')[0]}
┃ 📦 *Totale:* ${total}
┃ 📄 *Pagina:* ${page}/${totalPages}
┃ 📌 *Per pagina:* ${perPage}
╰━━━━━━━━━━━━━━━━━━━━━━━╯
`;

  let list = data.pokemons.slice(start, end).map((p, i) => {
    const emojiR = rarityEmojis[p.rarity] || '❓';
    const emojiT = typeEmojis[p.type] || '🔘';
    const lvl = p.level || 1;
    return `#${start + i + 1} ➤ *${p.name}* (Lv.${lvl})\n${emojiR} ${p.rarity} | ${emojiT} ${p.type}`;
  }).join('\n\n');

  let message = header + '\n' + list;

  const buttons = [];

  buttons.push({
    buttonId: `.darkness`,
    buttonText: { displayText: '🌑 Pokémon Darkness' },
    type: 1
  });

  // 📄 Bottoni Pagine
  const visibleButtons = 3;
  let startPage = Math.max(1, page - 1);
  let endPage = Math.min(totalPages, startPage + visibleButtons - 1);

  if (endPage - startPage < visibleButtons - 1) {
    startPage = Math.max(1, endPage - visibleButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    buttons.push({
      buttonId: `.inventario ${i}`,
      buttonText: { displayText: `${i === page ? '📍' : ''}Pagina ${i}` },
      type: 1
    });
  }

  return conn.sendMessage(m.chat, {
    text: message.trim(),
    buttons,
    footer: '📂 Usa `.inventario [pagina]` oppure clicca i bottoni per navigare.',
    mentions: [user],
    contextInfo: {
      externalAdReply: {
        title: 'Il tuo Inventario Pokémon',
        body: `Pagina ${page}/${totalPages} • ${total} totali`,
        thumbnailUrl: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/025.png',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m });
};

handler.help = ['inventario [pagina]'];
handler.tags = ['pokemon'];
handler.command = /^inventario(\s+\d+)?$/i;

export default handler;