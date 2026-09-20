
import { env } from 'process';
env.PORT = '3011';
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

process.env.SUPPRESS_BANNER = 'true';
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';

import './config.js';
import {
    createRequire
} from 'module';
import path, {
    join
} from 'path';
import {
    fileURLToPath,
    pathToFileURL
} from 'url';
import {
    platform
} from 'process';
import fs, {
    readdirSync,
    statSync,
    unlinkSync,
    existsSync,
    mkdirSync,
    rmSync,
    watch
} from 'fs';
import yargs from 'yargs';
import crypto from 'crypto';
import {
    spawn
} from 'child_process';
import lodash from 'lodash';
import chalk from 'chalk';
import syntaxerror from 'syntax-error';
import {
    tmpdir
} from 'os';
import {
    format
} from 'util';
import pino from 'pino';
import {
    makeWASocket,
    protoType,
    serialize
} from './lib/simple.js';
import storeHelper from './lib/store.js';
import './lib/mention-helper.js';
import {
    Low,
    JSONFile
} from 'lowdb';
import readline from 'readline';
import NodeCache from 'node-cache';


const authFolder = global.authFile || '333BotSession';
global.authFile = authFolder;
global.authFileJB = global.authFileJB || '333bot-sub';
global.rcanal = '120363341274693350@newsletter';

let channelJoinAttempted = false;

