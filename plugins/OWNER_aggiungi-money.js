//Plugin by Gab, Lucifero & 333 staff

const handler = async (m) => {
  const mention = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : m.text)
  const user = global.db.data.users[mention]

  if (!user) return conn.reply(m.chat, 'Inserisci la menzione nel comando!')

  const args = m.text.match(/\d+/)
  const numMoney = args ? parseInt(args[0]) : 0

  if (numMoney <= 0) {
      return conn.reply(m.chat, 'Inserisci un numero valido di money da aggiungere!', m)
  }

  user.money = (user.money || 0) + numMoney
  conn.reply(m.chat, `Ho aggiunto ${numMoney} money a @${mention.split('@')[0]}`, null, { mentions: [mention] })
}

handler.command = /^(addmoney)$/i
handler.help = ['𝐚𝐝𝐝𝐦𝐨𝐧𝐞𝐲 @𝐭𝐚𝐠'];
handler.tags = ['owner']
handler.rowner = true
export default handler