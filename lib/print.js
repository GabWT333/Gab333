import PhoneNumber from 'awesome-phonenumber'
import chalk from 'chalk'
import fs, { watchFile } from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import NodeCache from 'node-cache'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const __filename = fileURLToPath(import.meta.url)

const nameCache = global.nameCache || (global.nameCache = new NodeCache({ stdTTL: 600, useClones: false }));
const groupMetaCache = global.groupCache || (global.groupCache = new NodeCache({ stdTTL: 300, useClones: false }));
const errorThrottle = new Map();
const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g
const lastLogCache = { jid: null, time: 0 };

export function ensureMessageUpdateListener(conn = { ev: null, user: {} }) {
  if (!conn?.ev || global.messageUpdateListenerSet) return
  conn.ev.on('messages.update', async (updates) => {
    for (const update of updates) {
      const key = update?.key
      if (!key?.remoteJid || !key?.id) continue
      if (update.update?.message?.editedMessage?.message) {
        try {
          const editedContainer = update.update.message.editedMessage
          let editedMessage = editedContainer?.message || editedContainer
          if (editedMessage?.message) editedMessage = editedMessage.message
          if (!editedMessage) continue

          let originalMsg = null
          try {
            if (global.store?.getMessage) {
              originalMsg = await global.store.getMessage(key)
            } else if (global.store?.loadMessage) {
              const jid = conn.decodeJid(key.remoteJid)
              originalMsg = await global.store.loadMessage(jid, key.id)
            }
          } catch {
          }

          const participant = key.participant || originalMsg?.key?.participant || originalMsg?.participant || key.remoteJid
          const fakeMsg = {
            key: {
              ...key,
              participant,
              fromMe: false,
            },
            message: editedMessage,
            messageTimestamp: originalMsg?.messageTimestamp || update.update?.timestamp || update.update?.messageTimestamp,
            pushName: originalMsg?.pushName,
            broadcast: originalMsg?.broadcast,
          }

          if (typeof conn.handler === 'function') {
            await conn.handler({ messages: [fakeMsg], type: 'notify' })
          }
        } catch {
        }
        continue
      }
      if (update.update?.message === null) {
        continue
      }
    }
  })
  global.messageUpdateListenerSet = true
}

