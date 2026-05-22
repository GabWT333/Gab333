//Plugin by Gab, Lucifero & 333 staff

import { createCanvas } from 'canvas'

let unoSession = {}

const coloriHex = { 
    'Rosso': '#FF3B30', 
    'Blu': '#007AFF', 
    'Giallo': '#FFCC00', 
    'Verde': '#4CD964', 
    'Jolly': '#1C1C1E' 
}

const gameButtons = () => [{
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({
        display_text: '📥 𝐏𝐄𝐒𝐂𝐀',
        id: 'pesca'
    })
}, {
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({
        display_text: '🛑 𝐀𝐁𝐁𝐀𝐍𝐃𝐎𝐍𝐀',
        id: 'enduno'
    })
}]

async function generaGrafica(s) {
    const canvas = createCanvas(1000, 600)
    const ctx = canvas.getContext('2d')

    const gradiente = ctx.createLinearGradient(0, 0, 1000, 600)
    gradiente.addColorStop(0, '#1e1e24')
    gradiente.addColorStop(1, '#09090b')

    ctx.fillStyle = gradiente
    ctx.fillRect(0, 0, 1000, 600)

    ctx.fillStyle = 'rgba(255,255,255,0.10)'
    ctx.font = 'bold 90px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('333 BOT', 500, 320)

    const drawCard = (x, y, label, color, hidden = false, scale = 1) => {
        const w = 80 * scale
        const h = 120 * scale

        ctx.shadowColor = 'rgba(0,0,0,0.4)'
        ctx.shadowBlur = 10

        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.roundRect(x, y, w, h, 12 * scale)
        ctx.fill()

        ctx.shadowBlur = 0

        if (hidden) {
            ctx.fillStyle = '#1c1c1e'
            ctx.beginPath()
            ctx.roundRect(x + 4, y + 4, w - 8, h - 8, 8 * scale)
            ctx.fill()

            ctx.fillStyle = '#fff'
            ctx.font = `bold ${16 * scale}px Arial`
            ctx.fillText('333', x + (w / 2), y + (h / 2) + 6)
        } else {
            ctx.fillStyle = color
            ctx.beginPath()
            ctx.roundRect(x + 4, y + 4, w - 8, h - 8, 8 * scale)
            ctx.fill()

            ctx.fillStyle = '#fff'
            ctx.font = `bold ${26 * scale}px Arial`
            ctx.textAlign = 'center'
            ctx.fillText(label.split(' ')[1] || label, x + (w / 2), y + (h / 2) + 10)
        }
    }

    drawCard(50, 240, 'Mazzo', '#3a3a3c', true, 0.9)

    let botX = 500 - (Math.min(s.botHand.length, 10) * 15)

    s.botHand.slice(0, 12).forEach((_, i) => {
        drawCard(botX + (i * 30), 40, '', '', true, 0.7)
    })

    let tColore = coloriHex[s.currentColor] || coloriHex['Jolly']

    ctx.shadowColor = tColore
    ctx.shadowBlur = 25

    drawCard(460, 230, s.tableCard, tColore, false, 1.2)

    ctx.shadowBlur = 0

    let startX = 500 - (s.playerHand.length * 45)

    s.playerHand.forEach((c, i) => {
        let col = coloriHex[c.split(' ')[0]] || coloriHex['Jolly']

        drawCard(startX + (i * 90), 420, c, col, false, 1)

        ctx.fillStyle = 'rgba(255,255,255,0.8)'
        ctx.font = 'bold 15px Arial'
        ctx.textAlign = 'center'

        ctx.fillText(`${i + 1}`, startX + (i * 90) + 40, 565)
    })

    return canvas.toBuffer('image/jpeg', {
        quality: 0.95
    })
}

function creaMazzo() {
    let colori = ['Rosso', 'Blu', 'Giallo', 'Verde']
    let mazzo = []

    colori.forEach(c => {
        mazzo.push(`${c} 0`)

        for (let v = 1; v <= 9; v++) {
            mazzo.push(`${c} ${v}`)
            mazzo.push(`${c} ${v}`)
        }

        for (let i = 0; i < 2; i++) {
            mazzo.push(`${c} +2`)
        }
    })

    for (let i = 0; i < 4; i++) {
        mazzo.push('Jolly')
        mazzo.push('Jolly +4')
    }

    return mazzo.sort(() => Math.random() - 0.5)
}

function puoGiocare(carta, tavolo, coloreScelto) {
    if (carta.includes('Jolly')) return true

    let [c_c, v_c] = carta.split(' ')
    let [c_t, v_t] = tavolo.split(' ')

    return c_c === coloreScelto || v_c === v_t
}

