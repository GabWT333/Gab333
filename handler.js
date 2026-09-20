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
} from '@chatunity/baileys';

const {
    proto
} = await import('@chatunity/baileys');


let _printModule = null;
const _getPrintModule = async () => {
    if (!_printModule) _printModule = (await import('./lib/print.js')).default;
    return _printModule;
};


const isNumber = x => typeof x === 'number' && !isNaN(x);
const delay = ms => isNumber(ms) && new Promise(r => setTimeout(r, ms));
const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
const pickRandom = list => list[Math.floor(Math.random() * list.length)];


/** smsg protetto: evita crash contextInfo/quoted undefined in simple.js */
function safeSmsg(conn, m, store) {
    try {
        
        if (m && m.message && typeof m.message === 'object') {
            const mt = Object.keys(m.message)[0];
            const content = mt ? m.message[mt] : null;
            if (content && typeof content === 'object' && content.contextInfo === undefined) {
                
            }
        }
        return smsg(conn, m, store);
    } catch (e) {
        try {
            m.text = m?.text
                ?? m?.message?.conversation
                ?? m?.message?.extendedTextMessage?.text
                ?? m?.message?.imageMessage?.caption
                ?? m?.message?.videoMessage?.caption
                ?? m?.message?.buttonsResponseMessage?.selectedDisplayText
                ?? '';
            m.mtype = m?.mtype || (m?.message ? Object.keys(m.message).find(k => k !== 'messageContextInfo') : 'conversation');
            m.msg = m?.msg || (m?.message ? m.message[m.mtype] : null) || {};
            if (m.msg && typeof m.msg === 'object' && !('contextInfo' in m.msg)) {
                try { m.msg.contextInfo = m.msg.contextInfo ?? null; } catch {}
            }
        } catch {}
        return m;
    }
}



const DUPLICATE_WINDOW = 3000;
const ___dirname = join(path.dirname(fileURLToPath(import.meta.url)), './plugins');
const responseHandlers = new Map();

/** Telefono falso generato dalle cifre di un LID */
function digitsOnly(x) {
    return String(x || '').split('@')[0].replace(/:\d+$/, '').replace(/\D/g, '');
}

function isPlausibleRealPhone(jid) {
    if (!jid || typeof jid !== 'string') return false;
    if (jid.endsWith('@lid') || jid.endsWith('@g.us')) return false;
    if (!jid.includes('@s.whatsapp.net') && !jid.includes('@c.us')) return false;
    if (isFakePhoneJid(jid)) return false;
    const d = jid.split('@')[0].replace(/:\d+$/, '').replace(/\D/g, '');
    return d.length >= 8 && d.length <= 15;
}

function isFakePhoneJid(jid) {
    if (!jid || typeof jid !== 'string') return false;
    if (jid.endsWith('@lid') || jid.endsWith('@g.us')) return false;
    if (!jid.includes('@s.whatsapp.net') && !jid.includes('@c.us')) return false;
    const d = jid.split('@')[0].replace(/:\d+$/, '').replace(/\D/g, '');
    if (d.length > 15) return true;
    if (d.length >= 14 && (d.startsWith('120363') || d.startsWith('20363') || d.startsWith('90426'))) return true;
    return false;
}

if (!global.lidToRealJid) {
    global.lidToRealJid = new Map();
}

if (!global.lidToRealJid._syncPatched) {
    const _orig = global.lidToRealJid.set.bind(global.lidToRealJid);
    global.lidToRealJid.set = (lid, real) => {
        if (typeof real === 'string' && isFakePhoneJid(real)) return;
        
        try {
            if (typeof real === 'string' && !real.endsWith('@lid') && global.__ownBotDigits?.size) {
                const d = real.split('@')[0].replace(/\D/g, '');
                const lidNorm = String(lid || '').replace(/:\d+@/, '@');
                if (global.__ownBotDigits.has(d) && lidNorm !== global.__ownBotLid) {
                    console.warn('[lidToRealJid] BLOCCATO mapping verso bot:', lid, '->', real);
                    return;
                }
            }
        } catch {}
        _orig(lid, real);
        if (typeof lid === 'string' && lid.endsWith('@lid') && real && !String(real).endsWith('@lid') && global.lidCache?.set) {
            try { global.lidCache.set(lid, real); } catch {}
        }
    };
    global.lidToRealJid._syncPatched = true;
}


/** Telefono falso creato dalle cifre di un LID (es. +1 20363...) */
/**
 * Confronta JID con lista owner/mods/prems.
 * IMPORTANTE: le cifre di un @lid NON sono un numero di telefono → non confrontarle mai
 * direttamente con i numeri in config. Solo PN reale o mapping lidCache verificato.
 */
/**
 * Owner / mods / prems del BOT (non admin di gruppo).
 * Un @lid NON e mai owner a meno che lidCache non mappi a un PN reale presente in lista.
 * Mai confrontare le cifre grezze del LID con i numeri in config.
 */
function matchesNumberList(jid, list) {
    if (!jid || !list?.length) return false;
    const j = String(jid);

    const candidates = new Set();
    
    if ((j.endsWith('@s.whatsapp.net') || j.endsWith('@c.us')) && !isFakePhoneJid(j)) {
        const d = digitsOnly(j);
        if (d.length >= 8 && d.length <= 15) candidates.add(d);
    }
    
    if (j.endsWith('@lid')) {
        try {
            const mapped = global.lidCache?.get?.(j) || global.lidCache?.get?.(j.replace(/:\d+@/, '@'));
            if (typeof mapped === 'string' && mapped && !mapped.endsWith('@lid') && !isFakePhoneJid(mapped)) {
                const d = digitsOnly(mapped);
                if (d.length >= 8 && d.length <= 15) candidates.add(d);
            }
        } catch {}
    }
    
    {
        const d = digitsOnly(j);
        if (d.length >= 8 && d.length <= 15 && !j.endsWith('@lid')) candidates.add(d);
    }

    if (!candidates.size) return false;

    for (const entry of list) {
        const num = Array.isArray(entry) ? entry[0] : entry;
        if (num == null) continue;
        const n = digitsOnly(num);
        if (!n || n.length < 8) continue;
        if (candidates.has(n)) return true;
        
        for (const c of candidates) {
            if (c.endsWith(n) || n.endsWith(c)) {
                if (Math.min(c.length, n.length) >= 8) return true;
            }
        }
    }
    return false;
}


