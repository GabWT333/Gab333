const handler = async (m, {conn, args}) => {
  const wm = 'defaultWatermark'; // Define wm with an appropriate value
  const text = args.slice(1).join(' ');
  const who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
  conn.sendFile(m.chat, global.API('https://some-random-api.com', '/canvas/its-so-stupid', {
    avatar: await conn.profilePictureUrl(who, 'image').catch((_) => 'https://telegra.ph/file/24fa902ead26340f3df2c.png'),
    dog: text || 'im+stupid',
  }), 'error.png', `*@${wm}*`, m);
};
handler.help = ['stupida', 'iss', 'stupido'];
handler.tags = ['maker'];
handler.command = /^(stupida|iss|stupido)$/i;
export default handler;