//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn }) => {
    const botName = global.db.data?.nomedelbot || "꙰  333 BOT ꙰";
    let output = [`𝐋𝐈𝐒𝐓𝐀 𝐃𝐄𝐈 𝐆𝐑𝐔𝐏𝐏𝐈 𝐃𝐈 ${botName}`, ''];

    const groups = await conn.groupFetchAllParticipating()
    const groupList = Object.values(groups)
    groupList.sort((a, b) => b.participants.length - a.participants.length)

    output.push(`➣ 𝐓𝐨𝐭𝐚𝐥𝐞 𝐆𝐫𝐮𝐩𝐩𝐢: ${groupList.length}`, '\n══════ ೋೋ══════\n')

    const normalizedBot = conn.decodeJid(conn.user.jid)

    for (let i = 0; i < groupList.length; i++) {
        const group = groupList[i]
        const jid = group.id

        let metadata
        try { metadata = await conn.groupMetadata(jid) } catch { metadata = group }

        const participants = metadata?.participants || group.participants || []
        const totalParticipants = participants.length

        const normalizedParticipants = participants.map(u => {
            const id = conn.decodeJid(u.id || u.jid || u.lid || '')
            const jid = conn.decodeJid(u.jid || u.id || u.lid || '')
            return { ...u, id, jid }
        })

        const matchIds = (u, target) => [
            conn.decodeJid(u?.id),
            u?.jid ? conn.decodeJid(u.jid) : null,
            u?.lid ? conn.decodeJid(u.lid) : null
        ].filter(Boolean).includes(target)

        const admins = normalizedParticipants.filter(p => ['admin', 'superadmin', true].includes(p.admin))
        const adminCount = admins.length

        const isOwner = metadata?.owner ? conn.decodeJid(metadata.owner) === normalizedBot : false
        const isOwnerLid = metadata?.ownerLid ? conn.decodeJid(metadata.ownerLid) === normalizedBot : false
        const botIsAdmin = isOwner || isOwnerLid || normalizedParticipants.some(u => matchIds(u, normalizedBot) && ['admin', 'superadmin', true].includes(u.admin))

        const chatData = global.db.data.chats?.[jid] || {}
        let groupMessages = chatData.totalmsg || 0
        if (!groupMessages && chatData.topUsers) {
          groupMessages = Object.values(chatData.topUsers).reduce((sum, value) => sum + (value || 0), 0)
        }
        if (!groupMessages && chatData.users) {
          groupMessages = Object.values(chatData.users).reduce((sum, user) => sum + ((user?.messages || 0)), 0)
        }
        groupMessages = typeof groupMessages === 'number' ? groupMessages : 'N/D'

        let groupLink = '✗'
        if (botIsAdmin) {
            try {
                const code = await conn.groupInviteCode(jid)
                if (code) groupLink = `https://chat.whatsapp.com/${code}`
            } catch {}
        }
        if (groupLink === '✗') {
            const nativeCode = metadata?.inviteCode || metadata?.invite_code
            if (nativeCode) groupLink = `https://chat.whatsapp.com/${nativeCode}`
        }
        if (groupLink === '✗') {
            const desc = metadata?.desc?.toString() || ''
            const match = desc.match(/https:\/\/chat\.whatsapp\.com\/\S+/)
            if (match) groupLink = match[0]
        }

        output.push(
            `➣ 𝐆𝐑𝐔𝐏𝐏Ꮻ 𝐍𝐔𝐌𝚵𝐑Ꮻ: ${i + 1}`,
            `➣ 𝐆𝐑𝐔𝐏𝐏Ꮻ: ${group.subject}`,
            `➣ 𝐏𝐀𝐑𝐓𝐈𝐂𝐈𝐏𝐀𝐍𝐓𝐈: ${totalParticipants}`,
            `➣ 𝐌𝐄𝐒𝐒𝐀𝐆𝐆𝐈: ${groupMessages}`,
            `➣ 𝐀𝐃𝐌𝐈𝐍: ${botIsAdmin ? `✓ (${adminCount})` : '✗'}`,
            `➣ 𝐈𝐃: ${jid}`,
            `➣ 𝐋𝐈𝐍𝐊: ${groupLink}`,
            '\n══════ ೋೋ══════\n'
        )
    }

    m.reply(output.join('\n'))
}

handler.command = /^(gruppi)$/i
handler.owner = true

export default handler