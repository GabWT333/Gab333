//Plugin by Gab, Lucifero & 333 staff



let handler = async (m, { conn, command, text }) => {
let target = m.mentionedJid?.[0] 
  || m.quoted?.sender 
  || m.sender

let number = target.split("@")[0]
    let message = `
*📏 𝐂𝐀𝐋𝐂𝐎𝐋𝐈𝐀𝐌𝐎 𝐈 𝐓𝐔𝐎𝐈 𝐂𝐄𝐍𝐓𝐈𝐌𝐄𝐓𝐑𝐈 📏*

━━━━━━━━━━━━━━━━
🔍 *@${number}* 𝐡𝐚 𝐮𝐧𝐚 𝐥𝐮𝐧𝐠𝐡𝐞𝐳𝐳𝐚 𝐬𝐭𝐢𝐦𝐚𝐭𝐚 𝐝𝐢: *${Math.floor(Math.random() * 101)}* 𝐜𝐦
━━━━━━━━━━━━━━━━\n> 𝟥𝟥𝟥 𝔹𝕆𝕋
`.trim();

    m.reply(message, null, { mentions: conn.parseMention(message) });
};

handler.help = ['𝐩𝐞𝐧𝐞 @𝐭𝐚𝐠'];
handler.tags = ['fun'];
handler.command = /^(pene)$/i;

export default handler;