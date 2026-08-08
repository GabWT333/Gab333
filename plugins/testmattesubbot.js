import { makeWASocket } from '../lib/simple.js'
import { useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser, DisconnectReason } from '@realvare/baileys'
import { Boom } from '@hapi/boom'
import fs from 'fs'
import pino from 'pino'
import ws from 'ws'

if (!global.conns) global.conns = []

const handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
    let parentConn = conn
    
    const isJadi = /^(jadibot|subbot|333bot)$/i.test(command)
    const isDelete = /^(deletesesion|deletebot|deletesession|deletesesaion)$/i.test(command)
    const isStop = /^(stop|pausarai|pausarbot)$/i.test(command)
    const isList = /^(bots|listjadibots|subbots)$/i.test(command)

    let userId = m.sender.split('@')[0].replace(/[^0-9]/g, '')
    let authFolder = `./333bot_sessions/${userId}`

    async function reportError(e) {
        await m.reply(`❌ Si è verificato un errore.`)
        console.log(e)
    }

    switch (true) {
        case isJadi:
            if (global.conn.user.jid !== conn.user.jid) return m.reply(`Usa questo comando solo sul bot principale:\nwa.me/${global.conn.user.jid.split`@`[0]}?text=${usedPrefix}${command}`)
            
            let index = global.conns.findIndex(c => {
                if (!c.user) return false
                let id = c.user.id.split(':')[0]
                return (id.includes('@') ? id.split('@')[0] : id) === userId
            })
            
            if (index !== -1) {
                await parentConn.sendMessage(m.chat, { text: '⚠️ Hai già una sessione attiva. Se vuoi avviarne una nuova, usa prima il comando per eliminare la sessione.' }, { quoted: m })
                return
            }

            if (!fs.existsSync(authFolder)) {
                fs.mkdirSync(authFolder, { recursive: true })
            }

            const { state, saveCreds } = await useMultiFileAuthState(authFolder)
            const { version } = await fetchLatestBaileysVersion()

            const connectionOptions = {
                logger: pino({ level: 'silent' }),
                printQRInTerminal: false,
                mobile: false,
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
                },
                browser: ['Ubuntu', 'Chrome', '20.0.04'],
                version,
                markOnlineOnConnect: false,
                generateHighQualityLinkPreview: false,
                syncFullHistory: false,
                linkPreviewImageThumbnailWidth: 0,
                getMessage: async (key) => {
                    if (global.store) {
                        const msg = await global.store.loadMessage(key.remoteJid, key.id)
                        return msg?.message ?? undefined
                    }
                    return { conversation: '' }
                },
                defaultQueryTimeoutMs: 60000,
                connectTimeoutMs: 60000,
                keepAliveIntervalMs: 30000,
                emitOwnEvents: true,
                fireInitQueries: true,
                retryRequestDelayMs: 500,
                maxMsgRetryCount: 5,
                transactionOpts: {
                    maxCommitRetries: 5,
                    delayBetweenTriesMs: 500
                },
                lidCache: global.lidCache || new Map(),
                cachedGroupMetadata: async (jid) => {
                    try {
                        const decodedJid = /:\d+@/gi.test(jid) ? jidNormalizedUser(jid) : jid
                        return await sock.groupMetadata(decodedJid)
                    } catch {
                        return {}
                    }
                },
                decodeJid: (jid) => {
                    if (!jid || typeof jid !== 'string') return jid
                    let decoded = jid
                    if (/:\d+@/gi.test(jid)) decoded = jidNormalizedUser(jid)
                    return decoded
                },
                shouldIgnoreJid: () => false,
            }

            let sock = makeWASocket(connectionOptions)
            let isConnectedMessageSent = false

            if (global.store && typeof global.store.bind === 'function') {
                global.store.bind(sock)
            }

            if (!sock.authState.creds.registered) {
                setTimeout(async () => {
                    try {
                        let code = await sock.requestPairingCode(userId)
                        if (code) {
                            let formattedCode = code.match(/.{1,4}/g)?.join('-') || code
                            let pairingMsg = `🤖 *333 BOT - ACCOPPIAMENTO*\n\nEcco il tuo codice di collegamento:\n\n#️⃣ *${formattedCode}*\n\nIstruzioni:\n1. Apri WhatsApp\n2. Vai su Dispositivi connessi\n3. Clicca su "Collega con numero di telefono"\n4. Inserisci questo codice.`
                            await parentConn.sendMessage(m.chat, { text: pairingMsg }, { quoted: m })
                        }
                    } catch (err) {
                        console.error(err)
                    }
                }, 4000)
            }

            async function connectionUpdate(update) {
                const { connection, lastDisconnect } = update

                if (connection === 'close') {
                    let reason = new Boom(lastDisconnect?.error)?.output?.statusCode
                    global.conns = global.conns.filter(c => c !== sock)
                    
                    if (reason === DisconnectReason.loggedOut) {
                        if (fs.existsSync(authFolder)) fs.rmSync(authFolder, { recursive: true, force: true })
                        await parentConn.sendMessage(m.chat, { text: 'Connessione rifiutata o profilo disconnesso dal telefono. Dovrai richiedere un nuovo codice.' })
                    } else {
                        setTimeout(() => {
                            handler(m, { conn: parentConn, args, usedPrefix, command, isOwner })
                        }, 5000)
                    }
                }

                if (connection === 'open') {
                    sock.uptime = Date.now()
                    if (sock.user && !sock.user.jid && sock.user.id) {
                        let cleanId = sock.user.id.split(':')[0]
                        sock.user.jid = cleanId.includes('@') ? cleanId : `${cleanId}@s.whatsapp.net`
                    }
                    
                    if (!isConnectedMessageSent) {
                        isConnectedMessageSent = true
                        if (!global.conns.some(c => c.user?.id === sock.user?.id)) {
                            global.conns.push(sock)
                        }
                        await parentConn.sendMessage(m.chat, { text: '✅ *333 BOT ATTIVO!*\n\nConnessione completata con successo tramite codice. Ora tutti i plugin sono attivi sul tuo numero!' })
                    }
                }
            }

            sock.ev.on('creds.update', saveCreds)
            sock.ev.on('connection.update', connectionUpdate)

            sock.ev.on('messages.upsert', async (chatUpdate) => {
                try {
                    const handlerModule = await import(`../handler.js?update=${Date.now()}`).catch(() => null)
                    if (handlerModule?.handler) {
                        await handlerModule.handler.call(sock, chatUpdate)
                    }
                } catch (e) {
                    console.error(e)
                }
            })

            sock.ev.on('group-participants.update', async (update) => {
                try {
                    const handlerModule = await import(`../handler.js?update=${Date.now()}`).catch(() => null)
                    if (handlerModule?.participantsUpdate) {
                        await handlerModule.participantsUpdate.call(sock, update)
                    }
                } catch (e) {
                    console.error(e)
                }
            })

            sock.ev.on('groups.update', async (update) => {
                try {
                    const handlerModule = await import(`../handler.js?update=${Date.now()}`).catch(() => null)
                    if (handlerModule?.groupsUpdate) {
                        await handlerModule.groupsUpdate.call(sock, update)
                    }
                } catch (e) {
                    console.error(e)
                }
            })

            sock.ev.on('message.delete', async (update) => {
                try {
                    const handlerModule = await import(`../handler.js?update=${Date.now()}`).catch(() => null)
                    if (handlerModule?.deleteUpdate) {
                        await handlerModule.deleteUpdate.call(sock, update)
                    }
                } catch (e) {
                    console.error(e)
                }
            })

            sock.ev.on('call', async (update) => {
                try {
                    const handlerModule = await import(`../handler.js?update=${Date.now()}`).catch(() => null)
                    if (handlerModule?.callUpdate) {
                        await handlerModule.callUpdate.call(sock, update)
                    }
                } catch (e) {
                    console.error(e)
                }
            })
            break

        case isDelete:
            let mentionedJid = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
            let uniqid = `${mentionedJid.split`@`[0]}`
            const sessionPath = `./333bot_sessions/${uniqid}`

            if (!fs.existsSync(sessionPath)) {
                await conn.sendMessage(m.chat, { text: `🤖 Non hai una sessione attiva. Puoi crearne una usando:\n${usedPrefix}333bot` }, { quoted: m })
                return
            }
            
            if (global.conn.user.jid !== conn.user.jid) {
                return conn.sendMessage(m.chat, { text: `🤖 Usa questo comando sul *Bot* principale.\n\nwa.me/${global.conn.user.jid.split`@`[0]}?text=${usedPrefix + command}` }, { quoted: m })
            } else {
                await conn.sendMessage(m.chat, { text: `🗑️ La sessione come *Sub-Bot* è stata eliminata. Sarà necessario rifare l'accesso con il codice.` }, { quoted: m })
            }
            
            try {
                let activeConnIndex = global.conns.findIndex(c => {
                    if (!c.user) return false
                    let id = c.user.id.split(':')[0]
                    return (id.includes('@') ? id.split('@')[0] : id) === uniqid
                })
                
                if (activeConnIndex !== -1) {
                    try {
                        await global.conns[activeConnIndex].logout()
                    } catch {}
                    global.conns[activeConnIndex].end()
                    global.conns.splice(activeConnIndex, 1)
                }
                fs.rmSync(sessionPath, { recursive: true, force: true })
            } catch (e) {
                reportError(e)
            }
            break

        case isStop:
            if (global.conn.user.jid == conn.user.jid) {
                conn.reply(m.chat, `⚠️ Se non sei un *Sub-Bot*, contatta il numero principale del bot per diventarlo.`, m)
            } else {
                await conn.reply(m.chat, `🤖 *333 Bot* disattivato dal proprietario della sessione.`, m)
                try {
                    await conn.logout()
                } catch {}
                conn.end()
            }
            break

        case isList:
            const users = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])]
            
            function convertiMsInGiorniOreMinutiSecondi(ms) {
                var secondi = Math.floor(ms / 1000)
                var minuti = Math.floor(secondi / 60)
                var ore = Math.floor(minuti / 60)
                var giorni = Math.floor(ore / 24)
                secondi %= 60
                minuti %= 60
                ore %= 24
                var risultato = ""
                if (giorni !== 0) risultato += giorni + " giorni, "
                if (ore !== 0) risultato += ore + " ore, "
                if (minuti !== 0) risultato += minuti + " minuti, "
                if (secondi !== 0) risultato += secondi + " secondi"
                return risultato
            }

            const message = users.map((v, index) => `• 「 ${index + 1} 」\n📎 Wa.me/${v.user.id.split(':')[0]}?text=${usedPrefix}333bot\n👤 Utente: ${v.user.name || 'Sub-Bot'}\n🕑 Online: ${v.uptime ? convertiMsInGiorniOreMinutiSecondi(Date.now() - v.uptime) : 'Sconosciuto'}`).join('\n\n__________________________\n\n')
            const replyMessage = message.length === 0 ? `Nessun Sub-Bot disponibile al momento, riprova più tardi.` : message
            const totalUsers = users.length
            const responseMessage = `🤖 *LISTA DEI SUB-BOT (333 BOT)*\n\n🤖 SUB-BOT CONNESSI 🤖: ${totalUsers || '0'}\n\n${replyMessage.trim()}`
            
            await conn.sendMessage(m.chat, { text: responseMessage }, { quoted: m })
            break
    }
}

handler.command = ['jadibot', 'subbot', '333bot', 'deletesesion', 'deletebot', 'deletesession', 'deletesesaion', 'stop', 'pausarai', 'pausarbot', 'bots', 'listjadibots', 'subbots']
export default handler