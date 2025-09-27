let tradeRequests = {}

let handler = async (m, { conn, args, command }) => {
    global.db.data.users = global.db.data.users || {}
    let sender = m.sender
    let users = global.db.data.users
    let username = `@${sender.split('@')[0]}`

    if (command === 'scambia') {
        let target = m.mentionedJid?.[0]
        if (!target) return m.reply(`📌 Usa:\n.scambia @utente <tuo_numero> <suo_numero>`)
        
        let myIndex = parseInt(args[1]) - 1
        let theirIndex = parseInt(args[2]) - 1
        let myPokemons = users[sender]?.pokemons || []
        let theirPokemons = users[target]?.pokemons || []

        if (!myPokemons[myIndex]) return m.reply(`❌ Il tuo Pokémon n. ${args[1]} non esiste.`)
        if (!theirPokemons[theirIndex]) return m.reply(`❌ Il Pokémon n. ${args[2]} di @${target.split('@')[0]} non esiste.`, null, { mentions: [target] })

        tradeRequests[target] = {
            from: sender,
            myIndex,
            theirIndex
        }

        let myPoke = myPokemons[myIndex]
        let theirPoke = theirPokemons[theirIndex]

        let txt = `🔁 *Richiesta di Scambio*\n\n${username} vuole scambiare:\n📤 *${myPoke.name}* (Lv. ${myPoke.level})\ncon\n📥 *${theirPoke.name}* (Lv. ${theirPoke.level}) di @${target.split('@')[0]}\n\n✅ @${target.split('@')[0]}, rispondi con *.accetta* per confermare.`
        return conn.reply(m.chat, txt, m, { mentions: [target, sender] })
    }

    if (command === 'accetta') {
        let trade = tradeRequests[sender]
        if (!trade) return m.reply('❌ Nessuna richiesta di scambio trovata.')

        let { from, myIndex, theirIndex } = trade
        let myPokemons = users[sender]?.pokemons || []
        let theirPokemons = users[from]?.pokemons || []

        let myPoke = myPokemons[myIndex]
        let theirPoke = theirPokemons[theirIndex]

        if (!myPoke || !theirPoke) {
            delete tradeRequests[sender]
            return m.reply('❌ Uno dei Pokémon non è più disponibile.')
        }

        // Effettua lo scambio
        users[sender].pokemons[myIndex] = theirPoke
        users[from].pokemons[theirIndex] = myPoke

        delete tradeRequests[sender]

        return m.reply(`✅ Scambio completato tra @${from.split('@')[0]} e @${sender.split('@')[0]}!\n\n🎁 ${theirPoke.name} ⇄ ${myPoke.name}`, null, {
            mentions: [from, sender]
        })
    }
}

handler.help = ['scambia @utente <tuo_num> <suo_num>', 'accetta']
handler.tags = ['pokemon']
handler.command = /^scambia|accetta$/i

export default handler
