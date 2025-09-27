let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Verifica del messaggio di report
    if (!text) return conn.reply(m.chat, '⚠️ *Inserisci il comando che vuoi proporre. es: .consiglia (comando) (spiegazione)*', m)
    if (text.length < 10) return conn.reply(m.chat, '⚠️ *Descrivi meglio il comando (minimo 10 caratteri).*', m)
    if (text.length > 1000) return conn.reply(m.chat, '⚠️ *Lunghezza massima consentita: 1000 caratteri.*', m)
    
    // Formattazione del report
    const reportText = `* \`P R O P O S T A\` *

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
                    title: "⚠️ proposta comando ⚠️",
                    body: 'Nuova proposta ricevuta',
                    thumbnailUrl: fotoperfil,
                    sourceUrl: redes,
                    mediaType: 1,
                    showAdAttribution: false,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: null })

        // Conferma all'utente
        await m.reply('✅ *La tua proposta è stata inviata allo sviluppatore.*\n_⚠ Comandi illeciti possono comportare restrizioni._')
        
    } catch (error) {
        console.error('Errore nella proposta:', error)
        await m.reply('✅ *La tua proposta è stata inviata allo sviluppatore.*\n_⚠ Comandi illeciti possono comportare restrizioni._')
    }
}

handler.help = ['consiglia']
handler.tags = ['gp']
handler.command = ['consiglia',]

export default handler