import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import {
    smsg
} from './lib/simple.js';
import {
    format
} from 'util';
import {
    fileURLToPath
} from 'url';
import path, {
    join
} from 'path';
import {
    unwatchFile,
    watchFile
} from 'fs';
import fs from 'fs';
import chalk from 'chalk';
import NodeCache from 'node-cache';
import {
    getAggregateVotesInPollMessage,
    toJid
} from '@realvare/baileys';

const {
    proto
} = await import('@realvare/baileys');


let _printModule = null;
const _getPrintModule = async () => {
    if (!_printModule) _printModule = (await import('./lib/print.js')).default;
    return _printModule;
};


const isNumber = x => typeof x === 'number' && !isNaN(x);
const delay = ms => isNumber(ms) && new Promise(r => setTimeout(r, ms));
const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
const pickRandom = list => list[Math.floor(Math.random() * list.length)];


const DUPLICATE_WINDOW = 3000;
const ___dirname = join(path.dirname(fileURLToPath(import.meta.url)), './plugins');
const responseHandlers = new Map();

global.ignoredUsersGlobal ??= new Set();
global.ignoredUsersGroup ??= {};
global.groupSpam ??= {};
global.processedMessages ??= new Set();
global.processedCalls ??= new Map();
global.spamTracker ??= {};
global.activeEvents ??= new Map();
global.activeGiveaways ??= new Map();


global.groupCache ??= new NodeCache({
    stdTTL: 300,
    useClones: false,
    checkperiod: 60,
    maxKeys: 2000
});
global.jidCache ??= new NodeCache({
    stdTTL: 3600,
    useClones: false,
    checkperiod: 600,
    maxKeys: 5000
});
global.nameCache ??= new NodeCache({
    stdTTL: 3600,
    useClones: false,
    checkperiod: 600,
    maxKeys: 5000
});


export async function loadAllPlugins(pluginsDir = ___dirname) {
    const results = {};
    async function scanDir(dir, prefix = '') {
        let entries;
        try {
            entries = fs.readdirSync(dir, {
                withFileTypes: true
            });
        } catch {
            return;
        }
        await Promise.allSettled(entries.map(async (entry) => {
            const fullPath = path.join(dir, entry.name);
            const relName = prefix ? `${prefix}/${entry.name}` : entry.name;
            if (entry.isDirectory()) {
                await scanDir(fullPath, relName);
            } else if (entry.isFile() && /\.(js|mjs|cjs)$/.test(entry.name) && !entry.name.startsWith('_')) {
                try {
                    const mod = await import(`${fullPath}?t=${Date.now()}`);
                    results[relName] = mod.default ?? mod;
                } catch (e) {
                    console.error(chalk.red(`[plugins] Errore caricamento ${relName}:`), e.message);
                }
            }
        }));
    }
    await scanDir(pluginsDir);
    return results;
}


export const fetchMetadata = async (conn, chatId) => conn.groupMetadata(chatId);

const fetchGroupMetadataWithRetry = async (conn, chatId) => {
    try {
        return await conn.groupMetadata(chatId);
    } catch {
        return null;
    }
};

global.getGroupAdmins = async (conn, groupId) => {
    try {
        let meta = global.groupCache.get(groupId);
        if (!meta) {
            meta = await fetchGroupMetadataWithRetry(conn, groupId);
            if (meta) global.groupCache.set(groupId, meta);
        }
        if (!meta) return [];
        return meta.participants
            .filter(p => p.admin === 'admin' || p.admin === 'superadmin' || p.admin === true)
            .map(p => conn.decodeJid(p.id));
    } catch {
        return [];
    }
};

global.isGroupAdmin = async (conn, groupId, userId) => {
    const admins = await global.getGroupAdmins(conn, groupId);
    return admins.includes(conn.decodeJid(userId));
};


function initResponseHandler(conn) {
    if (conn.waitForResponse) return;
    conn.waitForResponse = (chat, sender, options = {}) => {
        const {
            timeout = 30_000, validResponses = null, onTimeout = null, filter = null
        } = options;
        return new Promise(resolve => {
            const key = chat + sender;
            const timeoutId = setTimeout(() => {
                responseHandlers.delete(key);
                onTimeout?.();
                resolve(null);
            }, timeout);
            responseHandlers.set(key, {
                resolve,
                timeoutId,
                validResponses,
                filter
            });
        });
    };
}


if (!global.adminListenerSet && global.conn) {
    global.conn.ev.on('group-participants.update', ({
        id,
        action
    }) => {
        try {
            if (action === 'promote' || action === 'demote') global.groupCache.del(id);
        } catch {}
    });
    global.adminListenerSet = true;
}


