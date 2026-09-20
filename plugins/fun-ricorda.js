//Plugin by Gab, Lucifero & 333 staff

const handler = async (m, { conn, args }) => {

  if (args.length < 2) {
    return conn.reply(m.chat,
`╔═🔔 𝐏𝐑𝐎𝐌𝐄𝐌𝐎𝐑𝐈𝐀═╗
┃ Uso:
┃ .promemoria <tempo> [@user] <messaggio>
┃
┃ Esempi:
┃ • .promemoria 18:30 Studiare
┃ • .promemoria @user 10m Bere acqua
┃ • .promemoria 1h Allenamento
╚═════════════╝`, m)
  }

  const isValidTimeInput = (str) => {
    if (str.includes(":")) {
      const [h, min] = str.split(":")
      return !isNaN(h) && !isNaN(min)
    } else if (/[smh]$/.test(str)) {
      return !isNaN(str.slice(0, -1))
    }
    return false
  }

  let target, timeInput, reminderMessage

  if (isValidTimeInput(args[0])) {
    timeInput = args[0]

    if (m.mentionedJid?.length) {
      target = m.mentionedJid[0]
      reminderMessage = args.slice(1).filter(a => !a.startsWith("@")).join(" ")
    } else {
      target = m.sender
      reminderMessage = args.slice(1).join(" ")
    }

  } else {
    if (m.mentionedJid?.length && isValidTimeInput(args[1])) {
      target = m.mentionedJid[0]
      timeInput = args[1]
      reminderMessage = args.slice(2).join(" ")
    } else {
      return conn.reply(m.chat, "❌ Formato non valido.", m)
    }
  }

  if (!reminderMessage) {
    return conn.reply(m.chat, "❌ Inserisci il messaggio.", m)
  }

  const now = new Date()
  const nowIT = new Date(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Rome",
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }).format(now)
  )

  let delay = 0

  if (timeInput.includes(":")) {

    const [hStr, mStr] = timeInput.split(":")
    const hours = Number(hStr)
    const minutes = Number(mStr)

    if (hours > 23 || minutes > 59) {
      return conn.reply(m.chat, "❌ Orario non valido.", m)
    }

    let targetTime = new Date(nowIT)
    targetTime.setHours(hours, minutes, 0, 0)

    if (targetTime <= nowIT) {
      targetTime.setDate(targetTime.getDate() + 1)
    }

    delay = targetTime.getTime() - nowIT.getTime()

  } else {

    const unit = timeInput.slice(-1)
    const value = parseInt(timeInput.slice(0, -1))

    if (isNaN(value)) {
      return conn.reply(m.chat, "❌ Tempo non valido.", m)
    }

    if (unit === "s") delay = value * 1000
    if (unit === "m") delay = value * 60 * 1000
    if (unit === "h") delay = value * 60 * 60 * 1000
  }

  let tag = target === m.sender ? "te" : `@${target.split("@")[0]}`

  await conn.sendMessage(m.chat, {
    text:
`╔═🔔 𝐏𝐑𝐎𝐌𝐄𝐌𝐎𝐑𝐈𝐀═╗
┃ 👤 Destinatario: ${tag}
┃ ⏳ Tempo: ${timeInput}
┃
┃ 📝 Messaggio:
┃ ${reminderMessage}
╚═════════════╝`,
    mentions: target === m.sender ? [] : [target]
  })

  setTimeout(async () => {
    await conn.sendMessage(target, {
      text:
`⏰ 𝐏𝐑𝐎𝐌𝐄𝐌𝐎𝐑𝐈𝐀

${reminderMessage}`
    })
  }, delay)
}

handler.command = /^promemoria$/i
handler.tags = ['utility']
handler.help = ['promemoria']

export default handler