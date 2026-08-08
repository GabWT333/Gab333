//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn }) => {
  const users = global.db.data.users;
  if (!users[m.sender]) users[m.sender] = {};

  if (!users[m.sender].nomeinsta || users[m.sender].nomeinsta === '') {
    return conn.sendMessage(m.chat, { text: '❌ Non hai un Instagram impostato!' }, { quoted: m });
  }

  users[m.sender].nomeinsta = '';

  return conn.sendMessage(m.chat, { text: '✅ Il tuo Instagram è stato rimosso correttamente!' }, { quoted: m });
};

handler.help = ['removeig'];
handler.tags = ['fun'];
handler.command = ['removeig', 'rimuoviig', 'delig'];

export default handler;

