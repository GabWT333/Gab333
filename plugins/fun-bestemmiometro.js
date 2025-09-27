import fetch from 'node-fetch'

// Handler principale
let handler = m => m

handler.before = async function (m) {
    // Accedi ai dati utente e chat dal database globale
    let chat = global.db.data.chats[m.chat]
    let user = global.db.data.users[m.sender]

    // Se non è un gruppo, esci
    if (!m.isGroup) return null

    // Se la funzione bestemmiometro non è attiva, esci
    if (!chat.bestemmiometro) return

    // Regex per rilevare bestemmie
    const regex = /(?:porco dio|porcodio|dio bastardo|dio cane|porcamadonna|madonnaporca|porca madonna|madonna porca|dio cristo|diocristo|dio maiale|diomaiale|jesucristo|jesu cristo|cristo madonna|madonna impanata|dio cristo|cristo dio|dio frocio|dio gay|dio madonna|dio infuocato|dio crocifissato|madonna puttana|madonna vacca|madonna inculata|maremma maiala|padre pio|jesu impanato|jesu porco|porca madonna|diocane|madonna porca|dio capra|capra dio|padre pio ti spio)/i

    // Se il messaggio contiene bestemmie
    if (regex.test(m.text)) {
        user.blasphemy = (user.blasphemy || 0) + 1
        user.blasphemyCounted = Math.floor(user.blasphemy / 10)

        // Notifica solo ogni 10 bestemmie
        if (user.blasphemy % 10 === 0) {
            const mention = '@' + m.sender.split('@')[0] + ` ha tirato ${user.blasphemy} bestemmie!`
            let quoted = {
                key: {
                    participants: '0@s.whatsapp.net',
                    fromMe: false,
                    id: 'Halo'
                },
                message: {
                    locationMessage: {
                        name: '𝐁𝐞𝐬𝐭𝐞𝐦𝐦𝐢𝐨𝐦𝐞𝐭𝐫𝐨',
                        jpegThumbnail: await (await fetch('https://telegra.ph/file/ba01cc1e5bd64ca9d65ef.jpg')).buffer(),
                        vcard: 'BEGIN:VCARD\x0aVERSION:3.0\x0aN:;Unlimited;;;\x0aFN:Unlimited\x0aORG:Unlimited\x0aTITLE:\x0aitem1.TEL;waid=19709001746:+1\x20(970)\x20900-1746\x0aitem1.X-ABLabel:Unlimited\x0aX-WA-BIZ-DESCRIPTION:ofc\x0aX-WA-BIZ-NAME:Unlimited\x0aEND:VCARD'
                    }
                },
                participant: '0@s.whatsapp.net'
            }
            await conn.sendMessage(m.chat, {
                text: mention,
                mentions: [...mention.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
            }, { quoted })
        }
    }
}

export default handler