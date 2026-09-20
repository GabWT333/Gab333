//Plugin by Gab, Lucifero & 333 staff


import JavaScriptObfuscator from 'javascript-obfuscator';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const configPath = join(__dirname, 'config.json');

const loadConfig = async () => {
  try {
    const data = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(data);
    if (!Array.isArray(config.authorizedNumbers)) {
      config.authorizedNumbers = ['46737807114@s.whatsapp.net'];
    }
    return config;
  } catch (error) {
    return {
      authorizedNumbers: ['393509414533@s.whatsapp.net'],
      gruppoNotifica: '120363396779012019@g.us'
    };
  }
};

const getObfuscationOptions = (livello) => {
  const opzioniBase = { compact: true };

  const opzioniMedio = {
    ...opzioniBase,
    controlFlowFlattening: true,
    deadCodeInjection: true,
  };

  const opzioniAvanzato = {
    ...opzioniMedio,
    debugProtection: true,
    debugProtectionInterval: 1000,
    selfDefending: true,
    renameGlobals: true,
    disableConsoleOutput: true,
    numbersToExpressions: true,
    stringArray: true,
    stringArrayThreshold: 1,
    splitStrings: true,
    splitStringsChunkLength: 5,
    controlFlowFlatteningThreshold: 1,
    deadCodeInjectionThreshold: 1,
    identifierNamesGenerator: 'hexadecimal',
    stringArrayEncoding: ['base64'],
    unicodeEscapeSequence: true,
    rotateStringArray: true,
    shuffleStringArray: true,
    transformObjectKeys: true,
    simplify: true,
    stringArrayWrappersCount: 2,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersType: 'variable'
  };

  switch (livello?.toLowerCase()) {
    case 'medio':
      return opzioniMedio;
    case 'avanzato':
      return opzioniAvanzato;
    default:
      return opzioniAvanzato;
  }
};

const extractCode = async (m, conn) => {
  let [livello, ...codiceArray] = m.text.split(' ');
  let codice = codiceArray.join(' ');

  if (!codice) {
    const fileMessage = m.message?.documentMessage || m.quoted?.message?.documentMessage;
    if (fileMessage) {
      const downloaded = await conn.downloadMediaMessage(m.message?.documentMessage ? m : m.quoted);
      codice = downloaded.toString('utf-8');
    }
  }
  return { livello, codice };
};

const handler = async (m, { conn, text, groupMetadata }) => {
  const config = await loadConfig();

  if (!config.authorizedNumbers.includes(m.sender)) {
    const groupName = groupMetadata?.subject || 'Chat privata';
    const alertMessage = `⚠️ Numero *${m.sender.split('@')[0]}* ha provato a usare il comando *enc* nel gruppo *${groupName}*!`;
    await conn.sendMessage(config.gruppoNotifica, { text: alertMessage, mentions: [m.sender] });
    await conn.sendMessage(m.chat, { text: '⚠️ Non hai il permesso di usare questo comando!' });
    return;
  }

  if (!text) {
    return m.reply('⚠️ Usa: .enc <livello: base | medio | avanzato> <codice> oppure allega un file con il codice!');
  }

  const { livello, codice } = await extractCode(m, conn);
  if (!codice) {
    return m.reply('⚠️ Inserisci il codice da offuscare dopo il livello oppure allega un file con il codice!');
  }

  const opzioni = getObfuscationOptions(livello);

  const fileName = 'enc333.js';
  const filePath = join(__dirname, fileName);

  try {
    let obfuscatedCode = JavaScriptObfuscator.obfuscate(codice, opzioni).getObfuscatedCode();
    obfuscatedCode = "//Crediti by Gabs & 333 Staff\n" + obfuscatedCode;

    await fs.writeFile(filePath, obfuscatedCode);

    await conn.sendMessage(m.chat, {
      document: { url: filePath },
      mimetype: 'application/javascript',
      fileName: fileName
    }, { quoted: m });
  } catch (error) {
    await conn.sendMessage(m.chat, { text: '⚠️ Si è verificato un errore durante l’offuscamento del codice. Riprova!' });
    console.error(error);
  } finally {
    fs.unlink(filePath).catch(err => console.error('Errore durante l\'eliminazione del file:', err));
  }
};
handler.help = ['𝐨𝐟𝐟𝐮𝐬𝐜𝐚 <𝐬𝐜𝐫𝐢𝐩𝐭>'];
handler.tags = ['owner'];
handler.rowner = true;
handler.command = /^(enc)$/i;
export default handler;