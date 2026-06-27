import axios from 'axios'
import FormData from 'form-data'

const handler = async (m, { conn, usedPrefix, command }) => {
    const { downloadContentFromMessage } = await import('@realvare/baileys')

    const quoted = m.quoted ? m.quoted : m
    const mime = (quoted.msg || quoted).mimetype || ''

    if (!/image|webp/i.test(mime)) {
        return await conn.sendMessage(m.chat, { 
            text: `❌ Rispondi a un'immagine o a uno sticker contenente un QR code con *${usedPrefix + command}*`
        }, { quoted: m })
    }

    await conn.sendMessage(m.chat, { 
        text: '🔍 Scansione QR code in corso...' 
    }, { quoted: m })

    try {
        const mediaKey = quoted.msg || quoted
        
        let msgType = m.quoted ? Object.keys(m.quoted.message)[0] : m.mtype
        msgType = msgType.replace('Message', '')

        const stream = await downloadContentFromMessage(mediaKey, msgType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        if (!buffer || buffer.length === 0) {
            throw new Error('Impossibile scaricare l\'immagine.')
        }

        console.log('[QR Debug] Immagine scaricata, dimensione:', buffer.length)

        const form = new FormData()
        form.append('file', buffer, {
            filename: 'qr.jpg',
            contentType: mime
        })

        let qrData = null

        try {
            const uploadResponse = await axios.post('https://api.qrserver.com/v1/read-qr-code/', form, {
                headers: {
                    ...form.getHeaders()
                },
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
                timeout: 15000
            })

            console.log('[QR Debug] Risposta QR API:', JSON.stringify(uploadResponse.data, null, 2))

            if (uploadResponse.data && uploadResponse.data[0] && uploadResponse.data[0].symbol && uploadResponse.data[0].symbol[0]) {
                const symbol = uploadResponse.data[0].symbol[0]
                if (symbol.data !== null && symbol.error === null) {
                    qrData = symbol.data
                }
            }
        } catch (e) {
            console.error('[QR Error] goqr.me fallito:', e.message)
        }

        if (!qrData) {
            try {
                console.log('[QR Debug] Tento il fallback su zxing.org...')
                const zxingForm = new FormData()
                zxingForm.append('f', buffer, {
                    filename: 'qr.jpg',
                    contentType: mime
                })

                const response = await axios.post('https://zxing.org/w/decode', zxingForm, {
                    headers: {
                        ...zxingForm.getHeaders()
                    },
                    timeout: 15000
                })

                const match = response.data.match(/<td>Parsed Result<\/td>\s*<td><pre>(.*?)<\/pre><\/td>/s)
                if (match && match[1]) {
                    qrData = match[1].trim()
                }
            } catch (e) {
                console.error('[QR Error] zxing.org fallito:', e.message)
            }
        }

        if (!qrData || qrData === 'null' || qrData.trim() === '') {
            return await conn.sendMessage(m.chat, { 
                text: '❌ Nessun QR code trovato nell\'immagine.\n\n💡 *Suggerimenti:*\n- Assicurati che il codice sia ben visibile e non ritagliato.\n- Se è uno sticker, potrebbe essere troppo piccolo o deformato.' 
            }, { quoted: m })
        }

        let finalResult = qrData.trim()

        if (finalResult.match(/^(http|https|www)/i)) {
            finalResult = `🔗 *Link QR Code:*\n\n${finalResult}`
        } else if (finalResult.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i)) {
            finalResult = `📧 *Email trovata:*\n\n${finalResult}`
        } else if (finalResult.match(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/)) {
            finalResult = `📱 *Numero trovato:*\n\n${finalResult}`
        } else if (finalResult.startsWith('BEGIN:VCARD')) {
            finalResult = `👤 *Contatto vCard trovato:*\n\n${finalResult}`
        } else if (finalResult.startsWith('WIFI:')) {
            finalResult = `📶 *Parametri WiFi:* \n\n${finalResult}`
        } else {
            finalResult = `📄 *Contenuto QR Code:*\n\n${finalResult}`
        }

        await conn.sendMessage(m.chat, { text: finalResult }, { quoted: m })

    } catch (e) {
        console.error('[QR Error Generale]:', e)
        let errorMsg = '❌ Errore durante la scansione del QR code.'

        if (e.code === 'ECONNABORTED' || e.code === 'ETIMEDOUT') {
            errorMsg = '❌ Timeout: I server di scansione non rispondono. Riprova più tardi.'
        } else if (e.message) {
            errorMsg = `❌ Errore: ${e.message}`
        }

        await conn.sendMessage(m.chat, { text: errorMsg }, { quoted: m })
    }
}

handler.command = ['tolink', 'readqr', 'qr', 'scanqr']
export default handler