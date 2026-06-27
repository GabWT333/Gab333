//Plugin by Gab, Lucifero & 333 staff





let handler = m => m

handler.before = async function (m) {

    if (!m.isGroup) return
    if (!m.text) return

    global.bounty = global.bounty || {}

    let data = global.bounty[m.chat] || {}

    if (data.last && Date.now() - data.last < 30 * 60 * 1000) return

    if (data.active) return

    if (Math.random() > 0.005) return

    let metadata = await this.groupMetadata(m.chat)
    let members = metadata.participants.map(p => p.id)

    let target = members[Math.floor(Math.random() * members.length)]

    let reward = Math.floor(Math.random() * (10000 - 100 + 1)) + 100

    global.bounty[m.chat] = {
        active: true,
        target,
        reward,
        last: Date.now()
    }

    await this.sendMessage(m.chat, {
        text: `🎯 𝐓𝐀𝐆𝐋𝐈𝐀 𝐀𝐓𝐓𝐈𝐕𝐀!

👤 @${target.split('@')[0]} 𝐡𝐚 𝐮𝐧𝐚 𝐭𝐚𝐠𝐥𝐢𝐚 𝐝𝐢 ${reward}€

💥 𝐒𝐜𝐫𝐢𝐯𝐢 ’’.𝐬𝐩𝐚𝐫𝐚’’ 𝐞𝐧𝐭𝐫𝐨 𝟑𝟎 𝐬𝐞𝐜𝐨𝐧𝐝𝐢 𝐩𝐞𝐫 𝐫𝐢𝐬𝐜𝐚𝐭𝐭𝐚𝐫𝐥𝐚!`,
        contextInfo: {
            mentionedJid: [target]
        }
    })

    setTimeout(async () => {

        let current = global.bounty[m.chat]
        if (!current || !current.active) return

        current.active = false

        await this.sendMessage(m.chat, {
            text: `⌛ Tempo scaduto! Nessuno ha preso la taglia.`
        })

    }, 30000)
}

export default handler