function forceLidIfFake(jid) {
    if (!jid || typeof jid !== 'string') return jid;
    if (jid.endsWith('@lid')) return jid;
    if (!isFakePhoneJid(jid)) return jid;
    const d = jid.split('@')[0].replace(/:\d+$/, '').replace(/\D/g, '');
    return d + '@lid';
}

global.ignoredUsersGlobal ??= new Set();
global.ignoredUsersGroup ??= {};
global.groupSpam ??= {};
global.processedMessages ??= new Set();
global.processedCalls ??= new Map();
global.spamTracker ??= {};
global.groupCloseTimers ??= {};
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
        const out = [];
        for (const p of meta.participants) {
            if (!(p.admin === 'admin' || p.admin === 'superadmin' || p.admin === true)) continue;
            for (const key of ['id', 'jid', 'lid']) {
                if (!p[key]) continue;
                let id = String(p[key]);
                if (id.includes(':') && id.includes('@')) id = id.replace(/:\d+@/, '@');
                if (isFakePhoneJid(id)) id = forceLidIfFake(id);
                if (id && !out.includes(id)) out.push(id);
            }
            if (p.phoneNumber) {
                const pn = String(p.phoneNumber);
                const id = pn.includes('@') ? pn : (digitsOnly(pn) + '@s.whatsapp.net');
                if (id && !isFakePhoneJid(id) && !out.includes(id)) out.push(id);
            }
        }
        return out;
    } catch {
        return [];
    }
};

global.isGroupAdmin = async (conn, groupId, userId) => {
    const admins = await global.getGroupAdmins(conn, groupId);
    let target = String(userId || '');
    if (target.includes(':') && target.includes('@')) target = target.replace(/:\d+@/, '@');
    if (!target.endsWith('@lid')) {
        target = forceLidIfFake(conn.decodeJid(userId) || target);
    }
    const targetIsLid = target.endsWith('@lid');
    const tDigits = (!targetIsLid && !isFakePhoneJid(target)) ? digitsOnly(target) : '';
    return admins.some(a => {
        if (a === target) return true;
        if (targetIsLid) return a.endsWith('@lid') && a === target;
        if (a.endsWith('@lid') || isFakePhoneJid(a)) return false;
        const ad = digitsOnly(a);
        return tDigits.length >= 8 && ad.length >= 8 && tDigits === ad;
    });
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
            if (action === 'promote' || action === 'demote' || id) {
                const groupId = String(id || '').includes(':') ? id.replace(/:\d+@/, '@') : id;
                if (groupId) global.groupCache.del(groupId);
            }
        } catch {}
    });
    global.adminListenerSet = true;
}


