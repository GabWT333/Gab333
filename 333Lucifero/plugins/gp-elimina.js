//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn, usedPrefix, command }) => {

  if (!m.quoted) return;

  try {
    let key = {};

    try {
      key.remoteJid = m.quoted ? m.quoted.fakeObj.key.remoteJid : m.key.remoteJid;
      key.fromMe = m.quoted ? m.quoted.fakeObj.key.fromMe : m.key.fromMe;
      key.id = m.quoted ? m.quoted.fakeObj.key.id : m.key.id;
      key.participant = m.quoted ? m.quoted.fakeObj.participant : m.key.participant;
    } catch (e) {
      console.error(e);
    }

    await conn.sendMessage(m.chat, { delete: key });
    await conn.sendMessage(m.chat, { delete: m.key });

  } catch (err) {
    console.error(err);
    try {
      await conn.sendMessage(m.chat, { delete: m.quoted.vM.key });
      await conn.sendMessage(m.chat, { delete: m.key });
    } catch (e) {
      console.error('Errore anche nel catch secondario:', e);
    }
  }
};

handler.help = ['𝐝𝐞𝐥'];
handler.tags = ['admin'];
handler.command = /^del(ete)?$/i;
handler.group = true; 
handler.admin = true;
handler.botAdmin = true;

export default handler;