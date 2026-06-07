// Plugin slowmode by 333 Lucifero

export async function before(m, { conn, isAdmin, isOwner, isROwner }) {
  if (!m.message) return false
  if (m.isBaileys && m.fromMe) return true
  if (!m.isGroup) return false
  if (isAdmin || isOwner || isROwner) return false

  const chatId = m.chat
  const chat = global.db.data.chats[chatId] = global.db.data.chats[chatId] || {}
  if (!chat.slowmode) return false

  global.slowmodeData = global.slowmodeData || {}
  if (!global.slowmodeData[chatId]) global.slowmodeData[chatId] = {}

  const sender = m.sender
  const now = Date.now()
  const data = global.slowmodeData[chatId][sender] = global.slowmodeData[chatId][sender] || { last: 0, warnings: 0 }
  const cooldown = Number(chat.slowmodeDuration || 5000)
  const elapsed = now - (data.last || 0)

  if (elapsed < cooldown) {
    data.warnings = (data.warnings || 0) + 1
    const diffSeconds = Math.ceil((cooldown - elapsed) / 1000)
    const warnCount = data.warnings
    const mention = [sender]
    m.text = ''

    if (warnCount >= 5) {
      data.warnings = 0
      data.last = now
      try {
        await conn.sendMessage(chatId, {
          text: `🚫 @${sender.split('@')[0]} espulso per 5 infrazioni slowmode.`,
          mentions: mention
        })
        await conn.groupParticipantsUpdate(chatId, [sender], 'remove')
      } catch (e) {}
      return true
    }

    try {
      await conn.sendMessage(chatId, {
        text: `⚠️ @${sender.split('@')[0]} modalità slowmode attiva in questa chat.
Attendi ancora ${diffSeconds}s prima di scrivere.
Infrazione ${warnCount}/5 — alla 5ª verrai espulso.`,
        mentions: mention
      })
    } catch (e) {}

    return true
  }

  data.last = now
  data.warnings = 0
  return false
}

const handler = async () => false
handler.before = before
export default handler
