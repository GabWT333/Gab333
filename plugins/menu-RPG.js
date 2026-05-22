//Plugin by Gab, Lucifero & 333 staff





import 'os';
import 'util';
import 'human-readable';
import '@realvare/baileys';
import 'fs';
import 'perf_hooks';

let handler = async (_0x512ed3, { conn: _0x542b94, usedPrefix: _0x3f73c1 }) => {
  const { welcome: _0x16d809, detect: _0x4c3a9f } = global.db.data.chats[_0x512ed3.chat];
  let _0x5bfb0b = _0x512ed3.quoted ? _0x512ed3.quoted.sender : _0x512ed3.mentionedJid && _0x512ed3.mentionedJid[0] ? _0x512ed3.mentionedJid[0] : _0x512ed3.fromMe ? _0x542b94.user.jid : _0x512ed3.sender;
  const _0x197a8a = (await _0x542b94.profilePictureUrl(_0x5bfb0b, "image").catch(_0x2cb040 => null)) || "./src/avatar_contact.png";

  let _0x53e6f1;
  if (_0x197a8a !== "./src/avatar_contact.png") {
    _0x53e6f1 = await (await fetch(_0x197a8a)).buffer();
  } else {
    _0x53e6f1 = await (await fetch("https://qu.ax/DQsgr.png")).buffer();
  }

  let _0x6bd16e = {
    'key': {
      'participants': "0@s.whatsapp.net",
      'fromMe': false,
      'id': "Halo"
    },
    'message': {
      'locationMessage': {
        'name': "𝐌𝚵𝐍𝐔 𝐑𝐏𝐆 🎰",
        'jpegThumbnail': await (await fetch("https://qu.ax/JKCXP.jpg")).buffer()
      }
    },
    'participant': "0@s.whatsapp.net"
  };

 let _0x2aa101 = 
`╭─────────╮ 
┃ 🎰 𝐌𝐄𝐍𝐔 𝐑𝐏𝐆 𝐃𝐈\n┃ ꙰  𝟥𝟥𝟥 𝔹𝕆𝕋  ꙰
┃━━━━━━━━━━━━━━ 
┃⮕ ${_0x3f73c1}𝐬𝐨𝐫𝐭𝐞 𝐭𝐞𝐬𝐭𝐚/𝐜𝐫𝐨𝐜𝐞
┃⮕ ${_0x3f73c1}𝐬𝐥𝐨𝐭
┃⮕ ${_0x3f73c1}𝐩𝐨𝐫𝐭𝐚𝐟𝐨𝐠𝐥𝐢𝐨
┃⮕ ${_0x3f73c1}𝐩𝐚𝐠𝐡𝐞𝐭𝐭𝐚
┃⮕ ${_0x3f73c1}𝐝𝐞𝐩𝐨𝐬𝐢𝐭𝐚
┃⮕ ${_0x3f73c1}𝐩𝐫𝐞𝐥𝐞𝐯𝐚
┃⮕ ${_0x3f73c1}𝐫𝐨𝐮𝐥𝐞𝐭𝐭𝐞
┃⮕ ${_0x3f73c1}𝐫𝐮𝐛𝐚
┃⮕ ${_0x3f73c1}𝐛𝐨𝐧𝐢𝐟𝐢𝐜𝐨
┃⮕ ${_0x3f73c1}𝐢𝐛𝐚𝐧
┃⮕ ${_0x3f73c1}𝐜𝐚𝐥𝐜𝐢𝐨𝐬𝐜𝐨𝐦𝐦𝐞𝐬𝐬𝐞
┃⮕ ${_0x3f73c1}𝐫𝐮𝐨𝐭𝐚
┃⮕ ${_0x3f73c1}𝐩𝐫𝐞𝐦𝐢𝐨𝐭𝐨𝐩
┃⮕ ${_0x3f73c1}𝐪𝐮𝐢𝐳
┃⮕ ${_0x3f73c1}𝐜𝐨𝐦𝐩𝐫𝐚 / 𝐯𝐞𝐧𝐝𝐢
┃⮕ ${_0x3f73c1}𝐥𝐚𝐯𝐨𝐫𝐚
┃⮕ ${_0x3f73c1}𝐩𝐫𝐨𝐬𝐭𝐢𝐭𝐮𝐭𝐚
┃⮕ ${_0x3f73c1}𝐜𝐨𝐥𝐩𝐨
┃⮕ ${_0x3f73c1}𝐦𝐚𝐠𝐚𝐳𝐳𝐢𝐧𝐨
┃⮕ ${_0x3f73c1}𝐫𝐚𝐧𝐤
┃⮕ ${_0x3f73c1}𝐫𝐚𝐩𝐢𝐧𝐚
┃⮕ ${_0x3f73c1}𝐬𝐩𝐚𝐫𝐚
┃⮕ ${_0x3f73c1}𝐝𝐮𝐞𝐥𝐥𝐨
┃⮕ ${_0x3f73c1}𝐜𝐚𝐬𝐢𝐧𝐨
━━━━━━━━━━━━━━
> 𝐩𝐞𝐫 𝐪𝐮𝐚𝐥𝐬𝐢𝐚𝐬𝐢 𝐩𝐫𝐨𝐛𝐥𝐞𝐦𝐚\n> 𝐮𝐬𝐚𝐫𝐞 𝐢𝐥 𝐭𝐚𝐬𝐭𝐨 ’’.𝐭𝐢𝐜𝐤𝐞𝐭’’\n> 𝐩𝐞𝐫 𝐬𝐞𝐠𝐧𝐚𝐥𝐚𝐫𝐥𝐨 𝐚𝐥𝐥𝐨 𝐬𝐭𝐚𝐟𝐟.
╰─────────╯

  `.trim();

  _0x542b94.sendMessage(_0x512ed3.chat, { text: _0x2aa101 }, { quoted: _0x6bd16e });
};

handler.help = ["menu"];
handler.tags = ["menu"];
handler.command = /^(rpg)$/i;

export default handler;