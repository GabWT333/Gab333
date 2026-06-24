//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn }) => {

    let users = global.db.data.users
    let user = users[m.sender] = users[m.sender] || {}

    user.money = user.money || 0
    user.lastProstituta = user.lastProstituta || 0

    let now = Date.now()
    let cooldown = 5 * 60 * 1000 // ⏱️ 5 minuti

    let userTag = `@${m.sender.split('@')[0]}`

    if (now - user.lastProstituta < cooldown) {

        let remainingMs = cooldown - (now - user.lastProstituta)
        let minutes = Math.floor(remainingMs / 60000)
        let seconds = Math.floor((remainingMs % 60000) / 1000)

        return conn.reply(m.chat,
`╭━━━〔 ⏳ ASPETTA 〕━━━╮
┃
┃ 👤 ${userTag}
┃ ⏱️ Riprova tra ${minutes}m ${seconds}s
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`,
        m,
        { mentions: [m.sender] })
    }

    user.lastProstituta = now

    let eventi = [
        { tipo: 'gain', min: 50, max: 200, testo: "💋 Hai lavorato tutta la notte" },
        { tipo: 'gain', min: 100, max: 300, testo: "🔥 Cliente ricco trovato" },
        { tipo: 'gain', min: 30, max: 150, testo: "😏 Serata tranquilla" },

        { tipo: 'loss', min: 20, max: 100, testo: "🤒 Hai pagato cure mediche" },
        { tipo: 'loss', min: 50, max: 150, testo: "🚔 Multa improvvisa" },
        { tipo: 'loss', min: 10, max: 80, testo: "😬 Cliente scappato senza pagare" }
    ]

    let ev = eventi[Math.floor(Math.random() * eventi.length)]
    let amount = Math.floor(Math.random() * (ev.max - ev.min + 1)) + ev.min

    let text = ""

    if (ev.tipo === 'gain') {

        user.money += amount

        text =
`╭━━━〔 💋 LAVORO NOTTURNO 〕━━━╮
┃
┃ 👤 ${userTag}
┃ ${ev.testo}
┃ 💰 Guadagno: +${amount} €
┃ 💵 Totale: ${user.money} €
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`

    } else {

        user.money -= amount
        if (user.money < 0) user.money = 0

        text =
`╭━━━〔 🤒 GIORNATA STORTA 〕━━━╮
┃
┃ 👤 ${userTag}
┃ ${ev.testo}
┃ 💸 Perdita: -${amount} €
┃ 💵 Totale: ${user.money} €
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
    }

    conn.reply(m.chat, text, m, {
        mentions: [m.sender]
    })
}

handler.command = ['prostituta']

export default handler