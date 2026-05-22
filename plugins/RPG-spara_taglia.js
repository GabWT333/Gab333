//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn }) => {

    if (!m.isGroup) return

    let data = global.bounty?.[m.chat]

    if (!data || !data.active) {
        return conn.reply(m.chat,
`🎯 Nessuna taglia attiva al momento.

Aspetta che il bot metta una taglia 👀`,
        m)
    }

    if (!data.shots) data.shots = []

    if (data.shots.includes(m.sender)) {
        return conn.reply(m.chat,
`🚫 Hai già sparato per questa taglia.

Aspetta la prossima 👀`,
        m)
    }

    if (m.sender === data.target) {
        return conn.reply(m.chat,
`🚫 Non puoi spararti da solo.`,
        m)
    }

    data.shots.push(m.sender)

    let fail = Math.random() < 0.3

    if (fail) {
        return conn.reply(m.chat,
`💥 @${m.sender.split('@')[0]} ha sparato...

❌ *MIRA DI MERDA, MANCATO!*

Sei fuori gioco per questa taglia.`,
        m,
        { mentions: [m.sender] })
    }

    let users = global.db.data.users
    users[m.sender] = users[m.sender] || {}

    let reward = data.reward

    users[m.sender].money = (users[m.sender].money || 0) + reward

    data.active = false

    await conn.reply(m.chat,
`💥 COLPO PERFETTO!

🏆 @${m.sender.split('@')[0]} ha preso ${reward}€!

🎯 Taglia riscattata.`,
    m,
    { mentions: [m.sender] })
}

handler.command = /^spara$/i
handler.group = true

export default handler