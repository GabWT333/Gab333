//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { args }) => {
  let user = global.db.data.users[m.sender]

  if (!user) global.db.data.users[m.sender] = {}

  user = global.db.data.users[m.sender]

  if (user.registered)
    return m.reply("❌ Sei già registrato")

  if (args.length < 3)
    return m.reply("❌ Usa così:\n.reg Nome Età Città")

  let nome = args[0]
  let eta = parseInt(args[1])
  let citta = args.slice(2).join(" ")

  if (isNaN(eta))
    return m.reply("❌ Età non valida")

  if (eta < 10 || eta > 100)
    return m.reply("❌ Età non realistica")

  user.nome = nome
  user.eta = eta
  user.citta = citta
  user.registered = true
  user.regTime = Date.now()

  m.reply(`
✅ 𝐑𝐄𝐆𝐈𝐒𝐓𝐑𝐀𝐙𝐈𝐎𝐍𝐄 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀

👤 Nome: ${nome}
🎂 Età: ${eta}
📍 Città: ${citta}
`)
}

handler.command = ['reg']
handler.tags = ['info']

export default handler