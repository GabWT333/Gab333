//Plugin by Gab, Lucifero & 333 staff


let handler = async (m, { conn, command, usedPrefix }) => {
    const chat = global.db.data.chats[m.chat] || {}

    if (command === 'nuke') {
        const groupMetadata = await conn.groupMetadata(m.chat)

        chat.oldName = groupMetadata.subject
        chat.oldDesc = groupMetadata.desc || "Nessuna descrizione"
        global.db.data.chats[m.chat] = chat

        let newName = `${chat.oldName} | SVƬ BY 333 BӨƬ`
        await conn.groupUpdateSubject(m.chat, newName)

        await conn.groupUpdateDescription(m.chat, "333 BӨƬ DӨMIПΛ SЦI VӨSƬЯI GЯЦPPI 🛡️")

        await conn.groupSettingUpdate(m.chat, 'announcement')

        let link = 'https://chat.whatsapp.com/' + await conn.groupInviteCode(m.chat)
        const participants = groupMetadata.participants.map(u => u.id)

        let nukeMsg = `*⊱─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⊰*\n`
        nukeMsg += `☣️ GЯЦPPӨ SVЦӨƬΛƬӨ ☣️\n`
        nukeMsg += `*⊱─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⊰*\n\n`
        nukeMsg += `📢 DΛᄂ MIGᄂIӨЯΣ DI ZӨZZΛP\n\n`
        nukeMsg += `🔗 ΣПƬЯΛƬΣ ƬЦƬƬI QЦI:\n`
        nukeMsg += `${link}\n\n`
        nukeMsg += `⚡ PӨWΣЯΣD BY 333 BӨƬ\n`
        nukeMsg += `*⊱─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⊰*`

        await conn.sendMessage(m.chat, {
            text: nukeMsg,
            mentions: participants,
            footer: '333 Bot versione X'
        }, { quoted: m })
    }

    if (command === 'resuscita') {
        if (!chat.oldName) return m.reply("⚠️ *Non ho dati salvati per il ripristino!*")

        await conn.groupUpdateSubject(m.chat, chat.oldName)
        await conn.groupUpdateDescription(m.chat, chat.oldDesc)
        await conn.groupSettingUpdate(m.chat, 'not_announcement')

        let resMsg = `*⊱─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⊰*\n`
        resMsg += `✨ ЯIPЯISƬIПӨ CӨMPᄂΣƬΛƬӨ ✨\n`
        resMsg += `*⊱─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⊰*\n\n`
        resMsg += `✅ Nome e descrizione ripristinati.\n`
        resMsg += `🔓 Chat aperta ai partecipanti.\n`
        resMsg += `*⊱─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⊰*`

        await conn.sendMessage(m.chat, { 
            text: resMsg, 
            footer: '333 Bot versione X' 
        }, { quoted: m })
    }
}

handler.help = ['nuke', 'resuscita']
handler.tags = ['giochi']
handler.command = ['nuke', 'resuscita']

handler.group = true
handler.admin = true
handler.botAdmin = true 

export default handler