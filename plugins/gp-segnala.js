let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Verifica del messaggio di report
    if (!text) return conn.reply(m.chat, '⚠ *Inserisci il comando che vuoi segnalare.*', m)
    if (text.length < 10) return conn.reply(m.chat, '⚠️ *Descrivi meglio il problema (minimo 10 caratteri).*', m)
    if (text.length > 1000) return conn.reply(m.chat, '⚠️ *Lunghezza massima consentita: 1000 caratteri.*', m)
    
    // Formattazione del report
    const reportText = `*❌️ \`S E G N A L A Z I O N E\` ❌️*

📱 Numero:
• Wa.me/${m.sender.split`@`[0]}

👤 Utente: 
• ${m.pushName || 'Anonimo'}

📝 Messaggio:
• ${text}`

    try {
        // Invia al proprietario
        await conn.reply(global.owner[0][0] + '@s.whatsapp.net', 
            m.quoted ? reportText + '\n\n📎 Citazione:\n' + m.quoted.text : reportText, 
            m, 
            { mentions: conn.parseMention(reportText) }
        )

        // Invia al canale
        await conn.sendMessage(global.channelid, { 
            text: m.quoted ? reportText + '\n\n📎 Citazione:\n' + m.quoted.text : reportText, 
            contextInfo: {
                externalAdReply: {
                    title: "⚠️ SEGNALAZIONE BUG ⚠️",
                    body: 'Nuova segnalazione ricevuta',
                    thumbnailUrl: fotoperfil,
                    sourceUrl: redes,
                    mediaType: 1,
                    showAdAttribution: false,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: null })

        // Conferma all'utente
        await m.reply('✅ *La tua segnalazione è stata inviata allo sviluppatore.*\n_⚠ Segnalazioni false possono comportare restrizioni._')
        
    } catch (error) {
        console.error('Errore nella segnalazione:', error)
        await m.reply('✅ *La tua segnalazione è stata inviata allo sviluppatore.*\n_⚠ Segnalazioni false possono comportare restrizioni._')
    }
}

handler.help = ['segnala']
handler.tags = ['info']
handler.command = ['segnala', 'report', 'bug', 'errore', 'reporta']

export default handler