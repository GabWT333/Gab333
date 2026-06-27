//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn, command, text }) => {
let target = m.mentionedJid?.[0] 
  || m.quoted?.sender 
  || m.sender

let number = target.split("@")[0]
    let width = Math.floor(Math.random() * 101);


    let finalPhrase = width >= 30 
        ?"𝐜𝐨𝐦𝐢𝐧𝐠 𝐨𝐮𝐭 𝐢𝐧𝐚𝐬𝐩𝐞𝐭𝐭𝐚𝐭𝐨!\n━━━━━━━━━━━━━━━━━━\n> 𝟥𝟥𝟥 𝔹𝕆𝕋"
        : "𝐥𝐚 𝐬𝐢𝐠𝐧𝐨𝐫𝐢𝐧𝐚 𝐚𝐦𝐚 𝐩𝐫𝐞𝐧𝐝𝐞𝐫𝐥𝐨!\n━━━━━━━━━━━━━━━━━━\n> 𝟥𝟥𝟥 𝔹𝕆𝕋";


    let message = `
━━━━━━━━━━━━━━━━━━
𝐌𝐎𝐌𝐄𝐍𝐓𝐎 𝐋𝐄𝐒𝐁𝐎 🏳️‍🌈
━━━━━━━━━━━━━━━━━━
@${number} 𝐞̀ 𝐥𝐞𝐬𝐛𝐢𝐜𝐚 𝐚𝐥 *${width}%🏳️‍🌈!* 
━━━━━━━━━━━━━━━━━━
${finalPhrase}
`.trim();

    m.reply(message, null, { mentions: conn.parseMention(message) });
};

handler.command = /^(lesbica)$/i;
handler.help = ['lesbica @𝐭𝐚𝐠'];
handler.tags = ['fun'];

export default handler;