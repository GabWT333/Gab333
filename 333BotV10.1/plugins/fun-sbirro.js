//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn, command, text }) => {
let target = m.mentionedJid?.[0] 
  || m.quoted?.sender 
  || m.sender

let number = target.split("@")[0]
    let width = Math.floor(Math.random() * 101);


    let finalPhrase = width >= 30 
        ?"𝐀𝐭𝐭𝐞𝐧𝐳𝐢𝐨𝐧𝐞! 𝐂’𝐞̀ 𝐮𝐧𝐨 𝐬𝐛𝐢𝐫𝐫𝐨 𝐭𝐫𝐚 𝐧𝐨𝐢!\n━━━━━━━━━━━━━━━━━━\n> 𝟥𝟥𝟥 𝔹𝕆𝕋"
        : "𝐌𝐡𝐡, 𝐦𝐞𝐠𝐥𝐢𝐨 𝐜𝐨𝐬𝐢̀\n━━━━━━━━━━━━━━━━━━\n> 𝟥𝟥𝟥 𝔹𝕆𝕋";


    let message = `
━━━━━━━━━━━━━━━━━━
𝐕𝐄𝐃𝐈𝐀𝐌𝐎 𝐒𝐄 𝐂𝐈 𝐒𝐎𝐍𝐎 𝐒𝐁𝐈𝐑𝐑𝐈 🚨
━━━━━━━━━━━━━━━━━━
@${number} 𝐞̀ 𝐬𝐛𝐢𝐫𝐫𝐨 𝐚𝐥 *${width}%🚨!* 
━━━━━━━━━━━━━━━━━━
${finalPhrase}
`.trim();

    m.reply(message, null, { mentions: conn.parseMention(message) });
};

handler.command = /^(sbirro)$/i;
handler.help = ['sbirro'];
handler.tags = ['fun'];

export default handler;