function botTurno(s) {
    let mosse = s.botHand.filter(c =>
        puoGiocare(c, s.tableCard, s.currentColor)
    )

    if (mosse.length > 0) {
        let scelta = mosse.find(c => !c.includes('Jolly')) || mosse[0]

        s.botHand.splice(s.botHand.indexOf(scelta), 1)

        s.tableCard = scelta

        s.currentColor = scelta.includes('Jolly')
            ? ['Rosso', 'Blu', 'Verde', 'Giallo'][Math.floor(Math.random() * 4)]
            : scelta.split(' ')[0]

        let res = `\n🤖 333 BOT mette: *${scelta}*`

        if (scelta.includes('+2')) {
            for (let i = 0; i < 2; i++) {
                s.playerHand.push(s.mazzo.shift())
            }

            res += `\n⚠️ Prendi +2!`
            res += botTurno(s)
        }

        else if (scelta.includes('+4')) {
            for (let i = 0; i < 4; i++) {
                s.playerHand.push(s.mazzo.shift())
            }

            res += `\n🔥 Prendi +4!`
            res += botTurno(s)
        }

        return res
    }

    else {
        if (s.mazzo.length === 0) {
            s.mazzo = creaMazzo()
        }

        s.botHand.push(s.mazzo.shift())

        return `\n🤖 333 BOT pesca.`
    }
}

let handler = async (m, { conn }) => {
    let chat = m.chat

    let mazzo = creaMazzo()

    unoSession[chat] = {
        player: m.sender,
        mazzo,
        playerHand: mazzo.splice(0, 7),
        botHand: mazzo.splice(0, 7),
        tableCard: mazzo.find(c =>
            !c.includes('Jolly') &&
            !c.includes('+')
        ),
        currentColor: ''
    }

    unoSession[chat].currentColor =
        unoSession[chat].tableCard.split(' ')[0]

    let img = await generaGrafica(unoSession[chat])

    await conn.sendMessage(chat, {
        image: img,
        mimetype: 'image/jpeg',
        fileName: 'uno.jpg',
        caption:
`🃏 *UNO MATCH - 333 BOT*

🎨 Colore attuale: *${unoSession[chat].currentColor}*`
    }, { quoted: m })

    await conn.sendMessage(chat, {
        text:
`🎮 *AZIONI DISPONIBILI*

📥 Premi il bottone per pescare
🛑 Premi il bottone per uscire
🎴 Oppure scrivi il numero della carta`,
        interactiveButtons: gameButtons()
    }, { quoted: m })
}

handler.before = async (m, { conn }) => {
    let chat = m.chat
    let s = unoSession[chat]

    if (!s || s.player !== m.sender) return

    let msgText = (m.text || m.body || '').trim().toLowerCase()

    if (m.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson) {
        try {
            const params = JSON.parse(
                m.message.interactiveResponseMessage
                .nativeFlowResponseMessage.paramsJson
            )

            msgText = params.id.toLowerCase()
        } catch {}
    }

    if (msgText === '.uno' || msgText === 'uno') return

    if (msgText === 'enduno') {
        delete unoSession[chat]
        return m.reply('🛑 Partita terminata.')
    }

    let report = ''

    if (msgText === 'pesca') {
        if (s.mazzo.length === 0) {
            s.mazzo = creaMazzo()
        }

        let p = s.mazzo.shift()

        s.playerHand.push(p)

        report = `📥 Hai pescato: ${p}`

        if (!puoGiocare(p, s.tableCard, s.currentColor)) {
            report += `\n❌ Non giocabile.`
            report += botTurno(s)
        }
    }

    else {
        let idx = parseInt(msgText) - 1

        if (isNaN(idx)) return

        idx--

        if (idx < 0 || idx >= s.playerHand.length) return

        let carta = s.playerHand[idx]

        if (!puoGiocare(carta, s.tableCard, s.currentColor)) {
            return m.reply('❌ Carta non valida.')
        }

        s.playerHand.splice(idx, 1)

        s.tableCard = carta

        s.currentColor = carta.includes('Jolly')
            ? s.currentColor
            : carta.split(' ')[0]

        report = `✅ Hai giocato: ${carta}`

        if (carta.includes('+2')) {
            for (let i = 0; i < 2; i++) {
                s.botHand.push(s.mazzo.shift())
            }

            report += `\n⚠️ Il bot prende +2`
        }

        else if (carta.includes('+4')) {
            for (let i = 0; i < 4; i++) {
                s.botHand.push(s.mazzo.shift())
            }

            report += `\n🔥 Il bot prende +4`
        }

        else {
            report += botTurno(s)
        }
    }

    if (s.playerHand.length === 0) {
        delete unoSession[chat]
        return m.reply('🏆 Hai vinto!')
    }

    if (s.botHand.length === 0) {
        delete unoSession[chat]
        return m.reply('💀 333 BOT ha vinto!')
    }

    let img = await generaGrafica(s)

    await conn.sendMessage(chat, {
        image: img,
        mimetype: 'image/jpeg',
        fileName: 'uno_update.jpg',
        caption:
`🃏 *UNO MATCH*

${report}

🎨 Colore attuale: *${s.currentColor}*`
    }, { quoted: m })

    await conn.sendMessage(chat, {
        text: '🎮 Tocca un bottone oppure scrivi il numero della carta',
        interactiveButtons: gameButtons()
    }, { quoted: m })
}

handler.command = /^(uno)$/i

export default handler