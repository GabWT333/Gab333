//Codice di menu-admin.js

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
        'name': "𝐌𝚵𝐍𝐔 𝚲𝐃𝐌𝕀𝐍 👑",
        'jpegThumbnail': await (await fetch("https://qu.ax/JKCXP.jpg")).buffer()
      }
    },
    'participant': "0@s.whatsapp.net"
  };

 let _0x2aa101 = 
`╭─────────╮ 
┃ 👑 𝐌𝐄𝐍𝐔 𝐀𝐃𝐌𝐈𝐍 𝐃𝐈\n┃ ꙰  𝟥𝟥𝟥 𝔹𝕆𝕋  ꙰
┃━━━━━━━━━━━━━━ 
┃⮕ ${_0x3f73c1}𝐩𝐫𝐨𝐦𝐮𝐨𝐯𝐢 / 𝐩
┃⮕ ${_0x3f73c1}𝐫𝐞𝐭𝐫𝐨𝐜𝐞𝐝𝐢 / 𝐫
┃⮕ ${_0x3f73c1}𝐰𝐚𝐫𝐧 / 𝐮𝐧𝐰𝐚𝐫𝐧
┃⮕ ${_0x3f73c1}𝐮𝐧𝐰𝐚𝐫𝐧𝐥𝐢𝐧𝐤
┃⮕ ${_0x3f73c1}𝐡𝐢𝐝𝐞𝐭𝐚𝐠 / 𝐭𝐚𝐠
┃⮕ ${_0x3f73c1}𝐭𝐚𝐠𝐚𝐥𝐥
┃⮕ ${_0x3f73c1}𝐚𝐩𝐞𝐫𝐭𝐨 / 𝐚𝐩𝐫𝐢
┃⮕ ${_0x3f73c1}𝐜𝐡𝐢𝐮𝐬𝐨 / 𝐜𝐡𝐢𝐮𝐝𝐢
┃⮕ ${_0x3f73c1}𝐬𝐞𝐭𝐰𝐞𝐥𝐜𝐨𝐦𝐞
┃⮕ ${_0x3f73c1}𝐬𝐞𝐭𝐛𝐲𝐞
┃⮕ ${_0x3f73c1}𝐢𝐧𝐚𝐭𝐭𝐢𝐯𝐢
┃⮕ ${_0x3f73c1}𝐢𝐧𝐯𝐢𝐭𝐚
┃⮕ ${_0x3f73c1}𝐤𝐢𝐜𝐤/𝐩𝐮𝐟𝐟𝐨/𝐬𝐩𝐚𝐫𝐢𝐬𝐜𝐢
┃⮕ ${_0x3f73c1}𝐝𝐬
┃⮕ ${_0x3f73c1}𝐥𝐨𝐠𝐚𝐝𝐦𝐢𝐧
┃⮕ ${_0x3f73c1}𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞
┃⮕ ${_0x3f73c1}𝐭𝐢𝐜𝐤𝐞𝐭
┃⮕ ${_0x3f73c1}𝐚𝐝𝐝𝐩𝐚𝐫𝐨𝐥𝐞
┃⮕ ${_0x3f73c1}𝐥𝐢𝐬𝐭𝐚𝐩𝐚𝐫𝐨𝐥𝐞
┃⮕ ${_0x3f73c1}𝐝𝐞𝐥𝐩𝐚𝐫𝐨𝐥𝐞
┃⮕ ${_0x3f73c1}𝐚𝐝𝐝𝐦𝐨𝐝 @user
┃⮕ ${_0x3f73c1}𝐝𝐞𝐥𝐦𝐨𝐝 @user
┃⮕ ${_0x3f73c1}𝐦𝐨𝐝𝐬
┃⮕ ${_0x3f73c1}𝐩𝐟𝐩 @𝐭𝐚𝐠
┃⮕ ${_0x3f73c1}𝐫𝐞𝐢𝐦𝐩𝐨𝐬𝐭𝐚 (𝐥𝐢𝐧𝐤 𝐠𝐫𝐮𝐩𝐩𝐨)
┃⮕ ${_0x3f73c1}𝐩𝐢𝐧 (𝐟𝐢𝐬𝐬𝐚 𝐮𝐧 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨)
┃⮕ ${_0x3f73c1}𝐮𝐧𝐩𝐢𝐧 (𝐭𝐨𝐠𝐥𝐢𝐞 𝐮𝐧 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨\n┃ 𝐟𝐢𝐬𝐬𝐚𝐭𝐨)
┃⮕ ${_0x3f73c1}𝐜𝐥𝐨𝐬𝐞𝐭𝐢𝐦𝐞 (𝐦𝐢𝐧𝐮𝐭𝐢)
┃⮕ ${_0x3f73c1}𝐬𝐢𝐦𝐮𝐥𝐚
┃⮕ ${_0x3f73c1}𝐦𝐮𝐭𝐚 (@)
┃⮕ ${_0x3f73c1}𝐬𝐦𝐮𝐭𝐚 (@)
┃⮕ ${_0x3f73c1}𝐟𝐫𝐞𝐞𝐳𝐞𝐠𝐩
┃⮕ ${_0x3f73c1}𝐚𝐫𝐫𝐞𝐬𝐭𝐚
┃⮕ ${_0x3f73c1}𝐠𝐢𝐮𝐫𝐢𝐚
┃⮕ ${_0x3f73c1}𝐜𝐥𝐞𝐚𝐫
┃⮕ ${_0x3f73c1}𝐰𝐦
┃⮕ ${_0x3f73c1}𝐬𝐭𝐚𝐭𝐬𝐠𝐢𝐨𝐫𝐧𝐚𝐥𝐢𝐞𝐫𝐞
┃⮕ ${_0x3f73c1}𝐫𝐢𝐚𝐬𝐬𝐮𝐧𝐭𝐨
┃⮕ ${_0x3f73c1}𝐟𝐚𝐤𝐞𝐧𝐮𝐤𝐞
┃⮕ ${_0x3f73c1}𝐬
┃⮕ ${_0x3f73c1}𝐝𝐞𝐥
┃⮕ ${_0x3f73c1}𝐥𝐢𝐧𝐤
┃⮕ ${_0x3f73c1}𝐬𝐭𝐚𝐟𝐟
┃⮕ ${_0x3f73c1}𝐩𝐢𝐧𝐠
┃⮕ ${_0x3f73c1}𝐢𝐧𝐟𝐨𝐠𝐫𝐮𝐩𝐩𝐨
┃⮕ ${_0x3f73c1}𝐥𝐢𝐧𝐤𝐪𝐫
┃⮕ ${_0x3f73c1}𝐫𝐮𝐥𝐞𝐬 (𝐥𝐞𝐠𝐠𝐢 𝐥𝐞 𝐫𝐞𝐠𝐨𝐥𝐞)
┃⮕ ${_0x3f73c1}𝐛𝐢𝐨 (𝐢𝐦𝐩𝐨𝐬𝐭𝐚 𝐥𝐞 𝐫𝐞𝐠𝐨𝐥𝐞)
┃⮕ ${_0x3f73c1}𝐧𝐨𝐦𝐞 (𝐦𝐨𝐝𝐢𝐟𝐢𝐜𝐚 𝐧𝐨𝐦𝐞\n┃ 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨)
┃⮕ ${_0x3f73c1}𝐚𝐝𝐦𝐢𝐧𝐬 (𝐦𝐞𝐧𝐳𝐢𝐨𝐧𝐚 𝐭𝐮𝐭𝐭𝐢 𝐠𝐥𝐢\n┃ 𝐚𝐝𝐦𝐢𝐧)
━━━━━━━━━━━━━━
> 𝐩𝐞𝐫 𝐪𝐮𝐚𝐥𝐬𝐢𝐚𝐬𝐢 𝐩𝐫𝐨𝐛𝐥𝐞𝐦𝐚\n> 𝐮𝐬𝐚𝐫𝐞 𝐢𝐥 𝐭𝐚𝐬𝐭𝐨 ’’.𝐭𝐢𝐜𝐤𝐞𝐭’’\n> 𝐩𝐞𝐫 𝐬𝐞𝐠𝐧𝐚𝐥𝐚𝐫𝐥𝐨 𝐚𝐥𝐥𝐨 𝐬𝐭𝐚𝐟𝐟.
╰─────────╯

  `.trim();

  _0x542b94.sendMessage(_0x512ed3.chat, { text: _0x2aa101 }, { quoted: _0x6bd16e });
};

handler.help = ["menu"];
handler.tags = ["menu"];
handler.command = /^(admin)$/i;

export default handler;