function getConfiguredChannelNewsletterJid() {
    const configured = global.canale ? String(global.canale) : '';
    if (!configured) return null;
    if (configured.includes('@newsletter')) return configured;
    const match = configured.match(/\/channel\/([^/?#]+)/);
    return match ? `${match[1]}@newsletter` : null;
}

async function joinConfiguredChannel() {
    if (channelJoinAttempted || !global.conn?.query) return;

    const jid = getConfiguredChannelNewsletterJid();
    if (!jid) return;

    channelJoinAttempted = true;

    try {
        const encoder = new TextEncoder();
        await global.conn.query({
            tag: 'iq',
            attrs: {
                id: `join-channel-${Date.now()}`,
                type: 'get',
                xmlns: 'w:mex',
                to: 's.whatsapp.net',
            },
            content: [
                {
                    tag: 'query',
                    attrs: { query_id: '7871414976211147' },
                    content: encoder.encode(JSON.stringify({
                        variables: { newsletter_id: jid }
                    }))
                }
            ]
        }, 15000);
        console.log(`[333] Canale configurato raggiunto: ${jid}`);
    } catch (error) {
        console.error('[333] Impossibile entrare nel canale configurato:', error);
    }
}

const sessionFolder = path.join(process.cwd(), authFolder);
const tempDir = join(process.cwd(), 'temp');
const tmpDir = join(process.cwd(), 'tmp');

if (!existsSync(tempDir)) mkdirSync(tempDir, {
    recursive: true
});
if (!existsSync(tmpDir)) mkdirSync(tmpDir, {
    recursive: true
});

if (process.send) {
    process.on('message', (msg) => {
        if (typeof msg === 'string')
            process.stdin.emit('data', Buffer.from(msg + '\n'));
    });
}


let dbWriteInProgress = false;
let dbWritePending = false;

global.dbDirty = false;
global.markDbDirty = () => {
    global.dbDirty = true;
};

async function flushDatabase({
    force = false
} = {}) {
    if (!global.db?.data) return false;
    if (!force && !global.dbDirty) return false;
    if (dbWriteInProgress) {
        dbWritePending = true;
        return false;
    }

    dbWriteInProgress = true;
    try {
        await global.db.write();
        global.dbDirty = false;
        return true;
    } catch (err) {
        global.dbDirty = true;
        throw err;
    } finally {
        dbWriteInProgress = false;
        if (dbWritePending) {
            dbWritePending = false;
            await flushDatabase({
                force: true
            }).catch(console.error);
        }
    }
}


function isProtectedAuthStateFile(entry) {
    return entry === 'creds.json';
}

function clearSessionFolderSelective(dir = sessionFolder) {
    if (!existsSync(dir)) {
        mkdirSync(dir, {
            recursive: true
        });
        return;
    }
    for (const entry of readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (statSync(full).isDirectory()) {
            try {
                rmSync(full, {
                    recursive: true,
                    force: true
                });
            } catch {}
        } else if (!isProtectedAuthStateFile(entry)) {
            try {
                unlinkSync(full);
            } catch {}
        }
    }
}


const bailey = await import('@chatunity/baileys');

const fallbackSafetySystems = {
    makeAntiBanSystem: () => ({
        reportSuccess: () => true,
        reportError: () => false,
        getAdaptiveDelay: () => 0,
        getStats: () => ({ successCount: 0, errorCount: 0, adaptiveDelay: 0 })
    }),
    makeCrashPreventionSystem: () => ({
        registerRecoveryStrategy: () => true,
        onExit: () => true,
        protectedExecute: async (fn) => fn(),
    }),
    makeAdvancedRateLimiter: () => ({
        add: async (fn) => fn(),
        check: () => true,
        getStats: () => ({})
    }),
    makeMetricsSystem: () => ({
        startTimer: () => 'timer',
        endTimer: () => undefined,
        recordMessageSent: () => undefined,
        getReport: () => ({})
    }),
    makeCentralizedErrorHandler: () => ({
        handleError: async (error) => ({ recovered: false, error })
    })
};

const {
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers,
    jidNormalizedUser,
    DisconnectReason,
    makeAntiBanSystem = fallbackSafetySystems.makeAntiBanSystem,
    makeCrashPreventionSystem = fallbackSafetySystems.makeCrashPreventionSystem,
    makeAdvancedRateLimiter = fallbackSafetySystems.makeAdvancedRateLimiter,
    makeMetricsSystem = fallbackSafetySystems.makeMetricsSystem,
    makeCentralizedErrorHandler = fallbackSafetySystems.makeCentralizedErrorHandler
} = bailey;

const {
    chain
} = lodash;
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;

protoType();
serialize();


global.__filename = (pathURL = import.meta.url, rmPrefix = platform !== 'win32') =>
    rmPrefix ?
    /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL :
    pathToFileURL(pathURL).toString();

global.__dirname = (pathURL) => path.dirname(global.__filename(pathURL, true));
global.__require = (dir = import.meta.url) => createRequire(dir);

global.API = (name, p = '/', query = {}, apikeyqueryname) =>
    (name in global.APIs ? global.APIs[name] : name) + p +
    (query || apikeyqueryname ?
        '?' + new URLSearchParams({
            ...query,
            ...(apikeyqueryname ?
                {
                    [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name]
                } :
                {})
        }) :
        '');

global.timestamp = {
    start: new Date()
};
const __dirname = global.__dirname(import.meta.url);

global.opts = Object.assign({}, yargs(process.argv.slice(2)).exitProcess(false).parse());
global.prefix = new RegExp(
    '^[' + (global.opts['prefix'] || '.').replace(/[|\\{}()[\]^$+*.\-^]/g, '\\$&') + ']'
);


global.db = new Low(
    /https?:\/\//.test(global.opts['db'] || '') ?
    new cloudDBAdapter(global.opts['db']) :
    new JSONFile('database.json')
);
global.DATABASE = global.db;

global.loadDatabase = async function loadDatabase() {
    if (global.db.READ) {
        return new Promise(resolve =>
            setInterval(function() {
                if (!global.db.READ) {
                    clearInterval(this);
                    resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
                }
            }, 1000)
        );
    }
    if (global.db.data !== null) return;
    global.db.READ = true;
    await global.db.read().catch(console.error);
    global.db.READ = null;
    global.db.data = {
        users: {},
        chats: {},
        stats: {},
        msgs: {},
        sticker: {},
        settings: {},
        ...(global.db.data || {})
    };
    let currencyMigrated = false;
    for (const user of Object.values(global.db.data.users)) {
        if (!user || typeof user !== 'object') continue;
        user.money = Math.max(0, Number(user.money) || 0);
        user.bank = Math.max(0, Number(user.bank) || 0);
        if (user.rpgCurrency !== 'XP333') {
            user.rpgCurrency = 'XP333';
            currencyMigrated = true;
        }
    }
    global.db.chain = chain(global.db.data);
    global.dbDirty = currencyMigrated;
};
global.loadDatabase();


const groupMetadataCache = new NodeCache({
    stdTTL: 300,
    checkperiod: 60,
    useClones: false,
    deleteOnExpire: true,
    maxKeys: 2000
});
global.groupCache = groupMetadataCache;

global.jidCache = new NodeCache({
    stdTTL: 600,
    useClones: false
});
global.lidCache = new NodeCache({
    stdTTL: 86400,
    useClones: false
});


/**
 * ============================================================================
 * FIX BOT/UTENTE CONFUSI (LID risolto sul numero del bot)
 * ----------------------------------------------------------------------------
 * Problema: se anche una sola volta viene salvata in lidCache un'associazione
 * LID_di_un_utente -> numero_del_bot (per un bug di Baileys, un sync di
 * contatti, o una scrittura interna non filtrata), da quel momento in poi
 * decodeJid() per quel LID restituisce il numero del bot, e ogni messaggio
 * di quell'utente viene trattato come se lo avesse scritto il bot stesso
 * (vedi log "bot: 39 375 694 7955 / utente: 39 375 694 7955").
 *
 * Fix: teniamo un set delle cifre "proprie" del bot (numero + eventuale @lid
 * del bot) e blocchiamo qualunque scrittura in lidCache che associ un LID
 * DIVERSO dal proprio a quelle cifre. Il set viene popolato/aggiornato non
 * appena la connessione si apre (vedi connectionUpdate più sotto).
 * ============================================================================
 */
global.__ownBotDigits = new Set();
global.__ownBotLid = null;

function _updateOwnBotIdentity() {
    try {
        const rawId = global.conn?.user?.id || global.conn?.user?.jid || '';
        const ownDigits = String(rawId).split(':')[0].replace(/\D/g, '');
        if (ownDigits.length >= 8 && ownDigits.length <= 15) {
            global.__ownBotDigits.add(ownDigits);
        }
    } catch {}
    try {
        if (global.conn?.user?.lid) {
            global.__ownBotLid = String(global.conn.user.lid).replace(/:\d+@/, '@');
        }
    } catch {}
    
    try {
        const cache = global.lidCache;
        if (cache && typeof cache.keys === 'function') {
            for (const k of cache.keys()) {
                if (!k || !String(k).endsWith('@lid')) continue;
                if (global.__ownBotLid && String(k) === global.__ownBotLid) continue;
                const v = cache.get(k);
                if (!v) continue;
                const vd = String(v).split('@')[0].replace(/\D/g, '');
                if (global.__ownBotDigits.has(vd)) {
                    try { cache.del(k); console.warn('[lidCache] Purgato mapping avvelenato:', k, '->', v); } catch {}
                }
            }
        }
        if (global.lidToRealJid && typeof global.lidToRealJid.entries === 'function') {
            for (const [k, v] of [...global.lidToRealJid.entries()]) {
                if (!k || !String(k).endsWith('@lid')) continue;
                if (global.__ownBotLid && String(k) === global.__ownBotLid) continue;
                const vd = String(v || '').split('@')[0].replace(/\D/g, '');
                if (global.__ownBotDigits.has(vd)) {
                    try { global.lidToRealJid.delete(k); } catch {}
                }
            }
        }
    } catch {}
}
global.updateOwnBotIdentity = _updateOwnBotIdentity;


/** FIX LID: rifiuta numeri inventati dalle cifre di un LID (es. +1 20363...) */
function _isFakePhoneFromLid(pn) {
    if (!pn || typeof pn !== 'string') return true;
    const d = pn.includes('@') ? pn.split('@')[0].replace(/:\d+$/, '') : pn;
    const digits = String(d).replace(/\D/g, '');
    if (!digits || digits.length < 8) return true;
    if (digits.length > 15) return true;
    if (digits.length >= 14 && (digits.startsWith('120363') || digits.startsWith('20363') || digits.startsWith('90426'))) return true;
    return false;
}

const _origLidSet = global.lidCache.set.bind(global.lidCache);
global.lidCache.set = (lid, pn, ttl) => {
    if (!lid || !pn) return false;
    const nLid = String(lid);
    let nPn = String(pn);
    if (!nPn.includes('@')) nPn = nPn.replace(/\D/g, '') + '@s.whatsapp.net';
    const digits = nPn.split('@')[0].replace(/\D/g, '');

    
    if (digits.length > 15 || digits.length < 8) return false;
    if (digits.length >= 14 && (digits.startsWith('120363') || digits.startsWith('20363') || digits.startsWith('90426'))) return false;

    
    
    if (global.__ownBotDigits.has(digits) && nLid !== global.__ownBotLid) {
        try {
            console.warn(`[lidCache] BLOCCATO tentativo di associare ${nLid} al numero del bot (${digits})`);
        } catch {}
        return false;
    }

    try { global.jidCache.del(nLid); } catch {}
    try { global.jidCache.set(nLid, nPn); } catch {}
    return _origLidSet(nLid, nPn, ttl);
};


const logger = pino({
    level: 'silent',
    redact: {
        paths: ['creds.*', 'auth.*', 'account.*', 'password', 'token', '*.secret'],
        censor: '***'
    },
    timestamp: () => `,"time":"${new Date().toJSON()}"`
});

global.antiBan = makeAntiBanSystem(logger);
global.crashPrevention = makeCrashPreventionSystem(logger);
global.rateLimiter = makeAdvancedRateLimiter({ tokensPerSecond: 4, enableAdaptive: true });
global.metrics = makeMetricsSystem(logger);
global.errorHandler = makeCentralizedErrorHandler(logger);

global.crashPrevention.registerRecoveryStrategy('high_memory', async () => {
    if (global.gc) global.gc();
});
global.crashPrevention.onExit(async () => {
    try { await global.conn?.end(); } catch {}
});

global.conns = [];
global.creds = 'creds.json';
global.store = {
    bind: (conn) => {
        if (!global.store.messages) global.store.messages = {};
        if (conn && !conn.messages) conn.messages = global.store.messages;
        return storeHelper.bind(conn);
    },
    loadMessage: storeHelper.loadMessage,
    getMessage: storeHelper.getMessage,
    saveMessage: storeHelper.saveMessage,
    messages: {},
};


const {
    state,
    saveCreds
} = await useMultiFileAuthState(global.authFile);
const msgRetryCounterCache = new NodeCache();
const {
    version
} = await fetchLatestBaileysVersion();


const hasExistingSession = existsSync(`./${global.authFile}/creds.json`);
let methodCodeQR = process.argv.includes('qr');
let methodCode = process.argv.includes('code');
let MethodMobile = process.argv.includes('mobile');
let phoneNumber = global.botNumberCode;
let pairingMode = methodCodeQR ? 'qr' : methodCode ? 'code' : null;
let pairingCodeRequested = false;
let lastConnectionStateLogged = null;
let successfulConnectionLogged = false;

global.isLogoPrinted = false;
global.qrGenerated = false;
global.connectionMessagesPrinted = {};


function logSystem(message, color = 'cyanBright') {
    (chalk[color] || chalk.cyanBright)(`〔 333 BOT 〕 ${message}`);
    console.log((chalk[color] || chalk.cyanBright)(`〔 333 BOT 〕 ${message}`));
}

function normalizePhoneNumberInput(value = '') {
    const digits = value.replace(/\D/g, '');
    if (digits.length < 8 || digits.length > 15) return null;
    return digits;
}

function generateRandomCode(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let r = '';
    for (let i = 0; i < length; i++)
        r += chars[Math.floor(Math.random() * chars.length)];
    return r;
}

function formatPairingCode(code = '') {
    return code?.match(/.{1,4}/g)?.join('-')?.toUpperCase() ?? code;
}

function getConnectionLabel() {
    const user = global.conn?.user;
    if (!user) return 'account sconosciuto';
    const id = String(user.id || '').split(':')[0];
    const name = user.name || user.verifiedName || 'Bot';
    return `${name} (${id || 'jid sconosciuto'})`;
}

function logConnectionState(state, color = 'cyanBright') {
    if (!state || lastConnectionStateLogged === state) return;
    lastConnectionStateLogged = state;
    logSystem(state, color);
}


function redefineConsoleMethod(methodName, filterStrings) {
    const orig = console[methodName];
    console[methodName] = function(...args) {
        if (typeof args[0] === 'string' &&
            filterStrings.some(f => args[0].includes(Buffer.from(f, 'base64').toString()))) {
            return;
        }
        orig.apply(console, args);
    };
}

const filterStrings = [
    'Q2xvc2luZyBzdGFsZSBvcGVu',
    'Q2xvc2luZyBvcGVuIHNlc3Npb24=',
    'RmFpbGVkIHRvIGRlY3J5cHQ=',
    'U2Vzc2lvbiBlcnJvcg==',
    'RXJyb3I6IEJhZCBNQUM=',
    'RGVjcnlwdGVkIG1lc3NhZ2U='
];
console.info = () => {};
console.debug = () => {};
['log', 'warn', 'error'].forEach(m => redefineConsoleMethod(m, filterStrings));


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
});

const question = (t) => {
    rl.clearLine(rl.input, 0);
    return new Promise(resolve =>
        rl.question(t, (r) => {
            rl.clearLine(rl.input, 0);
            resolve(r.trim());
        })
    );
};

async function askValidatedChoice(prompt, validator, invalidMessage) {
    let answer;
    do {
        answer = await question(prompt);
        if (!validator(answer)) logSystem(invalidMessage, 'yellowBright');
    } while (!validator(answer));
    return answer;
}

async function askValidatedPhoneNumber() {
    while (true) {
        const input = await question(chalk.bgBlack(chalk.bold.bgMagentaBright(`Inserisci il numero di WhatsApp.\n${chalk.bold.yellowBright('Esempio: +393471234567')}\n`)));
        const normalized = normalizePhoneNumberInput(input);
        if (normalized) return {
            input,
            normalized
        };
        logSystem('Numero non valido. Inserisci il prefisso internazionale completo.', 'yellowBright');
    }
}

async function requestPairingCodeFlow() {
    if (pairingCodeRequested || global.conn?.authState?.creds?.registered) return;
    pairingCodeRequested = true;
    try {
        let normalizedNumber;
        if (phoneNumber) {
            normalizedNumber = normalizePhoneNumberInput(phoneNumber);
            if (!normalizedNumber) throw new Error('Il numero in global.botNumberCode non è valido');
            phoneNumber = `+${normalizedNumber}`;
        } else {
            const res = await askValidatedPhoneNumber();
            normalizedNumber = res.normalized;
            phoneNumber = `+${normalizedNumber}`;
        }
        logSystem(`Avvio pairing code per ${phoneNumber}...`, 'blueBright');
        const raw = await global.conn.requestPairingCode(normalizedNumber, generateRandomCode());
        const formatted = formatPairingCode(raw);
        console.log(
            chalk.bold.white(chalk.bgBlueBright('꒰🩸꒱ ◦•≫ CODICE DI COLLEGAMENTO:')),
            chalk.bold.white(formatted)
        );
        logSystem('Inserisci il codice su WhatsApp › Dispositivi collegati › Collega un dispositivo.', 'greenBright');
    } catch (err) {
        pairingCodeRequested = false;
        logSystem(`Impossibile generare il pairing code: ${err.message}`, 'redBright');
    }
}

if (!pairingMode && !hasExistingSession) {
    const menu = `
${chalk.bgBlue.white('┏━━━━━━━━━━━━━━━━━━━━━━━┓')}
${chalk.bgBlue.white('┃     333 BOT 2026      ┃')}
${chalk.bgBlue.white('┃       V10.3           ┃')}
${chalk.bgBlue.white('┗━━━━━━━━━━━━━━━━━━━━━━━┛')}

${chalk.yellow('Seleziona come collegarti:')}

${chalk.green('[1] 📲 QR CODE')}
${chalk.gray('    → Scansiona con la fotocamera')}

${chalk.green('[2] 🔐 CODICE (8 caratteri)')}
${chalk.gray('    → Codice da inserire su WhatsApp')}

${chalk.gray('────────────────────────')}

${chalk.cyan('Scegli solo 1 o 2 ↓')}
`;
    const opzione = await askValidatedChoice(
        menu + '\n➤ ',
        v => /^[12]$/.test(v),
        '⛔ Inserisci solo 1 o 2.'
    );
    pairingMode = opzione === '1' ? 'qr' : 'code';
}

if (hasExistingSession)
    logSystem(`Sessione trovata in ${global.authFile}. Avvio con credenziali esistenti.`, 'whiteBright');
else if (pairingMode === 'qr')
    logSystem('Modalità pairing: QR code.', 'whiteBright');
else if (pairingMode === 'code')
    logSystem('Modalità pairing: codice a 8 caratteri.', 'whiteBright');








async function resetGroupSenderDistribution(groupJid) {
    if (!groupJid || !String(groupJid).endsWith('@g.us')) {
        return { ok: false, reason: 'serve un JID di gruppo (@g.us)' };
    }
    let clearedMemory = 0;
    let clearedKeys = 0;
    try {
        if (global.conn?.authState?.keys?.set) {
            await global.conn.authState.keys.set({ 'sender-key-memory': { [groupJid]: null } });
            clearedMemory = 1;
        }
    } catch (e) {
        return { ok: false, reason: e?.message || String(e) };
    }
    
    try {
        const authDir = path.join(process.cwd(), global.authFile || '333BotSession');
        if (existsSync(authDir)) {
            const prefix = 'sender-key-';
            const g = String(groupJid).replace(/[@.]/g, '_');
            for (const entry of readdirSync(authDir)) {
                if (!entry.startsWith(prefix)) continue;
                
                if (entry.includes('sender-key-memory') || entry.includes(String(groupJid).split('@')[0])) {
                    try {
                        unlinkSync(path.join(authDir, entry));
                        clearedKeys++;
                    } catch {}
                }
            }
        }
    } catch {}
    
    try { global.groupCache?.del?.(groupJid); } catch {}
    try { global.groupCache?.delete?.(groupJid); } catch {}
    return { ok: true, clearedMemory, clearedKeys };
}
global.resetGroupSenderDistribution = resetGroupSenderDistribution;


const connectionOptions = {
    logger,
    printQRInTerminal: pairingMode === 'qr',
    mobile: false,
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    browser: pairingMode === 'qr' ? ['Desktop', 'Chrome', '20.0.04'] : ['Ubuntu', 'Chrome', '20.0.04'],
    version,
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
    linkPreviewImageThumbnailWidth: 192,
    getMessage: async (key) => {
        if (!key?.remoteJid || !key?.id) return undefined;
        try {
            if (global.store?.getMessage) {
                const msg = await global.store.getMessage(key.remoteJid, key.id);
                if (msg) return msg;
            }
            if (global.store?.loadMessage) {
                const msg = await global.store.loadMessage(key.remoteJid, key.id);
                if (msg?.message) return msg.message;
                if (msg) return msg;
            }
            if (global.conn?.msgStore?.get) {
                const msg = await global.conn.msgStore.get(key.remoteJid, key.id);
                if (msg?.message) return msg.message;
                if (msg) return msg;
            }
        } catch {}
        return undefined;
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
    msgRetryCounterCache,
    lidCache: global.lidCache,

    
    cachedGroupMetadata: async (jid) => {
        if (!jid || typeof jid !== 'string') return undefined;
        const normalizedJid = jidNormalizedUser(jid);
        if (!normalizedJid || !normalizedJid.endsWith('@g.us')) return undefined;

        try {
            if (global.groupCache) {
                const cached = global.groupCache.get(normalizedJid) || global.groupCache.get(jid);
                if (cached && (cached.addressingMode || cached.participants?.length)) {
                    return cached;
                }
            }
            if (!global.conn || typeof global.conn.groupMetadata !== 'function') return undefined;
            const meta = await global.conn.groupMetadata(normalizedJid);
            if (meta && meta.id) {
                const refreshed = { ...meta, id: jidNormalizedUser(meta.id || normalizedJid) };
                if (global.groupCache) global.groupCache.set(refreshed.id, refreshed);
                return refreshed;
            }
            return global.groupCache?.get(normalizedJid) || global.groupCache?.get(jid) || undefined;
        } catch {
            return global.groupCache?.get(normalizedJid) || global.groupCache?.get(jid) || undefined;
        }
    },
    
    decodeJid: (jid) => {
        if (!jid || typeof jid !== 'string') return jid;
        const raw = String(jid).trim();
        if (raw.endsWith('@lid') || /@lid$/i.test(raw)) {
            const normalized = /:\d+@lid$/i.test(raw) ? raw.replace(/:\d+@/, '@') : raw;
            const resolved = global.resolveLidToJid ? global.resolveLidToJid(normalized, global.conn) : normalized;
            if (typeof resolved === 'string' && resolved && !resolved.endsWith('@lid')) {
                return resolved;
            }
            return normalized;
        }
        if (global.jidCache) {
            const cached = global.jidCache.get(jid);
            if (cached) return cached;
        }
        let decoded = jid;
        if (/:\d+@/gi.test(jid)) {
            try { decoded = jidNormalizedUser(jid); } catch {}
        }
        if (global.jidCache) global.jidCache.set(jid, decoded);
        return decoded;
    },
    shouldIgnoreJid: () => false,
};



global.conn = makeWASocket(connectionOptions);
global.store.bind(global.conn);

const _origSendMessage333 = global.conn.sendMessage.bind(global.conn);
global.conn.sendMessage = async (jid, content, options) => {
    const timerId = global.metrics.startTimer('sendMessage');
    try {
        const result = await global.rateLimiter.add(
            () => _origSendMessage333(jid, content, options),
            { priority: 1, timeout: 30000 }
        );
        global.antiBan.reportSuccess();
        global.metrics.recordMessageSent();
        return result;
    } catch (error) {
        global.antiBan.reportError(error, { context: 'message_send' });
        const handled = await global.errorHandler.handleError(error, { maxRetries: 3 }).catch(() => null);
        if (handled?.recovered) {
            const retried = await _origSendMessage333(jid, content, options);
            global.metrics.recordMessageSent();
            return retried;
        }
        throw error;
    } finally {
        global.metrics.endTimer(timerId);
    }
};

if (!hasExistingSession && pairingMode === 'code')
    await requestPairingCodeFlow();

global.conn.isInit = false;
global.conn.well = false;


setInterval(async () => {
    if (global.db?.data) await flushDatabase().catch(console.error);
    if (global.opts['autocleartmp']) {
        [tmpdir(), 'tmp'].forEach(d => spawn('find', [d, '-amin', '2', '-type', 'f', '-delete']));
    }
}, 30000);

if (!global.autoDsTimer) {
    global.autoDsTimer = setInterval(() => {
        clearSessionFolderSelective();
    }, 10 * 60 * 1000);
}

setInterval(() => {
    if (global.db?.data) flushDatabase({
        force: true
    }).catch(console.error);
}, 5 * 60000);


if (global.opts['server'])
    (await import('./server.js')).default(global.conn, PORT);


async function connectionUpdate(update) {
    const {
        connection,
        lastDisconnect,
        isNewLogin,
        qr
    } = update;
    global.stopped = connection;

    if (isNewLogin) global.conn.isInit = true;

    const code =
        lastDisconnect?.error?.output?.statusCode ??
        lastDisconnect?.error?.output?.payload?.statusCode;

    if (code && code !== DisconnectReason.loggedOut) {
        await global.reloadHandler(true).catch(console.error);
        global.timestamp.connect = new Date();
    }

    if (global.db.data == null) global.loadDatabase();

    if (connection === 'connecting')
        logConnectionState('Connessione a WhatsApp in corso...', 'whiteBright');

    if (qr && pairingMode === 'qr' && !global.qrGenerated) {
        console.log(chalk.bold.hex('#8b5cf6')(`
       333 BOT — CONNESSIONE QR

📲 Scansiona il QR qui sotto
⏳ Valido ~45 secondi

───────────────
`));
        logSystem('WhatsApp › Dispositivi collegati › Collega un dispositivo → scansiona il QR.', 'whiteBright');
        global.qrGenerated = true;
    }

    if (connection === 'open') {
        lastConnectionStateLogged = 'open';
        global.qrGenerated = false;
        global.connectionMessagesPrinted = {};
        successfulConnectionLogged = true;

        
        
        
        _updateOwnBotIdentity();

        logSystem(`Bot collegato come ${getConnectionLabel()}`, 'whiteBright');
        logSystem(`Sessione: ${global.authFile} | Pairing: ${hasExistingSession ? 'sessione esistente' : pairingMode ?? 'automatico'}`, 'whiteBright');
        setTimeout(() => {
            joinConfiguredChannel().catch(console.error);
        }, 7000);
    }

    if (connection === 'close') {
        successfulConnectionLogged = false;
        lastConnectionStateLogged = 'close';
        if (!global.conn?.authState?.creds?.registered) pairingCodeRequested = false;

        const reason = code;
        const printed = global.connectionMessagesPrinted;

        if (reason === DisconnectReason.badSession && !printed.badSession) {
            console.log(chalk.bold.redBright(`\n[ ⚠️ ] Sessione errata — elimina ${global.authFile} e riconnetti.`));
            printed.badSession = true;
            process.exit(1);
        } else if (reason === DisconnectReason.loggedOut && !printed.loggedOut) {
            console.log(chalk.bold.redBright(`\n[ ⚠️ ] Disconnesso — elimina ${global.authFile} e riconnetti.`));
            printed.loggedOut = true;
            process.exit(1);
        } else if (reason === DisconnectReason.connectionReplaced && !printed.connectionReplaced) {
            console.log(chalk.bold.yellowBright(`[ ⚠️ ] Connessione sostituita da un'altra sessione. Disconnetti prima la sessione attiva.`));
            printed.connectionReplaced = true;
            process.exit(1);
        } else if (reason === DisconnectReason.connectionLost && !printed.connectionLost) {
            console.log(chalk.bold.blueBright(`\n[ ⚠️ ] Connessione persa — riconnessione in corso...`));
            printed.connectionLost = true;
        } else if (reason === DisconnectReason.timedOut && !printed.timedOut) {
            console.log(chalk.bold.yellowBright(`\n[ ⚠️ ] Connessione scaduta — riconnessione in corso...`));
            printed.timedOut = true;
        }
    }
}

process.on('uncaughtException', console.error);
process.on('unhandledRejection', console.error);

global.conn.ev.on('connection.update', connectionUpdate);
global.conn.ev.on('creds.update', saveCreds);


let isInit = true;
let handler = await import('./handler.js').catch(e => {
    console.error('❌ ERRORE IMPORT HANDLER:', e);
    process.exit(1);
});

global.reloadHandler = async function(restatConn = false) {
    try {
        const Handler = await import(`./handler.js?update=${Date.now()}`).catch(e => {
            console.error('❌ ERRORE IMPORT HANDLER.JS:', e);
            return null;
        });
        if (!Handler?.handler) {
            console.error('❌ handler.js non ha esportato handler. Keys:', Object.keys(Handler ?? {}));
            return false;
        }
        handler = Handler;
    } catch (e) {
        console.error('❌ ERRORE reloadHandler:', e);
        return false;
    }

    if (restatConn) {
        const oldChats = global.conn.chats;
        try {
            global.conn.ws.close();
        } catch {}
        global.conn.ev.removeAllListeners();
        global.conn = makeWASocket(connectionOptions, {
            chats: oldChats
        });
        global.store.bind(global.conn);
        isInit = true;
    }

    if (!isInit) {
        global.conn.ev.off('messages.upsert', global.conn.handler);
        global.conn.ev.off('group-participants.update', global.conn.participantsUpdate);
        global.conn.ev.off('groups.update', global.conn.groupsUpdate);
        global.conn.ev.off('message.delete', global.conn.onDelete);
        global.conn.ev.off('call', global.conn.onCall);
        global.conn.ev.off('connection.update', global.conn.connectionUpdate);
        global.conn.ev.off('creds.update', global.conn.credsUpdate);
    }

    global.conn.welcome = '@user benvenuto/a in @subject';
    global.conn.bye = '@user ha abbandonato il gruppo';
    global.conn.spromote = '@user è stato promosso ad amministratore';
    global.conn.sdemote = '@user non è più amministratore';
    global.conn.sIcon = 'immagine gruppo modificata';
    global.conn.sRevoke = 'link reimpostato, nuovo link: @revoke';

    global.conn.handler = async (chatUpdate) => {
        try {
            for (const msgGrezzo of chatUpdate?.messages || []) {
                if (msgGrezzo?.key) {
                    const checkLidParticipant = msgGrezzo.key.participant || msgGrezzo.key.remoteJid || '';
                    if (typeof checkLidParticipant === 'string' && checkLidParticipant.endsWith('@lid')) {
                        if (msgGrezzo.key?.fromMe) return;

                        
                        
                        
                        
                        
                        
                        try {
                            const lidNorm = String(checkLidParticipant).replace(/:\d+@/, '@');
                            const isOwnBotLid = global.__ownBotLid && lidNorm === global.__ownBotLid;
                            if (!isOwnBotLid && global.__ownBotDigits?.size) {
                                const pn = msgGrezzo.key.participantPn;
                                if (pn) {
                                    const pnDigits = String(pn).split('@')[0].replace(/\D/g, '');
                                    if (global.__ownBotDigits.has(pnDigits)) {
                                        console.warn('[sbarramento333] participantPn corrotto (= bot) per lid utente, neutralizzato:', lidNorm, '->', pn);
                                        delete msgGrezzo.key.participantPn;
                                    }
                                }
                            }
                        } catch (e) {
                            console.error('Errore sbarramento participantPn 333.js:', e);
                        }
                    }
                }
            }
        } catch (e) {
            console.error('Errore sbarramento principale 333.js:', e);
        }
        return handler.handler.call(global.conn, chatUpdate);
    };
    global.conn.participantsUpdate = handler.participantsUpdate.bind(global.conn);
    global.conn.groupsUpdate = handler.groupsUpdate.bind(global.conn);
    global.conn.onDelete = handler.deleteUpdate.bind(global.conn);
    global.conn.onCall = handler.callUpdate.bind(global.conn);
    global.conn.connectionUpdate = connectionUpdate.bind(global.conn);
    global.conn.credsUpdate = saveCreds.bind(global.conn, true);

    global.conn.ev.on('messages.upsert', global.conn.handler);
    global.conn.ev.on('group-participants.update', global.conn.participantsUpdate);
    global.conn.ev.on('groups.update', global.conn.groupsUpdate);
    global.conn.ev.on('message.delete', global.conn.onDelete);
    global.conn.ev.on('call', global.conn.onCall);
    global.conn.ev.on('connection.update', global.conn.connectionUpdate);
    global.conn.ev.on('creds.update', global.conn.credsUpdate);

    isInit = false;
    return true;
};


const pluginFolder = join(__dirname, 'plugins');
global.plugins = {};

function getPluginFiles(dir = pluginFolder) {
    if (!existsSync(dir)) return [];
    const result = [];
    for (const entry of readdirSync(dir, {
            withFileTypes: true
        })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) result.push(...getPluginFiles(full));
        else if (entry.isFile() && /\.js$/i.test(entry.name)) result.push(full);
    }
    return result;
}

function normalizePluginKey(filePath) {
    return path.relative(pluginFolder, filePath).replace(/\\/g, '/');
}

async function filesInit() {
    const tasks = getPluginFiles().map(async (filePath) => {
        const key = normalizePluginKey(filePath);
        try {
            const mod = await import(global.__filename(filePath));
            global.plugins[key] = mod.default ?? mod;
        } catch (e) {
            global.conn?.logger?.error(e);
            delete global.plugins[key];
        }
    });
    await Promise.allSettled(tasks);
}
filesInit().catch(console.error);

global.reload = async (_ev, filename) => {
    if (!filename || !/\.js$/i.test(filename)) return;
    const filePath = join(pluginFolder, filename);
    const key = normalizePluginKey(filePath);
    const fileExists = existsSync(filePath);

    if (key in global.plugins) {
        if (fileExists) {
            global.conn?.logger?.info(chalk.green(`✅ PLUGIN AGGIORNATO — '${key}'`));
        } else {
            global.conn?.logger?.warn(chalk.yellow(`⚠️ PLUGIN RIMOSSO: '${key}'`));
            delete global.plugins[key];
            global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)));
            return;
        }
    } else if (fileExists) {
        global.conn?.logger?.info(chalk.blue(`🆕 NUOVO PLUGIN: '${key}'`));
    }

    if (!fileExists) return;

    const src = fs.readFileSync(filePath);
    const err = syntaxerror(src, key, {
        sourceType: 'module',
        allowAwaitOutsideFunction: true
    });
    if (err) {
        global.conn?.logger?.error(chalk.red(`❌ ERRORE SINTASSI '${key}'\n${format(err)}`));
        return;
    }
    try {
        const mod = await import(`${global.__filename(filePath)}?update=${Date.now()}`);
        global.plugins[key] = mod.default ?? mod;
    } catch (e) {
        global.conn?.logger?.error(`⚠️ ERRORE PLUGIN '${key}'\n${format(e)}`);
    } finally {
        global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)));
    }
};
Object.freeze(global.reload);

