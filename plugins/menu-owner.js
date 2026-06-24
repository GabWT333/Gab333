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
        'name': "𝐌𝚵𝐍𝐔 Ꮻ𝐖𝐍𝚵𝐑 🔐",
        'jpegThumbnail': await (await fetch("https://qu.ax/JKCXP.jpg")).buffer()
      }
    },
    'participant': "0@s.whatsapp.net"
  };

  let _0x2aa101 = 
`╭─────────╮
┃ 🔐 𝐌𝐄𝐍𝐔 𝐎𝐖𝐍𝐄𝐑 𝐃𝐈\n┃ ꙰  𝟥𝟥𝟥 𝔹𝕆𝕋  ꙰ 
┃━━━━━━━━━━━━━━
┃⮕ ${_0x3f73c1}𝐢𝐦𝐩𝐨𝐬𝐭𝐚𝐧𝐨𝐦𝐞
┃⮕ ${_0x3f73c1}𝐫𝐞𝐬𝐞𝐭𝐭𝐚𝐧𝐨𝐦𝐞
┃⮕ ${_0x3f73c1}𝐡𝐢𝐝𝐞𝐭𝐚𝐠𝐚𝐥𝐥
┃⮕ ${_0x3f73c1}𝐚𝐝𝐝𝐨𝐰𝐧𝐞𝐫
┃⮕ ${_0x3f73c1}𝐚𝐝𝐝𝐩𝐞𝐫𝐦𝐬
┃⮕ ${_0x3f73c1}𝐝𝐢𝐬𝐚𝐛𝐥𝐞𝐩𝐥
┃⮕ ${_0x3f73c1}𝐞𝐧𝐚𝐛𝐥𝐞𝐩𝐥
┃⮕ ${_0x3f73c1}𝐝𝐞𝐥𝐨𝐰𝐧𝐞𝐫
┃⮕ ${_0x3f73c1}𝐛𝐚𝐧𝐜𝐡𝐚𝐭
┃⮕ ${_0x3f73c1}𝐛𝐚𝐧𝐮𝐬𝐞𝐫 (@)
┃⮕ ${_0x3f73c1}𝐮𝐧𝐛𝐚𝐧𝐮𝐬𝐞𝐫 (@)
┃⮕ ${_0x3f73c1}𝐮𝐧𝐛𝐥𝐨𝐜𝐤 (@)
┃⮕ ${_0x3f73c1}𝐛𝐥𝐨𝐜𝐤 (@)
┃⮕ ${_0x3f73c1}𝐛𝐚𝐧𝐥𝐢𝐬𝐭
┃⮕ ${_0x3f73c1}𝐠𝐞𝐭𝐟𝐢𝐥𝐞
┃⮕ ${_0x3f73c1}𝐬𝐚𝐯𝐞𝐩𝐥𝐮𝐠𝐢𝐧
┃⮕ ${_0x3f73c1}𝐝𝐩 (𝐩𝐥𝐮𝐠𝐢𝐧)
┃⮕ ${_0x3f73c1}𝐠𝐞𝐭𝐩𝐥𝐮𝐠𝐢𝐧
┃⮕ ${_0x3f73c1}𝐞𝐝𝐢𝐭  𝐥𝐮𝐠𝐢𝐧
┃⮕ ${_0x3f73c1}𝐨𝐮𝐭
┃⮕ ${_0x3f73c1}𝐜𝐨𝐝𝐢𝐟𝐢𝐜𝐚
┃⮕ ${_0x3f73c1}𝐠𝐨𝐝𝐦𝐨𝐝𝐞
┃⮕ ${_0x3f73c1}𝐚𝐳𝐳𝐞𝐫𝐚(@)
┃⮕ ${_0x3f73c1}𝐚𝐠𝐠𝐢𝐮𝐧𝐠𝐢 (𝐧𝐮𝐦𝐞𝐫𝐨 𝐝𝐢 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢)
┃⮕ ${_0x3f73c1}𝐫𝐢𝐦𝐮𝐨𝐯𝐢 (𝐧𝐮𝐦𝐞𝐫𝐨 𝐝𝐢 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢)
┃⮕ ${_0x3f73c1}𝐝𝐞𝐥𝐩𝐫𝐞𝐦
┃⮕ ${_0x3f73c1}𝐝𝐢𝐚𝐠𝐧𝐨𝐬𝐢
┃⮕ ${_0x3f73c1}𝐢𝐬𝐩𝐞𝐳𝐢𝐨𝐧𝐚 <𝐥𝐢𝐧𝐤 𝐠𝐫𝐮𝐩𝐩𝐨>
┃⮕ ${_0x3f73c1}𝐬𝐞𝐭𝐩𝐩𝐛𝐨𝐭
┃⮕ ${_0x3f73c1}𝐥𝐨𝐜𝐤
┃⮕ ${_0x3f73c1}𝐣𝐨𝐢𝐧 (𝐥𝐢𝐧𝐤 𝐝𝐢 𝐮𝐧 𝐠𝐫𝐮𝐩𝐩𝐨)
┃⮕ ${_0x3f73c1}𝐠𝐫𝐮𝐩𝐩𝐢
┃⮕ ${_0x3f73c1}𝐥𝐢𝐬𝐭𝐩𝐥
┃⮕ ${_0x3f73c1}𝐚𝐝𝐦𝐢𝐧𝐚𝐥𝐥 
┃⮕ ${_0x3f73c1}𝐨𝐮𝐭𝐚𝐥𝐥
┃⮕ ${_0x3f73c1}𝐥𝐢𝐬𝐭𝐚𝐦𝐮𝐭𝐢
┃⮕ ${_0x3f73c1}𝐨𝐟𝐟𝐮𝐬𝐜𝐚
┃⮕ ${_0x3f73c1}𝐩𝐫𝐞𝐟𝐢𝐬𝐬𝐨
┃⮕ ${_0x3f73c1}𝐫𝐞𝐬𝐞𝐭𝐭𝐚𝐩𝐫𝐞𝐟𝐢𝐬𝐬𝐨
┃⮕ ${_0x3f73c1}𝐬𝐢𝐬𝐭𝐞𝐦𝐚
━━━━━━━━━━━━━━
> 𝐩𝐞𝐫 𝐪𝐮𝐚𝐥𝐬𝐢𝐚𝐬𝐢 𝐩𝐫𝐨𝐛𝐥𝐞𝐦𝐚\n> 𝐮𝐬𝐚𝐫𝐞 𝐢𝐥 𝐭𝐚𝐬𝐭𝐨 ’’.𝐭𝐢𝐜𝐤𝐞𝐭’’\n> 𝐩𝐞𝐫 𝐬𝐞𝐠𝐧𝐚𝐥𝐚𝐫𝐥𝐨 𝐚𝐥𝐥𝐨 𝐬𝐭𝐚𝐟𝐟.
╰─────────╯
  `.trim();

  _0x542b94.sendMessage(_0x512ed3.chat, { text: _0x2aa101 }, { quoted: _0x6bd16e });
};

handler.help = ["menu"];
handler.tags = ["menu"];
handler.command = /^(owner)$/i;
handler.rowner = true

export default handler;