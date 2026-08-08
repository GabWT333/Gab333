//Plugin by Gab, Lucifero & 333 staff

const COOLDOWN = 10 * 60 * 1000; // 10 minuti
const BLOCCO_ARRESTO = 20 * 60 * 1000; // 20 minuti

async function handler(m, { conn }) {
  const users = global.db.data.users;
  if (!users[m.sender]) users[m.sender] = { money: 0, bank: 0, lastRapina: 0, arrestatoFino: 0 };
  const user = users[m.sender];
  const now = Date.now();

  if (user.arrestatoFino && now < user.arrestatoFino) {
    const remaining = msToTime(user.arrestatoFino - now);
    return conn.sendMessage(m.chat, { 
      text: `🚔 𝐒𝐞𝐢 𝐬𝐨𝐭𝐭𝐨 𝐜𝐨𝐧𝐭𝐫𝐨𝐥𝐥𝐨 𝐝𝐞𝐥𝐥𝐚 𝐩𝐨𝐥𝐢𝐳𝐢𝐚!\n\n⏳ 𝐩𝐨𝐭𝐫𝐚𝐢 𝐭𝐨𝐫𝐧𝐚𝐫𝐞 𝐚 𝐫𝐚𝐩𝐢𝐧𝐚𝐫𝐞 𝐭𝐫𝐚 *${remaining}*.`
    }, { quoted: m });
  }

  if (now - user.lastRapina < COOLDOWN) {
    const remaining = msToTime(COOLDOWN - (now - user.lastRapina));
    return conn.sendMessage(m.chat, { 
      text: `⏳ 𝐏𝐮𝐨𝐢 𝐟𝐚𝐫𝐞 𝐮𝐧𝐚 𝐫𝐚𝐩𝐢𝐧𝐚 𝐨𝐠𝐧𝐢 𝟏𝟎 𝐦𝐢𝐧𝐮𝐭𝐢.\n𝐑𝐢𝐩𝐫𝐨𝐯𝐚 𝐭𝐫𝐚 *${remaining}*.` 
    }, { quoted: m });
  }

  user.lastRapina = now;

  const targets = [
    { nome: "🏪 𝐍𝐞𝐠𝐨𝐳𝐢𝐨", successo: 0.7, min: 500, max: 2000 },
    { nome: "🚛 𝐏𝐨𝐫𝐭𝐚𝐯𝐚𝐥𝐨𝐫𝐢", successo: 0.5, min: 2000, max: 5000 },
    { nome: "🏦 𝐁𝐚𝐧𝐜𝐚", successo: 0.3, min: 5000, max: 12000 }
  ];

  const target = targets[Math.floor(Math.random() * targets.length)];
  const esito = Math.random();


  if (esito < target.successo) {
    const guadagno = Math.floor(Math.random() * (target.max - target.min + 1)) + target.min;
    user.money += guadagno;

    return conn.sendMessage(m.chat, {
      text: `💣 𝐑𝐀𝐏𝐈𝐍𝐀 𝐑𝐈𝐔𝐒𝐂𝐈𝐓𝐀!\n\n🎯 𝐎𝐛𝐛𝐢𝐞𝐭𝐭𝐢𝐯𝐨: ${target.nome}\n💰 𝐁𝐨𝐭𝐭𝐢𝐧𝐨 𝐫𝐢𝐜𝐚𝐯𝐚𝐭𝐨: *${guadagno}€*\n\n🔥 𝐒𝐞𝐢 𝐬𝐜𝐚𝐩𝐩𝐚𝐭𝐨 𝐬𝐞𝐧𝐳𝐚 𝐥𝐚𝐬𝐜𝐢𝐚𝐫𝐞 𝐭𝐫𝐚𝐜𝐜𝐞!`
    }, { quoted: m });
  }


  if (esito > 0.9) {
    user.arrestatoFino = now + BLOCCO_ARRESTO;

    return conn.sendMessage(m.chat, {
      text: `🚨 𝐀𝐑𝐑𝐄𝐒𝐓𝐀𝐓𝐎!\n\n𝐋𝐚 𝐩𝐨𝐥𝐢𝐳𝐢𝐚 𝐭𝐢 𝐡𝐚 𝐛𝐞𝐜��𝐚𝐭𝐨 𝐝𝐮𝐫𝐚𝐧𝐭𝐞 𝐥𝐚 𝐫𝐚𝐩𝐢𝐧𝐚 𝐚𝐥𝐥𝐚 ${target.nome}.\n\n⛓️ 𝐏𝐞𝐫 𝟐𝟎 𝐦𝐢𝐧𝐮𝐭𝐢 𝐬𝐚𝐫𝐚𝐢 𝐢𝐧 𝐜𝐚𝐫𝐜𝐞𝐫𝐞 𝐞 𝐧𝐨𝐧 𝐩𝐨𝐭𝐫𝐚𝐢 𝐟𝐚𝐫𝐞 𝐚𝐥𝐭𝐫𝐞 𝐫𝐚𝐩𝐢𝐧𝐞`
    }, { quoted: m });
  }


  const multa = Math.floor(user.bank * 0.3);
  user.bank = Math.max(0, user.bank - multa);

  return conn.sendMessage(m.chat, {
    text: `🚔 𝐑𝐀𝐏𝐈𝐍𝐀 𝐅𝐀𝐋𝐋𝐈𝐓𝐀!\n\n🎯 𝐎𝐛𝐛𝐢𝐞𝐭𝐭𝐢𝐯𝐨: ${target.nome}\n💸 𝐋𝐚 𝐩𝐨𝐥𝐢𝐳𝐢𝐚 𝐭𝐢 𝐡𝐚 𝐟𝐚𝐭𝐭𝐨 𝐮𝐧𝐚 𝐦𝐮𝐥𝐭𝐚 𝐝𝐢 *${multa}€*.\n\n𝐏𝐫𝐨𝐬𝐬𝐢𝐦𝐚 𝐯𝐨𝐥𝐭𝐚 𝐩𝐢𝐚𝐧𝐢𝐟𝐢𝐜𝐚 𝐦𝐞𝐠𝐥𝐢𝐨 𝐥𝐚 𝐫𝐚𝐩𝐢𝐧𝐚...`
  }, { quoted: m });
}

handler.command = /^rapina$/i;
handler.tags = ['rpg'];
handler.help = ['rapina'];

export default handler;

function msToTime(duration) {
  let minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  let seconds = Math.floor((duration % (1000 * 60)) / 1000);
  return `${minutes}m ${seconds}s`;
}