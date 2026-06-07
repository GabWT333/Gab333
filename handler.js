import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import fs from 'fs'
import chalk from 'chalk'
import NodeCache from 'node-cache'
import { getAggregateVotesInPollMessage, toJid } from '@realvare/baileys'

const { proto } = await import('@realvare/baileys')

const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))
const responseHandlers = new Map()

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}

global.ignoredUsersGlobal = global.ignoredUsersGlobal || new Set()
global.ignoredUsersGroup = global.ignoredUsersGroup || {}
global.groupSpam = global.groupSpam || {}
global.processedMessages = global.processedMessages || new Set()
global.processedCalls = global.processedCalls || new Map()
global.spamTracker = global.spamTracker || {}
global.activeEvents = global.activeEvents || new Map()
global.activeGiveaways = global.activeGiveaways || new Map()

if (!global.groupCache) {
    global.groupCache = new NodeCache({
        stdTTL: 10,
        useClones: false,
        checkperiod: 5,
        maxKeys: 2000
    })
}
if (!global.jidCache) {
    global.jidCache = new NodeCache({
        stdTTL: 3600,
        useClones: false,
        checkperiod: 600,
        maxKeys: 5000
    })
}
if (!global.nameCache) {
    global.nameCache = new NodeCache({
        stdTTL: 3600,
        useClones: false,
        checkperiod: 600,
        maxKeys: 5000
    })
}

const DUPLICATE_WINDOW = 3000
const MEDIA_GIF_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'media', 'gif')
const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')

export async function loadAllPlugins(pluginsDir = ___dirname) {
    const results = {}

    async function scanDir(dir, prefix = '') {
        let entries
        try {
            entries = fs.readdirSync(dir, { withFileTypes: true })
        } catch {
            return
        }
        const tasks = entries.map(async (entry) => {
            const fullPath = path.join(dir, entry.name)
            const relName = prefix ? `${prefix}/${entry.name}` : entry.name
            if (entry.isDirectory()) {
                await scanDir(fullPath, relName)
            } else if (entry.isFile() && /\.(js|mjs|cjs)$/.test(entry.name) && !entry.name.startsWith('_')) {
                try {
                    const mod = await import(`${fullPath}?t=${Date.now()}`)
                    results[relName] = mod.default || mod
                } catch (e) {
                    console.error(chalk.red(`[plugins] Errore caricamento ${relName}:`), e.message)
                }
            }
        })
        await Promise.allSettled(tasks)
    }

    await scanDir(pluginsDir)
    return results
}

function selectQueue(m) {
    if (m.isCommand || (typeof m.text === 'string' && m.text.startsWith('.'))) return commandQueue
    if (m.mtype?.includes('image') || m.mtype?.includes('video')) return messageQueue
    if (m.mtype?.includes('audio') || m.mtype?.includes('document') || m.mtype?.includes('sticker')) return mediaQueue
    return messageQueue
}

export const fetchMetadata = async (conn, chatId) => await conn.groupMetadata(chatId)

const fetchGroupMetadataWithRetry = async (conn, chatId) => {
    try {
        return await conn.groupMetadata(chatId)
    } catch (e) {
        return null
    }
}

global.getGroupAdmins = async (conn, groupId) => {
    try {
        let metadata = global.groupCache.get(groupId)
        if (!metadata) {
            metadata = await fetchGroupMetadataWithRetry(conn, groupId)
            if (metadata) global.groupCache.set(groupId, metadata, { ttl: 10 })
        }
        if (!metadata) return []
        return metadata.participants
            .filter(p => p.admin === 'admin' || p.admin === 'superadmin' || p.admin === true)
            .map(p => conn.decodeJid(p.id))
    } catch (e) {
        return []
    }
}

global.isGroupAdmin = async (conn, groupId, userId) => {
    const admins = await global.getGroupAdmins(conn, groupId)
    return admins.includes(conn.decodeJid(userId))
}

function initResponseHandler(conn) {
    if (!conn.waitForResponse) {
        conn.waitForResponse = async (chat, sender, options = {}) => {
            const { timeout = 30000, validResponses = null, onTimeout = null, filter = null } = options
            return new Promise((resolve) => {
                const key = chat + sender
                const timeoutId = setTimeout(() => {
                    responseHandlers.delete(key)
                    if (onTimeout) onTimeout()
                    resolve(null)
                }, timeout)
                responseHandlers.set(key, { resolve, timeoutId, validResponses, filter })
            })
        }
    }
}

if (!global.adminListenerSet && global.conn) {
    global.conn.ev.on('group-participants.update', async (update) => {
        try {
            const { id, action } = update
            if (action === 'promote' || action === 'demote') global.groupCache.del(id)
        } catch (e) {}
    })
    global.adminListenerSet = true
}

if (!global.cacheListenersSet && global.conn) {
    const conn = global.conn

    const registerGroup = async (groupId) => {
        try {
            if (!global.db.data.chats[groupId]) {
                global.db.data.chats[groupId] = { isBanned: false, expired: 0, users: {} }
            }
            const metadata = await fetchGroupMetadataWithRetry(conn, groupId)
            if (metadata) global.groupCache.set(groupId, metadata, { ttl: 10 })
        } catch (e) {}
    }

    const registerAllGroups = async () => {
        try {
            const groups = await conn.groupFetchAllParticipating()
            for (const groupId in groups) await registerGroup(groupId)
        } catch (e) {}
    }

    setTimeout(() => registerAllGroups(), 5000)

    conn.ev.on('groups.update', async (updates) => {
        for (const update of updates) {
            if (!update || !update.id) continue
            global.groupCache.del(update.id)
            await registerGroup(update.id)
        }
    })

    conn.ev.on('group-participants.update', async (update) => {
        if (!update || !update.id) return
        global.groupCache.del(update.id)
        await registerGroup(update.id)
    })

    global.cacheListenersSet = true
}

