let handler = async (m, { conn }) => {
  const message = `
🌑 *PACCHETTI DARKNESS* 🌑

I pacchetti *Darkness* non si possono comprare, ma si trovano **apparentemente dal nulla** quando apri pacchetti *Premium*.

➡️ Ogni 10 pacchetti *Premium* aperti, hai il 50% di possibilità di ottenere un pacchetto *Darkness* bonus.

🎲 Aprendo un pacchetto *Darkness* puoi trovare Pokémon Darkness speciali con il 10% di possibilità.

Usa *.apri darkness* per aprire i pacchetti Darkness.

Buona fortuna! 🍀
`;

  await conn.sendMessage(m.chat, { text: message }, { quoted: m });
};

handler.help = ['darknessinfo'];
handler.tags = ['pokemon'];
handler.command = /^darknessinfo$/i;

export default handler;