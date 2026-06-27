//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn, command }) => {
  global.quizSession = global.quizSession || {};
  global.db.data.users[m.sender] = global.db.data.users[m.sender] || { money: 0 };
  let user = global.db.data.users[m.sender];

  if (user.money < 100) {
    return conn.reply(m.chat, `💸 𝐒𝐨𝐥𝐨 𝐜𝐡𝐢 𝐡𝐚 𝐮𝐧 𝐬𝐚𝐥𝐝𝐨 𝐝𝐢 𝐚𝐥𝐦𝐞𝐧𝐨 𝟏𝟎𝟎€ 𝐩𝐮𝐨 𝐠𝐢𝐨𝐜𝐚𝐫𝐞 𝐚𝐥 𝐪𝐮𝐢𝐳! 𝐀𝐭𝐭𝐮𝐚𝐥𝐞: *${user.money}€*`, m);
  }

  const categories = ['facile', 'media', 'difficile', 'impossibile'];

  const questions = {
    facile: [
      { q: 'Quanto fa 2+2?', a: 'B', choices: ['A) 3', 'B) 4', 'C) 5', 'D) 6'] },
      { q: 'Qual è la capitale d’Italia?', a: 'A', choices: ['A) Roma', 'B) Milano', 'C) Torino', 'D) Napoli'] },
      { q: 'Il sole è una stella?', a: 'C', choices: ['A) No', 'B) Luna', 'C) Sì', 'D) Marte'] },
      { q: 'Quanti giorni ha una settimana?', a: 'D', choices: ['A) 5', 'B) 6', 'C) 8', 'D) 7'] },
      { q: 'Quale colore si ottiene mescolando blu e giallo?', a: 'B', choices: ['A) Rosso', 'B) Verde', 'C) Viola', 'D) Arancione'] },
      { q: 'Quale animale abbaia?', a: 'A', choices: ['A) Cane', 'B) Gatto', 'C) Mucca', 'D) Cavallo'] },
      { q: 'Qual è il frutto della vite?', a: 'C', choices: ['A) Mela', 'B) Pera', 'C) Uva', 'D) Banana'] },
      { q: 'Che giorno viene dopo il lunedì?', a: 'D', choices: ['A) Domenica', 'B) Venerdì', 'C) Martedì', 'D) Martedì'] },
      { q: 'Quanto fa 10-3?', a: 'B', choices: ['A) 6', 'B) 7', 'C) 8', 'D) 9'] },
      { q: 'Quanti colori ha l’arcobaleno?', a: 'C', choices: ['A) 5', 'B) 6', 'C) 7', 'D) 8'] }
    ],
    media: [
      { q: 'Chi ha scritto “La Divina Commedia”?', a: 'A', choices: ['A) Dante', 'B) Manzoni', 'C) Leopardi', 'D) Petrarca'] },
      { q: 'Quale elemento chimico ha simbolo Fe?', a: 'C', choices: ['A) Fluoro', 'B) Fosforo', 'C) Ferro', 'D) Francio'] },
      { q: 'In quale anno cadde l’Impero Romano d’Occidente?', a: 'B', choices: ['A) 410', 'B) 476', 'C) 500', 'D) 395'] },
      { q: 'Chi ha dipinto la Gioconda?', a: 'D', choices: ['A) Michelangelo', 'B) Raffaello', 'C) Caravaggio', 'D) Leonardo da Vinci'] },
      { q: 'Quale pianeta è noto come pianeta rosso?', a: 'C', choices: ['A) Venere', 'B) Giove', 'C) Marte', 'D) Saturno'] },
      { q: 'In quale città si trova la Torre Eiffel?', a: 'B', choices: ['A) Londra', 'B) Parigi', 'C) Berlino', 'D) Roma'] },
      { q: 'Chi ha scoperto la penicillina?', a: 'A', choices: ['A) Fleming', 'B) Curie', 'C) Newton', 'D) Pasteur'] },
      { q: 'Qual è la formula chimica dell’acqua?', a: 'D', choices: ['A) H2', 'B) O2', 'C) HO', 'D) H2O'] },
      { q: 'Chi ha scritto “I promessi sposi”?', a: 'B', choices: ['A) Dante', 'B) Manzoni', 'C) Leopardi', 'D) Verga'] },
      { q: 'Qual è l’animale simbolo dell’Australia?', a: 'C', choices: ['A) Tigre', 'B) Elefante', 'C) Canguro', 'D) Panda'] }
    ],
    difficile: [
      { q: 'Qual è la radice quadrata di 144?', a: 'B', choices: ['A) 10', 'B) 12', 'C) 14', 'D) 16'] },
      { q: 'Chi ha scritto “Guerra e Pace”?', a: 'C', choices: ['A) Dostoevskij', 'B) Kafka', 'C) Tolstoj', 'D) Shakespeare'] },
      { q: 'Quale gas ha simbolo chimico Ne?', a: 'D', choices: ['A) Nitrato', 'B) Nichel', 'C) Nitrogeno', 'D) Neon'] },
      { q: 'In quale anno Cristoforo Colombo scoprì l’America?', a: 'A', choices: ['A) 1492', 'B) 1490', 'C) 1500', 'D) 1485'] },
      { q: 'Quale pittore è famoso per le Ninfee?', a: 'B', choices: ['A) Van Gogh', 'B) Monet', 'C) Picasso', 'D) Rembrandt'] },
      { q: 'Chi ha formulato la teoria della relatività?', a: 'D', choices: ['A) Newton', 'B) Galileo', 'C) Bohr', 'D) Einstein'] },
      { q: 'Qual è la capitale del Giappone?', a: 'C', choices: ['A) Osaka', 'B) Kyoto', 'C) Tokyo', 'D) Nagoya'] },
      { q: 'Quale fiume attraversa Parigi?', a: 'B', choices: ['A) Tamigi', 'B) Senna', 'C) Reno', 'D) Po'] },
      { q: 'Chi ha scritto “Amleto”?', a: 'A', choices: ['A) Shakespeare', 'B) Dickens', 'C) Cervantes', 'D) Goethe'] },
      { q: 'Qual è il metallo più leggero?', a: 'D', choices: ['A) Ferro', 'B) Rame', 'C) Alluminio', 'D) Litio'] }
    ],
    impossibile: [
      { q: 'Quanto fa 125x24?', a: 'C', choices: ['A) 2500', 'B) 2900', 'C) 3000', 'D) 3100'] },
      { q: 'Chi ha vinto il Premio Nobel per la Pace nel 2020?', a: 'B', choices: ['A) ONU', 'B) World Food Programme', 'C) Medici senza frontiere', 'D) Greenpeace'] },
      { q: 'Quale elemento ha numero atomico 79?', a: 'A', choices: ['A) Oro', 'B) Argento', 'C) Platino', 'D) Rame'] },
      { q: 'Chi ha scritto “Ulisse”?', a: 'C', choices: ['A) Joyce', 'B) Kafka', 'C) James Joyce', 'D) Proust'] },
      { q: 'Qual è la capitale del Kazakistan?', a: 'B', choices: ['A) Astana', 'B) Nur-Sultan', 'C) Almaty', 'D) Tashkent'] },
      { q: 'Chi ha scoperto l’America?', a: 'D', choices: ['A) Magellano', 'B) Vespucci', 'C) Marco Polo', 'D) Cristoforo Colombo'] },
      { q: 'Qual è la formula della velocità della luce?', a: 'C', choices: ['A) v=d/t', 'B) a=F/m', 'C) c=3x10^8 m/s', 'D) E=mc^2'] },
      { q: 'Chi ha scritto “Il Principe”?', a: 'B', choices: ['A) Machiavelli', 'B) Niccolò Machiavelli', 'C) Platone', 'D) Aristotele'] },
      { q: 'Quanto vale π (pi) approssimato?', a: 'D', choices: ['A) 3.12', 'B) 3.13', 'C) 3.14', 'D) 3.1415'] },
      { q: 'Qual è la montagna più alta del mondo?', a: 'A', choices: ['A) Everest', 'B) K2', 'C) Kangchenjunga', 'D) Lhotse'] }
    ]
  };

  const category = categories[Math.floor(Math.random() * categories.length)];
  const qlist = questions[category];
  const question = qlist[Math.floor(Math.random() * qlist.length)];

  global.quizSession[m.sender] = {
    answer: question.a,
    amount: category === 'facile' ? 5 : category === 'media' ? 10 : category === 'difficile' ? 50 : 100
  };

  setTimeout(() => {
    if (global.quizSession[m.sender]) {
      delete global.quizSession[m.sender];
      conn.reply(m.chat, `⏰ 𝐓𝐞𝐦𝐩𝐨 𝐬𝐜𝐚𝐝𝐮𝐭𝐨!`, m);
    }
  }, 20000);

  return conn.sendMessage(m.chat, {
    text:
`╭─────────╮
┃ 𝐐𝐔𝐈𝐙 𝐃𝐈
┃ ꙰  𝟥𝟥𝟥 𝔹𝕆𝕋  ꙰
┃ 🎓 𝐂𝐀𝐓𝐄𝐆𝐎𝐑𝐈𝐀: *${category}*
┃━━━━━━━━━━━━━━
┃ 𝐃𝐨𝐦𝐚𝐧𝐝𝐚:
┃ *${question.q}*
┃━━━━━━━━━━━━━━
┃ ⏳ 20 secondi
╰─────────╯`,
    buttons: [
      { buttonId: '.quizans A', buttonText: { displayText: question.choices[0] }, type: 1 },
      { buttonId: '.quizans B', buttonText: { displayText: question.choices[1] }, type: 1 },
      { buttonId: '.quizans C', buttonText: { displayText: question.choices[2] }, type: 1 },
      { buttonId: '.quizans D', buttonText: { displayText: question.choices[3] }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m });
};

handler.before = async (m, { conn }) => {
  if (!m.text) return;
  if (!m.text.startsWith('.quizans')) return;

  let user = global.db.data.users[m.sender];
  let session = global.quizSession?.[m.sender];

  if (!session) return;

  let ans = m.text.split(' ')[1];
  delete global.quizSession[m.sender];

  if (ans === session.answer) {
    user.money += session.amount;
    return conn.reply(m.chat,
`✅ 𝐂𝐨𝐫𝐫𝐞𝐭𝐭𝐨!
💰 +${session.amount}€
Saldo: ${user.money}€`,
    m);
  } else {
    user.money -= session.amount;
    if (user.money < 0) user.money = 0;

    return conn.reply(m.chat,
`❌ 𝐒𝐛𝐚𝐠𝐥𝐢𝐚𝐭𝐨!
💸 -${session.amount}€
Saldo: ${user.money}€`,
    m);
  }
};

handler.command = /^quiz$/i;
handler.tags = ['fun'];
handler.help = ['quiz'];

export default handler;