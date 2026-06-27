// Tracker sticker
const stickerTracker = {}
const spamWarnings = {}

export async function before(m, { conn, isAdmin, isBotAdmin }) {
  if (m.isBaileys && m.fromMe) return true
  if (!m.isGroup) return false

  const chat = global.db.data.chats[m.chat]
  if (!chat?.antiSpam || chat?.isBanned) return true

  if (!isBotAdmin) return true
  if (isAdmin) return true

  const chatId = m.chat
  const userId = m.sender


  if (chat.mutedUsers && chat.mutedUsers[userId]) {
    if (Date.now() < chat.mutedUsers[userId]) {

      await conn.sendMessage(chatId, {
        delete: {
          remoteJid: chatId,
          fromMe: false,
          id: m.key.id,
          participant: userId
        }
      })

      return false
    } else {
      delete chat.mutedUsers[userId]
    }
  }


  if (m.mtype !== 'stickerMessage') return true

  if (!stickerTracker[chatId]) stickerTracker[chatId] = {}
  if (!stickerTracker[chatId][userId]) {
    stickerTracker[chatId][userId] = {
      count: 0,
      messages: [],
      timeout: null
    }
  }

  const tracker = stickerTracker[chatId][userId]

  tracker.count++
  tracker.messages.push({
    id: m.key.id,
    participant: userId
  })

  if (tracker.timeout) clearTimeout(tracker.timeout)

  tracker.timeout = setTimeout(() => {
    if (stickerTracker[chatId] && stickerTracker[chatId][userId]) {
      stickerTracker[chatId][userId] = {
        count: 0,
        messages: [],
        timeout: null
      }
    }
  }, 10000)


  if (tracker.count >= 5) {

    if (!spamWarnings[chatId]) spamWarnings[chatId] = {}
    if (!spamWarnings[chatId][userId]) spamWarnings[chatId][userId] = 0

    spamWarnings[chatId][userId]++

    // Cancella sticker
    for (const msg of tracker.messages) {
      try {
        await conn.sendMessage(chatId, {
          delete: {
            remoteJid: chatId,
            fromMe: false,
            id: msg.id,
            participant: msg.participant
          }
        })
      } catch {}
    }


    if (spamWarnings[chatId][userId] >= 2) {

      await conn.sendMessage(chatId, {
        text: `🚫 *Utente espulso per spam*\n\n👤 @${userId.split('@')[0]}\n📝 Spam ripetuto di sticker`,
        mentions: [userId]
      })

      await conn.groupParticipantsUpdate(chatId, [userId], 'remove')

      delete spamWarnings[chatId][userId]

      stickerTracker[chatId][userId] = {
        count: 0,
        messages: [],
        timeout: null
      }

      return false
    }



    const muteTime = 5 * 60 * 1000

    if (!chat.mutedUsers) chat.mutedUsers = {}
    chat.mutedUsers[userId] = Date.now() + muteTime

    await conn.sendMessage(chatId, {
      text:
`🚫 *AntiSpam attivato*

👤 Utente: @${userId.split('@')[0]}
📝 Motivo: spam sticker⏱️ Mute: 5 minuti

⚠️ Alla prossima verrà espulso`,
      mentions: [userId]
    })

    setTimeout(async () => {

      if (chat.mutedUsers && chat.mutedUsers[userId]) {
        delete chat.mutedUsers[userId]

        await conn.sendMessage(chatId, {
          text: `✅ @${userId.split('@')[0]} può tornare a scrivere`,
          mentions: [userId]
        })
      }

      setTimeout(() => {
        if (spamWarnings[chatId] && spamWarnings[chatId][userId]) {
          delete spamWarnings[chatId][userId]
        }
      }, 10 * 60 * 1000)

    }, muteTime)

    stickerTracker[chatId][userId] = {
      count: 0,
      messages: [],
      timeout: null
    }

    return false
  }

  return true
}

export const disabled = false