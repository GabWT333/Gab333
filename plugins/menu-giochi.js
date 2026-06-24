//Codice di menu-giochi.js

//Codice di menu-giochi.js

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
        'name': "𝐌𝚵𝐍𝐔 𝐆𝐑𝐔𝐏𝐏Ꮻ 🎮",
        'jpegThumbnail': await (await fetch("https://qu.ax/JKCXP.jpg")).buffer()
      }
    },
    'participant': "0@s.whatsapp.net"
  };

  let _0x2aa101 =
 `╭─────────╮
┃ 🎮 𝐌𝐄𝐍𝐔 𝐆𝐈𝐎𝐂𝐇𝐈 𝐃𝐈\n┃ ꙰  𝟥𝟥𝟥 𝔹𝕆𝕋  ꙰
┃━━━━━━━━━━━━━━

╭ *𝐅𝐔𝐍𝐍𝐘*
┃⮕ ${_0x3f73c1}𝐢𝐦𝐩𝐢𝐜𝐜𝐚𝐭𝐨
┃⮕ ${_0x3f73c1}𝐭𝐫𝐢𝐬
┃⮕ ${_0x3f73c1}𝐮𝐧𝐨
┃⮕ ${_0x3f73c1}𝐛𝐚𝐧𝐝𝐢𝐞𝐫𝐚
┃⮕ ${_0x3f73c1}𝐦𝐚𝐬𝐜𝐨𝐭𝐭𝐞
┃⮕ ${_0x3f73c1}𝐥𝐚𝐛𝐢𝐫𝐢𝐧𝐭𝐨
┃⮕ ${_0x3f73c1}𝐛𝐨𝐦𝐛𝐚
┃⮕ ${_0x3f73c1}𝐬𝐜𝐟 (sasso, carta, forbici)
┃⮕ ${_0x3f73c1}𝐬𝐜𝐫𝐚𝐦𝐛𝐥𝐞
┃⮕ ${_0x3f73c1}𝐛𝐚𝐬𝐤𝐞𝐭
┃⮕ ${_0x3f73c1}𝐫𝐢𝐠𝐨𝐫𝐞
┃⮕ ${_0x3f73c1}𝐬𝐜𝐫𝐞𝐞𝐧𝐬𝐡𝐨𝐭
┃⮕ ${_0x3f73c1}𝐬𝐜𝐫𝐞𝐞𝐧𝐬𝐡𝐨𝐭𝐠𝐩
┃⮕ ${_0x3f73c1}𝐜𝐚𝐧𝐭𝐚

╭ *𝐇𝐀𝐑𝐃*
┃⮕ ${_0x3f73c1}𝐥𝐞𝐬𝐛𝐢𝐜𝐚
┃⮕ ${_0x3f73c1}𝐟𝐫𝐨𝐜𝐢𝐨
┃⮕ ${_0x3f73c1}𝐠𝐚𝐲
┃⮕ ${_0x3f73c1}𝐩𝐮𝐭𝐭𝐚𝐧𝐚
┃⮕ ${_0x3f73c1}𝐩𝐨𝐫𝐜𝐚
┃⮕ ${_0x3f73c1}𝐩𝐨𝐫𝐜𝐨
┃⮕ ${_0x3f73c1}𝐚𝐥𝐜𝐨𝐥𝐢𝐳𝐳𝐚𝐭𝐨
┃⮕ ${_0x3f73c1}𝐧𝐞𝐠𝐫𝐨
┃⮕ ${_0x3f73c1}𝐬𝐛𝐢𝐫𝐫𝐨
┃⮕ ${_0x3f73c1}𝐟𝐢𝐠𝐚
┃⮕ ${_0x3f73c1}𝐩𝐞𝐧𝐞
┃⮕ ${_0x3f73c1}𝐝𝐢𝐭𝐚𝐥𝐢𝐧𝐨
┃⮕ ${_0x3f73c1}𝐬𝐞𝐠𝐚
┃⮕ ${_0x3f73c1}𝐥𝐞𝐜𝐜𝐚
┃⮕ ${_0x3f73c1}𝐥𝐞𝐜𝐜𝐨
┃⮕ ${_0x3f73c1}𝐭𝐞𝐭𝐭𝐞
┃⮕ ${_0x3f73c1}𝐛𝐨𝐭𝐭𝐢𝐠𝐥𝐢𝐚
┃⮕ ${_0x3f73c1}𝐨𝐛𝐛𝐥𝐢𝐠𝐨 / 𝐯𝐞𝐫𝐢𝐭𝐚̀
┃⮕ ${_0x3f73c1}𝐦𝐨𝐫𝐝𝐢
┃⮕ ${_0x3f73c1}𝐢𝐧𝐬𝐮𝐥𝐭𝐚

╭ *𝐋𝐎𝐕𝐄*
┃⮕ ${_0x3f73c1}𝐚𝐝𝐨𝐭𝐭𝐚
┃⮕ ${_0x3f73c1}𝐟𝐚𝐦𝐢𝐠𝐥𝐢𝐚
┃⮕ ${_0x3f73c1}𝐬𝐩𝐨𝐬𝐚
┃⮕ ${_0x3f73c1}𝐛𝐚𝐜𝐢𝐚
┃⮕ ${_0x3f73c1}𝐚𝐛𝐛𝐫𝐚𝐜𝐜𝐢𝐚
┃⮕ ${_0x3f73c1}𝐜𝐫𝐮𝐬𝐡
┃⮕ ${_0x3f73c1}𝐭𝐫𝐨𝐯𝐚𝐟𝐢𝐝
┃⮕ ${_0x3f73c1}𝐨𝐝𝐢𝐨
┃⮕ ${_0x3f73c1}𝐜𝐥𝐚𝐧

╭ *𝐒𝐓𝐑𝐔𝐌𝐄𝐍𝐓𝐈*
┃⮕ ${_0x3f73c1}𝐜𝐚𝐥𝐞𝐧𝐝𝐚𝐫𝐢𝐨 (𝐜𝐢𝐭𝐭𝐚̀)
┃⮕ ${_0x3f73c1}𝐬𝐜𝐫𝐞𝐞𝐧
┃⮕ ${_0x3f73c1}𝐞𝐦𝐨𝐣𝐢𝐦𝐢𝐱
┃⮕ ${_0x3f73c1}𝐬𝐞𝐭𝐢𝐠
┃⮕ ${_0x3f73c1}𝐬𝐭𝐚𝐭𝐬𝐠𝐢𝐨𝐫𝐧𝐚𝐥𝐢𝐞𝐫𝐞
┃⮕ ${_0x3f73c1}𝐫𝐢𝐦𝐮𝐨𝐯𝐢𝐢𝐠
┃⮕ ${_0x3f73c1}𝐭𝐨𝐩𝐛𝐞𝐬𝐭𝐞𝐦𝐦𝐢𝐞
┃⮕ ${_0x3f73c1}𝐭𝐨𝐩𝐫𝐢𝐜𝐜𝐡𝐢
┃⮕ ${_0x3f73c1}𝐭𝐫𝐚𝐝𝐮𝐜𝐢
┃⮕ ${_0x3f73c1}𝐧𝐨𝐭𝐚
┃⮕ ${_0x3f73c1}𝐬𝐜𝐚𝐫𝐢𝐜𝐚 <𝐥𝐢𝐧𝐤 𝐭𝐢𝐤𝐭𝐨𝐤>
┃⮕ ${_0x3f73c1}𝐫𝐢𝐜𝐞𝐭𝐭𝐚
┃⮕ ${_0x3f73c1}𝐪𝐮𝐢𝐳
┃⮕ ${_0x3f73c1}𝐪𝐮𝐢𝐳𝐩𝐚𝐭𝐞𝐧𝐭𝐞
┃⮕ ${_0x3f73c1}𝐜𝐚𝐥𝐜𝐢𝐨𝐪𝐮𝐢𝐳

╭ *𝐑𝐀𝐍𝐃𝐎𝐌*
┃⮕ ${_0x3f73c1}𝐢𝐝𝐞𝐧𝐭𝐢𝐭𝐚
┃⮕ ${_0x3f73c1}𝐭𝐞𝐥𝐞𝐟𝐨𝐧𝐨
┃⮕ ${_0x3f73c1}𝐬𝐩𝐞𝐜𝐜𝐡𝐢𝐨
┃⮕ ${_0x3f73c1}𝐟𝐮𝐬𝐢𝐨𝐧𝐞
┃⮕ ${_0x3f73c1}𝐝𝐨𝐱
┃⮕ ${_0x3f73c1}𝐳𝐢𝐳𝐳𝐚𝐧𝐢𝐚
┃⮕ ${_0x3f73c1}𝐛𝐚𝐫𝐳𝐞𝐥𝐥𝐞𝐭𝐭𝐚
┃⮕ ${_0x3f73c1}𝐬𝐚𝐥𝐮𝐭𝐚
┃⮕ ${_0x3f73c1}𝐬𝐞𝐠𝐫𝐞𝐭𝐨
┃⮕ ${_0x3f73c1}𝐛𝐨𝐧𝐤
━━━━━━━━━━━━━━
> 𝐩𝐞𝐫 𝐪𝐮𝐚𝐥𝐬𝐢𝐚𝐬𝐢 𝐩𝐫𝐨𝐛𝐥𝐞𝐦𝐚\n> 𝐮𝐬𝐚𝐫𝐞 𝐢𝐥 𝐭𝐚𝐬𝐭𝐨 ’’.𝐭𝐢𝐜𝐤𝐞𝐭’’\n> 𝐩𝐞𝐫 𝐬𝐞𝐠𝐧𝐚𝐥𝐚𝐫𝐥𝐨 𝐚𝐥𝐥𝐨 𝐬𝐭𝐚𝐟𝐟.
╰─────────╯
  `.trim();

  _0x542b94.sendMessage(_0x512ed3.chat, { text: _0x2aa101 }, { quoted: _0x6bd16e });
};

handler.help = ["menu"];
handler.tags = ["menu"];
handler.command = /^(giochi)$/i;

export default handler;