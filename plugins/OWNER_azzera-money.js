//Plugin by Gab, Lucifero & 333 staff

const handler = async (m, { conn }) => {

  const mention = m.mentionedJid[0] 
    ? m.mentionedJid[0] 
    : m.quoted 
    ? m.quoted.sender 
    : null

  if (!mention) {
    return conn.reply(m.chat, '❌ Tagga qualcuno o rispondi a un messaggio!', m)
  }

  const user = global.db.data.users[mention]
  if (!user) {
    return conn.reply(m.chat, '❌ Utente non trovato!', m)
  }

  user.money = 0
  user.bank = 0

  return conn.reply(
    m.chat,
    `💀 Ho azzerato completamente i soldi di @${mention.split('@')[0]}`,
    m,
    { mentions: [mention] }
  )
}

handler.command = /^(azzeramoney)$/i
handler.help = ['azzeramoney @tag']
handler.tags = ['owner']
handler.rowner = true

export default handler