//Plugin by Gab, Lucifero & 333 staff


const handler = async (m, {conn, text, usedPrefix, command}) => {
  let who;
  if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
  else who = m.chat;
  const user = global.db.data.users[who];
  if (!who) throw `tagga l'utente a cui rimuovere il premium.`;
  if (!user) throw `*☘️ Questo utente non è presente nel mio database*`;
  if (user.premiumTime === 0) throw '*questo utente non è premium*';
  const txt = text.replace('@' + who.split`@`[0], '').trim();

  user.premiumTime = 0;

  user.premium = false;

  const textdelprem = `*l' utente @${who.split`@`[0]} non è più premium 👑*`;
  m.reply(textdelprem, null, {mentions: conn.parseMention(textdelprem)});
};
handler.help = ['𝐝𝐞𝐥𝐩𝐫𝐞𝐦 @𝐮𝐬𝐞𝐫'];
handler.tags = ['owner'];
handler.command = /^(remove|-|del)premium$/i;
handler.group = true;
handler.prems = true;
export default handler;