if (!global.cacheListenersSet && global.conn) {
    const conn = global.conn;

    const registerGroup = async (groupId) => {
        try {
            const normalizedId = String(groupId || '').includes(':') ? groupId.replace(/:\d+@/, '@') : groupId;
            if (!normalizedId || !normalizedId.endsWith('@g.us')) return;

            global.db.data.chats[normalizedId] ??= {
                isBanned: false,
                expired: 0,
                users: {}
            };
            const meta = await fetchGroupMetadataWithRetry(conn, normalizedId);
            if (meta && meta.id) {
                const refreshed = { ...meta, id: String(meta.id).includes(':') ? meta.id.replace(/:\d+@/, '@') : meta.id };
                global.groupCache.set(refreshed.id, refreshed);
            }
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
            const normalizedId = String(update.id).includes(':') ? update.id.replace(/:\d+@/, '@') : update.id;
            global.groupCache.del(normalizedId);
            await registerGroup(normalizedId);
        }
    });

    conn.ev.on('group-participants.update', async (update) => {
        if (!update?.id) return;
        const normalizedId = String(update.id).includes(':') ? update.id.replace(/:\d+@/, '@') : update.id;
        global.groupCache.del(normalizedId);
        await registerGroup(normalizedId);
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
            const isOwner = matchesNumberList(callerId, global.owner || []);
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
    if (!u || !target) return false;
    const norm = (x) => {
        x = String(x || '');
        if (x.includes(':') && x.includes('@')) x = x.replace(/:\d+@/, '@');
        return x;
    };
    const tRaw = norm(target);
    const tIsLid = tRaw.endsWith('@lid');

    
    const rawIds = [];
    for (const key of ['id', 'jid', 'lid']) {
        if (u[key]) rawIds.push(norm(u[key]));
    }
    if (u.phoneNumber) {
        const pn = String(u.phoneNumber);
        rawIds.push(norm(pn.includes('@') ? pn : pn.replace(/\D/g, '') + '@s.whatsapp.net'));
    }

    if (tIsLid) {
        
        return rawIds.some(id => id.endsWith('@lid') && id === tRaw);
    }

    
    if (isFakePhoneJid(tRaw)) return false;
    const tDigits = digitsOnly(tRaw);
    for (const id of rawIds) {
        if (id === tRaw) return true;
        if (id.endsWith('@lid')) continue; 
        if (isFakePhoneJid(id)) continue;
        if ((id.endsWith('@s.whatsapp.net') || id.endsWith('@c.us')) && tDigits.length >= 8) {
            if (digitsOnly(id) === tDigits) return true;
        }
    }
    return false;
}

function hasNumericAdmin(participants, sender) {
    if (!sender || !participants?.length) return false;
    const norm = (x) => {
        if (!x) return null;
        x = String(x);
        if (x.includes(':') && x.includes('@')) x = x.replace(/:\d+@/, '@');
        return x;
    };
    const s = norm(sender);
    if (!s) return false;
    const senderIsLid = s.endsWith('@lid');
    const sDigits = (!senderIsLid && !isFakePhoneJid(s)) ? digitsOnly(s) : '';

    
    const mappedAlts = new Set();
    mappedAlts.add(s);
    try {
        if (senderIsLid && global.lidCache) {
            const v = global.lidCache.get(s);
            if (v && !String(v).endsWith('@lid') && !isFakePhoneJid(v)) {
                const pn = String(v).includes('@') ? norm(v) : (digitsOnly(v) + '@s.whatsapp.net');
                if (pn) mappedAlts.add(pn);
            }
        }
        if (!senderIsLid && global.lidCache && typeof global.lidCache.keys === 'function') {
            for (const k of global.lidCache.keys()) {
                if (!k || !String(k).endsWith('@lid')) continue;
                const v = global.lidCache.get(k);
                if (!v) continue;
                const vd = digitsOnly(v);
                if (sDigits && vd === sDigits) mappedAlts.add(norm(k));
            }
        }
        if (global.lidToRealJid) {
            if (senderIsLid && global.lidToRealJid.get) {
                const v = global.lidToRealJid.get(s);
                if (v) mappedAlts.add(norm(v));
            }
            if (!senderIsLid && global.lidToRealJid.entries) {
                for (const [k, v] of global.lidToRealJid.entries()) {
                    if (norm(v) === s || (sDigits && digitsOnly(v) === sDigits)) mappedAlts.add(norm(k));
                }
            }
        }
    } catch {}

    return participants.some(p => {
        if (!(p.admin === 'admin' || p.admin === 'superadmin' || p.admin === true)) return false;

        const ids = [p.id, p.jid, p.lid, p.phoneNumber, p.phone].filter(Boolean).map(norm);

        
        for (const id of ids) {
            if (!id) continue;
            if (mappedAlts.has(id)) return true;
        }

        if (senderIsLid) {
            return ids.some(id => id && id.endsWith('@lid') && id === s);
        }

        for (const id of ids) {
            if (!id) continue;
            if (id === s) return true;
            if (id.endsWith('@lid')) {
                
                if (mappedAlts.has(id)) return true;
                continue;
            }
            if (isFakePhoneJid(id)) continue;
            if ((id.endsWith('@s.whatsapp.net') || id.endsWith('@c.us')) && sDigits.length >= 8) {
                if (digitsOnly(id) === sDigits) return true;
            }
        }
        if (p.phoneNumber && sDigits.length >= 8) {
            const pd = digitsOnly(p.phoneNumber);
            if (pd.length >= 8 && pd === sDigits) return true;
        }
        return false;
    });
}

function calcAdminFlags(conn, participants, groupMetadata, normalizedSender, normalizedBot) {
    const norm = (x) => {
        if (!x) return null;
        x = String(x);
        if (x.includes(':') && x.includes('@')) x = x.replace(/:\d+@/, '@');
        return x;
    };
    const sender = norm(normalizedSender);
    const bot = norm(normalizedBot);
    const nOwner = norm(groupMetadata?.owner);
    const nOwnerLid = norm(groupMetadata?.ownerLid);
    const senderIsLid = sender && sender.endsWith('@lid');

    const isGroupOwner = (() => {
        if (!sender) return false;
        if (senderIsLid) {
            
            return nOwnerLid && nOwnerLid === sender;
        }
        if (nOwner && nOwner === sender) return true;
        if (nOwner && !nOwner.endsWith('@lid') && !sender.endsWith('@lid') && !isFakePhoneJid(nOwner) && !isFakePhoneJid(sender)) {
            const da = digitsOnly(nOwner), db = digitsOnly(sender);
            return da.length >= 8 && da === db;
        }
        return false;
    })();

    const isAdmin = hasNumericAdmin(participants, sender);

    const isBotAdmin = (() => {
        if (!bot) return false;
        if (nOwnerLid && nOwnerLid === bot) return true;
        if (nOwner && (nOwner === bot || (!nOwner.endsWith('@lid') && !bot.endsWith('@lid') && digitsOnly(nOwner) === digitsOnly(bot) && digitsOnly(bot).length >= 8))) return true;
        return (participants || []).some(u => {
            const isAdm = (u.admin === 'admin' || u.admin === 'superadmin' || u.admin === true);
            if (!isAdm) return false;
            return matchIds(conn, u, bot);
        });
    })();

    return { isAdmin, isBotAdmin, isRAdmin: isGroupOwner };
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
      try {
        try {
            const earlyRawSender = m?.key?.participant || m?.key?.remoteJid || '';
            if (earlyRawSender && String(earlyRawSender).endsWith('@lid') && !m?.key?.fromMe) {
                const groupMetaData = this.chats?.[m.chat]?.metadata || this.cachedGroupMetadata?.[m.chat] || null;
                const participants = groupMetaData?.participants || [];
                const translated = global.resolveLidToJid
                    ? global.resolveLidToJid(earlyRawSender, this, participants)
                    : earlyRawSender;
                
                const botJ = String(this.user?.jid || this.user?.id || '').replace(/:\d+@/, '@');
                const botDig = botJ.split('@')[0].replace(/\D/g, '');
                const trDig = String(translated || '').split('@')[0].replace(/:\d+$/, '').replace(/\D/g, '');
                const isBotMap = botDig && trDig && botDig === trDig;
                if (
                    translated &&
                    translated !== '0@s.whatsapp.net' &&
                    translated !== earlyRawSender &&
                    !String(translated).endsWith('@lid') &&
                    !isBotMap &&
                    String(translated).replace(/:\d+@/, '@') !== botJ
                ) {
                    Object.defineProperty(m, 'sender', {
                        value: translated,
                        writable: true,
                        configurable: true,
                        enumerable: true
                    });
                    
                }
            }
        } catch (e) {
            console.error('Errore prioritario traduzione LID:', e);
        }

        if (!m?.key?.remoteJid) continue;

        
        const _origFromMe = !!(m.key?.fromMe);
        const _origParticipant = m.key?.participant ? String(m.key.participant) : null;
        const _origParticipantLid = m.key?.participantLid ? String(m.key.participantLid) : null;
        const _origParticipantPn = m.key?.participantPn ? String(m.key.participantPn) : null;



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

        try {
            m = safeSmsg(this, m, global.store);
        } catch (e) {
            
            if (!e?.message?.includes('contextInfo') && !e?.message?.includes("'text'") && !e?.message?.includes('quoted')) {
                console.error('[ERRORE] smsg:', e?.message || e);
            }
            
            if (!m?.key?.remoteJid) continue;
            try {
                m.text = m.text
                    ?? m.message?.conversation
                    ?? m.message?.extendedTextMessage?.text
                    ?? m.message?.imageMessage?.caption
                    ?? m.message?.videoMessage?.caption
                    ?? '';
                m.mtype = m.mtype || (m.message ? Object.keys(m.message)[0] : undefined);
            } catch {
                continue;
            }
        }
        if (!m?.key?.remoteJid) continue;

        
        try {
            const realParticipant = m.key?.participant || m.key?.remoteJid || m.sender || '';
            const officialBotJid = String(this.user?.jid || this.user?.id || '');
            const botNumberPuro = officialBotJid.replace(/[^0-9]/g, '');
            let senderValue = String(realParticipant);
            const senderPuro = senderValue.replace(/[^0-9]/g, '');
            const isLid = senderValue.endsWith('@lid');

            if (isLid) {
                m.fromMe = false;
                if (m.key) m.key.fromMe = false;
                Object.defineProperty(m, 'sender', {
                    value: senderValue,
                    writable: true,
                    configurable: true,
                    enumerable: true
                });
            } else if (m.key?.fromMe && botNumberPuro && senderPuro === botNumberPuro) {
                Object.defineProperty(m, 'sender', {
                    value: officialBotJid,
                    writable: true,
                    configurable: true,
                    enumerable: true
                });
            }
        } catch {}
        
        if (typeof m.text !== 'string') {
            try {
                m.text = m.message?.conversation
                    ?? m.message?.extendedTextMessage?.text
                    ?? m.message?.imageMessage?.caption
                    ?? m.message?.videoMessage?.caption
                    ?? '';
            } catch {
                m.text = '';
            }
        }


        if (m.messageStubType === 29 || m.messageStubType === 30)
            global.groupCache.del(m.chat);


        
        
        try {
            if (!m.chat) {
                try { m.chat = m.key.remoteJid; } catch {}
            }
            
            let logicalSender = null;
            try {
                logicalSender = m.sender || m.key.participant || m.key.participantPn || null;
            } catch {
                logicalSender = m.key?.participant || m.key?.participantPn || null;
            }
            if (m.key?.fromMe && this.user?.id) {
                logicalSender = this.user.id;
            }
            
            if (m.key?.participantPn && !m.key?.fromMe && !String(m.sender || '').endsWith('@lid')) {
                try {
                    const pnJ = this.decodeJid(m.key.participantPn);
                    if (pnJ && !pnJ.endsWith('@lid') && !isFakePhoneJid(pnJ)) {
                        const d = String(pnJ).split('@')[0].replace(/\D/g, '');
                        if (d.length >= 8 && d.length <= 15) logicalSender = pnJ;
                    }
                } catch {}
            }
            
            if (!m.sender && !m.key?.fromMe && m.key?.participant && String(m.key.participant).endsWith('@lid')) {
                logicalSender = String(m.key.participant).includes(':')
                    ? String(m.key.participant).replace(/:\d+@/, '@')
                    : String(m.key.participant);
            }
            if (logicalSender) {
                try {
                    Object.defineProperty(m, 'sender', {
                        value: logicalSender,
                        writable: true,
                        configurable: true,
                        enumerable: true
                    });
                } catch {
                    try { m._sender = logicalSender; } catch {}
                }
            }
        } catch (e) {
            
        }

        
        const chatId = (() => { try { return m.chat || m.key?.remoteJid; } catch { return m.key?.remoteJid; } })();
        const senderId = (() => { try { return m.sender || m.key?.participant || m.key?.participantPn; } catch { return m.key?.participant; } })();
        if (!chatId || !senderId) continue;
        if (typeof chatId !== 'string' || typeof senderId !== 'string') continue;
        if (String(senderId).includes('undefined')) continue;


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


        const normalizedBot = this.decodeJid(this.user?.jid || this.user?.id);
        const botIds = [
            normalizedBot,
            this.user?.lid ? this.decodeJid(this.user.lid) : null,
            this.user?.id ? this.decodeJid(this.user.id) : null,
        ].filter(Boolean);
        const botDigits = new Set(
            botIds.map(b => String(b).split('@')[0].replace(/:\d+$/, '').replace(/\D/g, '')).filter(d => d.length >= 8)
        );
        const isSameAsBot = (jid) => {
            if (!jid) return false;
            const s = String(jid);
            if (botIds.includes(s)) return true;
            try {
                const d = this.decodeJid(s);
                if (d && botIds.includes(d)) return true;
            } catch {}
            
            
            
            
            if (s.endsWith('@lid')) return false;
            const dig = s.split('@')[0].replace(/:\d+$/, '').replace(/\D/g, '');
            return dig.length >= 8 && botDigits.has(dig);
        };

        
        let normalizedSender = this.decodeJid(m.sender || m.key?.participant || m.key?.remoteJid);
        if (!normalizedSender) {
            normalizedSender = _origParticipant || _origParticipantPn || null;
        }

        
        if (normalizedSender && isFakePhoneJid(normalizedSender)) {
            const raw = _origParticipant || m.key?.participant || m.sender;
            if (raw && String(raw).endsWith('@lid')) {
                const d = String(raw).split('@')[0].replace(/:\d+$/, '');
                normalizedSender = d + '@lid';
            } else {
                const d = String(normalizedSender).split('@')[0].replace(/:\d+$/, '').replace(/\D/g, '');
                normalizedSender = d + '@lid';
            }
        }

        
        
        
        
        
        
        if (normalizedSender && String(normalizedSender).endsWith('@lid')) {
            normalizedSender = normalizedSender.includes(':')
                ? normalizedSender.replace(/:\d+@/, '@')
                : normalizedSender;
        }

        
        
        
        
        
        
        if (!m.key?.fromMe && isSameAsBot(normalizedSender)) {
            let recovered = null;
            const raw = _origParticipant || m.key?.participant;
            if (raw && String(raw).endsWith('@lid')) {
                recovered = String(raw).includes(':') ? String(raw).replace(/:\d+@/, '@') : String(raw);
            } else if (_origParticipantLid) {
                recovered = String(_origParticipantLid).includes(':')
                    ? String(_origParticipantLid).replace(/:\d+@/, '@')
                    : String(_origParticipantLid);
            }
            if (recovered && !isSameAsBot(recovered)) {
                normalizedSender = recovered;
            } else {
                
                continue;
            }
            try {
                if (String(normalizedSender).endsWith('@lid') && global.lidCache) {
                    const mapped = global.lidCache.get(normalizedSender);
                    if (mapped && isSameAsBot(mapped)) global.lidCache.del(normalizedSender);
                }
            } catch {}
        }

        if (!normalizedSender || !String(normalizedSender).includes('@')) continue;
        if (normalizedSender.endsWith('@g.us') || normalizedSender.endsWith('@broadcast') || normalizedSender.endsWith('@newsletter')) continue;
        if (!normalizedSender.endsWith('@s.whatsapp.net') && !normalizedSender.endsWith('@lid') && !normalizedSender.endsWith('@c.us')) continue;

        
        try {
            Object.defineProperty(m, 'sender', {
                value: normalizedSender,
                writable: true,
                configurable: true
            });
        } catch {
            try { m._sender = normalizedSender; } catch {}
            try { m.sender = normalizedSender; } catch {}
            m.normalizedSender = normalizedSender;
        }

        
        try {
            let displayName = String(m.pushName || m.name || '').trim();
            if (!displayName || displayName === 'Utente sconosciuto' || displayName === 'Sconosciuto' || /^\+?\d{10,}$/.test(displayName)) {
                
                try {
                    let look = normalizedSender;
                    if (String(look).endsWith('@lid') && global.lidCache) {
                        const v = global.lidCache.get(String(look).replace(/:\d+@/, '@'));
                        if (v && !String(v).endsWith('@lid')) look = String(v).includes('@') ? v : (digitsOnly(v) + '@s.whatsapp.net');
                    }
                    const cached = global.nameCache?.get?.(look) || global.nameCache?.get?.(normalizedSender);
                    if (cached && cached !== 'Utente sconosciuto' && cached !== 'Sconosciuto') displayName = cached;
                } catch {}
            }
            if (!displayName || displayName === 'Utente sconosciuto' || displayName === 'Sconosciuto') {
                displayName = m.pushName || 'Utente';
            }
            if (!displayName || displayName === 'Utente sconosciuto') {
                displayName = 'Utente';
            }
            Object.defineProperty(m, 'name', {
                value: displayName,
                writable: true,
                configurable: true,
                enumerable: true
            });
            Object.defineProperty(m, 'pushName', {
                value: displayName,
                writable: true,
                configurable: true,
                enumerable: true
            });
            global.nameCache?.set?.(normalizedSender, displayName);
        } catch (e) {
            console.error('Errore sblocco nome utente:', e);
        }

        
        try {
            const fixJid = (jid) => {
                if (!jid || typeof jid !== 'string') return jid;
                if (isSameAsBot(jid) && !m.key?.fromMe) return jid;
                if (isFakePhoneJid(jid)) {
                    const d = jid.split('@')[0].replace(/:\d+$/, '').replace(/\D/g, '');
                    return d + '@lid';
                }
                return jid;
            };
            
            if ((!Array.isArray(m.mentionedJid) || !m.mentionedJid.length) && typeof m.text === 'string') {
                const found = [];
                for (const mm of m.text.matchAll(/@(\d{5,20})/g)) {
                    const d = mm[1];
                    if (d.length >= 8 && d.length <= 15) found.push(d + '@s.whatsapp.net');
                    else if (d.length > 15) found.push(d + '@lid');
                }
                if (found.length) {
                    try {
                        Object.defineProperty(m, 'mentionedJid', {
                            value: found,
                            writable: true,
                            configurable: true,
                            enumerable: true
                        });
                    } catch {
                        try { m.mentionedJid = found; } catch {}
                    }
                }
            }
            if (Array.isArray(m.mentionedJid) && m.mentionedJid.length) {
                const fixed = [];
                for (let j of m.mentionedJid) {
                    j = fixJid(j);
                    if (!j) continue;
                    
                    if (String(j).endsWith('@lid')) {
                        try {
                            let pn = null;
                            if (global.lidCache) {
                                const v = global.lidCache.get(String(j).replace(/:\d+@/, '@'));
                                if (v && !String(v).endsWith('@lid') && !isFakePhoneJid(v)) pn = v;
                            }
                            if (!pn && global.lidToRealJid?.get) {
                                const v = global.lidToRealJid.get(String(j).replace(/:\d+@/, '@'));
                                if (v && !String(v).endsWith('@lid')) pn = v;
                            }
                            if (pn) {
                                const pns = String(pn).includes('@') ? String(pn).replace(/:\d+@/, '@') : (String(pn).replace(/\D/g, '') + '@s.whatsapp.net');
                                fixed.push(pns);
                                continue;
                            }
                        } catch {}
                    }
                    fixed.push(String(j).replace(/:\d+@/, '@'));
                }
                m.mentionedJid = fixed.filter(Boolean);
            }
            if (!m.key?.fromMe && isSameAsBot(m.sender)) {
                try {
                    Object.defineProperty(m, 'sender', {
                        value: normalizedSender,
                        writable: true,
                        configurable: true
                    });
                } catch {
                    try { m.sender = normalizedSender; } catch {}
                }
            }
            if (m.quoted && m.quoted.sender) {
                const qs = fixJid(m.quoted.sender);
                if (qs && qs !== m.quoted.sender) {
                    try { m.quoted.sender = qs; } catch {}
                }
                if (isSameAsBot(m.quoted.sender) && m.quoted.key && !m.quoted.key.fromMe) {
                    const qp = m.quoted.key.participant;
                    if (qp && String(qp).endsWith('@lid')) {
                        try { m.quoted.sender = String(qp).replace(/:\d+@/, '@'); } catch {}
                    }
                }
            }
        } catch {}

        
        if (!_origFromMe && isSameAsBot(m.sender)) {
            try {
                Object.defineProperty(m, 'sender', {
                    value: normalizedSender,
                    writable: true,
                    configurable: true
                });
            } catch {
                try { m.sender = normalizedSender; } catch {}
            }
        }


        global.db.data.users[m.sender] ??= {
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

        const user = global.db.data.users[m.sender];
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
        
        
        const isRealBot = String(m.sender || '').replace(/[^0-9]/g, '') ===
            String(this.user?.jid || '').replace(/[^0-9]/g, '');
        const trulyFromMe = m.key?.fromMe === true && isRealBot;
        const rawParticipant = m.key?.participant ? String(m.key.participant) : '';
        const cameAsLid = rawParticipant.endsWith('@lid') || String(normalizedSender || '').endsWith('@lid');

                
                let isGab = false;
        if (normalizedSender && !String(normalizedSender).endsWith('@lid')) {
            isGab = (global.owner || []).some((entry) => {
                const num = Array.isArray(entry) ? entry[0] : entry;
                const n = String(num).replace(/\D/g, '');
                if (!n || n.length < 8) return false;
                return (
                    normalizedSender === n + '@s.whatsapp.net' ||
                    normalizedSender === n + '@c.us' ||
                    digitsOnly(normalizedSender) === n
                );
            });
        }
        if (!isGab && _origParticipantPn) {
            const pnDig = digitsOnly(_origParticipantPn);
            if (pnDig.length >= 8 && pnDig.length <= 15 && !botDigits.has(pnDig)) {
                isGab = (global.owner || []).some((entry) => digitsOnly(Array.isArray(entry) ? entry[0] : entry) === pnDig);
            }
        }
        const isROwner = isGab;
        let isOwner = isROwner || trulyFromMe;
        
        if (!trulyFromMe && (String(_origParticipant || '').endsWith('@lid') || String(normalizedSender || '').endsWith('@lid'))) {
            if (!isROwner) isOwner = false;
        }


        let isMods = isOwner ||
            matchesNumberList(normalizedSender, global.mods ?? []) ||
            (global.db.data.chats?.[m.chat]?.moderatori ?? []).some(mod => {
                if (!mod) return false;
                if (mod === normalizedSender) return true;
                return matchesNumberList(normalizedSender, [mod]);
            }) || false;
        const isPrems = isROwner ||
            matchesNumberList(normalizedSender, global.prems ?? []) || false;

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
                    let nId = this.decodeJid(u.id ?? u.jid ?? '');
                    if (isFakePhoneJid(nId)) nId = forceLidIfFake(nId);
                    return {
                        ...u,
                        id: nId,
                        jid: u.jid ?? nId,
                        lid: u.lid ?? (nId.endsWith('@lid') ? nId : null)
                    };
                });
                const flags = calcAdminFlags(this, participants, groupMetadata, normalizedSender, normalizedBot, botIds);
                isAdmin = flags.isAdmin;
                isGroupAdmin = flags.isAdmin;
                isBotAdmin = flags.isBotAdmin;
                isRAdmin = flags.isRAdmin;
                
                {
                    const senderRaw = String(_origParticipant || normalizedSender || '');
                    const senderIsLid = senderRaw.endsWith('@lid') || String(normalizedSender || '').endsWith('@lid');
                    const candExact = [];
                    for (const x of [normalizedSender, _origParticipant, _origParticipantLid]) {
                        if (!x) continue;
                        let s = String(x);
                        if (s.includes(':') && s.includes('@')) s = s.replace(/:\d+@/, '@');
                        candExact.push(s);
                    }
                    const candPhoneDigits = [];
                    if (!senderIsLid) {
                        for (const x of [normalizedSender, _origParticipantPn, _origParticipant]) {
                            if (!x || String(x).endsWith('@lid')) continue;
                            const d = digitsOnly(x);
                            if (d.length >= 8 && d.length <= 15) candPhoneDigits.push(d);
                        }
                    } else if (_origParticipantPn) {
                        const d = digitsOnly(_origParticipantPn);
                        if (d.length >= 8 && d.length <= 15) candPhoneDigits.push(d);
                    }

                    let reallyAdmin = hasNumericAdmin(participants, normalizedSender);
                    /*
                    for (const u of (participants || [])) {
                        const isAdm = (u.admin === 'admin' || u.admin === 'superadmin' || u.admin === true);
                        if (!isAdm) continue;

                        const ids = [];
                        for (const k of ['id', 'lid', 'jid']) {
                            if (u[k]) {
                                let s = String(u[k]);
                                if (s.includes(':') && s.includes('@')) s = s.replace(/:\d+@/, '@');
                                ids.push(s);
                            }
                        }
                        if (ids.some(id => candExact.includes(id))) {
                            reallyAdmin = true;
                            break;
                        }
                        if (candPhoneDigits.length) {
                            for (const id of ids) {
                                if (String(id).endsWith('@lid')) continue;
                                const idDig = digitsOnly(id);
                                if (idDig.length >= 8 && idDig.length <= 15 && candPhoneDigits.includes(idDig)) {
                                    reallyAdmin = true;
                                    break;
                                }
                            }
                            if (u.phoneNumber) {
                                const pd = digitsOnly(u.phoneNumber);
                                if (pd.length >= 8 && candPhoneDigits.includes(pd)) {
                                    reallyAdmin = true;
                                }
                            }
                        }
                        if (reallyAdmin) break;
                    }
                    */
                    isAdmin = reallyAdmin;
                    isGroupAdmin = reallyAdmin;
                    if (!reallyAdmin) isRAdmin = false;
                }

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
                timeout: null,
                keys: [],
                stickerKeys: []
            };
            const data = global.spamTracker[chatId][userId];

            if (['conversation', 'extendedTextMessage'].includes(m.mtype)) {
                data.messages++;
                data.keys.push(m.key);
            }
            if (m.mtype === 'stickerMessage') {
                data.stickers++;
                data.keys.push(m.key);
                data.stickerKeys.push(m.key);
            }
            if (data.timeout) clearTimeout(data.timeout);
            data.timeout = setTimeout(() => {
                data.messages = 0;
                data.stickers = 0;
                data.keys = [];
                data.stickerKeys = [];
                data.timeout = null;
            }, 8000);

            const closeGroup = async (seconds) => {
                if (global.groupCloseTimers[chatId]) clearTimeout(global.groupCloseTimers[chatId]);
                await this.groupSettingUpdate(chatId, 'announcement').catch(() => {});
                await this.sendMessage(chatId, {
                    text: `🔒 𝐆𝐑𝐔𝐏𝐏𝐎 𝐂𝐇𝐈𝐔𝐒𝐎 𝐏𝐄𝐑 ${seconds} 𝐒𝐄𝐂𝐎𝐍𝐃𝐈 𝐏𝐄𝐑 𝐒𝐈𝐂𝐔𝐑𝐄𝐙𝐙𝐀 🔒`
                });
                global.groupCloseTimers[chatId] = setTimeout(async () => {
                    await this.groupSettingUpdate(chatId, 'not_announcement').catch(() => {});
                    await this.sendMessage(chatId, {
                        text: `✅ 𝐆𝐑𝐔𝐏𝐏𝐎 𝐑𝐈𝐀𝐏𝐄𝐑𝐓𝐎 𝐂𝐎𝐍 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐎 ✅`
                    });
                    delete global.groupCloseTimers[chatId];
                }, seconds * 1000);
            };

            if (data.messages >= 15 || data.stickers >= 5) {
                try {
                    if (data.warns === 0) {
                        data.warns = 1;
                        await Promise.allSettled(data.stickerKeys.map(key => this.sendMessage(chatId, { delete: key }).catch(() => {})));
                        await closeGroup(30);
                        await this.sendMessage(chatId, {
                            text: `⚠️ @${userId.split('@')[0]}, primo avvertimento per spam. Gruppo chiuso per 30 secondi per sicurezza. Alla prossima verrai espulso.`,
                            mentions: [userId]
                        });
                        data.messages = 0;
                        data.stickers = 0;
                        data.keys = [];
                        data.stickerKeys = [];
                        continue;
                    }
                    await Promise.allSettled(data.keys.map(key => this.sendMessage(chatId, { delete: key }).catch(() => {})));
                    await this.sendMessage(chatId, {
                        text: `🚫 *Utente espulso per spam*\n\n@${userId.split('@')[0]}`,
                        mentions: [userId]
                    });
                    await this.groupParticipantsUpdate(chatId, [userId], 'remove');
                    await closeGroup(60);
                    delete global.spamTracker[chatId][userId];
                    continue;
                } catch {}
            }
        }


        if (m.isGroup && chat.antibusiness && !isGroupAdmin && !isROwner && !isOwner && !isMods) {
            try {
                const chatData = global.db.data.chats[m.chat] || {}
                const wl = chatData.whitelist || {}
                const wlAntibusiness = wl.antibusiness || []
                if (wlAntibusiness.includes(normalizedSender)) continue

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

                const noPrefix = String(m.text || '').replace(usedPrefix, '');
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

                if (m.isGroup && (plugin.admin || plugin.botAdmin)) {
                    const freshMeta = global.groupCache.get(m.chat) ?? await fetchGroupMetadataWithRetry(this, m.chat);
                    if (freshMeta) {
                        global.groupCache.set(m.chat, freshMeta);
                        groupMetadata = freshMeta;
                        participants = freshMeta.participants;
                        normalizedParticipants = participants.map(u => {
                            let nId = this.decodeJid(u.id);
                            if (isFakePhoneJid(nId)) nId = forceLidIfFake(nId);
                            return {
                                ...u,
                                id: nId,
                                jid: u.jid ?? nId,
                                lid: u.lid ?? null
                            };
                        });
                        const flags = calcAdminFlags(this, participants, freshMeta, normalizedSender, normalizedBot, botIds);
                        isAdmin = flags.isAdmin;
                        isBotAdmin = flags.isBotAdmin;
                        isRAdmin = flags.isRAdmin;
                        
                        {
                            const senderRaw = String(_origParticipant || normalizedSender || '');
                            const senderIsLid = senderRaw.endsWith('@lid') || String(normalizedSender || '').endsWith('@lid');
                            const candExact = [];
                            for (const x of [normalizedSender, _origParticipant, _origParticipantLid]) {
                                if (!x) continue;
                                let s = String(x);
                                if (s.includes(':') && s.includes('@')) s = s.replace(/:\d+@/, '@');
                                candExact.push(s);
                            }
                            const candPhoneDigits = [];
                            if (!senderIsLid) {
                                for (const x of [normalizedSender, _origParticipantPn, _origParticipant]) {
                                    if (!x || String(x).endsWith('@lid')) continue;
                                    const d = digitsOnly(x);
                                    if (d.length >= 8 && d.length <= 15) candPhoneDigits.push(d);
                                }
                            } else if (_origParticipantPn) {
                                const d = digitsOnly(_origParticipantPn);
                                if (d.length >= 8 && d.length <= 15) candPhoneDigits.push(d);
                            }

                            let reallyAdmin = hasNumericAdmin(participants, normalizedSender);
                            /*
                            for (const u of (participants || [])) {
                                const isAdm = (u.admin === 'admin' || u.admin === 'superadmin' || u.admin === true);
                                if (!isAdm) continue;

                                const ids = [];
                                for (const k of ['id', 'lid', 'jid']) {
                                    if (u[k]) {
                                        let s = String(u[k]);
                                        if (s.includes(':') && s.includes('@')) s = s.replace(/:\d+@/, '@');
                                        ids.push(s);
                                    }
                                }
                                if (ids.some(id => candExact.includes(id))) {
                                    reallyAdmin = true;
                                    break;
                                }
                                if (candPhoneDigits.length) {
                                    for (const id of ids) {
                                        if (String(id).endsWith('@lid')) continue;
                                        const idDig = digitsOnly(id);
                                        if (idDig.length >= 8 && idDig.length <= 15 && candPhoneDigits.includes(idDig)) {
                                            reallyAdmin = true;
                                            break;
                                        }
                                    }
                                    if (u.phoneNumber) {
                                        const pd = digitsOnly(u.phoneNumber);
                                        if (pd.length >= 8 && candPhoneDigits.includes(pd)) {
                                            reallyAdmin = true;
                                        }
                                    }
                                }
                                if (reallyAdmin) break;
                            }
                            */
                            isAdmin = reallyAdmin;
                            isGroupAdmin = reallyAdmin;
                            if (!reallyAdmin) isRAdmin = false;
                        }

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

                if (m.isGroup) {
                    const gSpam = global.groupSpam[m.chat] ??= {
                        count: 0,
                        firstCommandTimestamp: 0,
                        isSuspended: false,
                        suspendedAt: 0
                    };
                    const now = Date.now();
                    
                    if (gSpam.isSuspended) {
                        if (now - gSpam.suspendedAt < 180_000) {
                            break;
                        } else {
                            gSpam.isSuspended = false;
                            gSpam.count = 0;
                            gSpam.firstCommandTimestamp = 0;
                            
                            const ownerMentions = global.owner?.map(([num]) => num + '@s.whatsapp.net') ?? [];
                            const mentions = ownerMentions.length > 0 ? ownerMentions : [];
                            
                            await this.sendMessage(m.chat, {
                                text: mentions.length > 0 
                                    ? `✅ Antispam finito, il bot può essere riutilizzato, fate i bravi.\n\n${mentions.map(o => '@' + o.split('@')[0]).join(', ')}`
                                    : `✅ Antispam finito, il bot può essere riutilizzato, fate i bravi.`,
                                mentions
                            }).catch(() => {});
                        }
                    }
                    
                    if (now - gSpam.firstCommandTimestamp > 20_000) {
                        gSpam.count = 1;
                        gSpam.firstCommandTimestamp = now;
                    } else {
                        gSpam.count++;
                    }
                    
                    if (gSpam.count > 10) {
                        gSpam.isSuspended = true;
                        gSpam.suspendedAt = now;
                        
                        const ownerMentions = global.owner?.map(([num]) => num + '@s.whatsapp.net') ?? [];
                        const mentions = ownerMentions.length > 0 ? ownerMentions : [];
                        
                        await this.sendMessage(m.chat, {
                            text: mentions.length > 0
                                ? `🚫 *Antispam attivato!*\n\nPer 3 minuti il bot non potrà essere utilizzabile.\n\n${mentions.map(o => '@' + o.split('@')[0]).join(', ')}`
                                : `🚫 *Antispam attivato!*\n\nPer 3 minuti il bot non potrà essere utilizzabile.`,
                            mentions
                        }).catch(() => {});
                        break;
                    }
                }

                const bypassModoadmin = !!plugin.modoadminBypass;
                if (m.isGroup && chat.modoadmin && !isAdmin && !isMods && !bypassModoadmin) break;
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

                
                
                if (!trulyFromMe && isSameAsBot(normalizedSender)) {
                    isAdmin = false;
                    isGroupAdmin = false;
                    isRAdmin = false;
                    isOwner = false;
                }
                
                if (!trulyFromMe && (String(_origParticipant || '').endsWith('@lid') || String(normalizedSender || '').endsWith('@lid'))) {
                    const lidExact = String(_origParticipant || normalizedSender).replace(/:\d+@/, '@');
                    const ok = hasNumericAdmin(participants, normalizedSender);
                    isAdmin = ok;
                    isGroupAdmin = ok;
                }

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
                if ((plugin.admin || (Array.isArray(plugin.tags) && plugin.tags.includes('admin'))) && !isAdmin && !trulyFromMe && !(isROwner && !isSameAsBot(normalizedSender))) {
                    fail('admin', m, this);
                    continue;
                }
                
                if (!isAdmin && !trulyFromMe && !(isROwner && !isSameAsBot(normalizedSender))) {
                    const cmd = String(command || m.command || '').toLowerCase();
                    const adminCmds = ['warn', 'kick', 'ban', 'unban', 'promote', 'demote', 'hidetag', 'tagall', 'mute', 'unmute', 'delete', 'del', 'group', 'open', 'close', 'setname', 'setdesc', 'link', 'revoke', 'antilink', 'welcome', 'bye'];
                    if (adminCmds.includes(cmd) && (plugin.admin || plugin.group || (plugin.tags && (plugin.tags.includes('admin') || plugin.tags.includes('group'))))) {
                        fail('admin', m, this);
                        continue;
                    }
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

                
                if (m.isGroup && !isBotAdmin && !isOwner && !isROwner && plugin.botAdmin) {
                    await this.reply(m.chat, `🚫 Devo essere amministratore per poter essere utilizzato!`, m).catch(() => {});
                    continue;
                }

                if (!isPrems && plugin.euro && user.euro < plugin.euro) {
                    await this.reply(m.chat, `Niente più soldini, stupido poraccio`, m, null, global.rcanal).catch(() => {});
                    continue;
                }

                
                
                
                if (!trulyFromMe && isSameAsBot(normalizedSender)) {
                    isAdmin = false;
                    isGroupAdmin = false;
                    isRAdmin = false;
                    isOwner = false;
                    isGab = false;
                    
                }
                if (!trulyFromMe && (String(_origParticipant || '').endsWith('@lid') || String(normalizedSender || '').endsWith('@lid') || isSameAsBot(normalizedSender))) {
                    const lidExact = String(_origParticipant || normalizedSender).replace(/:\d+@/, '@');
                    const okAdm = hasNumericAdmin(participants, normalizedSender);
                    isAdmin = okAdm;
                    isGroupAdmin = okAdm;
                    isRAdmin = false;
                    if (!isGab) isOwner = false;
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
                    
                
                if (normalizedSender && !trulyFromMe) {
                    try {
                        Object.defineProperty(m, 'sender', {
                            value: normalizedSender,
                            writable: true,
                            configurable: true
                        });
                    } catch {
                        try { m.sender = normalizedSender; } catch {}
                    }
                    if (m.pushName) {
                        try { global.nameCache?.set?.(normalizedSender, m.pushName); } catch {}
                    }
                }
await global.crashPrevention.protectedExecute(() => plugin.call(this, m, extra), { timeout: 30000 });
                    if (!isPrems) m.euro = plugin.euro || false;
                } catch (e) {
                    m.error = e;
                    global.antiBan.reportError(e, { context: 'plugin_exec' });
                    const handled = await global.errorHandler.handleError(e, { maxRetries: 2 }).catch(() => null);
                    if (handled?.recovered) {
                        try {
                            await plugin.call(this, m, extra);
                            if (!isPrems) m.euro = plugin.euro || false;
                            m.error = null;
                        } catch (e2) {
                            m.error = e2;
                        }
                    }
                    if (m.error) {
                        console.error(`[ERRORE] Plugin ${m.plugin}:`, m.error);
                        let errText = format(m.error);
                        for (const key of Object.values(global.APIKeys ?? {}))
                            errText = errText.replace(new RegExp(key, 'g'), '#HIDDEN#');
                        if (typeof m.error === 'string' && m.error.includes('rate-overlimit')) await delay(2000);
                        await this.reply(m.chat, errText, m).catch(() => {});
                    }
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
                            global.logAdmin.increment(m.chat, normalizedSender, 'commands', 1);
                        else {
                            (global.logAdminQueue ??= []).push({
                                chatId: m.chat,
                                adminJid: normalizedSender,
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
      } catch (loopErr) {
        
        if (!String(loopErr?.message || loopErr).includes('contextInfo') &&
            !String(loopErr?.message || loopErr).includes("'text'")) {
            console.error('[ERRORE] handler msg:', loopErr?.message || loopErr);
        }
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
