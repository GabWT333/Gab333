//Plugin by Gab, Lucifero & 333 staff

const handler = async (m) => {
  const mention = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : m.text)
  const user = global.db.data.users[mention]

  if (!user) return conn.reply(m.chat, 'Inserisci la menzione nel comando!')

  const args = m.text.match(/\d+/)
  const numBlasphemy = args ? parseInt(args[0]) : 0

  if (numBlasphemy <= 0) {
      return conn.reply(m.chat, 'Inserisci un numero valido di messaggi da aggiungere!', m)
  }

  user.blasphemy = (user.blasphemy || 0) + numBlasphemy
  conn.reply(m.chat, `Ho aggiunto ${numBlasphemy} bestemmie a @${mention.split('@')[0]}`, null, { mentions: [mention] })
}

handler.command = /^(aggiungib)$/i
handler.rowner = true
export default handler