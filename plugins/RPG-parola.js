//Plugin by Gab, Lucifero & 333 staff
//Crediti a Davide di Davebot

const parole = [
    'pizza', 'gelato', 'biscotto', 'panino', 'hamburger', 'lasagna', 'pasta',
    'mozzarella', 'nutella', 'focaccia', 'telefono', 'computer', 'tastiera',
    'bicicletta', 'treno', 'aereo', 'torino', 'milano', 'roma', 'napoli',
    'londra', 'parigi', 'berlino', 'madrid', 'chitarra', 'pianoforte',
    'calcio', 'basket', 'tennis', 'universo', 'galassia', 'pianeta',
    'arcobaleno', 'montagna', 'oceano', 'castello', 'drago', 'ninja',
    'pirata', 'robot', 'vampiro', 'fantasma', 'samurai', 'gabfrocio', 'mammadigab', 'luciferobellissimo', '333bot', 'ornitorinco', 'caccola', 'porno', 'sesso', 
]

const cooldownTime = 30 * 60 * 1000
const gameTime = 30 * 1000
const triggerChance = 0.005

global.parolaGame = global.parolaGame || {}

const handler = m => m

const normalize = text => (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()

handler.before = async function (m) {
    if (!m.isGroup || !m.text || m.fromMe || m.key?.fromMe) return

    const chatId = m.chat
    const chat = global.db.data.chats[chatId] || {}
    if (chat.parola === false) return

    const now = Date.now()
    const game = global.parolaGame[chatId]

    if (game) {
        if (now >= game.endsAt) {
            delete global.parolaGame[chatId]
            await this.sendMessage(chatId, {
                text: `⌛ Tempo scaduto! Nessuno ha indovinato la parola.\n\nLa parola era: *${game.word}*`
            })
            return
        }

        if (normalize(m.text) !== game.word) return

        const users = global.db.data.users
        users[m.sender] = users[m.sender] || {}
        users[m.sender].money = (users[m.sender].money || 0) + game.reward
        delete global.parolaGame[chatId]

        await this.sendMessage(chatId, {
            text: `🏆 Che riflessi! @${m.sender.split('@')[0]} è stato il primo!\n\nLa parola era: *${game.word}*\nHai vinto *${game.reward} XP333*!`,
            contextInfo: { mentionedJid: [m.sender] }
        })
        return
    }

    if (global.parolaCooldown?.[chatId] && now - global.parolaCooldown[chatId] < cooldownTime) return
    if (Math.random() > triggerChance) return

    const word = parole[Math.floor(Math.random() * parole.length)]
    const reward = Math.floor(Math.random() * (10000 - 100 + 1)) + 100

    global.parolaCooldown = global.parolaCooldown || {}
    global.parolaCooldown[chatId] = now
    global.parolaGame[chatId] = {
        word,
        reward,
        endsAt: now + gameTime
    }

    await this.sendMessage(chatId, {
        text: `🎯 𝐏𝐀𝐑𝐎𝐋𝐀 𝐀𝐓𝐓𝐈𝐕𝐀!\n\n✍️ Scrivi per primo: *${word}*\n\n🏆 Il primo che la scrive vince *${reward} XP333*!\n\nHai 30 secondi!`
    })

    setTimeout(async () => {
        const current = global.parolaGame[chatId]
        if (!current || current.word !== word) return

        delete global.parolaGame[chatId]
        await this.sendMessage(chatId, {
            text: `⌛ Tempo scaduto! Nessuno ha indovinato la parola.\n\nLa parola era: *${word}*`
        }).catch(() => {})
    }, gameTime)
}

export default handler
handler.modoadminBypass = true
