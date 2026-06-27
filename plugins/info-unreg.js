//Plugin by Gab, Lucifero & 333 staff

let handler = async (m) => {
  let user = global.db.data.users[m.sender]

  if (!user || !user.registered)
    return m.reply("❌ Non sei registrato")

  user.nome = null
  user.eta = null
  user.citta = null
  user.registered = false
  user.regTime = null

  m.reply("🗑️ Registrazione rimossa con successo")
}

handler.command = ['unreg', 'toglireg']
handler.tags = ['info']

export default handler