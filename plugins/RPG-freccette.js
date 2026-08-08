//Plugin by Gab, Lucifero & 333 staff

global.casinoRateLimit = global.casinoRateLimit || {}

const checkRateLimit = (userId, commandName) => {
  const key = `${userId}_${commandName}`
  const now = Date.now()
  const lastUse = global.casinoRateLimit[key]
  
  if (lastUse && now - lastUse < 120000) {
    const timeLeft = Math.ceil((120000 - (now - lastUse)) / 1000)
    return { allowed: false, timeLeft }
  }
  
  global.casinoRateLimit[key] = now
  return { allowed: true }
}

let handler = async (m, { conn, args, command }) => {

  let user = global.db.data.users[m.sender]
  if (!user) return

  if (command === "freccette") {
    const rateCheck = checkRateLimit(m.sender, 'freccette')
    if (!rateCheck.allowed) {
      return m.reply(`⏳ *Devi aspettare ${rateCheck.timeLeft} secondi* prima di giocare di nuovo alle freccette!`)
    }

    let money = user.money || 0
    const bet = (x) => money >= x ? `.freccetteplay ${x}` : `no_${x}`

    return conn.sendMessage(m.chat, {
      text:
`╔═🎯 𝐅𝐑𝐄𝐂𝐂𝐄𝐓𝐓𝐄 ═╗
┃ 💰 Portafoglio: *${money}€*
┃
┃ 🎯 Colpisci il bersaglio!
┃ Più punti fai, più vinci
╚══════════════╝`,
      buttons: [
        { buttonId: bet(100), buttonText: { displayText: "💵 100€" }, type: 1 },
        { buttonId: bet(200), buttonText: { displayText: "💵 200€" }, type: 1 },
        { buttonId: bet(500), buttonText: { displayText: "💰 500€" }, type: 1 },
        { buttonId: bet(1000), buttonText: { displayText: "💰 1000€" }, type: 1 },
        { buttonId: bet(10000), buttonText: { displayText: "💎 10000€" }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }

  if (command === "freccetteplay") {

    let bet = parseInt(args[0])
    let money = user.money || 0

    if (!bet || bet < 50) return m.reply("💸 Puntata minima 50€")
    if (money < bet) return m.reply(`💸 Devi avere almeno ${bet}€`)

    user.money -= bet

    await conn.sendMessage(m.chat, {
      text: "🎯 Lancio della freccetta..."
    }, { quoted: m })

    await new Promise(r => setTimeout(r, 2000))

    let score = Math.floor(Math.random() * 61)

    let text =
`╔═🎯 𝐅𝐑𝐄𝐂𝐂𝐄𝐓𝐓𝐀 ═╗
┃ 🎯 Punteggio: *${score}*
╚══════════════╝\n\n`

    let win = 0

    if (score >= 50) {
      win = bet * 2
      text += `🎯 BULLSEYE!\n💰 Vinci *${win}€*`
    } else if (score >= 30) {
      win = Math.floor(bet * 1.5)
      text += `🙂 Buon tiro\n💰 Vinci *${win}€*`
    } else {
      text += `💀 Hai fatto schifo\nHai perso *${bet}€*`
    }

    user.money += win

    return conn.sendMessage(m.chat, {
      text,
      buttons: [
        { buttonId: ".freccette", buttonText: { displayText: "🎯 Gioca di nuovo" }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }
}

handler.command = /^(freccette|freccetteplay)$/i
export default handler