if (!global.pollListenerSet && global.conn) {
    global.conn.ev.on('messages.update', async (chatUpdate) => {
        for (const { key, update } of chatUpdate) {
            if (update.pollUpdates) {
                try {
                    const pollCreation = await global.store.getMessage(key)
                    if (pollCreation) {
                        await getAggregateVotesInPollMessage({
                            message: pollCreation,
                            pollUpdates: update.pollUpdates,
                        })
                    }
                } catch (e) {}
            }
        }
    })
    global.pollListenerSet = true
}

if (global.conn && global.conn.ws) {
    global.conn.ws.on('CB:call', async (json) => {
        try {
            if (!json?.tag || json.tag !== 'call' || !json.attrs?.from) return
            const callerId = global.conn.decodeJid(json.attrs.from)
            const isOwner = global.owner.some(([num]) => num === callerId.split('@')[0])
            if (isOwner) return

            const eventId = json.attrs.id
            let actualCallId = null
            if (json.content?.length > 0) {
                for (const item of json.content) {
                    if (item.attrs && item.attrs['call-id']) {
                        actualCallId = item.attrs['call-id']
                        break
                    }
                }
            }
            const uniqueCallId = actualCallId || eventId
            if (json.content?.length > 0) {
                const contentTags = json.content.map(item => item.tag)
                if (contentTags.includes('terminate')) {
                    global.processedCalls.delete(uniqueCallId)
                    return
                }
                if (contentTags.includes('relaylatency')) {
                    if (global.processedCalls.has(uniqueCallId)) return
                    global.processedCalls.set(uniqueCallId, true)

                    let nome = global.nameCache.get(callerId)
                    if (!nome) {
                        nome = global.conn.getName(callerId) || 'Sconosciuto'
                        global.nameCache.set(callerId, nome)
                    }

                    if (!global.db.data) await global.loadDatabase()
                    let settings = global.db.data?.settings?.[global.conn.user.jid]
                    if (!settings) {
                        settings = global.db.data.settings[global.conn.user.jid] = {
                            jadibotmd: false, antiPrivate: true,
                            soloCreatore: false, anticall: true, status: 0
                        }
                    }
                    if (!settings.anticall) return

                    let userCall = global.db.data.users[callerId] || (global.db.data.users[callerId] = { callCount: 0, banned: false })
                    if (userCall.banned) {
                        await global.conn.rejectCall(uniqueCallId, callerId)
                        return
                    }
                    userCall.callCount = (userCall.callCount || 0) + 1
                    try {
                        await global.conn.rejectCall(uniqueCallId, callerId)
                        if (userCall.callCount >= 3) {
                            userCall.banned = true
                            userCall.bannedReason = 'Troppi tentativi di chiamata'
                            await global.conn.sendMessage(toJid(callerId), { text: `Quanto puoi essere sfigato per spammare di call smh.` })
                        } else {
                            await global.conn.sendMessage(toJid(callerId), { text: `Chiamata rifiutata automaticamente, non chiamare il bot.` })
                        }
                    } catch (err) {
                        global.processedCalls.delete(uniqueCallId)
                    }
                }
            }
        } catch (e) {}
    })
}

setInterval(() => {
    if (global.processedCalls.size > 10) global.processedCalls.clear()
}, 180000)