const pluginWatcher = watch(pluginFolder, {
    recursive: true
}, global.reload);
pluginWatcher.setMaxListeners(20);

await global.reloadHandler();



const { restoreAllSubbots, migrateLegacySessions } = await import('./333Subbot/manager.js');
migrateLegacySessions();
restoreAllSubbots().catch((e) => console.error('❌ ERRORE restoreAllSubbots:', e));


function clearDirectory(dirPath) {
    if (!existsSync(dirPath)) {
        try {
            mkdirSync(dirPath, {
                recursive: true
            });
        } catch {}
        return;
    }
    for (const file of readdirSync(dirPath)) {
        const p = join(dirPath, file);
        try {
            const st = statSync(p);
            if (st.isFile()) unlinkSync(p);
            else if (st.isDirectory()) rmSync(p, {
                recursive: true,
                force: true
            });
        } catch {}
    }
}

function ripristinaTimer(conn) {
    if (conn.timerReset) clearInterval(conn.timerReset);
    conn.timerReset = setInterval(() => {
        if (global.stopped === 'close' || !conn?.user) return;
        clearDirectory(join(__dirname, 'tmp'));
        clearDirectory(join(__dirname, 'temp'));
    }, 30 * 60_000);
}
ripristinaTimer(global.conn);


const mainWatcher = watch(fileURLToPath(import.meta.url), async () => {
    await global.reloadHandler(true).catch(console.error);
});
mainWatcher.setMaxListeners(20);
try { startBanServer(global.conn); } catch {}