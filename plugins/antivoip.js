//Codice di antivoip.js

//Plugin by Gab, Lucifero & 333 staff
import PhoneNumber from 'awesome-phonenumber';

let handler = m => m
handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner, isROwner }) {
    if (!m.isGroup) return false
    let chat = global.db.data.chats[m.chat] || {}
    let bot = global.db.data.settings[conn.user.jid] || {}

    if (!chat.antivoip) return false
    if (!isBotAdmin) return false
    if (isAdmin || isOwner || isROwner) return false

    try {
        const jid = m.sender || m.key?.participant || ''
        const number = jid.split('@')[0].replace(/\D/g, '')
        if (!jid || !number) return false

        const parsed = PhoneNumber('+' + number)
        if (!parsed || !parsed.isValid()) return false

        const country = parsed.getRegionCode() || ''
        const isForeign = country !== 'IT'

        if (isForeign) {
            const responseb = await conn.groupParticipantsUpdate(
                m.chat,
                [jid],
                'remove'
            )
            if (responseb?.[0]?.status === '404') return
            await conn.sendMessage(m.chat, { text: `📛 Utente rimosso: numero VoIP non consentito (${parsed.getNumber('international') || number})` }, { quoted: m })
        }
    } catch (e) {
        console.error(e)
    }
}
export default handler