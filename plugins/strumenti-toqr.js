import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        const usage = `
╭─⭓ 『 🔲 』 *GENERA QR CODE*

Crea un QR code da testo, link, email, etc.

*Esempi d'uso:*

📱 Link:
${usedPrefix + command} https://github.com/zyklon

📧 Email:
${usedPrefix + command} ciuccia@cannuccia.com

📞 Numero:
${usedPrefix + command} +4915510441099

📝 Testo:
${usedPrefix + command} Ciao, questo è un messaggio!


╰─⭓ `.trim()

        return await conn.sendMessage(m.chat, { text: usage }, { quoted: m })
    }

    await conn.sendMessage(m.chat, { 
        text: '⏳ Generazione QR code in corso...' 
    }, { quoted: m })

    try {
        // Determina il tipo di contenuto
        let contentType = 'text'
        let displayType = '📄 Testo'

        if (text.match(/^(http|https):\/\//i)) {
            contentType = 'url'
            displayType = '🔗 Link'
        } else if (text.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i)) {
            contentType = 'email'
            displayType = '📧 Email'
        } else if (text.match(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/)) {
            contentType = 'phone'
            displayType = '📱 Telefono'
        } else if (text.startsWith('BEGIN:VCARD')) {
            contentType = 'vcard'
            displayType = '👤 Contatto'
        } else if (text.startsWith('WIFI:')) {
            contentType = 'wifi'
            displayType = '📶 WiFi'
        }

        const size = '500x500' 
        const margin = 10 

        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}&margin=${margin}&data=${encodeURIComponent(text)}`

        console.log('[QR Generator] URL:', qrUrl)

        const response = await axios.get(qrUrl, {
            responseType: 'arraybuffer',
            timeout: 30000
        })

        const qrBuffer = Buffer.from(response.data)

        if (!qrBuffer || qrBuffer.length === 0) {
            throw 'Impossibile generare il QR code'
        }

        console.log('[QR Generator] QR code generated, size:', qrBuffer.length)

        let caption = `✅ *QR CODE GENERATO*\n\n`
        caption += `📋 *Tipo:* ${displayType}\n`

        let preview = text
        if (preview.length > 100) {
            preview = preview.substring(0, 100) + '...'
        }
        caption += `📝 *Contenuto:*\n${preview}\n\n`
        caption += `💡 _Scansiona il QR code per accedere al contenuto_`

        await conn.sendMessage(m.chat, {
            image: qrBuffer,
            caption: caption
        }, { quoted: m })

    } catch (e) {
        console.error('[QR Generator Error]:', e)
        let errorMsg = '❌ Errore durante la generazione del QR code.'

        if (e.code === 'ECONNABORTED' || e.code === 'ETIMEDOUT') {
            errorMsg = '❌ Timeout: L\'API sta impiegando troppo tempo. Riprova.'
        } else if (e.response?.status === 414) {
            errorMsg = '❌ Errore: Il testo è troppo lungo per essere convertito in QR code.\n\n💡 Riduci la lunghezza del testo.'
        } else if (e.message) {
            errorMsg = `❌ Errore: ${e.message}`
        }

        await conn.sendMessage(m.chat, { text: errorMsg }, { quoted: m })
    }
}

handler.help = ['qr', 'toqr', 'toqrcode']
handler.tags = ['tools']
handler.command = ['qr', 'toqr', 'toqrcode', 'qrcode', 'makeqr']

export default handler