export default async function (m, conn = { user: {} }) {
  ensureMessageUpdateListener(conn)

  const protocolType = m?.message?.protocolMessage?.type
  const hasEditedMessage = !!(m?.message?.editedMessage || m?.message?.protocolMessage?.editedMessage || m?.message?.protocolMessage?.editedMessage?.message)
  const isEdit = hasEditedMessage || protocolType === 'MESSAGE_EDIT' || protocolType === 14
  const isDelete = m?.messageStubType === 68 || protocolType === 'REVOKE' || protocolType === 0
  if (isEdit || isDelete) return

  if (!m || m.key?.fromMe) return

  try {
    const senderJid = conn.decodeJid(m.sender)
    const chatJid = conn.decodeJid(m.chat || '')
    const botJid = conn.decodeJid(conn.user?.jid)

    if (!chatJid) {
      console.warn('chatJid is undefined, skipping print');
      return;
    }

    const getName = async (jid) => {
      let cached = nameCache.get(jid);
      if (cached) return cached;

      if (jid.endsWith('@newsletter')) {
        cached = 'Newsletter ' + jid.split('@')[0];
      } else if (jid.endsWith('@g.us')) {
        const meta = groupMetaCache.get(jid);
        cached = meta?.subject || '';
      }

      if (!cached) {
        const c = conn.contacts?.[jid] || global.store?.contacts?.[jid];
        cached = c?.notify || c?.name || '';
        if (!cached) {
          cached = await conn.getName(jid) || '';
        }
      }

      if (cached) nameCache.set(jid, cached);
      return cached || (jid.endsWith('@g.us') ? 'Chat Sconosciuta' : '');
    };

    const _name = await getName(senderJid);
    const sender = formatPhoneNumber(senderJid, _name);
    const chat = await getName(chatJid) || 'Chat Sconosciuta';

    const me = formatPhoneNumber(botJid || '', conn.user?.name || 'Bot')
    const now = Date.now();
    if (lastLogCache.jid === senderJid && now - lastLogCache.time < 1000) return;
    lastLogCache.jid = senderJid;
    lastLogCache.time = now;

    const senderPhone = senderJid.split('@')[0];
    const isOwner = Array.isArray(global.owner)
      ? global.owner.some(([number]) => number === senderPhone)
      : global.owner === senderPhone;
    const isGroup = chatJid.endsWith('@g.us');
    const isAdmin = isGroup ? await checkAdmin(conn, chatJid, senderJid) : false;
    const isPremium = global.prems?.includes(senderJid) || false;
    const isBanned = global.DATABASE?.data?.users?.[senderJid]?.banned || false;
    const user = global.DATABASE?.data?.users?.[senderJid] || { exp: '?', diamonds: '?', level: '¿', euro: '?', bank: '?' }
    const filesize = getFileSize(m)
    const ts = formatTimestamp(m.messageTimestamp)
    const messageAge = getMessageAge(m.messageTimestamp)
    const c = getColorScheme()
    const bordi = getBorders(c)
    const tipo = formatType(m)

    const righe = [
  `\x1b[38;5;196m╔════════════〔333 BOT〕═══════════╗\x1b[0m`,

  `\x1b[38;5;196m║\x1b[0m \x1b[38;5;46mBOT\x1b[0m ⇢ \x1b[37m${me}\x1b[0m`,
  
  `\x1b[38;5;196m║\x1b[0m \x1b[38;5;46mORARIO\x1b[0m ⇢ \x1b[37m${ts}\x1b[0m${messageAge ? ` \x1b[90m⟨${messageAge}⟩\x1b[0m` : ''}`,
  
  `\x1b[38;5;196m║\x1b[0m \x1b[38;5;46mUTENTE\x1b[0m ⇢ \x1b[37m${sender}\x1b[0m${isGroup ? ` \x1b[90m⟡ ${getUserStatus(isOwner, isAdmin, isPremium, isBanned, c)}\x1b[0m` : ''}`,
  
  `\x1b[38;5;196m║\x1b[0m \x1b[38;5;46mCHAT\x1b[0m ⇢ \x1b[37m${chat}\x1b[0m${isGroup ? ' \x1b[90m⦿ GRUPPO\x1b[0m' : ' \x1b[90m◉ PRIVATO\x1b[0m'}`,
  
  `\x1b[38;5;196m║\x1b[0m \x1b[38;5;46mTIPO\x1b[0m ⇢ \x1b[37m${tipo}\x1b[0m${getMessageFlags(m, c)}`
]

    if (filesize) {
  righe.push(`\x1b[38;5;196m║\x1b[0m \x1b[38;5;46mDIMENSIONE\x1b[0m ⇢ \x1b[37m${formatSize(filesize)}\x1b[0m`)
}

const commandText = getCommandText(m)
if (commandText) {
  righe.push(`\x1b[38;5;196m║\x1b[0m \x1b[38;5;46mCMD\x1b[0m ⇢ \x1b[37m${commandText}\x1b[0m`)
}

    if (isGroup && chatJid) {
      try {
        let groupMeta = groupMetaCache.get(chatJid);
        if (!groupMeta) {
          groupMeta = await conn.groupMetadata(chatJid);
          if (groupMeta) {
            groupMeta.fetchTime = Date.now();
            groupMetaCache.set(chatJid, groupMeta);
          }
        }
        const participantCount = groupMeta?.participants?.length || '?'
        righe.push(`\x1b[38;5;196m║\x1b[0m \x1b[38;5;46mMEMBRI\x1b[0m ⇢ \x1b[37m${participantCount}\x1b[0m`)
      } catch (e) {
        throttleError('Errore nel recupero dei metadati del gruppo:', e.message, 5000);
      }
    }

    if (m.quoted) {
      const quotedSenderJid = conn.decodeJid(m.quoted.sender)
      let qname = nameCache.get(quotedSenderJid);
      if (!qname) {
        qname = await conn.getName(quotedSenderJid) || 'Utente';
        nameCache.set(quotedSenderJid, qname);
      }
      const qtype = formatType(m.quoted)
      righe.push(`\x1b[38;5;196m║\x1b[0m \x1b[38;5;46mRisposta a\x1b[0m ⇢ \x1b[37m${qname}\x1b[0m ${c.secondary('(')}${c.meta(qtype)}${c.secondary(')')}`)
    }

    if (m.forwarded) {
      righe.push(`\x1b[38;5;196m║\x1b[0m \x1b[38;5;46mInoltrato\x1b[0m ⇢ \x1b[37mSì\x1b[0m`)
    }

    if (m.broadcast) {
      righe.push(`\x1b[38;5;196m║\x1b[0m \x1b[38;5;46mBroadcast\x1b[0m ⇢ \x1b[37mSì\x1b[0m`)
    }

    righe.push(`${bordi.bottom}`)

    console.log('\n' + righe.join('\n'))

    const logText = await formatText(m, conn)
    if (logText?.trim()) console.log(logText)

    if (m.messageStubParameters && Array.isArray(m.messageStubParameters)) {
      const decoded = m.messageStubParameters.map(jid =>
        chalk.gray(formatPhoneNumber(conn.decodeJid(jid), ''))
      ).join(', ')
      if (decoded.trim()) console.log(decoded)
    }

    logMessageSpecifics(m, c)

    if (m.reactions && m.reactions.length > 0) {
      const reactions = m.reactions.map(r => `${r.text} (${r.count})`).join(', ')
      console.log(`${c.secondary('REAZIONI:')} ${c.text(reactions)}`)
    }

    if (m.editedTimestamp) {
      const editTime = new Date(m.editedTimestamp * 1000).toLocaleTimeString('it-IT')
      console.log(`${c.secondary('MODIFICATO:')} ${c.text(editTime)}`) 
    }

  } catch (error) {
    throttleError('Errore in print.js:', error.message, 5000);
  }
}

function throttleError(message, error, delay) {
  const key = message + error;
  const now = Date.now();
  const lastTime = errorThrottle.get(key);
  if (!lastTime || now - lastTime > delay) {
    console.error(chalk.red(message), error);
    errorThrottle.set(key, now);
    if (errorThrottle.size > 50) {
      const oldestKey = errorThrottle.keys().next().value;
      errorThrottle.delete(oldestKey);
    }
  }
}

function formatPhoneNumber(jid, name) {
    if (!jid) return 'Sconosciuto';
    if (jid.endsWith('@newsletter')) {
        return `Newsletter: ${jid.split('@')[0]}${name ? ` ~${name}` : ''}`;
    }
    let userPart = jid.split('@')[0];
    let cleanNumber = userPart.split(':')[0];
    try {
        const number = PhoneNumber('+' + cleanNumber).getNumber('international');
        return number + (name ? ` ~${name}` : '');
    } catch {
        return (cleanNumber || '') + (name ? ` ~${name}` : '');
    }
}

async function checkAdmin(conn, chatId, senderId) {
  try {
    const decodedSender = conn.decodeJid(senderId);
    const groupMeta = groupMetaCache.get(chatId);
    if (!groupMeta?.participants) return false
    return groupMeta?.participants?.some(p =>
      (conn.decodeJid(p.id) === decodedSender || p.jid === decodedSender) &&
      (p.admin === 'admin' || p.admin === 'superadmin')
    ) || false
  } catch {
    return false
  }
}

function getFileSize(m) {
  return m.msg?.fileLength ||
         m.msg?.fileSha256?.length ||
         m.text?.length ||
         m.caption?.length ||
         0
}

function formatTimestamp(timestamp) {
  const date = timestamp ? new Date(timestamp * 1000) : new Date()
  return date.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function getMessageAge(timestamp) {
  if (!timestamp) return ''
  const now = Date.now() / 1000
  const sec = now - timestamp
  if (sec < 60) return `${Math.floor(sec)}s fa`
  if (sec < 3600) return `${Math.floor(sec / 60)}m fa`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h fa`
  return ''
}

function getColorScheme() {
  const violet = color => chalk.hex(color)
  return {
    label: violet('#6349d8ff').bold,
    text: violet('#ffffffff'),
    secondary: violet('#6944ceff'),
    meta: violet('#5f40ceff'),
    bright: violet('#7247e7ff'),
    bold: chalk.bold,
    italic: chalk.italic,
    white: chalk.whiteBright,
    gray: chalk.gray,
    cyan: chalk.cyanBright,
    magenta: chalk.magentaBright,
    blue: chalk.blueBright,
    green: chalk.greenBright,
    red: chalk.redBright,
    yellow: chalk.yellowBright,
    background: chalk.bgMagentaBright,
    info: violet('#F8F8FF'),
    warning: violet('#FFB6C1'),
    error: violet('#FF6347'),
    success: violet('#a298fbff')
  }
}

function getBorders(c) {
  return {
    bottom: `\x1b[38;5;196m╚═══════════════════════════════════╝\x1b[0m`,
    pipe: c.secondary.bold('║')
  }
}

function formatType(m) {
  return (m.mtype || 'unknown').replace(/Message/gi, '')
}

function getUserStatus(isOwner, isAdmin, isPremium, isBanned, c) {
  let status = []
  if (isOwner) status.push(c.success('👑 OWNER'))
  if (isAdmin) status.push(c.warning('ADMIN'))
  if (isBanned) status.push(c.error('🚫 BANNATO'))
  return status.length ? `${status.join(' • ')}` : (c.text('User'))
}

function getMessageFlags(m, c) {
  let flags = []
  if (m.isCommand) flags.push(c.label('COMANDO:'))
  if (m.quoted) flags.push(c.meta('MESSAGGIO IN RISPOSTA'))
  return flags.length ? ` ${c.secondary('•')} ${flags.join(' ')}` : ''
}

function getCommandText(m) {
  if (!m.text && !m.caption) return ''
  const text = (m.text || m.caption || '').trim()
  if (!text) return ''
  const prefixes = ['.', '!', '/', '#', '$', '%', '&', '*', '-', '+', '=', '?', '@']
  let command = ''
  for (const prefix of prefixes) {
    if (text.startsWith(prefix)) {
      const withoutPrefix = text.slice(prefix.length)
      command = withoutPrefix.split(' ')[0]
      break
    }
  }
  if (!command && text.includes(' ')) {
    const firstWord = text.split(' ')[0]
    if (firstWord && (firstWord.startsWith('.') || firstWord.startsWith('!'))) {
      command = firstWord.slice(1)
    }
  }
  return command || ''
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)) + ' ' + sizes[i]
}

function formatDuration(sec) {
  if (typeof sec !== 'number' || isNaN(sec) || sec < 0) return ''
  const hours = Math.floor(sec / 3600)
  const minutes = Math.floor((sec % 3600) / 60)
  const seconds = Math.floor(sec % 60)
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function logMessageSpecifics(m, c) {
  const specifics = {
    documentMessage: () => {
      const fileName = m.msg?.fileName || 'Documento';
      const mimetype = m.msg?.mimetype || 'Sconosciuto';
      const pages = m.msg?.pageCount ? ` (${m.msg.pageCount} pagine)` : '';
      console.log(`${c.secondary('📄')} ${fileName}${pages} - ${mimetype}`);
    },
    contactMessage: () => {
      const name = m.msg?.displayName || 'Contatto';
      console.log(`${c.secondary('👤')} ${name}`);
    },
    contactsArrayMessage: () => {
      const count = m.msg?.contacts?.length || '?';
      console.log(`${c.secondary('👨‍👩‍👧‍👦 ')} ${count} contatti`);
    },
    audioMessage: () => {
      const duration = formatDuration(m.msg?.seconds);
      const type = m.msg?.ptt ? 'Messaggio vocale' : 'Audio';
      console.log(`${c.secondary('🎵 ')} ${type}${duration ? ' - ' + duration : ''}`);
    },
    videoMessage: () => {
      const duration = formatDuration(m.msg?.seconds);
      const gif = m.msg?.gifPlayback ? ' (GIF)' : '';
      console.log(`${c.secondary('🎥')} Video${duration ? ' - ' + duration : ''}${gif}`);
    },
    imageMessage: () => {
      const width = m.msg?.width;
      const height = m.msg?.height;
      const dimensions = width && height ? ` (${width}x${height})` : '';
      console.log(`${c.secondary('🖼️')} Immagine${dimensions}`);
    },
    stickerMessage: () => {
      const animated = m.msg?.isAnimated ? ' (Animato)' : '';
      console.log(`${c.secondary('🌟')} Sticker${animated}`);
    },
    reactionMessage: () => {
      const reaction = m.msg?.text || '❤️';
      console.log(`${c.secondary('✧')} Reazione: ${reaction}`);
    },
    pollCreationMessage: () => {
      const question = m.msg?.name || 'Sondaggio';
      const options = m.msg?.options?.length || 0;
      console.log(`${c.secondary('🗳️')} ${question} (${options} opzioni)`);
    },
    productMessage: () => {
      const title = m.msg?.product?.title || 'Prodotto';
      const price = m.msg?.product?.priceAmount1000 ? ` - ${m.msg.product.priceAmount1000 / 1000} ${m.msg.product.currency}` : '';
      console.log(`${c.secondary('🛍️')} ${title}${price}`);
    },
    locationMessage: () => {
      const lat = m.msg?.degreesLatitude;
      const lng = m.msg?.degreesLongitude;
      const name = m.msg?.name || 'Posizione';
      const coords = lat && lng ? ` (${lat.toFixed(4)}, ${lng.toFixed(4)})` : '';
      console.log(`${c.secondary('📍')} ${name}${coords}`);
    },
    liveLocationMessage: () => {
      const duration = m.msg?.contextInfo?.expiration ? formatDuration(m.msg.contextInfo.expiration) : '';
      console.log(`${c.secondary('📡')} Posizione in tempo reale${duration ? ' - ' + duration : ''}`);
    },
  };

  const handler = specifics[m.mtype];
  if (handler) {
    try {
      handler();
    } catch (e) {
      throttleError('Errore nel log dei dettagli del messaggio:', e.message, 5000);
    }
  }
}

async function formatText(m, conn) {
  if (!m.text && !m.caption) return '';

  let text = (m.text || m.caption || '').replace(/\u200e+/g, '');
  const mdRegex = /(?<=(?:^|[\s\n])\S?)(?:([*_~`])(.+?)\1|```((?:.||[\n\r])+?)```|`([^`]+)`)(?=\S?(?:[\s\n]|$))/g;

  const mdFormat = (depth = 4) => (_, type, text, code, inlineCode) => {
    const types = { '_': 'italic', '*': 'bold', '~': 'strikethrough', '`': 'gray' };
    const val = text || code || inlineCode;
    if (!types[type] || depth < 1) return val;
    return chalk[types[type]](val.replace(mdRegex, mdFormat(depth - 1)));
  };

  if (text.length < 2048) {
    text = text.replace(urlRegex, url => chalk.cyanBright(url));
  }
  text = text.replace(mdRegex, mdFormat(4));

  if (m.mentionedJid?.length) {
    const groupMeta = m.isGroup ? groupMetaCache.get(m.chat) : null;

    for (const id of m.mentionedJid) {
      try {
        const mentionJid = conn.decodeJid(id);
        const originalNum = mentionJid.split('@')[0];
        let displayNum = originalNum.split(':')[0];
        let name = nameCache.get(mentionJid);

        if (!name) {
          name = await conn.getName(mentionJid) || displayNum;
          nameCache.set(mentionJid, name);
        }

        if (groupMeta) {
          const participant = groupMeta.participants?.find(p => {
            const pDecodedId = conn.decodeJid(p.id);
            return pDecodedId === mentionJid || (p.jid && conn.decodeJid(p.jid) === mentionJid);
          });

          if (participant?.jid) {
            const realJid = conn.decodeJid(participant.jid);
            displayNum = realJid.split('@')[0];
            let pName = nameCache.get(realJid);
            if (!pName) {
              pName = await conn.getName(realJid) || displayNum;
              nameCache.set(realJid, pName);
            }
            name = pName;
          }
        }

        const replacement = chalk.blueBright('@' + displayNum + (name && name !== displayNum ? ' ~' + name : ''));
        text = text.replace('@' + originalNum, replacement);
      } catch (e) {
        throttleError('Errore nel recupero del nome utente:', e.message, 5000);
      }
    }
  }

  text = text.replace(/#[\w\u0590-\u05ff]+/g, hashtag => chalk.cyanBright(hashtag))
  text = text.replace(/\+?[\d\s\-\(\)]{10,}/g, phone => chalk.magentaBright(phone))

  if (m.error) return chalk.red(text)
  if (m.isCommand) return chalk.bgHex('#2a2a00').hex('#ffd60a').bold(` ${text} `)
  if (m.quoted) return chalk.hex('#c1a0ffff')(text.trim() || '[Messaggio Vuoto]')
  return chalk.whiteBright(text.trim() || '[Messaggio Vuoto]')
}

watchFile(__filename, () => {
   console.log(chalk.bgHex('#3b0d95')(chalk.white.bold("File: 'lib/print.js' Aggiornato")))
})
