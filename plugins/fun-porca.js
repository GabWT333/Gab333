//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn, command, text }) => {
let target = m.mentionedJid?.[0] 
  || m.quoted?.sender 
  || m.sender

let number = target.split("@")[0]
    let width = Math.floor(Math.random() * 101);


    let finalPhrase = width >= 30 
        ?"𝐏𝐢𝐜𝐜𝐨𝐥𝐚 𝐯𝐨𝐠𝐥𝐢𝐨𝐬𝐞𝐭𝐭𝐚, 𝐩𝐨𝐫𝐧𝐡𝐮𝐛 𝐞́ 𝐢𝐥 𝐭𝐮𝐨 𝐬𝐢𝐭𝐨 𝐩𝐫𝐞𝐟𝐞𝐫𝐢𝐭𝐨?😅\n━━━━━━━━━━━━━━━━━━\n> 𝟥𝟥𝟥 𝔹𝕆𝕋"
        : "𝐏𝐫𝐨𝐧𝐭𝐚 𝐩𝐞𝐫 𝐝𝐢𝐯𝐞𝐧𝐭𝐚𝐫𝐞 𝐬𝐮𝐨𝐫𝐚 ✝️\n━━━━━━━━━━━━━━━━━━\n> 𝟥𝟥𝟥 𝔹𝕆𝕋";


    let message = `
━━━━━━━━━━━━━━━━━━
𝐕𝐄𝐃𝐈𝐀𝐌𝐎 𝐐𝐔𝐀𝐍𝐓𝐎 𝐒𝐄𝐈 𝐏𝐎𝐑𝐂𝐀 😏 
━━━━━━━━━━━━━━━━━━
@${number} 𝐞̀ 𝐩𝐨𝐫𝐜𝐚 𝐚𝐥 *${width}%💦!* 
━━━━━━━━━━━━━━━━━━
${finalPhrase}
`.trim();

    m.reply(message, null, { mentions: conn.parseMention(message) });
};

handler.command = /^(porca)$/i;
handler.help = ['porco'];
handler.tags = ['fun'];

export default handler;