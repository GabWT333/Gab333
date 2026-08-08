let handler = async (m, { conn }) => {
  const text = `╭─────────╮
┃ 𝐀𝐒𝐒𝐈𝐒𝐓𝐄𝐍𝐙𝐀  333 𝐁𝐎𝐓
┃
┃ 👑 OWNER
┃ • Gab: wa.me/393892430108
┃ • Lucifero: wa.me/393793896091
┃
┃ 🔧 GRUPPO SUPPORTO
┃ • https://chat.whatsapp.com/L7Hz1iQpctTDfOoU4LARWL
┃
┃ 📺 CANALE
┃ • https://whatsapp.com/channel/0029VauhQviCsU9Ibrwlkb0h
┃
┃ 🌐 SITO
┃ • https://333wt.it
╰─────────╯`.trim()

  await conn.sendMessage(m.chat, { text }, { quoted: m })
}

handler.help = ['assistenza']
handler.tags = ['info']
handler.command = /^(assistenza)$/i

export default handler