export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || []
    this.uptime = this.uptime || Date.now()
    if (!chatUpdate || !chatUpdate.messages) return
    if (!Array.isArray(chatUpdate.messages) || chatUpdate.messages.length === 0) return

    this.pushMessage(chatUpdate.messages).catch(err => {
        if (!err.message?.includes('Bad MAC') && !err.message?.includes('absent')) {
            console.error('[ERRORE] pushMessage:', err)
        }
    })

    for (let m of chatUpdate.messages) {
        if (!m || !m.key || !m.key.remoteJid) continue

        if (!m.message && m.messageStubType == null) {
            try {
                const failedSender = m.key.participant || m.key.remoteJid
                if (failedSender) {
                    if (!global._decryptRetried) global._decryptRetried = new Map()
                    const retries = global._decryptRetried.get(failedSender) || 0
                    if (retries < 3) {
                        global._decryptRetried.set(failedSender, retries + 1)
                        setTimeout(() => global._decryptRetried?.delete(failedSender), 120000)
                        if (typeof this.authState?.keys?.remove === 'function') {
                            try { await this.authState.keys.remove('session', [failedSender]) } catch {}
                        }
                        if (typeof this.requestPrivacyTokens === 'function') {
                            try { await this.requestPrivacyTokens([failedSender]) } catch {}
                        }
                        await new Promise(r => setTimeout(r, 1500))
                        try {
                            const retried = await this.loadMessage(m.key.id)
                            if (retried?.message) {
                                m = retried
                            } else {
                                continue
                            }
                        } catch { continue }
                    } else {
                        global._decryptRetried.delete(failedSender)
                        continue
                    }
                }
            } catch (e) { continue }
        }

        if (m.message?.protocolMessage?.type === 'MESSAGE_EDIT') {
            const key = m.message.protocolMessage.key
            const editedMessage = m.message.protocolMessage.editedMessage
            m.key = key
            m.message = editedMessage
            m.text = editedMessage.conversation || editedMessage.extendedTextMessage?.text || ''
            m.mtype = Object.keys(editedMessage)[0]
        }

        m = smsg(this, m, global.store)

        if (!m || !m.key || !m.key.remoteJid) continue

        if (m.messageStubType === 29 || m.messageStubType === 30) {
            global.groupCache.del(m.chat)
        }

        try {
            m.key.remoteJid = this.decodeJid(m.key.remoteJid)
            if (m.key.participant) {
                m.key.participant = this.decodeJid(m.key.participant)
                if (m.key.participant && !m.key.participant.endsWith('@s.whatsapp.net')) {
                    m.key.participant = m.key.participant.split('@')[0].split(':')[0] + '@s.whatsapp.net'
                }
            }
        } catch (e) { continue }

        if (!m.chat) m.chat = m.key.remoteJid
        if (!m.sender) m.sender = m.key.participant || m.key.remoteJid

        if (!m.chat || !m.sender || typeof m.chat !== 'string' || typeof m.sender !== 'string') continue
        if (m.sender.includes('undefined') || (!m.sender.endsWith('@s.whatsapp.net') && !m.sender.endsWith('@g.us'))) continue

        const msgId = m.key?.id
        if (msgId) {
            if (global.processedMessages.has(msgId)) continue
            global.processedMessages.add(msgId)
            setTimeout(() => global.processedMessages.delete(msgId), DUPLICATE_WINDOW)
        }

        initResponseHandler(this)

        const _btnDispatch = (buttonId) => {
            if (!buttonId || typeof buttonId !== 'string') return false
            const fakeId = 'btn_' + Date.now() + '_' + Math.random().toString(36).slice(2)
            handler.call(this, { messages: [{
                key: {
                    remoteJid: m.key.remoteJid,
                    fromMe: false,
                    id: fakeId,
                    participant: m.key.participant || m.sender
                },
                message: { conversation: buttonId },
                text: buttonId,
                messageTimestamp: m.messageTimestamp || Date.now(),
                pushName: m.pushName || '',
                broadcast: false,
                participant: m.key.participant || m.sender
            }]})
            return true
        }

        if (m.message?.buttonsResponseMessage) {
            const r = m.message.buttonsResponseMessage
            if (_btnDispatch(r?.selectedButtonId || r?.id)) continue
        }

        if (m.message?.templateButtonReplyMessage) {
            const r = m.message.templateButtonReplyMessage
            if (_btnDispatch(r?.selectedId || r?.id)) continue
        }

        if (m.message?.interactiveResponseMessage) {
            try {
                const r = m.message.interactiveResponseMessage
                const paramsJson = r?.nativeFlowResponseMessage?.paramsJson || r?.paramsJson || ''
                let buttonId = r?.selectedId || ''
                if (!buttonId && paramsJson) {
                    try { buttonId = JSON.parse(paramsJson)?.id || '' } catch { buttonId = paramsJson }
                }
                if (_btnDispatch(buttonId)) continue
            } catch (e) {}
        }

        if (m.message?.eventResponseMessage) {
            try {
                const { eventId, response } = m.message.eventResponseMessage
                const jid = this.decodeJid(m.key.remoteJid)
                const userId = this.decodeJid(m.key.participant || m.key.remoteJid)
                const action = response === 'going' ? 'join' : 'leave'
                let eventData = global.activeEvents.get(eventId) || global.activeGiveaways.get(jid)
                if (eventData) {
                    if (!eventData.participants) eventData.participants = new Set()
                    if (action === 'join') eventData.participants.add(userId)
                    else eventData.participants.delete(userId)
                }
            } catch (e) {}
        }

        if (!global.db.data) await global.loadDatabase()

        m.exp = 0
        m.euro = false
        m.isCommand = false

        const normalizedSender = this.decodeJid(m.sender)
        const normalizedBot = this.decodeJid(this.user.jid)

        if (!normalizedSender || normalizedSender.includes('undefined') || !normalizedSender.includes('@')) continue
        if (normalizedSender.endsWith('@g.us') || normalizedSender.endsWith('@broadcast') || normalizedSender.endsWith('@newsletter')) continue
        if (!normalizedSender.endsWith('@s.whatsapp.net')) continue

        try {
            Object.defineProperty(m, 'sender', { value: normalizedSender, writable: true, configurable: true })
        } catch (e) {
            m.normalizedSender = normalizedSender
        }

        if (!global.db.data.users[normalizedSender]) {
            global.db.data.users[normalizedSender] = {
                exp: 0, euro: 10, muto: false, registered: false,
                name: m.pushName || '?', age: -1, regTime: -1,
                banned: false, bank: 0, level: 0, role: 'Novizio',
                firstTime: Date.now(), spam: 0, messaggi: 0, warn: 0,
                warnCount: 0, blasphemy: 0, comandiEseguiti: 0,
                premium: false, isAdmin: false, nomeinsta: '',
                gruppiincuieadmin: '', autolevelup: true,
                lastclaim: 0, afk: 0, afkReason: '',
                limit: 15000, premiumDate: -1, premiumTime: 0,
                money: 0, joincount: 2
            }
        }

        let user = global.db.data.users[normalizedSender]
        user.messaggi = user.messaggi || 0
        user.warn = user.warn || 0
        user.warnCount = user.warnCount || 0
        user.blasphemy = user.blasphemy || 0
        user.comandiEseguiti = user.comandiEseguiti || 0
        user.banned = user.banned || false
        user.muto = user.muto || false
        user.premium = user.premium || false
        user.isAdmin = user.isAdmin || false
        user.nomeinsta = user.nomeinsta || ''
        user.gruppiincuieadmin = user.gruppiincuieadmin || ''
        user.role = user.role || 'Novizio'
        user.level = user.level || 0

if (user.banned) {

    if (!user.notifiedBan) {
        await this.sendMessage(m.chat, { text: '❌ Un owner ti ha bloccato i comandi!' }, { quoted: m })
        user.notifiedBan = true
    }

    continue
}

        let chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {
            isBanned: false, welcome: false, goodbye: false, ai: false,
            vocali: false, antiporno: false, antioneview: false,
            autolevelup: false, antivoip: false, rileva: false,
            modoadmin: false, antiLink: false, antiLink2: false,
            slowmode: false, reaction: false, antispam: false, expired: 0, users: {}, topUsers: {}, topRich: {}, topBlasphemy: {}
        })
        if (!chat.topUsers) chat.topUsers = {}
        if (!chat.topRich) chat.topRich = {}
        if (!chat.topBlasphemy) chat.topBlasphemy = {}

        let settings = global.db.data.settings[this.user.jid] || (global.db.data.settings[this.user.jid] = {
            autoread: false, jadibotmd: false, antiPrivate: true,
            soloCreatore: false, status: 0, anticall: true
        })

        if (m.mtype === 'pollUpdateMessage' || m.mtype === 'reactionMessage') continue

        const responseKey = m.chat + normalizedSender
        if (responseHandlers.has(responseKey)) {
            const rh = responseHandlers.get(responseKey)
            let shouldRespond = true
            if (rh.filter && typeof rh.filter === 'function') shouldRespond = rh.filter(m)
            if (rh.validResponses && Array.isArray(rh.validResponses)) {
                const txt = (m.text || '').toLowerCase().trim()
                shouldRespond = rh.validResponses.some(v => txt === v.toLowerCase() || txt.includes(v.toLowerCase()))
            }
            if (shouldRespond) {
                clearTimeout(rh.timeoutId)
                responseHandlers.delete(responseKey)
                rh.resolve(m)
                continue
            }
        }

        let isBotAdmin = false
        let isAdmin = false
        let isGroupAdmin = false
        let isRAdmin = false
        let isGab = global.owner.some(([num]) => num + '@s.whatsapp.net' === normalizedSender)
        let isROwner = isGab || global.owner.some(([num]) => num + '@s.whatsapp.net' === normalizedSender)
        let isOwner = isROwner || m.fromMe
        let isMods = isOwner || global.mods?.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(normalizedSender) || global.db.data.chats?.[m.chat]?.moderatori?.includes(normalizedSender) || false
        let isPrems = isROwner || global.prems?.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(normalizedSender) || false

        let groupMetadata = null
        let participants = []
        let normalizedParticipants = []

        if (m.isGroup) {
            groupMetadata = global.groupCache.get(m.chat)
            if (!groupMetadata) {
                groupMetadata = await fetchGroupMetadataWithRetry(this, m.chat)
                if (groupMetadata) global.groupCache.set(m.chat, groupMetadata, { ttl: 300 })
            }
            if (groupMetadata && groupMetadata.participants) {
                participants = groupMetadata.participants
                normalizedParticipants = participants.map(u => {
                    const nId = this.decodeJid(u.id || u.jid || '')
                    return { ...u, id: nId, jid: u.jid || nId }
                })
                const nOwner = groupMetadata.owner ? this.decodeJid(groupMetadata.owner) : null
                const nOwnerLid = groupMetadata.ownerLid ? this.decodeJid(groupMetadata.ownerLid) : null
                const matchIds = (u, target) => [
                    this.decodeJid(u.id),
                    u.jid ? this.decodeJid(u.jid) : null,
                    u.lid ? this.decodeJid(u.lid) : null
                ].filter(Boolean).includes(target)

                        isAdmin = (normalizedSender === nOwner || normalizedSender === nOwnerLid) ||
                    participants.some(u => matchIds(u, normalizedSender) && (u.admin === 'admin' || u.admin === 'superadmin' || u.admin === true))
                isGroupAdmin = isAdmin
                isBotAdmin = (normalizedBot === nOwner || normalizedBot === nOwnerLid) ||
                    participants.some(u => matchIds(u, normalizedBot) && (u.admin === 'admin' || u.admin === 'superadmin'))
                isRAdmin = (normalizedSender === nOwner || normalizedSender === nOwnerLid)
            }
        }

        if (m.isGroup && !isGroupAdmin) {
            isGroupAdmin = await global.isGroupAdmin(this, m.chat, normalizedSender)
        }

        if (m.isGroup && chat.antimedia && !isAdmin && !isROwner && !isOwner) {
            if (['imageMessage', 'videoMessage'].includes(m.mtype)) {
                try {
                    await this.sendMessage(m.chat, { delete: m.key })
                    await this.sendMessage(m.chat, {
                        text: `@${normalizedSender.split('@')[0]}, 𝐬𝐨𝐥𝐨 𝐟𝐨𝐭𝐨 / 𝐯𝐢𝐝𝐞𝐨 𝐚𝐝 𝐮𝐧𝐚 𝐯𝐢𝐬𝐮𝐚𝐥𝐢𝐳𝐳𝐚𝐳𝐢𝐨𝐧𝐞! ⚠️`,
                        mentions: [normalizedSender]
                    })
                } catch (e) {}
                continue
            }
        }

        if (m.isGroup && chat.antispam && !isGroupAdmin && !isROwner && !isOwner) {
            const chatId = m.chat
            const userId = normalizedSender
            if (!global.spamTracker[chatId]) global.spamTracker[chatId] = {}
            if (!global.spamTracker[chatId][userId]) {
                global.spamTracker[chatId][userId] = { messages: 0, stickers: 0, warns: 0, timeout: null }
            }
            const data = global.spamTracker[chatId][userId]
            if (['conversation', 'extendedTextMessage'].includes(m.mtype)) data.messages++
            if (m.mtype === 'stickerMessage') data.stickers++
            if (data.timeout) clearTimeout(data.timeout)
            data.timeout = setTimeout(() => { data.messages = 0; data.stickers = 0 }, 8000)

            if (data.messages >= 15) {
                try {
                    data.warns++
                    if (data.warns >= 2) {
                        await this.sendMessage(chatId, { text: `🚫 *Utente espulso per spam messaggi*\n\n@${userId.split('@')[0]}`, mentions: [userId] })
                        await this.groupParticipantsUpdate(chatId, [userId], 'remove')
                        delete global.spamTracker[chatId][userId]
                        continue
                    }
                    await this.sendMessage(chatId, { text: `⚠️ @${userId.split('@')[0]}, stai inviando troppi messaggi!\n\nAlla prossima verrai espulso.`, mentions: [userId] })
                    data.messages = 0
                } catch (e) {}
                continue
            }

            if (data.stickers >= 5) {
                try {
                    data.warns++
                    if (data.warns >= 2) {
                        await this.sendMessage(chatId, { text: `🚫 *Utente espulso per spam sticker*\n\n@${userId.split('@')[0]}`, mentions: [userId] })
                        await this.groupParticipantsUpdate(chatId, [userId], 'remove')
                        delete global.spamTracker[chatId][userId]
                        continue
                    }
                    await this.sendMessage(chatId, { text: `⚠️ @${userId.split('@')[0]}, spam di sticker rilevato!\n\nAlla prossima verrai espulso.`, mentions: [userId] })
                    data.stickers = 0
                } catch (e) {}
                continue
            }
        }

        if (m.isGroup && chat.antibusiness && !isGroupAdmin && !isROwner && !isOwner && !isMods) {
            try {
                const businessInfo = await this.getBusinessProfile(normalizedSender).catch(() => null) || {}
                if (businessInfo && Object.keys(businessInfo).length) {
                    if (!isBotAdmin) {
                        await this.sendMessage(m.chat, { text: `⚠️ Ho rilevato un account Business, ma non posso rimuoverlo perché non sono admin del gruppo.` })
                        return
                    }
                    await this.sendMessage(m.chat, { text: `🚫 Account Business rilevato e rimosso: @${normalizedSender.split('@')[0]}`, mentions: [normalizedSender] })
                    await this.groupParticipantsUpdate(m.chat, [normalizedSender], 'remove')
                    return
                }
            } catch (e) {
                console.error('[ERRORE] antibusiness:', e)
            }
        }

        if (chat.isBanned && !isOwner) return

        const activePlugins = Object.entries(global.plugins).filter(([, p]) => p && !p.disabled)
        const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')

        await Promise.allSettled(
            activePlugins
                .filter(([, plugin]) => typeof plugin.all === 'function')
                .map(([name, plugin]) => {
                    const __filename = join(___dirname, name)
                    return plugin.all.call(this, m, { chatUpdate, __dirname: ___dirname, __filename })
                        .catch(e => console.error(`[ERRORE] plugin.all (${name}):`, e))
                })
        )

        try {
            let usedPrefix = null

            for (const [name, plugin] of activePlugins) {
                const __filename = join(___dirname, name)

                let _prefix = plugin.customPrefix || global.prefix || '.'
                let match = (_prefix instanceof RegExp ? [[_prefix.exec(m.text), _prefix]] :
                    Array.isArray(_prefix) ? _prefix.map(p => [p instanceof RegExp ? p : new RegExp(str2Regex(p)).exec(m.text), p]) :
                    typeof _prefix === 'string' ? [[new RegExp(str2Regex(_prefix)).exec(m.text), _prefix]] :
                    [[[], new RegExp]]).find(p => p[1])

                if (typeof plugin.before === 'function') {
                    try {
                        const shouldContinue = await plugin.before.call(this, m, {
                            match, conn: this, participants: normalizedParticipants, groupMetadata,
                            user: { admin: isAdmin ? 'admin' : null },
                            bot: { admin: isBotAdmin ? 'admin' : null },
                            isGab, isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems, isMods,
                            chatUpdate, __dirname: ___dirname, __filename
                        })
                        if (shouldContinue) continue
                    } catch (e) { console.error(`[ERRORE] plugin.before (${name}):`, e) }
                }

                if (typeof plugin !== 'function') continue
                if (!match || !match[0]) continue

                usedPrefix = (match[0] || '')[0]
                if (!usedPrefix) continue

                let noPrefix = m.text.replace(usedPrefix, '')
                let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
                args = args || []
                let _args = noPrefix.trim().split` `.slice(1)
                let text = _args.join` `
                command = command?.toLowerCase() || ''
                let fail = plugin.fail || global.dfail

                let isAccept = plugin.command instanceof RegExp ? plugin.command.test(command) :
                    Array.isArray(plugin.command) ? plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) :
                    typeof plugin.command === 'string' ? plugin.command === command : false

                if (!isAccept) continue

                if (m.isGroup && (plugin.admin || plugin.botAdmin)) {
                    const freshMeta = global.groupCache.get(m.chat) || await fetchGroupMetadataWithRetry(this, m.chat)
                    if (freshMeta) {
                        freshMeta.fetchTime = Date.now()
                        global.groupCache.set(m.chat, freshMeta, { ttl: 300 })
                        groupMetadata = freshMeta
                        participants = groupMetadata.participants
                        normalizedParticipants = participants.map(u => {
                            const nId = this.decodeJid(u.id)
                            return { ...u, id: nId, jid: u.jid || nId }
                        })
                        const nOwner = groupMetadata.owner ? this.decodeJid(groupMetadata.owner) : null
                        const nOwnerLid = groupMetadata.ownerLid ? this.decodeJid(groupMetadata.ownerLid) : null
                        const matchIds = (u, target) => [
                            this.decodeJid(u.id),
                            u.jid ? this.decodeJid(u.jid) : null,
                            u.lid ? this.decodeJid(u.lid) : null
                        ].filter(Boolean).includes(target)

                        isAdmin = (normalizedSender === nOwner || normalizedSender === nOwnerLid) ||
                            participants.some(u => matchIds(u, normalizedSender) && (u.admin === 'admin' || u.admin === 'superadmin'))
                        isBotAdmin = (normalizedBot === nOwner || normalizedBot === nOwnerLid) ||
                            participants.some(u => matchIds(u, normalizedBot) && (u.admin === 'admin' || u.admin === 'superadmin' || u.admin === true))
                        isRAdmin = (normalizedSender === nOwner || normalizedSender === nOwnerLid)
                    }
                }

                if (plugin.disabled && !isOwner) { fail('disabled', m, this); continue }

                if (user.muto && !isROwner && !isOwner) {
                    await this.sendMessage(m.chat, { text: `Sei stato mutato, non puoi usare i comandi.` }, { quoted: m }).catch(e => console.error('[ERRORE]', e))
                    break
                }

                const ignoredGlobally = global.ignoredUsersGlobal.has(normalizedSender)
                const ignoredInGroup = m.isGroup && global.ignoredUsersGroup[m.chat]?.has(normalizedSender)
                if ((ignoredGlobally || ignoredInGroup) && !isROwner) {
                    await this.sendMessage(m.chat, { text: `Non sei autorizzato a usare comandi.` }, { quoted: m }).catch(e => console.error('[ERRORE]', e))
                    break
                }

                m.plugin = name
                if (chat.isBanned && !isROwner && !['gp-sbanchat.js', 'creatore-exec.js', 'gp-delete.js'].includes(name)) break
                if (user.banned && !isROwner && name !== 'creatore-banuser.js') {
                    if (user.antispam > 2) break
                    await this.sendMessage(m.chat, {
                        text: `Sei stato bannato/a dall'utilizzo del bot.\n\n${user.bannedReason ? `Motivo: ${user.bannedReason}` : `Motivo: Non specificato ma meritato`}\n\nContatta il creatore con *${usedPrefix}segnala* per problemi.`
                    }, { quoted: m }).catch(e => console.error('[ERRORE]', e))
                    user.antispam++
                    break
                }

                if (m.isGroup && !isOwner && !isROwner && !isAdmin && chat.antispam) {
                    const groupData = global.groupSpam[m.chat] || (global.groupSpam[m.chat] = {
                        count: 0, firstCommandTimestamp: 0, isSuspended: false
                    })
                    const now = Date.now()
                    if (groupData.isSuspended) break
                    if (now - groupData.firstCommandTimestamp > 60000) {
                        groupData.count = 1
                        groupData.firstCommandTimestamp = now
                    } else {
                        groupData.count++
                    }
                    if (groupData.count > 8) {
                        groupData.isSuspended = true
                        await this.reply(m.chat, `Anti-spam comandi\n\nRilevati troppi comandi in un minuto, aspettate 15 secondi prima di riutilizzare i comandi.\n\nGli admin del gruppo sono esenti da questo limite.`, m).catch(e => console.error('[ERRORE]', e))
                        setTimeout(() => { delete global.groupSpam[m.chat] }, 15000)
                        break
                    }
                }

                if (m.isGroup && chat.modoadmin && !isAdmin && !isMods) break
                if (m.isGroup && chat.antiporno && plugin.tags?.includes('nsfw') && !isAdmin && !isOwner && !isROwner) { fail('restrict', m, this); continue }
                if (m.isGroup && chat.antiLink && plugin.tags?.includes('link') && !isAdmin && !isOwner && !isROwner) { fail('restrict', m, this); continue }
                if (settings.soloCreatore && !isROwner) break
                if (plugin.gab && !isGab) { fail('gab', m, this); continue }

                // Check permesso plugin specifico (addperms)
                const _pluginPerms = global.db.data.pluginPerms?.[normalizedSender] ?? []
                const _pluginBaseName = name.replace(/^.*[\\/]/, '').replace(/\.(js|mjs|cjs)$/, '').toLowerCase()
                const _hasPluginPerm = _pluginPerms.includes(_pluginBaseName) ||
                    (plugin.command instanceof RegExp && _pluginPerms.some(p => plugin.command.test(p))) ||
                    (typeof plugin.command === 'string' && _pluginPerms.includes(plugin.command.toLowerCase()))

                if (plugin.rowner && !isROwner && !_hasPluginPerm) { fail('rowner', m, this); continue }
                if (plugin.owner && !isOwner && !isROwner && !_hasPluginPerm) { fail('owner', m, this); continue }
                if (plugin.mods && !isMods && !isAdmin) { fail('mods', m, this); continue }
                if (plugin.premium && !isPrems) { fail('premium', m, this); continue }
                if (plugin.group && !m.isGroup) { fail('group', m, this); continue }
                if (plugin.botAdmin && !isBotAdmin) { fail('botAdmin', m, this); continue }
                if (plugin.admin && !isAdmin) { fail('admin', m, this); continue }
                if (plugin.private && m.isGroup) { fail('private', m, this); continue }
                if (plugin.register && !user.registered) { fail('unreg', m, this); continue }

                m.isCommand = true
                let xp = 'exp' in plugin ? parseInt(plugin.exp) : 17
                if (xp > 200) {
                    await this.reply(m.chat, 'bzzzzz', m).catch(e => console.error('[ERRORE]', e))
                } else {
                    m.exp += xp
                }

                if (!isPrems && plugin.euro && user.euro < plugin.euro) {
                    await this.reply(m.chat, `Niente piu soldini, stupido poraccio`, m, null, global.rcanal).catch(e => console.error('[ERRORE]', e))
                    continue
                }

                let extra = {
                    match, usedPrefix, noPrefix, _args, args, command, text,
                    conn: this, participants: normalizedParticipants, groupMetadata,
                    user: { admin: isAdmin ? 'admin' : null },
                    bot: { admin: isBotAdmin ? 'admin' : null },
                    isGab, isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems, isMods,
                    chatUpdate, __dirname: ___dirname, __filename,
                    mentionedJid: m.mentionedJid || []
                }

                try {
                    await plugin.call(this, m, extra)
                    if (!isPrems) m.euro = plugin.euro || false
                } catch (e) {
                    m.error = e
                    console.error(`[ERRORE] Plugin ${m.plugin}:`, e)
                    const errMsg = typeof e === 'string' ? e : (e?.message || String(e))
                    if (errMsg && errMsg.includes('rate-overlimit')) await delay(2000)
                    let errText = format(e)
                    for (let key of Object.values(global.APIKeys || {}))
                        errText = errText.replace(new RegExp(key, 'g'), '#HIDDEN#')
                    await this.reply(m.chat, errText, m).catch(err => console.error('[ERRORE]', err))
                } finally {
                    if (typeof plugin.after === 'function') {
                        try { await plugin.after.call(this, m, extra) } catch (e) {}
                    }
                    if (m.euro) {
                        await this.reply(m.chat, `Hai utilizzato *${+m.euro}*`, m, null, global.rcanal).catch(e => console.error('[ERRORE]', e))
                    }
                }
                break
            }
        } catch (e) {
            console.error(`[ERRORE] Handler per ${m.chat}:`, e)
        } finally {
            if (user && user.muto && !m.fromMe) {
                await this.sendMessage(m.chat, { delete: m.key }).catch(e => console.error('[ERRORE]', e))
            }

            if (user) {
                user.exp += m.exp || 0
                user.euro -= m.euro * 1 || 0
                user.messaggi = (user.messaggi || 0) + 1
                user.messages = (user.messages || 0) + 1
                if (m.isCommand) {
                    user.comandiEseguiti = (user.comandiEseguiti || 0) + 1
                    if (isAdmin) {
                        if (typeof global.logAdmin?.increment === 'function') {
                            global.logAdmin.increment(m.chat, m.sender, 'commands', 1)
                        } else {
                            global.logAdminQueue = global.logAdminQueue || []
                            global.logAdminQueue.push({ chatId: m.chat, adminJid: m.sender, actionKey: 'commands', amount: 1 })
                        }
                    }
                }

                if (m.isGroup) {
                    if (!chat.users) chat.users = {}
                    if (!chat.users[normalizedSender]) chat.users[normalizedSender] = { messages: 0 }
                    chat.users[normalizedSender].messages++

                    if (!chat.topUsers) chat.topUsers = {}
                    chat.topUsers[normalizedSender] = (chat.topUsers[normalizedSender] || 0) + 1

                    if (!chat.topRich) chat.topRich = {}
                    const wallet = Number(user.money) || 0
                    const bank = Number(user.bank) || 0
                    chat.topRich[normalizedSender] = wallet + bank

                    if (!chat.topBlasphemy) chat.topBlasphemy = {}
                    chat.topBlasphemy[normalizedSender] = Number(user.blasphemy) || 0
                }

                if (m.plugin) {
                    let stats = global.db.data.stats || (global.db.data.stats = {})
                    let stat = stats[m.plugin] || (stats[m.plugin] = { total: 0, success: 0, last: 0, lastSuccess: 0 })
                    const now = +new Date
                    stat.total += 1
                    stat.last = now
                    if (!m.error) { stat.success += 1; stat.lastSuccess = now }
                }
            }

            try {
                if (!global.opts['noprint'] && m) await (await import(`./lib/print.js`)).default(m, this)
            } catch (e) { console.error('[ERRORE] Print:', e) }

            let settingsREAD = global.db.data.settings[this.user.jid] || {}
            if ((global.opts['autoread'] || settingsREAD.autoread2) && m) {
                await this.readMessages([m.key]).catch(e => console.error('[ERRORE]', e))
            }

            if (chat && chat.reaction && m?.text?.match(/(mente|zione|ta|ivo|osa|issimo|ma|pero|eppure|anche|ma|no|se|ai|ciao|si)/gi) && !m.fromMe) {
                const emot = pickRandom(["🟢","😃","😄","😁","😆","😅","😂","🤣","🥲","☺️","😊","😇","🙂","🙃","😉","😌","😍","🥰"])
                await this.sendMessage(m.chat, { react: { text: emot, key: m.key } }).catch(e => console.error('[ERRORE]', e))
            }

            if (typeof global.markDbDirty === 'function') global.markDbDirty()
        }
    }
}

