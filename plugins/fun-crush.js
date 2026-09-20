//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn, command, text }) => {
let target = m.mentionedJid?.[0] 
  || m.quoted?.sender 
  || m.sender

let number = target.split("@")[0]
    let love = `💘 𝐂𝐀𝐋𝐂𝐎𝐋𝐀𝐓𝐎𝐑𝐄 𝐃𝐈 𝐀𝐌𝐎𝐑𝐄 💘\n
━━━━━━━━━━━━━━━
🌹 𝐚𝐦𝐨𝐫𝐞 𝐝𝐞𝐢 𝐭𝐮𝐨𝐢 𝐬𝐨𝐠𝐧𝐢: @${number}
💌 𝐥𝐢𝐯𝐞𝐥𝐥𝐨 𝐝𝐢 𝐚𝐦𝐨𝐫𝐞: *${Math.floor(Math.random() * 101)}%* su *100%*
━━━━━━━━━━━━━━━
❓ 𝐩𝐞𝐫𝐜𝐡𝐞̀ 𝐧𝐨𝐧 𝐭𝐢 𝐝𝐢𝐜𝐡𝐢𝐚𝐫𝐢?
🤔 𝐥’𝐚𝐦𝐨𝐫𝐞 𝐩𝐨𝐭𝐫𝐞𝐛𝐛𝐞 𝐬𝐨𝐫𝐩𝐫𝐞𝐧𝐝𝐞𝐫𝐭𝐢\n━━━━━━━━━━━━━━━\n> 𝟥𝟥𝟥 𝔹𝕆𝕋
`.trim()
    m.reply(love, null, { mentions: conn.parseMention(love) })
}
handler.help = ['𝐜𝐫𝐮𝐬𝐡 @𝐭𝐚𝐠']
handler.tags = ['fun']
handler.command = /^(crush)$/i
export default handler
