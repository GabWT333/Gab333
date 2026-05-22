//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn, command, text }) => {
let target = m.mentionedJid?.[0] 
  || m.quoted?.sender 
  || m.sender

let number = target.split("@")[0]
    let width = Math.floor(Math.random() * 101);


    let finalPhrase = width >= 30 
        ?"𝐜𝐨𝐦𝐢𝐧𝐠 𝐨𝐮𝐭 𝐢𝐧𝐚𝐬𝐩𝐞𝐭𝐭𝐚𝐭𝐨!\n━━━━━━━━━━━━━━━━━━\n> 𝟥𝟥𝟥 𝔹𝕆𝕋"
        : "𝐛𝐫𝐚𝐯𝐨 𝐬𝐨𝐥𝐝𝐚𝐭𝐨!\n━━━━━━━━━━━━━━━━━━\n> 𝟥𝟥𝟥 𝔹𝕆𝕋";


    let message = `
━━━━━━━━━━━━━━━━━━
𝐌𝐎𝐌𝐄𝐍𝐓𝐎 𝐅𝐑𝐎𝐂𝐈𝐀𝐆𝐆𝐈𝐍𝐄 🏳️‍🌈
━━━━━━━━━━━━━━━━━━
@${number} 𝐞̀ 𝐠𝐚𝐲 𝐚𝐥 *${width}%🏳️‍🌈!* 
━━━━━━━━━━━━━━━━━━
${finalPhrase}
`.trim();

    m.reply(message, null, { mentions: conn.parseMention(message) });
};

handler.command = /^(gay)$/i;
handler.help = ['gay @𝐭𝐚𝐠'];
handler.tags = ['fun'];

export default handler;