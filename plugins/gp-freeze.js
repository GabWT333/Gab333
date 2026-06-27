//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn, isAdmin, isBotAdmin, usedPrefix }) => {
  if (!m.isGroup) return m.reply("❌ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨 𝐮𝐭𝐢𝐥𝐢𝐳𝐳𝐚𝐛𝐢𝐥𝐞 𝐬𝐨𝐥𝐨 𝐬𝐮𝐢 𝐠𝐫𝐮𝐩𝐩𝐢.")
  if (!isAdmin) return m.reply("👑 𝐂𝐨𝐦𝐚𝐧𝐝𝐨 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞 𝐬𝐨𝐥𝐨 𝐩𝐞𝐫 𝐚𝐝𝐦𝐢𝐧.")
  if (!isBotAdmin) return m.reply("🤖 𝐃𝐞𝐯𝐨 𝐞𝐬𝐬𝐞𝐫𝐞 𝐚𝐝𝐦𝐢𝐧 𝐩𝐞𝐫 𝐟𝐮𝐧𝐳𝐢𝐨𝐧𝐚𝐫𝐞!.")

  const pulsanti = [
    ['🧊 𝟏 𝐦𝐢𝐧𝐮𝐭𝐨', `${usedPrefix}freeze_1`],
    ['🧊 𝟓 𝐦𝐢𝐧𝐮𝐭𝐢', `${usedPrefix}freeze_5`],
    ['🧊 𝟏𝟎 𝐦𝐢𝐧𝐮𝐭𝐢', `${usedPrefix}freeze_10`]
  ]

  await conn.sendButton(
    m.chat,
    `🚨 𝐅𝐑𝐄𝐄𝐙𝐄  ꙰ 𝟥𝟥𝟥 𝔹𝕆𝕋  ꙰\n\n𝐬𝐜𝐞𝐠𝐥𝐢 𝐩𝐞𝐫 𝐪𝐮𝐚𝐧𝐭𝐨 𝐭𝐞𝐦𝐩𝐨 𝐜𝐡𝐢𝐮𝐝𝐞𝐫𝐞 𝐢𝐥 𝐠𝐫𝐮𝐩𝐩𝐨:`,
    `> 𝟥𝟥𝟥 𝔹𝕆𝕋`,
    null,
    pulsanti,
    m
  )
}

handler.command = /^freezegp$/i
handler.group = true
handler.admin = true
export default handler