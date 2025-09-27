import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, text, usedPrefix, command }) => {
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
        await m.reply('*⚠️ Solo gli owner possono usare questo comando*')
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
        diagnosticReport = `*[ 🔍 AUTO-DIAGNOSI BOT ]*\n\n`
        
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
        const ownerNumbers = Array.isArray(global.owner) 
            ? global.owner
                .map(entry => {
                    if (Array.isArray(entry)) return entry[0]
                    if (typeof entry === 'string' || typeof entry === 'number') return entry
                    return null
                })
                .filter(v => v !== null)
                .map(v => String(v).replace(/[^0-9]/g, '') + '@s.whatsapp.net')
            : []

        ownerNumbers.filter(v => v !== conn.user.jid).forEach(async owner => {
            try {
                await conn.sendMessage(owner, {
                    text: finalReport,
                    mentions: [m.sender]
                })
            } catch (e) {
                console.error('Errore invio a owner:', e)
            }
        })
        let chatReport = `*[ 🔍 RISULTATI AUTO-DIAGNOSI ]*\n\n`
        if (errors.length > 0) {
            chatReport += `⚠️ *Trovati ${errors.length} file con problemi:*\n\n`
            errors.forEach(({ file, errors }) => {
                chatReport += `📁 *${file}*\n`
                errors.forEach(error => chatReport += `- ${error}\n`)
                chatReport += '\n'
            })
        } else {
            chatReport += `✅ *Nessun problema rilevato!*\n`
        }
        
        chatReport += `\n📊 *Statistiche:*\n`
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
        const errorReport = `*[ ❌ ERRORE AUTO-DIAGNOSI ]*\n\n` +
            `*Tipo:* ${e.name}\n` +
            `*Messaggio:* ${e.message}\n` +
            `*Stack:* ${e.stack?.slice(0, 1000)}`
        await m.reply(errorReport).catch(async err => {
            console.error('Errore invio report:', err)
            await conn.sendMessage(m.chat, {
                text: '⚠️ *Errore critico durante l\'auto-diagnosi*\n' + e.message
            }).catch(console.error)
        })
    }
}

handler.help = ['bughunt']
handler.tags = ['creatore']
handler.command = ['bughunt']
handler.owner = true 

export default handler