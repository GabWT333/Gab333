//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { args }) => {
  let users = global.db.data.users
  let user = users[m.sender]

  let pin = args[0]

  if (!pin || !/^\d{4}$/.test(pin))
    return m.reply("🔐 Inserisci un PIN di 4 numeri")

  const blacklist = ['0000', '1111', '1234', '2222']
  if (blacklist.includes(pin))
    return m.reply("❌ PIN troppo facile, scegline uno migliore")

  let giaUsato = Object.entries(users).find(([id, u]) => u.pin === pin)

  if (giaUsato)
    return m.reply("❌ Questo PIN è già usato da un altro utente")

  user.pin = pin

  m.reply("✅ PIN impostato con successo")
}

handler.command = ['impostapin']
export default handler