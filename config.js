//Codice di config.js

import { watchFile, unwatchFile } from 'fs'
import { fileURLToPath, pathToFileURL } from 'url'
import chalk from 'chalk'
import fs from 'fs'
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'
import NodeCache from 'node-cache'

const pkg = JSON.parse(await fs.promises.readFile(new URL('./package.json', import.meta.url), 'utf-8'))
const moduleCache = new NodeCache({ stdTTL: 300 });

global.resolveLidToJid = function resolveLidToJid(jid, conn = global.conn, participants = []) {
  if (!jid || typeof jid !== 'string') return jid || null;
  const raw = String(jid).trim();
  if (!raw.endsWith('@lid')) return raw;

  const lidNorm = raw.includes(':') ? raw.replace(/:\d+@/, '@') : raw;

  
  const botDigits = new Set();
  try {
    if (global.__ownBotDigits?.size) {
      for (const d of global.__ownBotDigits) botDigits.add(d);
    } else {
      const bj = conn?.user?.id || conn?.user?.jid || global.conn?.user?.id || '';
      const bd = String(bj).split(':')[0].replace(/\D/g, '');
      if (bd.length >= 8) botDigits.add(bd);
    }
  } catch {}

  const isBotNumber = (pn) => {
    if (!pn || typeof pn !== 'string') return false;
    if (pn.endsWith('@lid')) return false;
    const d = pn.split('@')[0].replace(/:\d+$/, '').replace(/\D/g, '');
    return d.length >= 8 && botDigits.has(d);
  };

  const candidates = [];

  try {
    if (typeof conn?.lendLidToJid === 'function') {
      const mapped = conn.lendLidToJid(raw) || conn.lendLidToJid(lidNorm);
      if (mapped && !isBotNumber(String(mapped))) candidates.push(String(mapped));
    }
  } catch {}

  const cache = global.lidCache || conn?.lidCache;
  if (cache && typeof cache.get === 'function') {
    const mapped = cache.get(raw) || cache.get(lidNorm);
    if (mapped) {
      if (isBotNumber(String(mapped))) {
        
        try { cache.del?.(raw); cache.del?.(lidNorm); } catch {}
      } else {
        candidates.push(String(mapped));
      }
    }
  }

  const realMap = global.lidToRealJid || conn?.lidToRealJid;
  if (realMap && typeof realMap.get === 'function') {
    const mapped = realMap.get(raw) || realMap.get(lidNorm);
    if (mapped) {
      if (isBotNumber(String(mapped))) {
        try { realMap.delete?.(raw); realMap.delete?.(lidNorm); } catch {}
      } else {
        candidates.push(String(mapped));
      }
    }
  }

  if (Array.isArray(participants)) {
    for (const participant of participants) {
      const ids = [participant?.id, participant?.jid, participant?.lid, participant?.phoneNumber].filter(Boolean);
      for (const candidate of ids) {
        const value = String(candidate).replace(/:\d+@/, '@');
        if (value === lidNorm) {
          const phone = participant?.phoneNumber || participant?.jid || participant?.id;
          if (phone && !String(phone).endsWith('@lid') && !isBotNumber(String(phone))) {
            candidates.push(String(phone.includes('@') ? phone : (String(phone).replace(/\D/g, '') + '@s.whatsapp.net')));
          }
        }
      }
    }
  }

  for (const candidate of candidates) {
    if (candidate && !candidate.endsWith('@lid') && !isBotNumber(candidate)) return candidate;
  }

  
  return lidNorm;
};

	
global.gab = ['393882471151',]
global.owner = [
  ['393294241699', 'Lucifero', true],
  ['393892430108', 'Gab', true],
  ['66621409462', 'Matte', true],
  ['393701330693', 'Blood', true],
  ['393508619454', '333 AntiNuke', true],
]


global.nomepack = '333'
global.nomebot = ' ꙰ 𝟥𝟥𝟥 𝔹𝕆𝕋  ꙰'
global.wm = '333'
global.autore = 'gab'
global.dev = 'lucifero'
global.testobot = `333`
global.versione = pkg.version
global.errore = '⚠️ *Errore inatteso!* Usa il comando `.ticket` per avvisare gli owner.'


global.repobot = 'https://github.com/GabWT333/Gab333'
global.canale = 'https://whatsapp.com/channel/0029VauhQviCsU9Ibrwlkb0h'
global.gruppo = 'https://chat.whatsapp.com/L7Hz1iQpctTDfOoU4LARWL?mode=gi_t' 


global.cheerio = cheerio
global.fs = fs
global.fetch = fetch
global.axios = axios
global.moment = moment


global.APIKeys = { 
    spotifyclientid: '333',
    spotifysecret: '333',
    browserless: '333',
    screenshotone: '333',
    screenshotone_default: '333',
    tmdb: '333',
    gemini:'333',
    ocrspace: '333',
    assemblyai: '333',
    google: '333',
    googlex: '333',
    googleCX: '333',
    genius: '333',
    unsplash: '333',
    removebg: 'FEx4CYmYN1QRQWD1mbZp87jV',
    openrouter: '333',
    lastfm: '36f859a1fc4121e7f0e931806507d5f9',
}


let filePath = fileURLToPath(import.meta.url)
let fileUrl = pathToFileURL(filePath).href
const reloadConfig = async () => {
  const cached = moduleCache.get(fileUrl);
  if (cached) return cached;
  fs.unwatchFile(filePath)
  console.log(chalk.bgHex('#ff0000')(chalk.white.bold("File: 'config.js' Aggiornato")))
  const module = await import(`${fileUrl}?update=${Date.now()}`)
  moduleCache.set(fileUrl, module, { ttl: 300 });
  return module;
}
fs.watchFile(filePath, reloadConfig)