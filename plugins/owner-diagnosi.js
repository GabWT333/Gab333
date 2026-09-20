//Plugin by Gab, Lucifero & 333 staff

import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, text }) => {
    let isOwner = false
    try {
        const sender = m.sender.split('@')[0]
        isOwner = global.owner
            .map(entry => Array.isArray(entry) ? entry[0] : entry)
            .map(v => v.toString())
            .includes(sender)
    } catch (e) {
        console.error('Errore nel controllo allowner:', e)
    }

    if (!isOwner) {
        await m.reply('*⚠️ comando disponibile solo per owner!*')
        return
    }
    const pluginsFolder = path.join(process.cwd(), 'plugins')
    let diagnosticReport = ''
    
    try {
        if (!fs.existsSync(pluginsFolder)) {
            throw new Error(`Cartella plugins non trovata: ${pluginsFolder}`)
        }
        const files = await fs.promises.readdir(pluginsFolder)
        console.log(`Trovati ${files.length} file nella cartella plugins`)
        let errors = []
        for (const file of files) {
            if (file.endsWith('.js')) {
                try {
                    const filePath = path.join(pluginsFolder, file)
                    console.log(`Analisi file: ${file}`)
                    const stats = await fs.promises.stat(filePath)
                    if (!stats.isFile()) {
                        console.log(`Saltato ${file}: non è un file`)
                        continue
                    }

                    const content = await fs.promises.readFile(filePath, 'utf8')
                    const checks = [
                        {
                            test: !content.includes('export default'),
                            error: `File non esporta handler correttamente`
                        },
                        {
                            test: content.includes('undefined') && !content.includes('typeof undefined'),
                            error: `Possibili riferimenti undefined non gestiti`
                        },
                        {
                            test: !content.includes('try') && content.includes('await'),
                            error: `Operazioni asincrone senza try/catch`
                        },
                        {
                            test: content.includes('conn.reply') && !content.includes('catch'),
                            error: `Chiamate conn.reply non gestite con try/catch`
                        },
                        {
                            test: content.includes('m.reply') && !content.includes('catch'),
                            error: `Chiamate m.reply non gestite con try/catch`
                        }
                    ]
                    
                    const fileErrors = checks
                        .filter(check => check.test)
                        .map(check => check.error)
                    
                    if (fileErrors.length > 0) {
                        console.log(`Trovati ${fileErrors.length} errori in ${file}`)
                        errors.push({
                            file,
                            errors: fileErrors
                        })
                    }
                    
                } catch (e) {
                    console.error(`Errore nell'analisi di ${file}:`, e)
                    errors.push({
                        file,
                        errors: [`Errore analisi: ${e.message}`]
                    })
                }
            }
        }
        diagnosticReport = `*[RISULTATO DIAGNOSI  ꙰  𝟥𝟥𝟥 𝔹𝕆𝕋  ꙰ ]*\n\n`
        
        if (errors.length > 0) {
            diagnosticReport += `Trovati ${errors.length} file con potenziali problemi:\n\n`
            errors.forEach(({ file, errors }) => {
                diagnosticReport += `*📁 File:* ${file}\n`
                errors.forEach(error => {
                    diagnosticReport += `⚠️ ${error}\n`
                })
                diagnosticReport += '\n'
            })
        } else {
            diagnosticReport += `✅ Nessun problema rilevato nei plugin!\n`
        }
        diagnosticReport += `\n*📊 Statistiche:*\n`
        diagnosticReport += `• File analizzati: ${files.length}\n`
        diagnosticReport += `• File con errori: ${errors.length}\n`
        if (text && text.length >= 10) {
            diagnosticReport += `\n\n*[ 👤 SEGNALAZIONE UTENTE ]*\n`
            diagnosticReport += `*Da:* @${m.sender.split('@')[0]}\n`
            diagnosticReport += `*Descrizione:*\n${text}\n`
        }
        diagnosticReport += `\n*Data:* ${new Date().toLocaleDateString('it-IT')}`
        diagnosticReport += `\n*Ora:* ${new Date().toLocaleTimeString('it-IT')}`
        const finalReport = diagnosticReport
        try {
            const samList = Array.isArray(global.sam) ? global.sam : [global.sam]
            for (const samEntry of samList) {
                if (samEntry) {
                    const samJid = String(samEntry).replace(/[^0-9]/g, '') + '@s.whatsapp.net'
                    if (samJid !== conn.user.jid) {
                        await conn.sendMessage(samJid, {
                            text: finalReport,
                            mentions: [m.sender]
                        })
                    } else {
                        console.log('global.sam corrisponde all\'account del bot; messaggio non inviato.')
                    }
                }
            }
        } catch (e) {
            console.error('Errore invio a global.sam:', e)
        }
        let chatReport = `*[RISULTATO DIAGNOSI  ꙰  𝟥𝟥𝟥 𝔹𝕆𝕋  ꙰ ]*\n\n`
        if (errors.length > 0) {
            chatReport += `⚠️ *ho trovato ${errors.length} file con problemi:*\n\n`
            errors.forEach(({ file, errors }) => {
                chatReport += `📁 *${file}*\n`
                errors.forEach(error => chatReport += `- ${error}\n`)
                chatReport += '\n'
            })
        } else {
            chatReport += `✅ *nessun problema rilevato, che bot perfetto!*\n`
        }
        
        chatReport += `\n*ricapitoliamo:*\n`
        chatReport += `• File analizzati: ${files.length}\n`
        chatReport += `• File con errori: ${errors.length}`
        await m.reply(chatReport).catch(async e => {
            console.error('Errore primo tentativo invio:', e)
            await conn.sendMessage(m.chat, {
                text: chatReport
            }).catch(e => console.error('Errore secondo tentativo:', e))
        })

    } catch (e) {
        console.error('Errore critico:', e)
        const errorReport = `*[ERRORE AUTO-DIAGNOSI ]*\n\n` +
            `*Tipo:* ${e.name}\n` +
            `*Messaggio:* ${e.message}\n` +
            `*Stack:* ${e.stack?.slice(0, 1000)}`
        await m.reply(errorReport).catch(async err => {
            console.error('Errore invio report:', err)
            await conn.sendMessage(m.chat, {
                text: '*Errore inatteso.*' + e.message
            }).catch(console.error)
        })
    }
}

handler.help = ['𝐝𝐢𝐚𝐠𝐧𝐨𝐬𝐢']
handler.tags = ['owner']
handler.command = ['diagnosi']
export default handler
