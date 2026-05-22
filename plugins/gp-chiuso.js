//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn, args }) => {
  let setting = { "": "announcement" }[args[0] || ""]
  if (setting === undefined) return
  await conn.groupSettingUpdate(m.chat, setting)
  conn.reply(m.chat, "𝐡𝐨 𝐜𝐡𝐢𝐮𝐬𝐨 𝐢𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 𝐜𝐨𝐧 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐨! 𝐜𝐡𝐚𝐭 𝐚𝐩𝐞𝐫𝐭𝐚 𝐬𝐨𝐥𝐨 𝐩𝐞𝐫 𝐚𝐝𝐦𝐢𝐧\n\n> 𝐝𝐢𝐠𝐢𝐭𝐚 ’’.𝐚𝐩𝐫𝐢’’ 𝐩𝐞𝐫 𝐚𝐩𝐫𝐢𝐫𝐞 𝐥𝐚 𝐜𝐡𝐚𝐭 𝐚𝐢 𝐦𝐞𝐦𝐛𝐫𝐢.")
}

handler.help = ["𝐜𝐡𝐢𝐮𝐝𝐢/𝐜𝐡𝐢𝐮𝐬𝐨"]
handler.tags = ["admin"]
handler.command = /^(chiuso|chiudi)$/i
handler.admin = true
handler.botAdmin = true

export default handler