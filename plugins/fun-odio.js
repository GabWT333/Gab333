//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn, command, text }) => {
let target = m.mentionedJid?.[0] 
  || m.quoted?.sender 
  || m.sender

let number = target.split("@")[0]

    let percentage = Math.floor(Math.random() * 101);


    let finalPhrase = percentage >= 50 
        ? "😡 𝐰𝐨𝐰, 𝐬𝐞𝐦𝐛𝐫𝐚 𝐜𝐡𝐞 𝐭𝐫𝐚 𝐯𝐨𝐢 𝐝𝐮𝐞 𝐜𝐢 𝐬𝐢𝐚 𝐝𝐚𝐯𝐯𝐞𝐫𝐨 𝐭𝐞𝐧𝐬𝐢𝐨𝐧𝐞!\n━━━━━━━━━━━━━━━━━━\n> 𝟥𝟥𝟥 𝔹𝕆𝕋" 
        : "😌 𝐟𝐨𝐫𝐬𝐞 𝐧𝐨𝐧 𝐞̀ 𝐜𝐨𝐬𝐢̀ 𝐠𝐫𝐚𝐯𝐞 𝐜𝐨𝐦𝐞 𝐩𝐞𝐧𝐬𝐢.\n━━━━━━━━━━━━━━━━━━\n> 𝟥𝟥𝟥 𝔹𝕆𝕋";


    let hate = `
━━━━━━━━━━━━━━━━━━
🔥 𝐂𝐀𝐋𝐂𝐎𝐋𝐀𝐓𝐎𝐑𝐄 𝐃’𝐎𝐃𝐈𝐎 🔥
━━━━━━━━━━━━━━━━━━
👿 𝐥’𝐨𝐝𝐢𝐨 𝐭𝐫𝐚 𝐭𝐞 𝐞 @${number}:  
💢 𝐞̀ 𝐝𝐞𝐥𝐥’ *${percentage}%*!
━━━━━━━━━━━━━━━━━━
${finalPhrase}
`.trim();

    m.reply(hate, null, { mentions: conn.parseMention(hate) });
};

handler.command = /^(odio)$/i;
handler.help = ['𝐨𝐝𝐢𝐨 @𝐭𝐚𝐠'];
handler.tags = ['fun'];
export default handler;
