//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn, args }) => {
  let setting = { "": "not_announcement" }[args[0] || ""]
  if (setting === undefined) return
  await conn.groupSettingUpdate(m.chat, setting)
  conn.reply(m.chat, "𝐡𝐨 𝐚𝐩𝐞𝐫𝐭𝐨 𝐢𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 𝐜𝐨𝐧 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐨! 𝐜𝐡𝐚𝐭 𝐚𝐩𝐞𝐫𝐭𝐚 𝐚 𝐭𝐮𝐭𝐭𝐢.\n\n> 𝐝𝐢𝐠𝐢𝐭𝐚 ’’.𝐜𝐡𝐢𝐮𝐝𝐢’’ 𝐩𝐞𝐫 𝐜𝐡𝐢𝐮𝐝𝐞𝐫𝐞 𝐥𝐚 𝐜𝐡𝐚𝐭 𝐚 𝐬𝐨𝐥𝐢 𝐚𝐝𝐦𝐢𝐧")
}

handler.help = ["𝐚𝐩𝐫𝐢/𝐚𝐩𝐞𝐫𝐭𝐨"]
handler.tags = ["admin"]
handler.command = /^(aperto|apri)$/i
handler.admin = true
handler.botAdmin = true

export default handler