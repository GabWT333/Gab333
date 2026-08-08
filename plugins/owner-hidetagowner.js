//Plugin by 333 staff

let handler = async (m, { conn, text, isOwner }) => {
  if (!isOwner) return m.reply('⚠️ Solo owner')

  let groupId = m.chat
  let message = m.quoted?.text || text

  if (!message) return m.reply('📝 Scrivi il messaggio o cita un messaggio da mandare come hidetag\n\n💡 Uso:\n.hidetag [messaggio]\n.hidetag ID_GRUPPO [messaggio]\n\n🔍 Per recuperare l\'ID di un gruppo: .ispeziona [link]')

  if (text?.includes('@g.us')) {
    const parts = text.split(' ')
    const possibleId = parts.find(p => p.includes('@g.us'))
    if (possibleId) {
      groupId = possibleId
      message = text.replace(possibleId, '').trim() || m.quoted?.text
      if (!message) return m.reply('📝 Scrivi il messaggio da mandare')
    }
  }

  try {
    const group = await conn.groupMetadata(groupId)
    const mentions = group.participants.map(p => p.id)

    if (mentions.length === 0) {
      return m.reply('⚠️ Nessun partecipante nel gruppo')
    }

    const ownerMention = m.sender
    const finalMessage = `${message}\n\n🔐 hidetag da parte dell'owner del bot @${ownerMention.split('@')[0]}`

    await conn.sendMessage(groupId, {
      text: finalMessage,
      mentions: [...mentions, ownerMention]
    })

    m.reply(`✅ Hidetag inviato in ${group.subject}\n👥 Taggati: ${mentions.length}`)
  } catch (err) {
    console.error(err)
    m.reply(`❌ Errore: ${err.message || 'Gruppo non trovato o bot non è membro'}`)
  }
}

handler.command = /^(hidetagowner|ht)$/i
handler.tags = ['owner']
handler.help = ['hidetag [messaggio]', 'ht [messaggio]']
handler.owner = true

export default handler
