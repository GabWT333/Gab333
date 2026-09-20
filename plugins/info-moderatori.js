//Plugin by 333 staff

let handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('❌ Questo comando funziona solo nei gruppi.')

  const chatId = m.chat
  if (!global.db.data.chats[chatId]) global.db.data.chats[chatId] = {}
  if (!global.db.data.chats[chatId].moderatori) global.db.data.chats[chatId].moderatori = []

  const mods = global.db.data.chats[chatId].moderatori
  if (mods.length === 0) return m.reply('📋 Nessun moderatore registrato in questo gruppo.')

  let text = '📋 *Lista Moderatori del Gruppo*\n\n'
  const mentions = []
  mods.forEach((jid, index) => {
    text += `${index + 1}. @${jid.split('@')[0]}\n`
    mentions.push(jid)
  })

  text += '\n━━━━━━━━━━━━━━━━━━━━━━\n'
  text += '🛡️ *Comandi Disponibili ai Moderatori*\n\n'
  text += '• .pin / .unpin - Fissa/defissa messaggi\n'
  text += '• .setwelcome - Imposta messaggio di benvenuto\n'
  text += '• .link - Genera link del gruppo\n'
  text += '• .del - Elimina messaggi\n'
  text += '• .giuria @user motivo - Avvia processo giuria\n'
  text += '• .banlist - Mostra lista bannati\n'
  text += '• .hidetag - Tag nascosto\n'
  text += '• .invita <numero> - Invita utente\n'
  text += '• .admins - Sveglia admin\n'
  text += '• .tagall - Menziona tutti\n'
  text += '• .muta / .smuta - Muta/smuta utente\n'

  await conn.sendMessage(chatId, { text, mentions }, { quoted: m })
}

handler.help = ['mods', 'moderatori']
handler.tags = ['group']
handler.command = ['mods', 'moderatori']
handler.group = true

export default handler
