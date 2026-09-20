//Plugin by Gab, Lucifero & 333 staff

const travaWarnings = {}

export async function before(m, { conn, isAdmin, isBotAdmin }) {
  if (m.isBaileys && m.fromMe) return true
  if (!m.isGroup) return true

  const chat = global.db.data.chats[m.chat]
  if (!chat?.antitrava || chat?.isBanned) return true
  if (isAdmin || !isBotAdmin) return true

  const text = (m.text || m.message?.extendedTextMessage?.text || '').toString()
  const messageSize = JSON.stringify(m.message || {}).length
  const fileLength = Number(
    m.message?.imageMessage?.fileLength ||
    m.message?.videoMessage?.fileLength ||
    m.message?.documentMessage?.fileLength ||
    m.message?.audioMessage?.fileLength ||
    m.message?.stickerMessage?.fileLength ||
    0
  )
  const hasInvisibleSpam = /[\u200b\u200c\u200d\u2060\uFEFF]{10,}/.test(text)

  const isTravaPayload = messageSize > 18000 || text.length > 1600 || fileLength > 8_000_000 || hasInvisibleSpam
  if (!isTravaPayload) return true

  global.db.data.users[m.sender] = global.db.data.users[m.sender] || {}
  const user = global.db.data.users[m.sender]
  user.antitrava = (user.antitrava || 0) + 1

  await conn.sendMessage(m.chat, {
    text:
`🚫 *AntiTrava attivato*

👤 @${m.sender.split('@')[0]}
📝 Messaggio rimosso perché potenzialmente crash/trava
⚠️ Warn: ${user.antitrava}/2`
    , mentions: [m.sender]
  })

  try {
    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: m.key.id,
        participant: m.sender
      }
    })
  } catch {}

  if (user.antitrava >= 2) {
    try {
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
      await conn.sendMessage(m.chat, {
        text: `👋 @${m.sender.split('@')[0]} espulso per aver inviato travi ripetute.`,
        mentions: [m.sender]
      })
      user.antitrava = 0
    } catch (e) {
      console.log('Errore espulsione antitrava:', e)
    }
  }

  return false
}
