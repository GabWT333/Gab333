//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        let target

        if (m.isGroup && !args[0]) {
            target = m.chat
        } else if (args[0]) {
            const num = args[0].replace(/[^0-9]/g, '')
            target = num + '@s.whatsapp.net'
        } else if (m.quoted) {
            target = m.quoted.sender
        } else {
            target = m.chat
        }

        let pp
        try {
            pp = await conn.profilePictureUrl(target, 'image')
        } catch {
            pp = 'https://i.imgur.com/wuxBN7M.png'
        }

        const isGroup = target.endsWith('@g.us')
        let nama = ''

        if (isGroup) {
            try {
                const meta = await conn.groupMetadata(target)
                nama = meta.subject || 'Gruppo'
            } catch {
                nama = 'Gruppo'
            }
        } else {
            nama = await conn.getName(target) || target.split('@')[0]
        }

        const caption = isGroup
            ? `📸 *Foto del gruppo*\n\n👥 *Nome:* ${nama}`
            : `📸 *Foto profilo*\n\n👤 *Nome:* ${nama}`

        await conn.sendFile(m.chat, pp, 'foto.jpg', caption, m)

    } catch (e) {
        console.error('[ERRORE] picgruppo:', e)
        m.reply(`${global.errore || '❌ Si è verificato un errore'}`)
    }
}

handler.help = ['picgruppo', 'fotogruppo', 'pp <numero>']
handler.tags = ['gruppo', 'utility']
handler.command = /^(picgruppo|fotogruppo|pp|getpp|fotoprofilo)$/i

export default handler
