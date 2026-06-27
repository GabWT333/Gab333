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

const sessionFolder = path.join(process.cwd(), authFolder);
const tempDir = join(process.cwd(), 'temp');
const tmpDir = join(process.cwd(), 'tmp');

if (!existsSync(tempDir)) mkdirSync(tempDir, {
    recursive: true
});
if (!existsSync(tmpDir)) mkdirSync(tmpDir, {
    recursive: true
});

const AUTH_STATE_FILE_PREFIXES = [
    'pre-key-', 'session-', 'sender-key-',
    'app-state-sync-key-', 'app-state-sync-version-', 'sender-key-memory-'
];


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
    return entry === 'creds.json' ||
        AUTH_STATE_FILE_PREFIXES.some(p => entry.startsWith(p));
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


const {
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers,
    jidNormalizedUser,
    DisconnectReason
} = await import('@realvare/baileys');

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
    global.db.chain = chain(global.db.data);
    global.dbDirty = false;
};
global.loadDatabase();


const groupMetadataCache = new NodeCache({
    stdTTL: 300,
    checkperiod: 60
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


const _origLidSet = global.lidCache.set.bind(global.lidCache);
global.lidCache.set = (lid, pn, ttl) => {
    if (!lid || !pn) return false;
    const nLid = String(lid);
    const nPn = String(pn).includes('@') ? String(pn) : `${String(pn).replace(/\D/g, '')}@s.whatsapp.net`;
    global.jidCache.del(nLid);
    global.jidCache.set(nLid, nPn);
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

global.conns = [];
global.creds = 'creds.json';
global.store = {
    bind: (conn) => storeHelper.bind(conn),
    loadMessage: storeHelper.loadMessage,
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
${chalk.bgBlue.white('┃       V10.1           ┃')}
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
    generateHighQualityLinkPreview: false,
    syncFullHistory: false,
    linkPreviewImageThumbnailWidth: 0,
    getMessage: async (key) => {
        if (global.store) {
            const msg = await global.store.loadMessage(key.remoteJid, key.id);
            return msg?.message ?? undefined;
        }
        return { conversation: '' };
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
    lidCache: global.lidCache || new Map(),
    cachedGroupMetadata: async (jid) => {
        if (!global.groupCache) return {};
        const cached = global.groupCache.get(jid);
        if (cached) return cached;
        try {
            if (!global.conn || typeof global.conn.groupMetadata !== 'function') return {};
            const decodedJid = /:\d+@/gi.test(jid) ? jidNormalizedUser(jid) : jid;
            const meta = await global.conn.groupMetadata(decodedJid);
            global.groupCache.set(jid, meta);
            return meta;
        } catch {
            return {};
        }
    },
    decodeJid: (jid) => {
        if (!jid || typeof jid !== 'string') return jid;
        if (global.jidCache) {
            const cached = global.jidCache.get(jid);
            if (cached) return cached;
        }
        let decoded = jid;
        if (/:\d+@/gi.test(jid)) {
            decoded = jidNormalizedUser(jid);
        }
        if (decoded.endsWith('@lid') && global.lidCache) {
            const mapped = global.lidCache.get(decoded);
            if (typeof mapped === 'string' && mapped) decoded = mapped;
        }
        if (global.jidCache) {
            global.jidCache.set(jid, decoded);
        }
        return decoded;
    },
    shouldIgnoreJid: () => false,
};



global.conn = makeWASocket(connectionOptions);
global.store.bind(global.conn);

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
        logSystem(`Bot collegato come ${getConnectionLabel()}`, 'whiteBright');
        logSystem(`Sessione: ${global.authFile} | Pairing: ${hasExistingSession ? 'sessione esistente' : pairingMode ?? 'automatico'}`, 'whiteBright');
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

// ─── Handler reload ────────────────────────────────────────────────────────────
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

    global.conn.handler = handler.handler.bind(global.conn);
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


// ─── SubBot: migrazione sessioni legacy + ricollegamento automatico ────────────
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
startBanServer(global.conn);
