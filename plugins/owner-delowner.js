//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { text }) => {
  let number
  if (m.quoted) {
    number = m.quoted.sender.split('@')[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  } else if (text) {
    number = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  } else {
    return m.reply('Scrivi un numero o rispondi a un messaggio')
  }

  const clean = number.split('@')[0]

  const exists = global.owner.some(([num]) => num === clean)
  if (!exists) return m.reply('Non è rowner')

  
  global.owner = global.owner.filter(([num]) => num !== clean)

  
  if (global.db.data.owners) {
    global.db.data.owners = global.db.data.owners.filter(v => v !== number)
  }

  m.reply(`❌ *${clean}* rimosso da rowner`)
}

handler.command = /^delowner$/i
handler.rowner = true
export default handler