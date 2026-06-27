//Plugin by Gab, Lucifero & 333 staff

global.estrazione = global.estrazione || {
  players: {},
  active: false,
  endTime: 0
}

let handler = async (m, { conn, args, command }) => {

  let user = global.db.data.users[m.sender]
  if (!user) return

  if (command === "estrazione") {

    if (global.estrazione.active)
      return m.reply("⏳ 𝐂'𝐞̀ 𝐠𝐢𝐚̀ 𝐮𝐧'𝐞𝐬𝐭𝐫𝐚𝐳𝐢𝐨𝐧𝐞 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨")

    global.estrazione = {
      players: {},
      active: true,
      endTime: Date.now() + 60 * 1000
    }

    let money = user.money || 0
    const bet = (x) => money >= x ? `.estrazionegioca ${x}` : `no_${x}`

    await conn.sendMessage(m.chat, {
      text:
`╔═══🎯 𝐄𝐒𝐓𝐑𝐀𝐙𝐈𝐎𝐍𝐄 𝐋𝐈𝐕𝐄 ═══╗
┃ 💰 𝐏𝐨𝐫𝐭𝐚𝐟𝐨𝐠𝐥𝐢𝐨: *${money}€*
┃
┃ ⏳ Tempo: *60 secondi*
┃ 🎲 Scegli *1 numero (1–100)*
┃ 🏆 3 numeri vincenti
╚════════════════════╝`,
      buttons: [
        { buttonId: bet(100), buttonText: { displayText: "💵 100€" }, type: 1 },
        { buttonId: bet(200), buttonText: { displayText: "💵 200€" }, type: 1 },
        { buttonId: bet(500), buttonText: { displayText: "💰 500€" }, type: 1 },
        { buttonId: bet(1000), buttonText: { displayText: "💰 1000€" }, type: 1 },
        { buttonId: bet(10000), buttonText: { displayText: "💎 10000€" }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })

    setTimeout(async () => {

      let players = global.estrazione.players
      let list = Object.entries(players).filter(([_, v]) => v.number !== null)

      if (!list.length) {
        global.estrazione.active = false
        return conn.sendMessage(m.chat, {
          text:
`╔═💀 𝐄𝐒𝐓𝐑𝐀𝐙𝐈𝐎𝐍𝐄 𝐀𝐍𝐍𝐔𝐋𝐋𝐀𝐓𝐀 ═╗
┃ Nessuno ha partecipato...
┃
┃ Che tristezza 😐
╚═══════════════════╝`
        })
      }

      await conn.sendMessage(m.chat, {
        text: "🎯 Estrazione in corso..."
      })

      await new Promise(r => setTimeout(r, 2000))

      let winNumbers = []
      while (winNumbers.length < 3) {
        let r = Math.floor(Math.random() * 100) + 1
        if (!winNumbers.includes(r)) winNumbers.push(r)
      }

      let winners = list.filter(([_, v]) => winNumbers.includes(v.number))
      let pool = list.reduce((acc, [_, v]) => acc + v.bet, 0)

      let text =
`╔═══🎯 𝐑𝐈𝐒𝐔𝐋𝐓𝐀𝐓𝐎 ═══╗
┃ 🎲 Numeri usciti:
┃ ➤ ${winNumbers.join(" • ")}
┃
┃ 💰 Montepremi:
┃ ➤ *${pool}€*
╚═══════════════════╝\n\n`

      if (winners.length) {

        let prize = Math.floor(pool / winners.length)

        winners.forEach(([jid]) => {
          global.db.data.users[jid].money += prize
        })

        text += `🏆 𝐕𝐈𝐍𝐂𝐈𝐓𝐎𝐑𝐈\n`
        winners.forEach(([jid]) => {
          text += `➤ @${jid.split("@")[0]}\n`
        })

        text += `\n💎 Premio: *${prize}€* ciascuno`

      } else {
        text += `💀 Nessun vincitore...\n\nRiprova, magari oggi sei meno sfortunato 😈`
      }

      global.estrazione = {
        players: {},
        active: false,
        endTime: 0
      }

      await conn.sendMessage(m.chat, {
        text,
        mentions: winners.map(w => w[0]),
        buttons: [
          { buttonId: ".estrazione", buttonText: { displayText: "🎯 Nuova estrazione" }, type: 1 }
        ],
        headerType: 1
      })

    }, 60000)
  }

  if (command === "estrazionegioca") {

    if (!global.estrazione.active)
      return m.reply("❌ Nessuna estrazione attiva")

    let bet = parseInt(args[0])
    if (!bet || bet < 50) return m.reply("💸 Puntata minima 50€")
    if (user.money < bet) return m.reply(`💸 Devi avere almeno ${bet}€`)

    global.estrazione.players[m.sender] = {
      bet,
      number: null
    }

    user.money -= bet

    return m.reply(
`╔═🎯 𝐏𝐀𝐑𝐓𝐄𝐂𝐈𝐏𝐀𝐙𝐈𝐎𝐍𝐄 ═╗
┃ 💰 Puntata: *${bet}€*
┃
┃ ✍️ Scrivi:
┃ *.scegli numero*
┃
┃ Esempio:
┃ *.scegli 77*
╚══════════════════╝`)
  }

  if (command === "scegli") {

    if (!global.estrazione.active)
      return m.reply("❌ Nessuna estrazione attiva")

    let game = global.estrazione.players[m.sender]
    if (!game) return m.reply("❌ Non stai partecipando")

    if (game.number !== null)
      return m.reply("❌ Hai già scelto un numero")

    let num = parseInt(args[0])
    if (!num || num < 1 || num > 100)
      return m.reply("⚠️ Numero valido: 1–100")

    let already = Object.values(global.estrazione.players)
      .find(p => p.number === num)

    if (already)
      return m.reply("❌ Numero già preso")

    game.number = num

    return m.reply(
`╔═✅ 𝐍𝐔𝐌𝐄𝐑𝐎 𝐒𝐂𝐄𝐋𝐓𝐎 ═╗
┃ 🎯 Numero: *${num}*
┃
┃ ⏳ Attendi l’estrazione...
╚════════════════════╝`)
  }
}

handler.command = /^(estrazione|estrazionegioca|scegli)$/i
export default handler