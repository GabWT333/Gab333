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

  global.cavalli = global.cavalli || {}

  let user = global.db.data.users[m.sender]
  if (!user) global.db.data.users[m.sender] = { money: 0 }

  if (command === "cavalli") {
    const rateCheck = checkRateLimit(m.sender, 'cavalli')
    if (!rateCheck.allowed) {
      return m.reply(`⏳ *Devi aspettare ${rateCheck.timeLeft} secondi* prima di giocare di nuovo ai cavalli!`)
    }

    let money = user.money || 0

    const bet = (x) => {
      if (money < x) return `no_money`
      return `.cavalliplay ${x}`
    }

    return conn.sendMessage(m.chat, {
      text:
`╔═🐎 𝐂𝐀𝐕𝐀𝐋𝐋𝐈 ═╗
┃ 💰 Portafoglio: *${money} XP333*
┃
┃ Scegli la puntata
╚══════╝`,
      buttons: [
        { buttonId: bet(100), buttonText: { displayText: "100 XP333" }, type: 1 },
        { buttonId: bet(200), buttonText: { displayText: "200 XP333" }, type: 1 },
        { buttonId: bet(500), buttonText: { displayText: "500 XP333" }, type: 1 },
        { buttonId: bet(1000), buttonText: { displayText: "1000 XP333" }, type: 1 },
        { buttonId: bet(10000), buttonText: { displayText: "10000 XP333" }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }

  if (command === "cavalliplay") {

    let bet = parseInt(args[0])

    if (!bet || bet < 50) return m.reply("💸 Puntata minima 50 XP333")
    if (user.money < bet) return m.reply(`💸 Devi avere almeno ${bet} XP333`)

    global.cavalli[m.sender] = { bet }

    return conn.sendMessage(m.chat, {
      text:
`╔═🐎 𝐂𝐀𝐕𝐀𝐋𝐋𝐈 ═╗
┃ 🎯 Scegli il cavallo
┃ 💰 Puntata: *${bet} XP333*
┃
┃ 🐎 1 → Jonny
┃ 🐎 2 → Gab
┃ 🐎 3 → Franco
╚══════╝`,
      buttons: [
        { buttonId: ".cavallo 1", buttonText: { displayText: "🐎 Jonny" }, type: 1 },
        { buttonId: ".cavallo 2", buttonText: { displayText: "🐎 Gab" }, type: 1 },
        { buttonId: ".cavallo 3", buttonText: { displayText: "🐎 Franco" }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }

  if (command === "cavallo") {

    let scelta = parseInt(args[0])
    let game = global.cavalli[m.sender]

    if (!game) return m.reply("❌ Devi prima fare .cavalli")

    let cavalli = {
      1: "Jonny",
      2: "Gab",
      3: "Franco"
    }

    if (![1,2,3].includes(scelta)) return m.reply("❌ Scelta non valida")

    let vincitore = Math.floor(Math.random() * 3) + 1
    let nomeVincitore = cavalli[vincitore]

    let text

    if (scelta === vincitore) {
      user.money += game.bet * 2
      text =
`╔═🐎 𝐂𝐀𝐕𝐀𝐋𝐋𝐈 ═╗
┃ 🏆 Vincitore: *${nomeVincitore}*
┃ 💰 Guadagno: +${game.bet * 2} XP333
┃
┃ 💼 Saldo: ${user.money} XP333
╚══════╝`
    } else {
      user.money -= game.bet
      text =
`╔═🐎 𝐂𝐀𝐕𝐀𝐋𝐋𝐈 ═╗
┃ 🏆 Vincitore: *${nomeVincitore}*
┃ 💀 Perso: -${game.bet} XP333
┃
┃ 💼 Saldo: ${user.money} XP333
╚══════╝`
    }

    delete global.cavalli[m.sender]

    return conn.sendMessage(m.chat, {
      text,
      buttons: [
        { buttonId: ".cavalli", buttonText: { displayText: "🔁 Gioca di nuovo" }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }

}

handler.command = /^(cavalli|cavalliplay|cavallo)$/i

export default handler