if (!global.cacheListenersSet && global.conn) {
    const conn = global.conn;

    const registerGroup = async (groupId) => {
        try {
            global.db.data.chats[groupId] ??= {
                isBanned: false,
                expired: 0,
                users: {}
            };
            const meta = await fetchGroupMetadataWithRetry(conn, groupId);
            if (meta) global.groupCache.set(groupId, meta);
        } catch {}
    };

    setTimeout(async () => {
        try {
            const groups = await conn.groupFetchAllParticipating();
            await Promise.allSettled(Object.keys(groups).map(id => registerGroup(id)));
        } catch {}
    }, 5000);

    conn.ev.on('groups.update', async (updates) => {
        for (const update of updates) {
            if (!update?.id) continue;
            global.groupCache.del(update.id);
            await registerGroup(update.id);
        }
    });

    conn.ev.on('group-participants.update', async (update) => {
        if (!update?.id) return;
        global.groupCache.del(update.id);
        await registerGroup(update.id);

        try {
            const botJid = conn.decodeJid(conn.user?.jid || conn.user?.id || '');
            if (!botJid) return;

            const participantJids = Array.isArray(update.participants) ? update.participants.map(p => {
                if (!p) return '';
                if (typeof p === 'string') return conn.decodeJid(p);
                return conn.decodeJid(p.id || p.jid || p.lid || '');
            }).filter(Boolean) : [];

            const isBotPromoted = update.action === 'promote' && participantJids.includes(botJid);
            const isBotAdded = ['add', 'invite', 'join'].includes(update.action) && participantJids.includes(botJid);

            let shouldAnnounce = false;
            if (isBotPromoted) {
                shouldAnnounce = true;
            } else if (isBotAdded) {
                const metadata = await fetchGroupMetadataWithRetry(conn, update.id);
                const participants = Array.isArray(metadata?.participants) ? metadata.participants : [];
                shouldAnnounce = participants.some(p => {
                    const jid = conn.decodeJid(p?.id || p?.jid || p?.lid || p || '');
                    return jid === botJid && ['admin', 'superadmin', true].includes(p?.admin);
                });
            }

            if (shouldAnnounce) {
                const metadata = await fetchGroupMetadataWithRetry(conn, update.id);
                const groupName = metadata?.subject || 'questo gruppo';




                const text = `*👋 Ciao a tutti membri di ${groupName}*\n\n*🤖 Sono 333 bot* — un bot italiano sviluppato da *Gab* e *Lucifero*, con oltre *300 comandi*.\n\n*✅ Ora sono operativo in questo gruppo.*\n\n*👉 Per iniziare:* digita *'.menu'* per visualizzare la lista completa dei comandi.\n\n*🔗 Il nostro canale per aggiornamenti:* https://whatsapp.com/channel/0029VauhQviCsU9Ibrwlkb0h\n\n*🛠️ Supporto:* per qualsiasi problema o info potete entrare nel gruppo supporto: https://chat.whatsapp.com/KADhiii0aHS1DnX6rL5PRE?mode=gi_t`;
                await conn.sendMessage(update.id, {
                    text
                }).catch(() => {});
            }
        } catch (e) {
            console.error('[handler] welcome admin error:', e);
        }
    });

    global.cacheListenersSet = true;
}


if (!global.pollListenerSet && global.conn) {
    global.conn.ev.on('messages.update', async (chatUpdate) => {
        for (const {
                key,
                update
            }
            of chatUpdate) {
            if (!update.pollUpdates) continue;
            try {
                const pollCreation = await global.store.getMessage(key);
                if (pollCreation)
                    await getAggregateVotesInPollMessage({
                        message: pollCreation,
                        pollUpdates: update.pollUpdates
                    });
            } catch {}
        }
    });
    global.pollListenerSet = true;
}


if (global.conn?.ws) {
    global.conn.ws.on('CB:call', async (json) => {
        try {
            if (json?.tag !== 'call' || !json.attrs?.from) return;
            const callerId = global.conn.decodeJid(json.attrs.from);
            const isOwner = global.owner.some(([num]) => num === callerId.split('@')[0]);
            if (isOwner) return;

            const eventId = json.attrs.id;
            let actualCallId = null;
            for (const item of (json.content ?? [])) {
                if (item?.attrs?.['call-id']) {
                    actualCallId = item.attrs['call-id'];
                    break;
                }
            }
            const uniqueId = actualCallId ?? eventId;
            const tags = (json.content ?? []).map(i => i.tag);

            if (tags.includes('terminate')) {
                global.processedCalls.delete(uniqueId);
                return;
            }
            if (!tags.includes('relaylatency')) return;
            if (global.processedCalls.has(uniqueId)) return;

            global.processedCalls.set(uniqueId, true);

            let nome = global.nameCache.get(callerId);
            if (!nome) {
                nome = global.conn.getName(callerId) ?? 'Sconosciuto';
                global.nameCache.set(callerId, nome);
            }

            if (!global.db.data) await global.loadDatabase();
            const settings = global.db.data?.settings?.[global.conn.user.jid] ??
                (global.db.data.settings[global.conn.user.jid] = {
                    jadibotmd: false,
                    antiPrivate: true,
                    soloCreatore: false,
                    anticall: true,
                    status: 0
                });
            if (!settings.anticall) return;

            const userCall = global.db.data.users[callerId] ??
                (global.db.data.users[callerId] = {
                    callCount: 0,
                    banned: false
                });

            if (userCall.banned) {
                await global.conn.rejectCall(uniqueId, callerId);
                return;
            }

            userCall.callCount = (userCall.callCount || 0) + 1;
            try {
                await global.conn.rejectCall(uniqueId, callerId);
                if (userCall.callCount >= 3) {
                    userCall.banned = true;
                    userCall.bannedReason = 'Troppi tentativi di chiamata';
                    await global.conn.sendMessage(toJid(callerId), {
                        text: 'Quanto puoi essere sfigato per spammare di call smh.'
                    });
                } else {
                    await global.conn.sendMessage(toJid(callerId), {
                        text: 'Chiamata rifiutata automaticamente, non chiamare il bot.'
                    });
                }
            } catch {
                global.processedCalls.delete(uniqueId);
            }
        } catch {}
    });
}

setInterval(() => {
    if (global.processedCalls.size > 10) global.processedCalls.clear();
}, 180_000);


function matchIds(conn, u, target) {
    return [
        conn.decodeJid(u.id),
        u.jid ? conn.decodeJid(u.jid) : null,
        u.lid ? conn.decodeJid(u.lid) : null,
    ].filter(Boolean).includes(target);
}

