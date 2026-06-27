//Plugin by Gab, Lucifero & 333 staff

import fetch from 'node-fetch';

let handler = async (m, { conn }) => {
  const users = global.db.data.users;

  const who = m.quoted 
    ? m.quoted.sender 
    : m.mentionedJid && m.mentionedJid[0] 
    ? m.mentionedJid[0] 
    : m.sender;

  if (!users[who]) {
    users[who] = { messaggi: 0, warn: 0, nomeinsta: '', blasphemy: 0, bank: 0 };
  }

  const u = users[who];
  const tag = '@' + who.split('@')[0];
  const nome = u.name || conn.getName?.(who) || tag;

  const profilePic = await conn.profilePictureUrl(who, 'image').catch(() => null);
  const ppBuffer = profilePic 
    ? await (await fetch(profilePic)).buffer() 
    : await (await fetch('https://telegra.ph/file/8ca14ef9fa43e99d1d196.jpg')).buffer();

  const fake = {
    key: {
      participants: '0@s.whatsapp.net',
      fromMe: false,
      id: '333Info'
    },
    message: {
      locationMessage: {
        name: `𝐈𝐧𝐟𝐨 𝐝𝐢 ${nome}`,
        jpegThumbnail: ppBuffer.toString('base64'),
        vcard: 'BEGIN:VCARD\nVERSION:3.0\nN:;Info;;;\nFN:Info\nEND:VCARD'
      }
    },
    participant: '0@s.whatsapp.net'
  }

  const insta = u.nomeinsta 
    ? `🤳🏻 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦: @${u.nomeinsta}` 
    : '🤳🏻 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦: 𝐍𝐨𝐧 𝐢𝐦𝐩𝐨𝐬𝐭𝐚𝐭𝐨';

  const warnEmoji = u.warn === 0 ? '👌' : u.warn === 1 ? '⚠️' : '‼️';
  const curse = u.blasphemy || 0;

  const regInfo = u.registered
    ? `┃🧾 𝐍𝐨𝐦𝐞: ${u.nome}\n┃🎂 𝐄𝐭𝐚̀: ${u.eta}\n┃📍 𝐂𝐢𝐭𝐭𝐚̀: ${u.citta}`
    : `┃🧾 𝐑𝐞𝐠𝐢𝐬𝐭𝐫𝐚𝐳𝐢𝐨𝐧𝐞: ❌ 𝐍𝐨𝐧 𝐞𝐟𝐟𝐞𝐭𝐭𝐮𝐚𝐭𝐚`;

  const messageText = `📌 𝐈𝐧𝐟𝐨 𝐔𝐭𝐞𝐧𝐭𝐞
╭─────────╮
┃👤 𝐔𝐭𝐞𝐧𝐭𝐞: ${tag}
┃
${regInfo}
┃
┃💬 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢: ${u.messaggi || 0}
┃
┃💰 𝐁𝐚𝐧𝐜𝐚: ${u.bank || 0}€
┃
┃${warnEmoji} 𝐖𝐚𝐫𝐧: ${u.warn || 0} / 3
┃
┃💢 𝐁𝐞𝐬𝐭𝐞𝐦𝐦𝐢𝐞: ${curse}
┃
┃${insta}
╰─────────╯`;

  await conn.sendMessage(m.chat, {
    text: messageText,
    mentions: [who],
    buttons: [
      { buttonId: '.statsgiornaliere', buttonText: { displayText: '📊 Statistiche giornaliere' }, type: 1 }
    ]
  }, { quoted: fake });
};

handler.command = ['info', 'bal'];
handler.tags = ['info'];
handler.help = ['infouser'];

export default handler;