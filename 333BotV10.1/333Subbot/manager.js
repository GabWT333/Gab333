import {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers,
  jidNormalizedUser,
  DisconnectReason
} from '@realvare/baileys';
import NodeCache from 'node-cache';
import fs from 'fs';
import path from 'path';
import pino from 'pino';
import { makeWASocket } from '../lib/simple.js';

const SUBBOT_ROOT  = path.join(process.cwd(), '333Subbot', 'sessions');
const LEGACY_ROOT   = path.join(process.cwd(), 'jadibts');

if (!fs.existsSync(SUBBOT_ROOT)) fs.mkdirSync(SUBBOT_ROOT, { recursive: true });
if (!global.subbots) global.subbots = new Map();

const logger = pino({ level: 'silent' });

export function migrateLegacySessions() {
  if (!fs.existsSync(LEGACY_ROOT)) return;
  let moved = 0;
  for (const entry of fs.readdirSync(LEGACY_ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const src  = path.join(LEGACY_ROOT, entry.name);
    const dest = path.join(SUBBOT_ROOT, entry.name);
    const credsSrc = path.join(src, 'creds.json');
    if (!fs.existsSync(credsSrc)) continue;
    if (fs.existsSync(dest)) continue;
    try {
      fs.cpSync(src, dest, { recursive: true });
      moved++;
    } catch (e) {
      console.error(`[subbot-manager] errore migrazione ${entry.name}:`, e.message);
    }
  }
  if (moved > 0) console.log(`[subbot-manager] migrate ${moved} sessioni legacy in 333Subbot/sessions/`);
}

function buildConnectionOptions(state) {
  const msgRetryCounterCache = new NodeCache();
  const jidCache = new NodeCache({ stdTTL: 600,   useClones: false });
  const lidCache = new NodeCache({ stdTTL: 86400, useClones: false });
  const _origLidSet = lidCache.set.bind(lidCache);
  lidCache.set = (lid, pn, ttl) => {
    if (!lid || !pn) return false;
    const nLid = String(lid);
    const nPn  = String(pn).includes('@') ? String(pn) : `${String(pn).replace(/\D/g, '')}@s.whatsapp.net`;
    jidCache.del(nLid);
    jidCache.set(nLid, nPn);
    return _origLidSet(nLid, nPn, ttl);
  };

  return {
    logger,
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys:  makeCacheableSignalKeyStore(state.keys, logger),
    },
    browser: Browsers.macOS('Safari'),
    markOnlineOnConnect:           true,
    generateHighQualityLinkPreview: false,
    syncFullHistory:               false,
    linkPreviewImageThumbnailWidth: 0,
    getMessage: async key => {
      const msg = await global.store?.loadMessage(key.remoteJid, key.id);
      return msg?.message ?? undefined;
    },
    defaultQueryTimeoutMs: 20_000,
    connectTimeoutMs:      30_000,
    keepAliveIntervalMs:   25_000,
    emitOwnEvents:         true,
    fireInitQueries:       true,
    retryRequestDelayMs:   250,
    maxMsgRetryCount:      5,
    transactionOpts:       { maxCommitRetries: 3, delayBetweenTriesMs: 250 },
    msgRetryCounterCache,
    lidCache,
    cachedGroupMetadata: async jid => {
      const cached = global.groupCache?.get(jid);
      if (cached) return cached;
      try {
        const meta = await sock.groupMetadata(sock.decodeJid(jid));
        global.groupCache?.set(jid, meta);
        return meta;
      } catch { return {}; }
    },
    decodeJid: jid => {
      if (!jid) return jid;
      const cached = jidCache.get(jid);
      if (cached) return cached;
      let d = /:\d+@/gi.test(jid) ? jidNormalizedUser(jid) : jid;
      if (typeof d === 'object' && d.user && d.server) d = `${d.user}@${d.server}`;
      if (typeof d === 'string' && d.endsWith('@lid')) {
        const mapped = lidCache.get(d);
        if (typeof mapped === 'string' && mapped) d = mapped;
      }
      jidCache.set(jid, d);
      return d;
    },
    shouldIgnoreJid: () => false,
  };
}

async function messagesUpsert(sock, chatUpdate) {
  if (!chatUpdate?.messages?.length) return;
  const msg = chatUpdate.messages[0];
  if (!msg || msg.key?.remoteJid === 'status@broadcast') return;

  let mParsed = msg;
  try {
    const simpleMod = await import('../lib/simple.js').catch(() => null);
    if (simpleMod && typeof simpleMod.smsg === 'function') mParsed = simpleMod.smsg(sock, msg, global.store);
    else if (typeof sock.serializeM === 'function') mParsed = sock.serializeM(msg);
  } catch {}

  try {
    let runHandler = global.handler;
    if (!runHandler) {
      const handlerModule = await import('../handler.js?update=' + Date.now()).catch(() => null);
      runHandler = handlerModule?.handler ?? handlerModule?.default;
    }
    if (typeof runHandler === 'function') await runHandler.call(sock, mParsed, chatUpdate);
  } catch (err) {
    console.error('[subbot-manager handler]', err);
  }
}

async function reconnectSubbot(num, attempt = 0) {
  const sessionPath = path.join(SUBBOT_ROOT, num);
  const credsPath    = path.join(sessionPath, 'creds.json');
  if (!fs.existsSync(credsPath)) return;

  try {
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version }          = await fetchLatestBaileysVersion();
    const sock = makeWASocket({ version, ...buildConnectionOptions(state) });
    sock.isInit = false;

    global.subbots.set(num, { sock, connected: false, num });

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('messages.upsert', cu => messagesUpsert(sock, cu));

    sock.ev.on('connection.update', async update => {
      const { connection, lastDisconnect } = update;

      if (connection === 'open') {
        sock.isInit = true;
        const entry = global.subbots.get(num);
        if (entry) entry.connected = true;
        console.log(`[subbot-manager] ✅ ${num} ricollegato come ${sock.user?.id ?? '?'}`);
      }

      if (connection === 'close') {
        const code = lastDisconnect?.error?.output?.statusCode ?? lastDisconnect?.error?.output?.payload?.statusCode;

        if (!sock.isInit || code === DisconnectReason.loggedOut || code === DisconnectReason.badSession || code === 405) {
          global.subbots.delete(num);
          try { fs.rmSync(sessionPath, { recursive: true, force: true }); } catch {}
          console.log(`[subbot-manager] ❌ ${num} sessione invalida, rimossa.`);
          return;
        }

        if (attempt >= 10) {
          global.subbots.delete(num);
          console.error(`[subbot-manager] ${num} troppi tentativi falliti, abbandono.`);
          return;
        }

        const entry = global.subbots.get(num);
        if (entry) entry.connected = false;
        setTimeout(() => reconnectSubbot(num, attempt + 1), 5000);
      }
    });
  } catch (e) {
    console.error(`[subbot-manager] errore avvio ${num}:`, e.message);
  }
}

export async function restoreAllSubbots() {
  if (!fs.existsSync(SUBBOT_ROOT)) return;
  const entries = fs.readdirSync(SUBBOT_ROOT, { withFileTypes: true }).filter(e => e.isDirectory());
  if (entries.length === 0) return;

  console.log(`[subbot-manager] ripristino ${entries.length} sessioni subbot...`);
  for (const entry of entries) {
    const num = entry.name;
    if (global.subbots.has(num)) continue;
    await reconnectSubbot(num);
    await new Promise(r => setTimeout(r, 1500));
  }
}

