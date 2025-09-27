const handler = async (m, { conn, usedPrefix }) => {
  const sender = m.sender;
  const userData = global.db.data.users[sender];

  if (!userData) {
    return conn.reply(m.chat, 'Errore: Utente specificato non trovato.', m);
  }

  // Comando per eliminare Instagram
  if (/^(\D|_)?eliminaig/i.test(m.text)) {
    if (!userData.instagram) {
      return conn.reply(
        m.chat,
        `ⓘ Assicurati di configurare il tuo nome utente Instagram con ${usedPrefix}setig prima di continuare.`,
        null,
        { quoted: m }
      );
    }

    userData.instagram = undefined;
    return conn.reply(
      m.chat,
      'ⓘ Nome Instagram eliminato con successo dal tuo profilo utente.',
      null,
      { quoted: m }
    );
  }

  // Comando per impostare Instagram
  if (/^(\D|_)?setig/i.test(m.text)) {
    const parts = m.text.trim().split(' ');
    const instaName = parts[1];

    if (!instaName) {
      return conn.reply(
        m.chat,
        'ⓘ Usa .setig <nomeutente> per impostare Instagram oppure .eliminaig per rimuoverlo.',
        null,
        { quoted: m }
      );
    }

    userData.instagram = instaName.toLowerCase();
    return conn.reply(
      m.chat,
      `ⓘ Hai impostato con successo il tuo nome Instagram come *${userData.instagram}*`,
      null,
      { quoted: m }
    );
  }
};

handler.command = /^(setig|eliminaig)$/i;
export default handler;