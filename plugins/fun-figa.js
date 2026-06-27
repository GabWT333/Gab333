//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn, command, text }) => {
let target = m.mentionedJid?.[0] 
  || m.quoted?.sender 
  || m.sender

let number = target.split("@")[0]
    let width = Math.floor(Math.random() * 101);
    let finalPhrase = width >= 8 
        ? "🔥 𝐜𝐨𝐦𝐩𝐥𝐢𝐦𝐞𝐧𝐭𝐢, 𝐬𝐢𝐚𝐦𝐨 𝐬𝐮 𝐥𝐢𝐯𝐞𝐥𝐥𝐢 𝐢𝐦𝐩𝐫𝐞𝐬𝐬𝐢𝐨𝐧𝐚𝐧𝐭𝐢!\n━━━━━━━━━━━━━━━━━━\n> 𝟥𝟥𝟥 𝔹𝕆𝕋"
        : "😅 𝐮𝐧 𝐫𝐢𝐬𝐮𝐥𝐭𝐚𝐭𝐨 𝐝𝐢𝐬𝐜𝐫𝐞𝐭𝐨, 𝐜’𝐞̀ 𝐬𝐞𝐦𝐩𝐫𝐞 𝐦𝐚𝐫𝐠𝐢𝐧𝐞 𝐝𝐢 𝐦𝐢𝐠𝐥𝐢𝐨𝐫𝐚𝐦𝐞𝐧𝐭𝐨\n━━━━━━━━━━━━━━━━━━\n> 𝟥𝟥𝟥 𝔹𝕆𝕋";

    let message = `
━━━━━━━━━━━━━━━━━━
📏 𝐕𝐄𝐃𝐈𝐀𝐌𝐎 𝐐𝐔𝐀𝐍𝐓𝐎 𝐂’𝐄̀ 𝐋’𝐇𝐀𝐈 𝐋𝐀𝐑𝐆𝐀 📏
━━━━━━━━━━━━━━━━━━
🔍 *@${number}* 𝐡𝐚 𝐮𝐧’𝐚𝐩𝐞𝐫𝐭𝐮𝐫𝐚 𝐬𝐭𝐢𝐦𝐚𝐭𝐚 𝐝𝐢: *${width}* 𝐜𝐦!  
━━━━━━━━━━━━━━━━━━
${finalPhrase}
`.trim();

    m.reply(message, null, { mentions: conn.parseMention(message) });
};

handler.command = /^(figa)$/i;
handler.help = ['𝐟𝐢𝐠𝐚 @𝐭𝐚𝐠'];
handler.tags = ['fun'];
export default handler;