let handler = async (m, { conn, isAdmin }) => {
  const text = m.text?.toLowerCase();

  if (text === '.skiplogo') {
    if (!m.isGroup) return m.reply('⚠ Questo comando funziona solo nei gruppi!');
    if (!global.logoGame?.[m.chat]) return m.reply('⚠ Nessuna partita attiva!');
    if (!isAdmin && !m.fromMe) return m.reply('❌ Solo admin possono interrompere!');
    clearTimeout(global.logoGame[m.chat].timeout);
    await conn.reply(m.chat, `🛑 Gioco interrotto. La risposta era: *${global.logoGame[m.chat].risposta}*`, m);
    delete global.logoGame[m.chat];
    return;
  }

  if (text === '.auto') {
    if (global.logoGame?.[m.chat]) return m.reply('⚠ Partita già in corso!');
    global.cooldowns = global.cooldowns || {};
    const now = Date.now(), key = `logo_${m.chat}`;
    if (now - (global.cooldowns[key] || 0) < 10000) {
      return m.reply(`⏳ Attendi ${Math.ceil((10000 - (now - global.cooldowns[key]))/1000)}s prima di riprovare.`);
    }
    global.cooldowns[key] = now;

    const loghi = [
      { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/audi.png', marca: 'audi' },
      { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/bmw.png', marca: 'bmw' },
      { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/mercedes-benz.png', marca: 'mercedes-benz' },
      { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/porsche.png', marca: 'porsche' },
      { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/volkswagen.png', marca: 'volkswagen' },
      { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/opel.png', marca: 'opel' },
      { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/ford.png', marca: 'ford' },
      { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/smart.png', marca: 'smart' },
      { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/maybach.png', marca: 'maybach' },
      { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/fiat.png', marca: 'fiat' },
      { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/ferrari.png', marca: 'ferrari' },
      { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/lamborghini.png', marca: 'lamborghini' },
      { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/maserati.png', marca: 'maserati' },
      { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/alfa-romeo.png', marca: 'alfa-romeo' },
      { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/lancia.png', marca: 'lancia' },
      { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/pagani.png', marca: 'pagani' },
      { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/de-tomaso.png', marca: 'de-tomaso' },
      { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/bugatti.png', marca: 'bugatti' },
      { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/tesla.png', marca: 'tesla' },
      { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/honda.png', marca: 'honda' },
      { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/toyota.png', marca: 'toyota' },
      { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/nissan.png', marca: 'nissan' },
      { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/mazda.png', marca: 'mazda' },
      { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/chevrolet.png', marca: 'chevrolet' },
      { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/volvo.png', marca: 'volvo' },
      { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/jeep.png', marca: 'jeep' },
      { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/mini.png', marca: 'mini' },
      { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/kia.png', marca: 'kia' },
      { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/hyundai.png', marca: 'hyundai' },
      { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/land-rover.png', marca: 'land-rover' },
    ];

    const scelta = loghi[Math.floor(Math.random() * loghi.length)];
    const frasi = ['🚘 INDOVINA IL LOGO!', '🏁 Che marca è questa?', '🔍 Riconosci questa auto?'];
    const frase = frasi[Math.floor(Math.random() * frasi.length)];

    global.logoGame = global.logoGame || {};
    global.logoGame[m.chat] = {
      risposta: scelta.marca,
      startTime: Date.now(),
      timeout: setTimeout(() => {
        if (global.logoGame?.[m.chat]) {
          conn.reply(m.chat, `⏰ Tempo scaduto! Risposta: *${scelta.marca}*`, m);
          delete global.logoGame[m.chat];
        }
      }, 60000)
    };

    await conn.sendMessage(m.chat, { image: { url: scelta.url }, caption: `${frase}\n⌛ 60 secondi.` }, { quoted: m });
  }
};

handler.before = async (m, { conn }) => {
  const game = global.logoGame?.[m.chat];
  if (!game || m.key.fromMe) return;
  const text = m.text?.toLowerCase().trim();
  if (!text) return;
  if (text === game.risposta) {
    clearTimeout(game.timeout);
    const reward = 100;
    const exp = 10;
    const timeTaken = Math.floor((Date.now() - game.startTime) / 1000);
    const timeBonus = 0;
    const congratsMessage = `
╭━『 🎉 RISPOSTA CORRETTA! 』━╮
┃
┃ 🚗 Marchio: ${game.risposta}
┃ ⏱ Tempo impiegato: ${timeTaken}s
┃
┃ 🎁 Ricompense:
┃ • ${reward} 💰 euro${timeBonus > 0 ? ` (+${timeBonus} bonus velocità)` : ''}
┃ • ${exp} 🆙 EXP
┃
╰━━━━━━━━━━━━━━━━╯

> \\by chatunity\\`;

    await conn.reply(m.chat, congratsMessage, m);
    delete global.logoGame[m.chat];
  }
};

handler.help = ['auto', 'skiplogo'];
handler.tags = ['game'];
handler.command = ['auto', 'skiplogo'];
export default handler;