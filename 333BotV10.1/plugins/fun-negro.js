//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn, command, text }) => {
let target = m.mentionedJid?.[0] 
  || m.quoted?.sender 
  || m.sender

let number = target.split("@")[0]
    let width = Math.floor(Math.random() * 101);


    let finalPhrase = width >= 30
        ?"𝐇𝐞𝐲 𝐚𝐛𝐛𝐢𝐚𝐦𝐨 𝐮𝐧 𝐜𝐢𝐨𝐜𝐜𝐨𝐥𝐚𝐭𝐢𝐧𝐨 𝐪𝐮𝐢!\n━━━━━━━━━━━━━━━━━━\n> 𝟥𝟥𝟥 𝔹𝕆𝕋"
        : "𝐒𝐞𝐢 𝐛𝐢𝐚𝐧𝐜𝐨/𝐚 𝐦𝐨𝐳𝐳𝐚𝐫𝐞𝐥𝐥𝐚!\n━━━━━━━━━━━━━━━━━━\n> 𝟥𝟥𝟥 𝔹𝕆𝕋";


    let message = `
━━━━━━━━━━━━━━━━━━
𝐕𝐄𝐃𝐈𝐀𝐌𝐎 𝐐𝐔𝐀𝐍𝐓𝐎 𝐒𝐄𝐈 𝐍𝐄𝐆𝐑𝐎/𝐀 ⚫️
━━━━━━━━━━━━━━━━━━
@${number} 𝐞̀ 𝐧𝐞𝐠𝐫𝐨 𝐚𝐥 *${width}%🚨!* 
━━━━━━━━━━━━━━━━━━
${finalPhrase}
`.trim();

    m.reply(message, null, { mentions: conn.parseMention(message) });
};

handler.command = /^(negro)$/i;
handler.help = ['negro @𝐭𝐚𝐠'];
handler.tags = ['fun'];

export default handler;