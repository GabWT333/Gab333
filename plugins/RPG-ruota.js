//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn, command }) => {

  global.ruotaSession = global.ruotaSession || {}
  global.ruotaTimeout = global.ruotaTimeout || {}

  let user = global.db.data.users[m.sender]
  if (!user) {
    global.db.data.users[m.sender] = { bank: 0, ruotaCount: 0, ruotaLast: 0 }
    user = global.db.data.users[m.sender]
  }

  let oggi = new Date().toDateString()
  if (user.ruotaLast !== oggi) {
    user.ruotaCount = 0
    user.ruotaLast = oggi
  }

  if (command === 'ruota') {

    if (user.ruotaCount >= 3)
      return conn.reply(m.chat, '❌ 𝐇𝐚𝐢 𝐠𝐢𝐚̀ 𝐠𝐢𝐫𝐚𝐭𝐨 𝐥𝐚 𝐫𝐮𝐨𝐭𝐚 𝟑 𝐯𝐨𝐥𝐭𝐞 𝐨𝐠𝐠𝐢! 𝐓𝐨𝐫𝐧𝐚 𝐝𝐨𝐦𝐚𝐧𝐢!', m)

    if (global.ruotaSession[m.sender])
      return conn.reply(m.chat, '𝐂’𝐞̀ 𝐠𝐢𝐚̀ 𝐮𝐧𝐚 𝐬𝐜𝐞𝐥𝐭𝐚 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨! 𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐜𝐨𝐧 .𝐬𝐢 𝐨 .𝐧𝐨', m)

    global.ruotaSession[m.sender] = true

    global.ruotaTimeout[m.sender] = setTimeout(() => {
      if (global.ruotaSession[m.sender]) {
        delete global.ruotaSession[m.sender]
        conn.reply(m.chat, '⏰ 𝐓𝐞𝐦𝐩𝐨 𝐬𝐜𝐚𝐝𝐮𝐭𝐨! 𝐆𝐢𝐫𝐨 𝐚𝐧𝐧𝐮𝐥𝐥𝐚𝐭𝐨.', m)
      }
    }, 30 * 1000) 

    return conn.reply(
      m.chat,
      `╭─────────╮
┃ 🎡 𝐑𝐔𝐎𝐓𝐀 𝐃𝐄𝐋𝐋𝐀 𝐅𝐎𝐑𝐓𝐔𝐍𝐀! 
┃━━━━━━━━━━━━━━
┃ 𝐋𝐚 𝐫𝐮𝐨𝐭𝐚 𝐡𝐚 𝟏𝟖 𝐬𝐩𝐢𝐜𝐜𝐡𝐢:\n┃ 𝟏𝟎 𝐯𝐢𝐧𝐜𝐞𝐧𝐭𝐢\n┃ (𝐦𝐚𝐱: 𝟏𝟎𝟎.𝟎𝟎𝟎€)\n┃ 𝟖 𝐩𝐞𝐫𝐝𝐞𝐧𝐭𝐢 \n┃ (𝐦𝐚𝐱: 𝐩𝐞𝐫𝐝𝐢𝐭𝐚 𝐭𝐨𝐭𝐚𝐥𝐞)
┃ 𝐕𝐮𝐨𝐢 𝐭𝐞𝐧𝐭𝐚𝐫𝐞 𝐥𝐚 𝐟𝐨𝐫𝐭𝐮𝐧𝐚? 
┃━━━━━━━━━━━━━━
┃ 𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢:
┃ .𝐬𝐢 𝐩𝐞𝐫 𝐚𝐜𝐜𝐞𝐭𝐭𝐚𝐫𝐞
┃ .𝐧𝐨 𝐩𝐞𝐫 𝐫𝐢𝐟𝐢𝐮𝐭𝐚𝐫𝐞
┃━━━━━━━━━━━━━━
┃ ⏳𝐇𝐚𝐢 𝟑𝟎 𝐬𝐞𝐜𝐨𝐧𝐝𝐢 𝐝𝐢 𝐭𝐞𝐦𝐩𝐨\n┃ 𝐩𝐞𝐫 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐞𝐫𝐞\n┃━━━━━━━━━━━━━━\n> 𝐋𝐚 𝐫𝐮𝐨𝐭𝐚 𝐬𝐢 𝐩𝐮𝐨̀ 𝐠𝐢𝐫𝐚𝐫𝐞 𝐦𝐚𝐬𝐬𝐢𝐦𝐨 𝟑 𝐯𝐨𝐥𝐭𝐞 𝐚𝐥 𝐠𝐢𝐨𝐫𝐧𝐨!\n╰─────────╯`,
      m
    )
  }

  if (command === 'si') {
    if (!global.ruotaSession[m.sender])
      return conn.reply(m.chat, '𝐍𝐞𝐬𝐬𝐮𝐧 𝐠𝐢𝐫𝐨 𝐝𝐢 𝐫𝐮𝐨𝐭𝐚 𝐚𝐭𝐭𝐢𝐯𝐨!', m)

    if (global.ruotaTimeout[m.sender]) {
      clearTimeout(global.ruotaTimeout[m.sender])
      delete global.ruotaTimeout[m.sender]
    }

    delete global.ruotaSession[m.sender]

    user.ruotaCount += 1

    const premi = [
      { name: '*100€*', amount: 100, weight: 20 },
      { name: '*200€*', amount: 200, weight: 15 },
      { name: '*300€*', amount: 300, weight: 10 },
      { name: '*400€*', amount: 400, weight: 8 },
      { name: '*500€*', amount: 500, weight: 5 },
      { name: '*1000€*', amount: 1000, weight: 4 },
      { name: '*Raddoppia*', amount: 'double', weight: 3 },
      { name: '*5000€*', amount: 5000, weight: 2 },
      { name: '*10.000€*', amount: 10000, weight: 1 },
      { name: '*100.000€*', amount: 100000, weight: 0.5 }
    ]

    const perdite = [
      { name: '*-100€*', amount: -100, weight: 20 },
      { name: '*-200€*', amount: -200, weight: 15 },
      { name: '*-300€*', amount: -300, weight: 10 },
      { name: '*-400€*', amount: -400, weight: 8 },
      { name: '*-500€*', amount: -500, weight: 5 },
      { name: '*-1000€*', amount: -1000, weight: 4 },
      { name: '*-10.000€*', amount: -10000, weight: 2 },
      { name: '*PERDI TUTTO€*', amount: 'all', weight: 1 }
    ]

    function pick(lista) {
      const total = lista.reduce((a, b) => a + b.weight, 0)
      let rand = Math.random() * total
      for (let item of lista) {
        if (rand < item.weight) return item
        rand -= item.weight
      }
    }

    const frames = [
      "🎡 ▰▱▱▱▱",
      "🎡 ▰▰▰▱▱",
      "🎡 ▰▰▰▰▰"
    ]

    await conn.reply(m.chat, "🎡 𝐋𝐚 𝐫𝐮𝐨𝐭𝐚 𝐬𝐭𝐚 𝐠𝐢𝐫𝐚𝐧𝐝𝐨...", m)

    for (let f of frames) {
      await new Promise(r => setTimeout(r, 3000))
      await conn.reply(m.chat, f + "\n\n꙰  𝟥𝟥𝟥 𝔹𝕆𝕋  ꙰", m)
    }

    let lista = Math.random() < 0.5 ? premi : perdite
    let risultato = pick(lista)

    if (risultato.amount === 'double') user.bank *= 2
    else if (risultato.amount === 'all') user.bank = 0
    else user.bank += risultato.amount

    if (user.bank < 0) user.bank = 0

    let finalText = (risultato.amount > 0 || risultato.amount === 'double') ?
      `🏆 𝐕𝐈𝐓𝐓𝐎𝐑𝐈𝐀!\n𝐇𝐚𝐢 𝐯𝐢𝐧𝐭𝐨: ${risultato.name}\n💰 𝐒𝐚𝐥𝐝𝐨 𝐛𝐚𝐧𝐜𝐚𝐫𝐢𝐨 𝐚𝐭𝐭𝐮𝐚𝐥𝐞: *${user.bank}€*\n𝐅𝐨𝐫𝐭𝐮𝐧𝐚𝐭𝐨!` :
      `💀 𝐒𝐂𝐎𝐍𝐅𝐈𝐓𝐓𝐀!\n𝐇𝐚𝐢 𝐩𝐞𝐫𝐬𝐨: ${risultato.name}\n💰 𝐒𝐚𝐥𝐝𝐨 𝐛𝐚𝐧𝐜𝐚𝐫𝐢𝐨 𝐚𝐭𝐭𝐮𝐚𝐥𝐞: *${user.bank}€*\n𝐑𝐢𝐭𝐞𝐧𝐭𝐚, 𝐬𝐚𝐫𝐚𝐢 𝐩𝐢𝐮̀ 𝐟𝐨𝐫𝐭𝐮𝐧𝐚𝐭𝐨!`

    await conn.reply(m.chat, finalText, m)
  }
}

handler.command = /^(ruota|si|no)$/i

export default handler