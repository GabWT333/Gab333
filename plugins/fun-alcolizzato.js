//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn, command, text }) => {
let target = m.mentionedJid?.[0] 
  || m.quoted?.sender 
  || m.sender

let number = target.split("@")[0]
    let width = Math.floor(Math.random() * 101);


    let finalPhrase = width >= 30 
        ?"😅 𝐢𝐥 𝐛𝐫𝐨 𝐞̀ 𝐜𝐚𝐥𝐚𝐭𝐨 𝐢𝐧 𝐝𝐞𝐩𝐫𝐞𝐬𝐬𝐢𝐨𝐧𝐞\n━━━━━━━━━━━━━━━━━━\n> 𝟥𝟥𝟥 𝔹𝕆𝕋"
        : "👮 𝐢𝐥 𝐫𝐚𝐠𝐚𝐳𝐳𝐨/𝐚 𝐞̀ 𝐚𝐬𝐭𝐞𝐦𝐢𝐨/𝐚\n━━━━━━━━━━━━━━━━━━\n> 𝟥𝟥𝟥 𝔹𝕆𝕋";


    let message = `
━━━━━━━━━━━━━━━━━━
𝐌𝐎𝐌𝐄𝐍𝐓𝐎 𝐀𝐋𝐂𝐎𝐋 𝐓𝐄𝐒𝐓!🍷
━━━━━━━━━━━━━━━━━━
@${number} 𝐞̀ 𝐚𝐥𝐜𝐨𝐥𝐢𝐳𝐳𝐚𝐭𝐨 𝐚𝐥 *${width}%🍷!* 
━━━━━━━━━━━━━━━━━━
${finalPhrase}
`.trim();

    m.reply(message, null, { mentions: conn.parseMention(message) });
};

handler.command = /^(alcolizzato)$/i;
handler.help = ['𝐚𝐥𝐜𝐨𝐥𝐢𝐳𝐳𝐚𝐭𝐨 @𝐭𝐚𝐠'];
handler.tags = ['fun'];

export default handler;