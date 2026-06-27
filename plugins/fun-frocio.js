//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn, command, text }) => {
let target = m.mentionedJid?.[0] 
  || m.quoted?.sender 
  || m.sender

let number = target.split("@")[0]
    let love = `𝐂𝐀𝐋𝐂𝐎𝐋𝐀𝐓𝐎𝐑𝐄 𝐅𝐑𝐎𝐂𝐈𝐀𝐆𝐆𝐈𝐍𝐄! 🏳️‍🌈
━━━━━━━━━━━━━━━━
👤 𝐩𝐞𝐫𝐬𝐨𝐧𝐚 𝐚𝐧𝐚𝐥𝐢𝐳𝐳𝐚𝐭𝐚: @${number}
🌈 𝐩𝐞𝐫𝐜𝐞𝐧𝐭𝐮𝐚𝐥𝐞 𝐝𝐢 𝐟𝐫𝐨𝐜𝐢𝐚𝐠𝐠𝐢𝐧𝐞: *${Math.floor(Math.random() * 101)}%* 𝐬𝐮 𝟏𝟎𝟎%
━━━━━━━━━━━━━━━━\n> 𝟥𝟥𝟥 𝔹𝕆𝕋
`.trim()
    m.reply(love, null, { mentions: conn.parseMention(love) })
}
handler.help = ['𝐟𝐫𝐨𝐜𝐢𝐨 @𝐭𝐚𝐠']
handler.tags = ['fun']
handler.command = /^(frocio)$/i
export default handler
