//Codice di RPG-iban.js

function generaIBAN() {
  const country = 'IT'
  const checksum = Math.floor(Math.random() * 90 + 10)
  const cin = String.fromCharCode(65 + Math.floor(Math.random() * 26))
  const abi = Math.floor(Math.random() * 90000 + 10000)
  const cab = Math.floor(Math.random() * 90000 + 10000)
  const conto = Math.floor(Math.random() * 1e12).toString().padStart(12, '0')

  return `${country}${checksum}${cin}${abi}${cab}${conto}`
}

let handler = async (m, { conn }) => {
  let users = global.db.data.users

  if (!users[m.sender]) users[m.sender] = {}
  let user = users[m.sender]

  if (!user.iban) {
    user.iban = generaIBAN()
  }

  const iban = user.iban

  await conn.sendMessage(m.chat, {
    text: `IBAN di @${m.sender.split('@')[0]}\n\n${iban}`,
    mentions: [m.sender]
  })
}

handler.command = ['iban']
handler.tags = ['economy']
handler.help = ['iban']

export default handler