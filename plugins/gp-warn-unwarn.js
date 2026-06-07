//Plugin by Gab, Lucifero & 333 staff

const time = async (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}
let handler = async (m, { conn, text, args, groupMetadata, usedPrefix, command }) => {
let reason = args.slice(1).join(' ') || 'non specificato\n┃ ma meritato'
if (command == 'warn' || command == "ammonisci") {
  let mention = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.quoted
  if (!mention) return m.reply('ⓘ 𝐌𝐞𝐧𝐳𝐢𝐨𝐧𝐚 𝐥𝐚 𝐩𝐞𝐫𝐬𝐨𝐧𝐚 𝐝𝐚 𝐰𝐚𝐫𝐧𝐚𝐫𝐞')
    let war = '2'
    let who;
if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : true;
else who = m.chat;
if (!who) return;
if (!(who in global.db.data.users)) {
global.db.data.users[who] = { warn: 0 };
}
let warn = global.db.data.users[who].warn;
    let user = global.db.data.users[who];
 let prova = {
      "key": {
        "participants": "0@s.whatsapp.net",
        "fromMe": false,
        "id": "Halo"
      },
      "message": {
        "locationMessage": {
          name: '𝐖𝐀𝐑𝐍 ⚠️',
          jpegThumbnail: await loadIcon('warn'),
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
        }
      },
      "participant": "0@s.whatsapp.net"
    };
if (warn < war) {
  global.db.data.users[who].warn += 1;

  conn.reply(m.chat, `╭─────────╮
┃ @${mention.split`@`[0]}\n┃ 𝐡𝐚𝐢 𝐫𝐢𝐜𝐞𝐯𝐮𝐭𝐨 𝐮𝐧 𝐰𝐚𝐫𝐧 𝐝𝐚\n┃ @${m.sender.split`@`[0]}
┃━━━━━━━━━━━━━━
┃➣ 𝐖𝐚𝐫𝐧: ${user.warn} / 3
┃➣ 𝐌𝐨𝐭𝐢𝐯𝐨: ${reason}
┃━━━━━━━━━━━━━━
> 𝐀𝐭𝐭𝐞𝐧𝐳𝐢𝐨𝐧𝐞! 𝐀 𝟑 𝐰𝐚𝐫𝐧 𝐯𝐞𝐫𝐫𝐚𝐢 𝐞𝐬𝐩𝐮𝐥𝐬𝐨 𝐝𝐚𝐥 𝐠𝐫𝐮𝐩𝐩𝐨.
╰─────────╯`, prova, { mentions: [mention, m.sender] });

} else if (warn == war) {

  global.db.data.users[who].warn = 0;

  conn.reply(m.chat, `𝐔𝐭𝐞𝐧𝐭𝐞 𝐫𝐢𝐦𝐨𝐬𝐬𝐨 𝐝𝐨𝐩𝐨 𝟑 𝐚𝐯𝐯𝐞𝐫𝐭𝐢𝐦𝐞𝐧𝐭𝐢`, prova);

  await time(1000);
  await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
    }
  }
if (command == 'unwarn' || command == "delwarn") {

let mention = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null
if (!mention) return m.reply('ⓘ 𝐌𝐞𝐧𝐳𝐢𝐨𝐧𝐚 𝐥𝐚 𝐩𝐞𝐫𝐬𝐨𝐧𝐚 𝐚 𝐜𝐮𝐢 𝐭𝐨𝐠𝐥𝐢𝐞𝐫𝐞 𝐢𝐥 𝐰𝐚𝐫𝐧')

let who = mention

if (!(who in global.db.data.users)) {
global.db.data.users[who] = { warn: 0 }
}

let user = global.db.data.users[who]

if (user.warn > 0) {

user.warn -= 1

let prova = {
  "key": {
    "participants": "0@s.whatsapp.net",
    "fromMe": false,
    "id": "Halo"
  },
  "message": {
    "locationMessage": {
      name: '𝐔𝐧𝐰𝐚𝐫𝐧 ✅',
      jpegThumbnail: await loadIcon('unwarn')
    }
  },
  "participant": "0@s.whatsapp.net"
}

conn.reply(m.chat, `╭─────────╮
┃ @${who.split('@')[0]},\n┃ 𝐭𝐢 𝐞̀ 𝐬𝐭𝐚𝐭𝐨 𝐭𝐨𝐥𝐭𝐨 𝐮𝐧 𝐰𝐚𝐫𝐧 𝐝𝐚\n┃ @${m.sender.split('@')[0]},\n┃ 𝐫𝐢𝐧𝐠𝐫𝐚𝐳𝐢𝐚!
┃━━━━━━━━━━━━━━
┃➣ 𝐖𝐚𝐫𝐧: ${user.warn} / 3
┃━━━━━━━━━━━━━━
> 𝟑𝟑𝟑 𝐁𝐎𝐓
╰─────────╯`, prova, { mentions: [who, m.sender] })

} else {

m.reply('ⓘ 𝐐𝐮𝐞𝐬𝐭𝐨 𝐮𝐭𝐞𝐧𝐭𝐞 𝐧𝐨𝐧 𝐡𝐚 𝐰𝐚𝐫𝐧')
}
  }
}

handler.command = ['warn', 'ammonisci', 'unwarn', 'delwarn'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;
export default handler;