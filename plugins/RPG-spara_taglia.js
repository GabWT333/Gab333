//Plugin by Gab, Lucifero & 333 staff

import { loadBounty, saveBounty } from '../lib/bounty-store.js'

global.bounty = global.bounty || loadBounty()

let handler = async (m, { conn, command }) => {

    if (!m.isGroup) return

    if (command === 'toptaglie') {
        let data = global.bounty[m.chat]
        let stats = data?.stats ? Object.entries(data.stats) : []

        if (!stats.length) {
            return conn.reply(m.chat,
`🏆 Nessun utente ha ancora riscattato una taglia in questo gruppo.`,
            m)
        }

        let ranking = stats
            .map(([jid, stat]) => ({
                jid,
                count: Number(stat?.count || 0),
                money: Number(stat?.money || 0)
            }))
            .filter(user => user.count > 0)
            .sort((a, b) => b.count - a.count || b.money - a.money || a.jid.localeCompare(b.jid))
            .slice(0, 10)

        if (!ranking.length) {
            return conn.reply(m.chat,
`🏆 Nessun utente ha ancora riscattato una taglia in questo gruppo.`,
            m)
        }

        let text = `🏆 TOP 10 TAGLIE RISCATTATE

`

        text += `📊 Classifica di chi ha riscattato più taglie in questo gruppo.
`
        text += `━━━━━━━━━━━━━━━
`

        ranking.forEach((user, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🎯'
            text += `${medal} ${index + 1}. @${user.jid.split('@')[0]}
   • Taglie: ${user.count}
   • Guadagno: ${user.money} XP333
`
        })

        text += `
━━━━━━━━━━━━━━━`

        return conn.reply(m.chat, text, m, { mentions: ranking.map(user => user.jid) })
    }

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
    saveBounty(global.bounty)

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

    global.bounty[m.chat].stats = global.bounty[m.chat].stats || {}
    let stats = global.bounty[m.chat].stats[m.sender] || { count: 0, money: 0 }
    stats.count += 1
    stats.money += reward
    global.bounty[m.chat].stats[m.sender] = stats
    saveBounty(global.bounty)

    await conn.reply(m.chat,
`💥 COLPO PERFETTO!

🏆 @${m.sender.split('@')[0]} ha preso ${reward} XP333!

🎯 Taglia riscattata.\n\n> Digita ''.toptaglie'' per vedere la classifica.`,
    m,
    { mentions: [m.sender] })
}

handler.command = /^(spara|toptaglie)$/i
handler.group = true
handler.modoadminBypass = true

export default handler