export async function participantsUpdate({ id, participants, action }) {
    if (global.db.data.chats[id]?.rileva === false) return
    try {
        let metadata = global.groupCache.get(id) || await fetchMetadata(this, id)
        if (!metadata) return
        global.groupCache.set(id, metadata, { ttl: 300 })
        for (const user of participants) {
            const normalizedUser = this.decodeJid(user)
            let userName = global.nameCache.get(normalizedUser)
            if (!userName) {
                userName = (await this.getName(normalizedUser)) || normalizedUser.split('@')[0] || 'Sconosciuto'
                global.nameCache.set(normalizedUser, userName)
            }
        }
    } catch (e) {}
}

export async function groupsUpdate(groupsUpdate) {
    if (global.opts['self']) return
    for (const groupUpdate of groupsUpdate) {
        const id = groupUpdate.id
        if (!id) continue
        global.groupCache.del(id)
        let chats = global.db.data.chats[id] || {}
        let text = ''
        if (groupUpdate.icon) text = (chats.sIcon || this.sIcon || '`immagine modificata`').replace('@icon', groupUpdate.icon)
        if (groupUpdate.revoke) text = (chats.sRevoke || this.sRevoke || '`link reimpostato, nuovo link:`\n@revoke').replace('@revoke', groupUpdate.revoke)
        if (!text) continue
        await this.sendMessage(id, { text, mentions: this.parseMention(text) }).catch(console.error)
    }
}

