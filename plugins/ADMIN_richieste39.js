setInterval(async () => {
  let chats = global.db.data.chats
  for (let chatId in chats) {
    if (!chats[chatId].accetta39) continue
    try {
      const pending = await conn.groupRequestParticipantsList(chatId)
      if (pending.length) {
        for (let p of pending) {
          const jid = p.jid
          const number = jid.split('@')[0]
          if (!number.startsWith('39') || number.slice(2).startsWith('0')) {
            await conn.groupRequestParticipantsUpdate(chatId, [jid], 'reject')
          } else {
            await conn.groupRequestParticipantsUpdate(chatId, [jid], 'approve')
          }
        }
      }
    } catch (e) {}
  }
}, 1000)

const handler = async (m, { conn, isAdmin, isBotAdmin, isOwner, command }) => {
  if (!(isAdmin || isOwner)) {
    throw '*Solo gli admin possono usare questo comando*'
  }
  
  if (!isBotAdmin) {
    throw '*Il bot deve essere admin per usare questa funzione*'
  }

  let chat = global.db.data.chats[m.chat]
  
  if (chat.accetta39) {
    chat.accetta39 = false
    await m.reply('*❌ Accettazione automatica numeri italiani disattivata*')
  } else {
    chat.accetta39 = true
    await m.reply('*✅ Accettazione automatica numeri italiani attivata*\n\nI numeri italiani (39) verranno accettati automaticamente, gli altri rifiutati')
  }
}

handler.command = /^(accetta39)$/i
handler.group = true

export default handler