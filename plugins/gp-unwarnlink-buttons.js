let handler = async (m, { conn }) => {
  return true
}

handler.before = async (m, { conn }) => {
  const buttonId = m.buttonId || m.text
  if (!buttonId || !buttonId.startsWith('unwarnlink_')) return true

  const parts = buttonId.split('_')
  if (parts.length < 3) return true

  const category = parts[1]
  const who = parts.slice(2).join('_')

  if (!global.db.data.users[who]) return true

  let field, maxWarns, emoji, categoryName
  
  if (category === 'ig') {
    field = 'warnIg'
    maxWarns = 3
    emoji = '📸'
    categoryName = 'IG'
  } else if (category === 'tiktok') {
    field = 'warnTiktok'
    maxWarns = 3
    emoji = '🎵'
    categoryName = 'TikTok'
  } else if (category === 'porno') {
    field = 'antiporno'
    maxWarns = 5
    emoji = '🚫'
    categoryName = 'Porno&Gore'
  } else {
    return true
  }

  const currentWarns = global.db.data.users[who][field] || 0

  if (currentWarns > 0) {
    global.db.data.users[who][field]--
    const remaining = global.db.data.users[who][field]

    await conn.sendMessage(m.chat, {
      text: `✅ Un warn ${categoryName} rimosso a @${who.split('@')[0]}\n\n${emoji} Warn ${categoryName}: ${remaining} / ${maxWarns}`,
      mentions: [who]
    }, { quoted: m })
  } else {
    await conn.sendMessage(m.chat, {
      text: `ℹ️ @${who.split('@')[0]} non ha warn ${categoryName} da rimuovere`,
      mentions: [who]
    }, { quoted: m })
  }

  return false
}

export default handler
