//Codice di menu-audio.js

//Plugin fatto da 333 Staff.
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
        'name': "𝐌𝐄𝐍𝐔 𝐀𝐔𝐃𝐈𝐎 🎵",
        'jpegThumbnail': await (await fetch("https://qu.ax/JKCXP.jpg")).buffer()
      }
    },
    'participant': "0@s.whatsapp.net"
  };

 let _0x2aa101 = 
`╭─────────╮ 
┃ 🎵 𝐌𝐄𝐍𝐔 𝐀𝐔𝐃𝐈𝐎 𝐃𝐈\n┃ ꙰  𝟥𝟥𝟥 𝔹𝕆𝕋  ꙰
┃━━━━━━━━━━━━━━ 
┃⮕ ${_0x3f73c1}𝐩𝐥𝐚𝐲
┃⮕ ${_0x3f73c1}𝐩𝐥𝐚𝐲𝐥𝐢𝐬𝐭
┃⮕ ${_0x3f73c1}𝐜𝐮𝐫
┃⮕ ${_0x3f73c1}𝐚𝐮𝐝𝐢𝐨 (testo)
┃⮕ ${_0x3f73c1}𝐛𝐚𝐬𝐬
┃⮕ ${_0x3f73c1}𝐛𝐥𝐨𝐰𝐧
┃⮕ ${_0x3f73c1}𝐝𝐞𝐞𝐩
┃⮕ ${_0x3f73c1}𝐞𝐚𝐫𝐫𝐚𝐩𝐞
┃⮕ ${_0x3f73c1}𝐟𝐚𝐬𝐭
┃⮕ ${_0x3f73c1}𝐟𝐚𝐭
┃⮕ ${_0x3f73c1}𝐧𝐢𝐠𝐡𝐭𝐜𝐨𝐫𝐞
┃⮕ ${_0x3f73c1}𝐫𝐞𝐯𝐞𝐫𝐬𝐞
┃⮕ ${_0x3f73c1}𝐫𝐨𝐛𝐨𝐭
┃⮕ ${_0x3f73c1}𝐬𝐦𝐨𝐨𝐭𝐡
┃⮕ ${_0x3f73c1}𝐬𝐥𝐨𝐰
┃⮕ ${_0x3f73c1}𝐜𝐡𝐢𝐩𝐦𝐮𝐧𝐤
┃⮕ ${_0x3f73c1}𝐞𝐜𝐡𝐨
┃⮕ ${_0x3f73c1}𝐯𝐢𝐛𝐫𝐚𝐭𝐨
┃⮕ ${_0x3f73c1}𝐫𝐞𝐯𝐞𝐫𝐛
┃⮕ ${_0x3f73c1}𝐝𝐢𝐬𝐭𝐨𝐫𝐭
┃⮕ ${_0x3f73c1}𝐜𝐡𝐢𝐩
━━━━━━━━━━━━━━
> 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚𝐝 𝐮𝐧 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐯𝐨𝐜𝐚𝐥𝐞 𝐜𝐨𝐧 𝐥’𝐞𝐟𝐟𝐞𝐭𝐭𝐨 𝐜𝐡𝐞 𝐝𝐞𝐬𝐢𝐝𝐞𝐫𝐢 𝐮𝐬𝐚𝐫𝐞.
╰─────────╯

  `.trim();

  _0x542b94.sendMessage(_0x512ed3.chat, { text: _0x2aa101 }, { quoted: _0x6bd16e });
};

handler.help = ["menu"];
handler.tags = ["menu"];
handler.command = /^(menuaudio)$/i;

export default handler;