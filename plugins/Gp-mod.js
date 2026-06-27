// Plugin di Blood - Gestione Moderatori (Finti Admin)
let handler = async (m, { conn, text, command, usedPrefix, isOwner, isAdmin }) => {
    if (!isOwner && !isAdmin) return m.reply("❌ Questo comando è riservato al proprietario del bot o agli admin del gruppo.")

    let chatId = m.chat
    if (!global.db.data.chats[chatId]) global.db.data.chats[chatId] = {}
    if (!global.db.data.chats[chatId].moderatori) global.db.data.chats[chatId].moderatori = []

    let mods = global.db.data.chats[chatId].moderatori

    if (command === 'addmod') {
        let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null
        if (!who) return m.reply(`Tagga qualcuno per aggiungerlo come moderatore.`)
        if (mods.includes(who)) return m.reply("⚠️ Utente già presente.")
        mods.push(who)
        return m.reply(`✅ @${who.split('@')[0]} aggiunto!\nPuò usare i comandi admin, tranne gestire i ruoli.\n> *Digita ''.mods'' per vedere la lista e i comandi per i moderatori*`, null, { mentions: [who] })
    }

    if (command === 'delmod') {
        let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null
        if (!who) return m.reply(`Tagga qualcuno per rimuoverlo.`)
        global.db.data.chats[chatId].moderatori = mods.filter(jid => jid !== who)
        return m.reply(`🗑️ Privilegi rimossi per @${who.split('@')[0]}.`, null, { mentions: [who] })
    }

    if (command === 'listanera') {
        if (mods.length === 0) return m.reply("📋 Nessun moderatore registrato.")
        let lista = `📋 *LISTA MODERATORI*\n\n`
        mods.forEach((jid, i) => { lista += `${i + 1}. @${jid.split('@')[0]}\n` })
        return conn.sendMessage(chatId, { text: lista, mentions: mods }, { quoted: m })
    }
}

handler.before = async function (m) {
    if (!m.isGroup || !global.db.data.chats[m.chat]?.moderatori) return

    let mods = global.db.data.chats[m.chat].moderatori
    if (!mods.includes(m.sender)) return 

    const comandiProibiti = /^(promote|demote|admin|unadmin|addadmin|deladmin)/i

    let body = m.text ? m.text.trim() : ''
    let isCommand = body.startsWith('.') || body.startsWith('/') || body.startsWith('!')
    let cmd = body.slice(1).split(' ')[0].toLowerCase()

    if (isCommand && comandiProibiti.test(cmd)) {
        m.isAdmin = false 
        return m.reply("🚫 *Azione Fallita*\nI Moderatori non possono promuovere o declassare altri utenti.")
    } else {
        m.isAdmin = true 
    }
}

handler.help = ['addmod', 'delmod', 'listanera']
handler.tags = ['admin', 'group']
handler.command = /^(addmod|delmod|listanera)$/i
handler.group = true
handler.admin = true

export default handler