function calcAdminFlags(conn, participants, groupMetadata, normalizedSender, normalizedBot) {
    const nOwner = groupMetadata.owner ? conn.decodeJid(groupMetadata.owner) : null;
    const nOwnerLid = groupMetadata.ownerLid ? conn.decodeJid(groupMetadata.ownerLid) : null;

    const isAdmin = (normalizedSender === nOwner || normalizedSender === nOwnerLid) ||
        participants.some(u => matchIds(conn, u, normalizedSender) && (u.admin === 'admin' || u.admin === 'superadmin' || u.admin === true));
    const isBotAdmin = (normalizedBot === nOwner || normalizedBot === nOwnerLid) ||
        participants.some(u => matchIds(conn, u, normalizedBot) && (u.admin === 'admin' || u.admin === 'superadmin'));
    const isRAdmin = normalizedSender === nOwner || normalizedSender === nOwnerLid;

    return {
        isAdmin,
        isBotAdmin,
        isRAdmin
    };
}


export async function handler(chatUpdate) {
    this.msgqueque ??= [];
    this.uptime ??= Date.now();

    if (!chatUpdate?.messages?.length) return;

    this.pushMessage(chatUpdate.messages).catch(err => {
        if (!err.message?.includes('Bad MAC') && !err.message?.includes('absent'))
            console.error('[ERRORE] pushMessage:', err);
    });

    for (let m of chatUpdate.messages) {
        if (!m?.key?.remoteJid) continue;


        if (!m.message && m.messageStubType == null) {
            try {
                const failedSender = m.key.participant ?? m.key.remoteJid;
                if (failedSender) {
                    global._decryptRetried ??= new Map();
                    const retries = global._decryptRetried.get(failedSender) ?? 0;
                    if (retries < 3) {
                        global._decryptRetried.set(failedSender, retries + 1);
                        setTimeout(() => global._decryptRetried?.delete(failedSender), 120_000);
                        try {
                            await this.authState?.keys?.remove?.('session', [failedSender]);
                        } catch {}
                        try {
                            await this.requestPrivacyTokens?.([failedSender]);
                        } catch {}
                        await delay(1500);
                        try {
                            const retried = await this.loadMessage(m.key.id);
                            if (retried?.message) m = retried;
                            else continue;
                        } catch {
                            continue;
                        }
                    } else {
                        global._decryptRetried.delete(failedSender);
                        continue;
                    }
                }
            } catch {
                continue;
            }
        }


        if (m.message?.protocolMessage?.type === 'MESSAGE_EDIT') {
            const {
                key: eKey,
                editedMessage
            } = m.message.protocolMessage;
            m.key = eKey;
            m.message = editedMessage;
            m.text = editedMessage.conversation ?? editedMessage.extendedTextMessage?.text ?? '';
            m.mtype = Object.keys(editedMessage)[0];
        }

        m = smsg(this, m, global.store);
        if (!m?.key?.remoteJid) continue;


        if (m.messageStubType === 29 || m.messageStubType === 30)
            global.groupCache.del(m.chat);


        try {
            m.key.remoteJid = this.decodeJid(m.key.remoteJid);
            if (m.key.participant) {
                m.key.participant = this.decodeJid(m.key.participant);
                if (!m.key.participant.endsWith('@s.whatsapp.net'))
                    m.key.participant = m.key.participant.split('@')[0].split(':')[0] + '@s.whatsapp.net';
            }
        } catch {
            continue;
        }

        m.chat ??= m.key.remoteJid;
        m.sender ??= m.key.participant ?? m.key.remoteJid;

        if (!m.chat || !m.sender) continue;
        if (typeof m.chat !== 'string' || typeof m.sender !== 'string') continue;
        if (m.sender.includes('undefined')) continue;
        if (!m.sender.endsWith('@s.whatsapp.net') && !m.sender.endsWith('@g.us')) continue;


        const msgId = m.key?.id;
        if (msgId) {
            if (global.processedMessages.has(msgId)) continue;
            global.processedMessages.add(msgId);
            setTimeout(() => global.processedMessages.delete(msgId), DUPLICATE_WINDOW);
        }

        initResponseHandler(this);


        const _btnDispatch = (buttonId) => {
            if (!buttonId || typeof buttonId !== 'string') return false;
            handler.call(this, {
                messages: [{
                    key: {
                        remoteJid: m.key.remoteJid,
                        fromMe: false,
                        id: `btn_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                        participant: m.key.participant ?? m.sender
                    },
                    message: {
                        conversation: buttonId
                    },
                    text: buttonId,
                    messageTimestamp: m.messageTimestamp ?? Date.now(),
                    pushName: m.pushName ?? '',
                    broadcast: false,
                    participant: m.key.participant ?? m.sender
                }]
            });
            return true;
        };

        if (m.message?.buttonsResponseMessage) {
            const r = m.message.buttonsResponseMessage;
            if (_btnDispatch(r?.selectedButtonId ?? r?.id)) continue;
        }
        if (m.message?.templateButtonReplyMessage) {
            const r = m.message.templateButtonReplyMessage;
            if (_btnDispatch(r?.selectedId ?? r?.id)) continue;
        }
        if (m.message?.interactiveResponseMessage) {
            try {
                const r = m.message.interactiveResponseMessage;
                const paramsJson = r?.nativeFlowResponseMessage?.paramsJson ?? r?.paramsJson ?? '';
                let buttonId = r?.selectedId ?? '';
                if (!buttonId && paramsJson) {
                    try {
                        buttonId = JSON.parse(paramsJson)?.id ?? '';
                    } catch {
                        buttonId = paramsJson;
                    }
                }
                if (_btnDispatch(buttonId)) continue;
            } catch {}
        }
        if (m.message?.eventResponseMessage) {
            try {
                const {
                    eventId,
                    response
                } = m.message.eventResponseMessage;
                const jid = this.decodeJid(m.key.remoteJid);
                const userId = this.decodeJid(m.key.participant ?? m.key.remoteJid);
                const action = response === 'going' ? 'join' : 'leave';
                const evData = global.activeEvents.get(eventId) ?? global.activeGiveaways.get(jid);
                if (evData) {
                    evData.participants ??= new Set();
                    action === 'join' ? evData.participants.add(userId) : evData.participants.delete(userId);
                }
            } catch {}
        }


        if (!global.db.data) await global.loadDatabase();

        m.exp = 0;
        m.euro = false;
        m.isCommand = false;

        const normalizedSender = this.decodeJid(m.sender);
        const normalizedBot = this.decodeJid(this.user.jid);

        if (!normalizedSender?.includes('@')) continue;
        if (normalizedSender.endsWith('@g.us') || normalizedSender.endsWith('@broadcast') || normalizedSender.endsWith('@newsletter')) continue;
        if (!normalizedSender.endsWith('@s.whatsapp.net')) continue;

        try {
            Object.defineProperty(m, 'sender', {
                value: normalizedSender,
                writable: true,
                configurable: true
            });
        } catch {
            m.normalizedSender = normalizedSender;
        }


        global.db.data.users[normalizedSender] ??= {
            exp: 0,
            euro: 10,
            muto: false,
            registered: false,
            name: m.pushName ?? '?',
            age: -1,
            regTime: -1,
            banned: false,
            bank: 0,
            level: 0,
            role: 'Novizio',
            firstTime: Date.now(),
            spam: 0,
            messaggi: 0,
            warn: 0,
            warnCount: 0,
            blasphemy: 0,
            comandiEseguiti: 0,
            premium: false,
            isAdmin: false,
            nomeinsta: '',
            gruppiincuieadmin: '',
            autolevelup: true,
            lastclaim: 0,
            afk: 0,
            afkReason: '',
            limit: 15000,
            premiumDate: -1,
            premiumTime: 0,
            money: 0,
            joincount: 2
        };

        const user = global.db.data.users[normalizedSender];
        for (const [k, v] of Object.entries({
                messaggi: 0,
                warn: 0,
                warnCount: 0,
                blasphemy: 0,
                comandiEseguiti: 0,
                banned: false,
                muto: false,
                premium: false,
                isAdmin: false,
                nomeinsta: '',
                gruppiincuieadmin: '',
                role: 'Novizio',
                level: 0
            })) user[k] ??= v;


        if (user.banned) {
            if (!user.notifiedBan) {
                await this.sendMessage(m.chat, {
                    text: '❌ Un owner ti ha bloccato i comandi!'
                }, {
                    quoted: m
                });
                user.notifiedBan = true;
            }
            continue;
        }


        const chatDefaults = {
            isBanned: false,
            welcome: false,
            goodbye: false,
            ai: false,
            vocali: false,
            antiporno: false,
            antioneview: false,
            autolevelup: false,
            antivoip: false,
            rileva: false,
            modoadmin: false,
            antiLink: false,
            antiLink2: false,
            slowmode: false,
            reaction: false,
            antispam: false,
            expired: 0,
            users: {},
            topUsers: {},
            topRich: {},
            topBlasphemy: {}
        };
        const chat = global.db.data.chats[m.chat] ??= chatDefaults;
        chat.topUsers ??= {};
        chat.topRich ??= {};
        chat.topBlasphemy ??= {};

        const settingsDefaults = {
            autoread: false,
            jadibotmd: false,
            antiPrivate: true,
            soloCreatore: false,
            status: 0,
            anticall: true
        };
        const settings = global.db.data.settings[this.user.jid] ??= settingsDefaults;

        if (m.mtype === 'pollUpdateMessage' || m.mtype === 'reactionMessage') continue;


        const responseKey = m.chat + normalizedSender;
        if (responseHandlers.has(responseKey)) {
            const rh = responseHandlers.get(responseKey);
            let ok = true;
            if (typeof rh.filter === 'function') ok = rh.filter(m);
            if (rh.validResponses?.length) {
                const txt = (m.text ?? '').toLowerCase().trim();
                ok = rh.validResponses.some(v => txt === v.toLowerCase() || txt.includes(v.toLowerCase()));
            }
            if (ok) {
                clearTimeout(rh.timeoutId);
                responseHandlers.delete(responseKey);
                rh.resolve(m);
                continue;
            }
        }


        let isBotAdmin = false,
            isAdmin = false,
            isGroupAdmin = false,
            isRAdmin = false;
        const isGab = global.owner.some(([num]) => num + '@s.whatsapp.net' === normalizedSender);
        const isROwner = isGab;
        const isOwner = isROwner || m.fromMe;
        const isMods = isOwner ||
            global.mods?.map(v => v.replace(/\D/g, '') + '@s.whatsapp.net').includes(normalizedSender) ||
            global.db.data.chats?.[m.chat]?.moderatori?.includes(normalizedSender) || false;
        const isPrems = isROwner ||
            global.prems?.map(v => v.replace(/\D/g, '') + '@s.whatsapp.net').includes(normalizedSender) || false;

        let groupMetadata = null;
        let participants = [];
        let normalizedParticipants = [];

        if (m.isGroup) {
            groupMetadata = global.groupCache.get(m.chat);
            if (!groupMetadata) {
                groupMetadata = await fetchGroupMetadataWithRetry(this, m.chat);
                if (groupMetadata) global.groupCache.set(m.chat, groupMetadata);
            }
            if (groupMetadata?.participants) {
                participants = groupMetadata.participants;
                normalizedParticipants = participants.map(u => {
                    const nId = this.decodeJid(u.id ?? u.jid ?? '');
                    return {
                        ...u,
                        id: nId,
                        jid: u.jid ?? nId
                    };
                });
                const flags = calcAdminFlags(this, participants, groupMetadata, normalizedSender, normalizedBot);
                isAdmin = flags.isAdmin;
                isGroupAdmin = flags.isAdmin;
                isBotAdmin = flags.isBotAdmin;
                isRAdmin = flags.isRAdmin;
            }
        }


        if (m.isGroup && chat.antimedia && !isAdmin && !isROwner && !isOwner) {
            if (['imageMessage', 'videoMessage'].includes(m.mtype)) {
                try {
                    await this.sendMessage(m.chat, {
                        delete: m.key
                    });
                    await this.sendMessage(m.chat, {
                        text: `@${normalizedSender.split('@')[0]}, solo foto/video ad una visualizzazione! ⚠️`,
                        mentions: [normalizedSender]
                    });
                } catch {}
                continue;
            }
        }


        if (m.isGroup && chat.antispam && !isGroupAdmin && !isROwner && !isOwner) {
            const chatId = m.chat,
                userId = normalizedSender;
            global.spamTracker[chatId] ??= {};
            global.spamTracker[chatId][userId] ??= {
                messages: 0,
                stickers: 0,
                warns: 0,
                timeout: null
            };
            const data = global.spamTracker[chatId][userId];

            if (['conversation', 'extendedTextMessage'].includes(m.mtype)) data.messages++;
            if (m.mtype === 'stickerMessage') data.stickers++;
            if (data.timeout) clearTimeout(data.timeout);
            data.timeout = setTimeout(() => {
                data.messages = 0;
                data.stickers = 0;
            }, 8000);

            if (data.messages >= 15) {
                try {
                    data.warns++;
                    if (data.warns >= 2) {
                        await this.sendMessage(chatId, {
                            text: `🚫 *Utente espulso per spam messaggi*\n\n@${userId.split('@')[0]}`,
                            mentions: [userId]
                        });
                        await this.groupParticipantsUpdate(chatId, [userId], 'remove');
                        delete global.spamTracker[chatId][userId];
                        continue;
                    }
                    await this.sendMessage(chatId, {
                        text: `⚠️ @${userId.split('@')[0]}, stai inviando troppi messaggi!\n\nAlla prossima verrai espulso.`,
                        mentions: [userId]
                    });
                    data.messages = 0;
                } catch {}
                continue;
            }

            if (data.stickers >= 5) {
                try {
                    data.warns++;
                    if (data.warns >= 2) {
                        await this.sendMessage(chatId, {
                            text: `🚫 *Utente espulso per spam sticker*\n\n@${userId.split('@')[0]}`,
                            mentions: [userId]
                        });
                        await this.groupParticipantsUpdate(chatId, [userId], 'remove');
                        delete global.spamTracker[chatId][userId];
                        continue;
                    }
                    await this.sendMessage(chatId, {
                        text: `⚠️ @${userId.split('@')[0]}, spam di sticker!\n\nAlla prossima verrai espulso.`,
                        mentions: [userId]
                    });
                    data.stickers = 0;
                } catch {}
                continue;
            }
        }


        if (m.isGroup && chat.antibusiness && !isGroupAdmin && !isROwner && !isOwner && !isMods) {
            try {
                const biz = await this.getBusinessProfile(normalizedSender).catch(() => null) ?? {};
                if (Object.keys(biz).length) {
                    if (!isBotAdmin) {
                        await this.sendMessage(m.chat, {
                            text: `⚠️ Account Business rilevato, ma non sono admin del gruppo — impossibile rimuovere.`
                        });
                    } else {
                        await this.sendMessage(m.chat, {
                            text: `🚫 Account Business rimosso: @${normalizedSender.split('@')[0]}`,
                            mentions: [normalizedSender]
                        });
                        await this.groupParticipantsUpdate(m.chat, [normalizedSender], 'remove');
                    }
                    continue;
                }
            } catch (e) {
                console.error('[ERRORE] antibusiness:', e);
            }
        }

        if (chat.isBanned && !isOwner) continue;


        const activePlugins = Object.entries(global.plugins).filter(([, p]) => p && !p.disabled);
        await Promise.allSettled(
            activePlugins
            .filter(([, p]) => typeof p.all === 'function')
            .map(([name, p]) =>
                p.all.call(this, m, {
                    chatUpdate,
                    __dirname: ___dirname,
                    __filename: join(___dirname, name)
                })
                .catch(e => console.error(`[ERRORE] plugin.all (${name}):`, e))
            )
        );


        try {
            let usedPrefix = null;

            for (const [name, plugin] of activePlugins) {
                const __filename = join(___dirname, name);

                const _prefix = plugin.customPrefix ?? global.prefix ?? '.';
                const match = (
                    _prefix instanceof RegExp ? [
                        [_prefix.exec(m.text), _prefix]
                    ] :
                    Array.isArray(_prefix) ? _prefix.map(p => [p instanceof RegExp ? p.exec(m.text) : new RegExp(str2Regex(p)).exec(m.text), p]) :
                    typeof _prefix === 'string' ? [
                        [new RegExp(str2Regex(_prefix)).exec(m.text), _prefix]
                    ] : [
                        [
                            [], new RegExp
                        ]
                    ]
                ).find(([p]) => p);

                if (typeof plugin.before === 'function') {
                    try {
                        const stop = await plugin.before.call(this, m, {
                            match,
                            conn: this,
                            participants: normalizedParticipants,
                            groupMetadata,
                            user: {
                                admin: isAdmin ? 'admin' : null
                            },
                            bot: {
                                admin: isBotAdmin ? 'admin' : null
                            },
                            isGab,
                            isROwner,
                            isOwner,
                            isRAdmin,
                            isAdmin,
                            isBotAdmin,
                            isPrems,
                            isMods,
                            chatUpdate,
                            __dirname: ___dirname,
                            __filename
                        });
                        if (stop) continue;
                    } catch (e) {
                        console.error(`[ERRORE] plugin.before (${name}):`, e);
                    }
                }

                if (typeof plugin !== 'function') continue;
                if (!match?.[0]) continue;

                usedPrefix = (match[0] || '')[0];
                if (!usedPrefix) continue;

                const noPrefix = m.text.replace(usedPrefix, '');
                let [command, ...args] = noPrefix.trim().split` `.filter(Boolean);
                args = args ?? [];
                const _args = noPrefix.trim().split` `.slice(1);
                const text = _args.join` `;
                command = command?.toLowerCase() ?? '';
                const fail = plugin.fail ?? global.dfail;

                const isAccept = plugin.command instanceof RegExp ? plugin.command.test(command) :
                    Array.isArray(plugin.command) ? plugin.command.some(c => c instanceof RegExp ? c.test(command) : c === command) :
                    typeof plugin.command === 'string' ? plugin.command === command : false;
                if (!isAccept) continue;

                // Refresh metadata per comandi admin
                if (m.isGroup && (plugin.admin || plugin.botAdmin)) {
                    const freshMeta = global.groupCache.get(m.chat) ?? await fetchGroupMetadataWithRetry(this, m.chat);
                    if (freshMeta) {
                        global.groupCache.set(m.chat, freshMeta);
                        groupMetadata = freshMeta;
                        participants = freshMeta.participants;
                        normalizedParticipants = participants.map(u => {
                            const nId = this.decodeJid(u.id);
                            return {
                                ...u,
                                id: nId,
                                jid: u.jid ?? nId
                            };
                        });
                        const flags = calcAdminFlags(this, participants, freshMeta, normalizedSender, normalizedBot);
                        isAdmin = flags.isAdmin;
                        isBotAdmin = flags.isBotAdmin;
                        isRAdmin = flags.isRAdmin;
                    }
                }

                if (plugin.disabled && !isOwner) {
                    fail('disabled', m, this);
                    continue;
                }
                if (user.muto && !isROwner && !isOwner) {
                    await this.sendMessage(m.chat, {
                        text: `Sei stato mutato, non puoi usare i comandi.`
                    }, {
                        quoted: m
                    }).catch(() => {});
                    break;
                }

                const ignoredGlobally = global.ignoredUsersGlobal.has(normalizedSender);
                const ignoredInGroup = m.isGroup && global.ignoredUsersGroup[m.chat]?.has(normalizedSender);
                if ((ignoredGlobally || ignoredInGroup) && !isROwner) {
                    await this.sendMessage(m.chat, {
                        text: `Non sei autorizzato a usare comandi.`
                    }, {
                        quoted: m
                    }).catch(() => {});
                    break;
                }

                m.plugin = name;
                if (chat.isBanned && !isROwner && !['gp-sbanchat.js', 'creatore-exec.js', 'gp-delete.js'].includes(name)) break;
                if (user.banned && !isROwner && name !== 'creatore-banuser.js') {
                    if (user.antispam > 2) break;
                    await this.sendMessage(m.chat, {
                        text: `Sei stato bannato/a dall'utilizzo del bot.\n\n${user.bannedReason ? `Motivo: ${user.bannedReason}` : 'Motivo: Non specificato ma meritato'}\n\nContatta il creatore con *${usedPrefix}segnala* per problemi.`
                    }, {
                        quoted: m
                    }).catch(() => {});
                    user.antispam = (user.antispam ?? 0) + 1;
                    break;
                }

                // Antispam comandi gruppo
                if (m.isGroup && !isOwner && !isROwner && !isAdmin && chat.antispam) {
                    const gSpam = global.groupSpam[m.chat] ??= {
                        count: 0,
                        firstCommandTimestamp: 0,
                        isSuspended: false
                    };
                    const now = Date.now();
                    if (gSpam.isSuspended) break;
                    if (now - gSpam.firstCommandTimestamp > 60_000) {
                        gSpam.count = 1;
                        gSpam.firstCommandTimestamp = now;
                    } else gSpam.count++;
                    if (gSpam.count > 8) {
                        gSpam.isSuspended = true;
                        await this.reply(m.chat, `Anti-spam comandi\n\nTroppi comandi in un minuto, aspettate 15 secondi.\n\nGli admin sono esenti.`, m).catch(() => {});
                        setTimeout(() => {
                            delete global.groupSpam[m.chat];
                        }, 15_000);
                        break;
                    }
                }

                if (m.isGroup && chat.modoadmin && !isAdmin && !isMods) break;
                if (m.isGroup && chat.antiporno && plugin.tags?.includes('nsfw') && !isAdmin && !isOwner && !isROwner) {
                    fail('restrict', m, this);
                    continue;
                }
                if (m.isGroup && chat.antiLink && plugin.tags?.includes('link') && !isAdmin && !isOwner && !isROwner) {
                    fail('restrict', m, this);
                    continue;
                }
                if (settings.soloCreatore && !isROwner) break;
                if (plugin.gab && !isGab) {
                    fail('gab', m, this);
                    continue;
                }


                const _pluginPerms = global.db.data.pluginPerms?.[normalizedSender] ?? [];
                const _pluginBaseName = name.replace(/^.*[\\/]/, '').replace(/\.(js|mjs|cjs)$/, '').toLowerCase();
                const _hasPerm = _pluginPerms.includes(_pluginBaseName) ||
                    (plugin.command instanceof RegExp && _pluginPerms.some(p => plugin.command.test(p))) ||
                    (typeof plugin.command === 'string' && _pluginPerms.includes(plugin.command.toLowerCase()));

                if (plugin.rowner && !isROwner && !_hasPerm) {
                    fail('rowner', m, this);
                    continue;
                }
                if (plugin.owner && !isOwner && !isROwner && !_hasPerm) {
                    fail('owner', m, this);
                    continue;
                }
                if (plugin.mods && !isMods && !isAdmin) {
                    fail('mods', m, this);
                    continue;
                }
                if (plugin.premium && !isPrems) {
                    fail('premium', m, this);
                    continue;
                }
                if (plugin.group && !m.isGroup) {
                    fail('group', m, this);
                    continue;
                }
                if (plugin.botAdmin && !isBotAdmin) {
                    fail('botAdmin', m, this);
                    continue;
                }
                if (plugin.admin && !isAdmin) {
                    fail('admin', m, this);
                    continue;
                }
                if (plugin.private && m.isGroup) {
                    fail('private', m, this);
                    continue;
                }
                if (plugin.register && !user.registered) {
                    fail('unreg', m, this);
                    continue;
                }

                m.isCommand = true;
                const xp = 'exp' in plugin ? parseInt(plugin.exp) : 17;
                m.exp += xp <= 200 ? xp : 0;

                if (!isPrems && plugin.euro && user.euro < plugin.euro) {
                    await this.reply(m.chat, `Niente più soldini, stupido poraccio`, m, null, global.rcanal).catch(() => {});
                    continue;
                }

                const extra = {
                    match,
                    usedPrefix,
                    noPrefix,
                    _args,
                    args,
                    command,
                    text,
                    conn: this,
                    participants: normalizedParticipants,
                    groupMetadata,
                    user: {
                        admin: isAdmin ? 'admin' : null
                    },
                    bot: {
                        admin: isBotAdmin ? 'admin' : null
                    },
                    isGab,
                    isROwner,
                    isOwner,
                    isRAdmin,
                    isAdmin,
                    isBotAdmin,
                    isPrems,
                    isMods,
                    chatUpdate,
                    __dirname: ___dirname,
                    __filename,
                    mentionedJid: m.mentionedJid ?? []
                };

                try {
                    await plugin.call(this, m, extra);
                    if (!isPrems) m.euro = plugin.euro || false;
                } catch (e) {
                    m.error = e;
                    console.error(`[ERRORE] Plugin ${m.plugin}:`, e);
                    let errText = format(e);
                    for (const key of Object.values(global.APIKeys ?? {}))
                        errText = errText.replace(new RegExp(key, 'g'), '#HIDDEN#');
                    if (typeof e === 'string' && e.includes('rate-overlimit')) await delay(2000);
                    await this.reply(m.chat, errText, m).catch(() => {});
                } finally {
                    if (typeof plugin.after === 'function') {
                        try {
                            await plugin.after.call(this, m, extra);
                        } catch {}
                    }
                    if (m.euro)
                        await this.reply(m.chat, `Hai utilizzato *${+m.euro}*`, m, null, global.rcanal).catch(() => {});
                }
                break;
            }
        } catch (e) {
            console.error(`[ERRORE] Handler ${m.chat}:`, e);
        } finally {

            if (user?.muto && !m.fromMe)
                await this.sendMessage(m.chat, {
                    delete: m.key
                }).catch(() => {});


            if (user) {
                user.exp = (user.exp || 0) + (m.exp || 0);
                user.euro = (user.euro || 0) - (m.euro || 0);
                user.messaggi = (user.messaggi || 0) + 1;
                user.messages = (user.messages || 0) + 1;

                if (m.isCommand) {
                    user.comandiEseguiti = (user.comandiEseguiti || 0) + 1;
                    if (isAdmin) {
                        if (typeof global.logAdmin?.increment === 'function')
                            global.logAdmin.increment(m.chat, m.sender, 'commands', 1);
                        else {
                            (global.logAdminQueue ??= []).push({
                                chatId: m.chat,
                                adminJid: m.sender,
                                actionKey: 'commands',
                                amount: 1
                            });
                        }
                    }
                }

                if (m.isGroup) {
                    chat.users ??= {};
                    chat.users[normalizedSender] ??= {
                        messages: 0
                    };
                    chat.users[normalizedSender].messages++;
                    chat.topUsers[normalizedSender] = (chat.topUsers[normalizedSender] || 0) + 1;
                    chat.topRich[normalizedSender] = (Number(user.money) || 0) + (Number(user.bank) || 0);
                    chat.topBlasphemy[normalizedSender] = Number(user.blasphemy) || 0;
                }

                if (m.plugin) {
                    const stats = global.db.data.stats ??= {};
                    const stat = stats[m.plugin] ??= {
                        total: 0,
                        success: 0,
                        last: 0,
                        lastSuccess: 0
                    };
                    const now = Date.now();
                    stat.total++;
                    stat.last = now;
                    if (!m.error) {
                        stat.success++;
                        stat.lastSuccess = now;
                    }
                }
            }


            try {
                if (!global.opts['noprint'] && m)
                    await (await _getPrintModule())(m, this);
            } catch (e) {
                console.error('[ERRORE] Print:', e);
            }


            const sREAD = global.db.data?.settings?.[this.user?.jid] ?? {};
            if ((global.opts['autoread'] || sREAD.autoread2) && m)
                await this.readMessages([m.key]).catch(() => {});


            if (chat?.reaction && !m.fromMe && m?.text?.match(/(mente|zione|ta|ivo|osa|issimo|ma|pero|eppure|anche|no|se|ai|ciao|si)/gi)) {
                const emot = pickRandom(['🟢', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥲', '☺️', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰']);
                await this.sendMessage(m.chat, {
                    react: {
                        text: emot,
                        key: m.key
                    }
                }).catch(() => {});
            }

            global.markDbDirty?.();
        }
    }
}


export async function participantsUpdate({
    id,
    participants,
    action
}) {
    if (global.db.data.chats[id]?.rileva === false) return;
    try {
        const meta = global.groupCache.get(id) ?? await fetchMetadata(this, id);
        if (!meta) return;
        global.groupCache.set(id, meta);
        for (const user of participants) {
            const nUser = this.decodeJid(user);
            if (!global.nameCache.get(nUser)) {
                const nome = (await this.getName(nUser)) ?? nUser.split('@')[0] ?? 'Sconosciuto';
                global.nameCache.set(nUser, nome);
            }
        }
    } catch {}
}


export async function groupsUpdate(groupsUpdate) {
    if (global.opts['self']) return;
    for (const update of groupsUpdate) {
        if (!update?.id) continue;
        global.groupCache.del(update.id);
        const chats = global.db.data.chats[update.id] ?? {};
        let text = '';
        if (update.icon) text = (chats.sIcon ?? this.sIcon ?? '`immagine modificata`').replace('@icon', update.icon);
        if (update.revoke) text = (chats.sRevoke ?? this.sRevoke ?? '`link reimpostato:\n@revoke`').replace('@revoke', update.revoke);
        if (!text) continue;
        await this.sendMessage(update.id, {
            text,
            mentions: this.parseMention(text)
        }).catch(console.error);
    }
}


export async function deleteUpdate(message) {
    try {
        const {
            fromMe,
            id
        } = message;
        if (fromMe) return;
        const msg = this.serializeM(this.loadMessage(id));
        if (!msg) return;
    } catch (e) {
        console.error(e);
    }
}


global.dfail = async (type, m, conn) => {
    const nome = m.pushName ?? 'gab';
    const etarandom = Math.floor(Math.random() * 21) + 13;
    const msg = {
        gab: '𝐐𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐞̀ 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞 𝐬𝐨𝐥𝐨 𝐩𝐞𝐫 𝐎𝐰𝐧𝐞𝐫 🕵🏻‍♂️',
        rowner: '𝐐𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐞̀ 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞 𝐬𝐨𝐥𝐨 𝐩𝐞𝐫 𝐎𝐰𝐧𝐞𝐫 𝐞 𝐂𝐨-𝐎𝐰𝐧𝐞𝐫 🕵🏻‍♂️',
        owner: '𝐐𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐞̀ 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞 𝐬𝐨𝐥𝐨 𝐩𝐞𝐫 𝐎𝐰𝐧𝐞𝐫 𝐞 𝐂𝐨-𝐎𝐰𝐧𝐞𝐫 🕵🏻‍♂️',
        mods: '𝐐𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐞̀ 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞 𝐬𝐨𝐥𝐨 𝐩𝐞𝐫 𝐢 𝐌𝐨𝐝𝐞𝐫𝐚𝐭𝐨𝐫𝐢 𝐞 𝐀𝐝𝐦𝐢𝐧 🛡️',
        premium: '𝐐𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐞̀ 𝐫𝐢𝐬𝐞𝐫𝐯𝐚𝐭𝐨 𝐚𝐢 𝐏𝐫𝐞𝐦𝐢𝐮𝐦 💎',
        group: '𝐐𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐩𝐮𝐨̀ 𝐞𝐬𝐬𝐞𝐫𝐞 𝐮𝐬𝐚𝐭𝐨 𝐬𝐨𝐥𝐨 𝐧𝐞𝐢 𝐆𝐫𝐮𝐩𝐩𝐢 👥',
        private: '𝐐𝐮𝐞𝐬𝐭𝐚 𝐟𝐮𝐧𝐳𝐢𝐨𝐧𝐞 𝐞̀ 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞 𝐬𝐨𝐥𝐨 𝐢𝐧 𝐏𝐫𝐢𝐯𝐚𝐭𝐨 🔒',
        admin: '𝐐𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐞̀ 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞 𝐬𝐨𝐥𝐨 𝐩𝐞𝐫 𝐠𝐥𝐢 𝐀𝐝𝐦𝐢𝐧 ⚙️',
        botAdmin: '𝐃𝐞𝐯𝐨 𝐞𝐬𝐬𝐞𝐫𝐞 𝐀𝐝𝐦𝐢𝐧 𝐩𝐞𝐫 𝐞𝐬𝐞𝐠𝐮𝐢𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 🤖',
        unreg: `𝐍𝐨𝐧 𝐬𝐞𝐢 𝐫𝐞𝐠𝐢𝐬𝐭𝐫𝐚𝐭𝐨/𝐚 📝\n𝐑𝐞𝐠𝐢𝐬𝐭𝐫𝐚𝐭𝐢 𝐩𝐞𝐫 𝐮𝐬𝐚𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐚 𝐟𝐮𝐧𝐳𝐢𝐨𝐧𝐞\n\n𝐅𝐨𝐫𝐦𝐚𝐭𝐨:\nnome eta\n\n𝐄𝐬𝐞𝐦𝐩𝐢𝐨:\n.reg ${nome} ${etarandom}`,
        restrict: '𝐐𝐮𝐞𝐬𝐭𝐚 𝐟𝐮𝐧𝐳𝐢𝐨𝐧𝐞 𝐞̀ 𝐚𝐭𝐭𝐮𝐚𝐥𝐦𝐞𝐧𝐭𝐞 𝐝𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐚 🚫',
        disabled: '𝐐𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐞̀ 𝐚𝐭𝐭𝐮𝐚𝐥𝐦𝐞𝐧𝐭𝐞 𝐝𝐢𝐬𝐚𝐛𝐢𝐥𝐢𝐭𝐚𝐭𝐨 🚫',
    } [type];
    if (msg) conn.reply(m.chat, msg, m, global.rcanal).catch(() => {});
};


export async function callUpdate(calls) {
    for (const call of (Array.isArray(calls) ? calls : [calls])) {
        if (!call) continue;
        const {
            from,
            status,
            id
        } = call;
        if (status === 'offer') {
            try {
                await global.conn.rejectCall(id, from);
            } catch (e) {
                console.error('[callUpdate] Errore rifiuto:', e.message);
            }
        }
    }
}


const file = global.__filename(import.meta.url, true);
watchFile(file, async () => {
    unwatchFile(file);
    console.log(chalk.bgHex('#3b0d95')(chalk.white.bold("File: 'handler.js' Aggiornato")));
    if (global.reloadHandler) console.log(await global.reloadHandler());
});