export async function deleteUpdate(message) {
    try {
        const { fromMe, id } = message
        if (fromMe) return
        let msg = this.serializeM(this.loadMessage(id))
        if (!msg) return
    } catch (e) { console.error(e || 'Unknown deleteUpdate error') }
}

global.dfail = async (type, m, conn) => {
    const nome = m.pushName || 'gab'
    const etarandom = Math.floor(Math.random() * 21) + 13
    const msg = {
        gab: '𝐐𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐞̀ 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞 𝐬𝐨𝐥𝐨 𝐩𝐞𝐫 𝐎𝐰𝐧𝐞𝐫 🕵🏻‍♂️',
        rowner: '𝐐𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐞̀ 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞 𝐬𝐨𝐥𝐨 𝐩𝐞𝐫 𝐎𝐰𝐧𝐞𝐫 𝐞 𝐂𝐨-𝐎𝐰𝐧𝐞𝐫 🕵🏻‍♂️',
        owner: '𝐐𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐞̀ 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞 𝐬𝐨𝐥𝐨 𝐩𝐞𝐫 𝐎𝐰𝐧𝐞 𝐞 𝐂𝐨-𝐎𝐰𝐧𝐞𝐫 🕵🏻‍♂️',
        mods: '𝐐𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐞̀ 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞 𝐬𝐨𝐥𝐨 𝐩𝐞𝐫 𝐢 𝐌𝐨𝐝𝐞𝐫𝐚𝐭𝐨𝐫𝐢 𝐞 𝐀𝐝𝐦𝐢𝐧🛡️',
        premium: '𝐐𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐞̀ 𝐫𝐢𝐬𝐞𝐫𝐯𝐚𝐭𝐨 𝐚𝐢 𝐏𝐫𝐞𝐦𝐢𝐮𝐦 💎',
        group: '𝐐𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐩𝐮𝐨̀ 𝐞𝐬𝐬𝐞𝐫𝐞 𝐮𝐬𝐚𝐭𝐨 𝐬𝐨𝐥𝐨 𝐧𝐞𝐢 𝐆𝐫𝐮𝐩𝐩𝐢 👥',
        private: '𝐐𝐮𝐞𝐬𝐭𝐚 𝐟𝐮𝐧𝐳𝐢𝐨𝐧𝐞 𝐞̀ 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞 𝐬𝐨𝐥𝐨 𝐢𝐧 𝐏𝐫𝐢𝐯𝐚𝐭𝐨 🔒',
        admin: '𝐐𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐞̀ 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞 𝐬𝐨𝐥𝐨 𝐩𝐞𝐫 𝐠𝐥𝐢 𝐀𝐝𝐦𝐢𝐧 ⚙️',
        botAdmin: '𝐃𝐞𝐯𝐨 𝐞𝐬𝐬𝐞𝐫𝐞 𝐀𝐝𝐦𝐢𝐧 𝐩𝐞𝐫 𝐞𝐬𝐞𝐠𝐮𝐢𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 🤖',
        unreg: `𝐍𝐨𝐧 𝐬𝐞𝐢 𝐫𝐞𝐠𝐢𝐬𝐭𝐫𝐚𝐭𝐨/𝐚 📝\n𝐑𝐞𝐠𝐢𝐬𝐭𝐫𝐚𝐭𝐢 𝐩𝐞𝐫 𝐮𝐬𝐚𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐚 𝐟𝐮𝐧𝐳𝐢𝐨𝐧𝐞\n\n𝐅𝐨𝐫𝐦𝐚𝐭𝐨:\n𝐧𝐨𝐦𝐞 𝐞𝐭𝐚\n\n𝐄𝐬𝐞𝐦𝐩𝐢𝐨:\n.reg ${nome} ${etarandom}`,
        restrict: '𝐐𝐮𝐞𝐬𝐭𝐚 𝐟𝐮𝐧𝐳𝐢𝐨𝐧𝐞 𝐞̀ 𝐚𝐭𝐭𝐮𝐚𝐥𝐦𝐞𝐧𝐭𝐞 𝐝𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐚 🚫',
        disabled: '𝐐𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐞̀ 𝐚𝐭𝐭𝐮𝐚𝐥𝐦𝐞𝐧𝐭𝐞 𝐝𝐢𝐬𝐚𝐛𝐢𝐥𝐢𝐭𝐚𝐭𝐨 🚫'
    }[type]
    if (msg) conn.reply(m.chat, msg, m, global.rcanal).catch(e => console.error('[ERRORE] dfail:', e))
}

export async function callUpdate(calls) {
  for (const call of (Array.isArray(calls) ? calls : [calls])) {
    if (!call) continue
    const { from, status, isVideo, id } = call
    if (status === 'offer') {
      try {
        await global.conn.rejectCall(id, from)
      } catch (e) {
        console.error('[callUpdate] Errore rifiuto chiamata:', e.message)
      }
    }
  }
}

let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
    unwatchFile(file)
    console.log(chalk.bgHex('#3b0d95')(chalk.white.bold("File: 'handler.js' Aggiornato")))
    if (global.reloadHandler) {
        const result = await global.reloadHandler()
        if (result !== true) console.error('Errore reloadHandler handler.js:', result)
    }
})