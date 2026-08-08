//Plugin by Gab, Lucifero & 333 staff

async function handler(m, { conn }) {
  const users = global.db.data.users;
  if (!users[m.sender]) users[m.sender] = {};
  const user = users[m.sender];

  user.magazzino = user.magazzino || [];

  if (user.magazzino.length === 0) {
    return conn.sendMessage(m.chat, { 
      text: '📦 𝐈𝐥 𝐦𝐚𝐠𝐚𝐳𝐳𝐢𝐧𝐨 𝐞̀ 𝐯𝐮𝐨𝐭𝐨!' 
    }, { quoted: m });
  }

  let testo = `╭───────────╮
│ 📦 𝐌𝐀𝐆𝐀𝐙𝐙𝐈𝐍𝐎
│─────────────`;

  user.magazzino.forEach((item, index) => {
    testo += `
│
│ *${index + 1}. ${item.nome} x${item.quantità}*
│ 𝐕𝐚𝐥𝐨𝐫𝐞 𝐦𝐞𝐫𝐜𝐞: *${item.valore}€*
│`;

    if (index !== user.magazzino.length - 1) {
      testo += `─────────────`;
    }
  });

  testo += `
│
> 𝐔𝐬𝐚 𝐢𝐥 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 ’’.𝐯𝐞𝐧𝐝𝐢’’\n> 𝐩𝐞𝐫 𝐯𝐞𝐧𝐝𝐞𝐫𝐞 𝐭𝐮𝐭𝐭𝐚 𝐥𝐚 𝐦𝐞𝐫𝐜𝐞
╰───────────╯`;

  conn.sendMessage(m.chat, { text: testo }, { quoted: m });
}

handler.command = /^magazzino$/i;
handler.tags = ['rpg'];
handler.help = ['magazzino'];

export default handler;