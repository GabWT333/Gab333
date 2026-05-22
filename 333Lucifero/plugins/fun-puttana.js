//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn, command, text }) => {
let target = m.mentionedJid?.[0] 
  || m.quoted?.sender 
  || m.sender

let number = target.split("@")[0]
    let width = Math.floor(Math.random() * 101);


    let finalPhrase = width >= 30 
        ?"𝐞𝐜𝐜𝐨 𝐚 𝐯𝐨𝐢 𝐥𝐚 𝐧𝐮𝐨𝐯𝐚 𝐛𝐚𝐭𝐭𝐨𝐧𝐚!\n━━━━━━━━━━━━━━━━━━\n> 𝟥𝟥𝟥 𝔹𝕆𝕋"
        : "𝐜𝐨𝐦𝐩𝐥𝐢𝐦𝐞𝐧𝐭𝐢, 𝐬𝐞𝐦𝐩𝐫𝐞 𝐝𝐢𝐠𝐧𝐢𝐭𝐚̀.\n━━━━━━━━━━━━━━━━━━\n> 𝟥𝟥𝟥 𝔹𝕆𝕋";


    let message = `
━━━━━━━━━━━━━━━━━━
𝐕𝐄𝐃𝐈𝐀𝐌𝐎 𝐐𝐔𝐀𝐍𝐓𝐎 𝐒𝐄𝐈 𝐏𝐔𝐓𝐓𝐀𝐍𝐀 🔞
━━━━━━━━━━━━━━━━━━
@${number} 𝐞̀ 𝐩𝐮𝐭𝐭𝐚𝐧𝐚 𝐚𝐥 *${width}%🔞!* 
━━━━━━━━━━━━━━━━━━
${finalPhrase}
`.trim();

    m.reply(message, null, { mentions: conn.parseMention(message) });
};

handler.command = /^(puttana)$/i;
handler.help = ['puttana @𝐭𝐚𝐠'];
handler.tags = ['fun'];

export default handler;