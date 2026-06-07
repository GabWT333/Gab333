//Codice di config.js

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

	
global.gab = ['393882471151',]
global.owner = [
  ['393294241699', 'Lucifero', true],
  ['393892430108', 'Gab', true],
  ['66621409462', 'Matte', true],
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
global.gruppo = 'https://chat.whatsapp.com/KqBeKHgrc53BNdvuPTKLTL' 


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
  unwatchFile(filePath)
  console.log(chalk.bgHex('#ff0000')(chalk.white.bold("File: 'config.js' Aggiornato")))
  const module = await import(`${fileUrl}?update=${Date.now()}`)
  moduleCache.set(fileUrl, module, { ttl: 300 });
  return module;
}
watchFile(filePath, reloadConfig)