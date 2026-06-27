//Plugin by Gab, Lucifero & 333 staff



let freezeTimers = global.freezeTimers || (global.freezeTimers = {})

let handler = async (m, { conn, command, isBotAdmin }) => {
  if (!m.isGroup) return
  if (!isBotAdmin) return

  let minutes = 0
  if (command === 'freeze_1') minutes = 1
  if (command === 'freeze_5') minutes = 5
  if (command === 'freeze_10') minutes = 10
  if (!minutes) return

  const duration = minutes * 60 * 1000

  await conn.groupSettingUpdate(m.chat, 'announcement')

  if (freezeTimers[m.chat]) clearTimeout(freezeTimers[m.chat])

  freezeTimers[m.chat] = setTimeout(async () => {
    await conn.groupSettingUpdate(m.chat, 'not_announcement')
    await conn.sendMessage(m.chat, { 
      text: "🔓 𝐆𝐫𝐮𝐩𝐩𝐨 𝐫𝐢𝐚𝐩𝐞𝐫𝐭𝐨 𝐚𝐮𝐭𝐨𝐦𝐚𝐭𝐢𝐜𝐚𝐦𝐞𝐧𝐭𝐞." 
    })
    delete freezeTimers[m.chat]
  }, duration)

  await conn.sendMessage(m.chat, {
    text: `🚨 𝐆𝐑𝐔𝐏𝐏𝐎 𝐂𝐇𝐈𝐔𝐒𝐎 𝐓𝐄𝐌𝐏𝐎𝐑𝐀𝐍𝐄𝐀𝐌𝐄𝐍𝐓𝐄 𝐃𝐀 𝐔𝐍 𝐀𝐃𝐌𝐈𝐍 𝐏𝐄𝐑 𝐒𝐈𝐂𝐔𝐑𝐄𝐙𝐙𝐀\n\n⏳ 𝐒𝐢 𝐫𝐢𝐚𝐩𝐫𝐢𝐫𝐚̀ 𝐭𝐫𝐚 *${minutes}* 𝐦𝐢𝐧𝐮𝐭𝐨/𝐢.`
  })
}

handler.command = /^freeze_(1|5|10)$/i
handler.group = true
handler.admin = true
export default handler