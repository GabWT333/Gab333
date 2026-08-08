//Plugin by Gab, Lucifero & 333 staff



let heists = {}

const ENTRY_FEE = 500
const MAX_PLAYERS = 5

let handler = async (m, { command, conn }) => {

  const chat = m.chat
  const sender = m.sender

  global.db.data.users[sender] = global.db.data.users[sender] || {}
  let user = global.db.data.users[sender]

  if (command === 'colpo') {

    if (heists[chat])
      return m.reply("💀 C'è già un colpo in corso")

    heists[chat] = {
      players: [],
      started: false
    }

    await conn.sendMessage(chat, {
      text: `💰 COLPO IN PREPARAZIONE!

💸 Ingresso: ${ENTRY_FEE}€
👥 Max: ${MAX_PLAYERS} persone

Scrivi *.partecipa* per partecipare
⏳ Tempo: 30 secondi`
    })

    setTimeout(async () => {

      let data = heists[chat]
      if (!data) return

      if (data.players.length < 2) {
        delete heists[chat]
        return conn.sendMessage(chat, { text: "❌ Colpo annullato (pochi partecipanti)" })
      }

      data.started = true

      let result = `💣 COLPO IN CORSO...\n\n`

      for (let p of data.players) {

        let user = global.db.data.users[p]
        let rand = Math.random()

        let outcome = ""

        if (rand < 0.4) {
          let win = Math.floor(Math.random() * 800) + 200
          user.money = (user.money || 0) + win
          outcome = `💰 @${p.split('@')[0]} scappa con ${win}€`
        } 
        else if (rand < 0.75) {
          let lose = Math.floor(Math.random() * 400) + 100
          user.money = Math.max(0, (user.money || 0) - lose)
          outcome = `💸 @${p.split('@')[0]} perde ${lose}€`
        } 
        else {
          user.heistJail = Date.now() + (10 * 60 * 1000)
          outcome = `🚔 @${p.split('@')[0]} è stato arrestato (10 min)`
        }

        result += outcome + '\n'
      }

      await conn.sendMessage(chat, {
        text: result,
        mentions: data.players
      })

      delete heists[chat]

    }, 30000)
  }

  if (command === 'partecipa' || command === 'join') {

    let data = heists[chat]
    if (!data)
      return m.reply("❌ Nessun colpo attivo")

    if (data.started)
      return m.reply("💀 Il colpo è già partito")

    if (data.players.length >= MAX_PLAYERS)
      return m.reply("❌ Squadra piena")

    if (data.players.includes(sender))
      return m.reply("❌ Sei già dentro")

    if (user.heistJail && Date.now() < user.heistJail)
      return m.reply("🚔 Sei in prigione, aspetta")

    if ((user.money || 0) < ENTRY_FEE)
      return m.reply(`💸 Ti servono almeno ${ENTRY_FEE}€ per partecipare`)

    user.money -= ENTRY_FEE

    data.players.push(sender)

    return m.reply(`✅ Entrato nel colpo (${data.players.length}/${MAX_PLAYERS})`)
  }

}

handler.command = /^(colpo|partecipa)$/i
handler.group = true

export default handler