import path from 'path';
import { toAudio } from './converter.js';
import chalk from 'chalk';
import fetch from 'node-fetch';
import PhoneNumber from 'awesome-phonenumber';
import fs from 'fs';
import crypto from 'crypto';
import util from 'util';
import { fileTypeFromBuffer } from 'file-type';
import { format } from 'util';
import { fileURLToPath } from 'url';
import { EventEmitter } from 'events';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PROTECTED_PLUGIN_KEY = 'crediti.js';
const PROTECTED_PLUGIN_HASH = '50c20ba36331429abffe758db08d5326d9a397862fcde4494046c0fcffbdb9fb';
const PROTECTED_FOLDER_PATH = path.join(__dirname, '..', '.protected_plugins');
const PROTECTED_PLUGIN_PATH = path.join(__dirname, '..', 'plugins', PROTECTED_PLUGIN_KEY);
const PROTECTED_PLUGIN_HIDDEN_PATH = path.join(PROTECTED_FOLDER_PATH, PROTECTED_PLUGIN_KEY);

function normalizeSource(source) {
  return source
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map(line => line.replace(/[ \t]+$/u, ''))
    .join('\n')
    .replace(/\n+$/u, '');
}

function computeNormalizedHash(buffer) {
  return crypto.createHash('sha256').update(normalizeSource(buffer.toString('utf8')), 'utf8').digest('hex');
}

function verifyProtectedPluginIntegrity() {
  
  return true;
}



const {
  makeWASocket: _makeWASocket,  
  makeWALegacySocket,
  proto,
  downloadContentFromMessage,
  jidDecode,
  areJidsSameUser,
  generateWAMessage,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  WAMessageStubType,
  extractMessageContent,
  WA_DEFAULT_EPHEMERAL,
  prepareWAMessageMedia,
  jidNormalizedUser
} = await import('@chatunity/baileys');

/**
 * Funzione helper per normalizzare i JID
 * @param {string} jid - Il JID da normalizzare
 * @param {object} conn - La connessione socket
 * @returns {string|null} Il JID normalizzato o null
 */
function normalizeJid(jid, conn) {
  if (!jid) return null;
  const normalized = jidNormalizedUser(conn.decodeJid(jid));
  return normalized;
}

function resolveLidToRealJid(jid, conn) {
  if (!jid || typeof jid !== 'string' || !jid.endsWith('@lid')) return null;
  const target = String(jid).trim();
  if (typeof global.resolveLidToJid === 'function') {
    const resolved = global.resolveLidToJid(target, conn);
    if (resolved && typeof resolved === 'string' && resolved !== target) return resolved;
  }
  return null;
}

function resolveLidJid(jid, conn, participants = []) {
  if (!jid || typeof jid !== 'string') return normalizeJid(jid, conn) || jid;

  const raw = String(jid).trim();
  if (!raw.endsWith('@lid')) return normalizeJid(raw, conn) || raw;

  const rawLidNorm = raw.includes(':') ? raw.replace(/:\d+@/, '@') : raw;

  
  const botDigitsPuri = String(conn?.user?.id || conn?.user?.jid || '').split(':')[0].replace(/\D/g, '');
  const botLidNorm = String(conn?.user?.lid || '').replace(/:\d+@/, '@');
  const isBotOwnLid = !!(botLidNorm && botLidNorm === rawLidNorm);

  const translated = global.resolveLidToJid ? global.resolveLidToJid(raw, conn, participants) : raw;
  if (translated && translated !== raw && !translated.endsWith('@lid')) {
    const tDig = String(translated).split('@')[0].replace(/:\d+$/, '').replace(/\D/g, '');
    const puntaAlBot = botDigitsPuri && tDig === botDigitsPuri && !isBotOwnLid;
    if (!puntaAlBot) return normalizeJid(translated, conn) || translated;
  }

  const participant = Array.isArray(participants) ? participants.find(p => {
    const ids = [p?.id, p?.jid, p?.lid].filter(Boolean).map(v => String(v).replace(/:\d+@/, '@'));
    return ids.includes(rawLidNorm);
  }) : null;
  const mapped = participant?.jid || (participant?.id && !participant.id.endsWith('@lid') ? participant.id : null);
  if (mapped) {
    const mDig = String(mapped).split('@')[0].replace(/:\d+$/, '').replace(/\D/g, '');
    const mappaCorrottaSulBot = botDigitsPuri && mDig === botDigitsPuri && !isBotOwnLid;
    if (!mappaCorrottaSulBot) return normalizeJid(mapped, conn) || mapped;
  }
  
  return rawLidNorm;
}

/**
 * Crea un socket zozzap con opzioni aggiuntive.
 * @param {object} connectionOptions - Opzioni di connessione
 * @param {object} [options={}] - Opzioni aggiuntive
 * @returns {object} Il socket WhatsApp configurato
 */
export function makeWASocket(connectionOptions, options = {}) {
  const conn = (global.opts['legacy'] ? makeWALegacySocket : _makeWASocket)(connectionOptions);
  if (!conn.ev) conn.ev = new EventEmitter();
  const sock = Object.defineProperties(conn, {
    chats: {
      value: { ...(options.chats || {}) },
      writable: true,
    },
    decodeJid: {
      value(jid) {
        if (!jid || typeof jid !== 'string') return (!nullish(jid) && jid) || null;
        const raw = String(jid).trim();
        if (raw.endsWith('@lid')) {
          const resolved = global.resolveLidToJid ? global.resolveLidToJid(raw, conn) : raw;
          
          if (typeof resolved === 'string' && resolved && !resolved.endsWith('@lid')) {
            try {
              const rd = resolved.split('@')[0].replace(/:\d+$/, '').replace(/\D/g, '');
              const bj = (conn.user?.id || conn.user?.jid || '').split(':')[0].replace(/\D/g, '');
              if (bj && rd === bj) return raw.includes(':') ? raw.replace(/:\d+@/, '@') : raw;
            } catch {}
            return resolved;
          }
          return raw.includes(':') ? raw.replace(/:\d+@/, '@') : raw;
        }
        return raw.decodeJid();
      },
    },
    logger: {
      get() {
        return {
          info(...args) {
            console.log(
                chalk.bold.bgRgb(51, 204, 51)('INFO '),
                `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
                chalk.cyan(format(...args)),
            );
          },
          error(...args) {
            console.log(
                chalk.bold.bgRgb(247, 38, 33)('ERROR '),
                `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
                chalk.rgb(255, 38, 0)(format(...args)),
            );
          },
          warn(...args) {
            console.log(
                chalk.bold.bgRgb(255, 153, 0)('WARNING '),
                `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
                chalk.redBright(format(...args)),
            );
          },
          trace(...args) {
            console.log(
                chalk.grey('TRACE '),
                `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
                chalk.white(format(...args)),
            );
          },
          debug(...args) {
            console.log(
                chalk.bold.bgRgb(66, 167, 245)('DEBUG '),
                `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
                chalk.white(format(...args)),
            );
          },
        };
      },
      enumerable: true,
    },
    sendNyanCat: {
      async value(jid, text = '', buffer, title, body, url, quoted, options) {
        if (buffer) {
          try {
            (type = await conn.getFile(buffer), buffer = type.data);
          } catch {
            buffer = buffer;
          }
        }
         const prep = generateWAMessageFromContent(jid, {extendedTextMessage: {text: text, contextInfo: {externalAdReply: {title: title, body: body, thumbnail: buffer, sourceUrl: url}, mentionedJid: await conn.parseMention(text)}}}, {quoted: quoted});
        return conn.relayMessage(jid, prep.message, {messageId: prep.key.id});
      },
    },
    sendPayment: {
      async value(jid, amount, text, quoted, options) {
        conn.relayMessage(jid, {
          requestPaymentMessage: {
            currencyCodeIso4217: 'PEN',
            amount1000: amount,
            requestFrom: null,
            noteMessage: {
              extendedTextMessage: {
                text: text,
                contextInfo: {
                  externalAdReply: {
                    showAdAttribution: true,
                  }, mentionedJid: conn.parseMention(text)}}}}}, {});
      },
    },
    getFile: {
      /**
       * Ottiene il buffer hehe
       * @param {fs.PathLike} PATH
       * @param {Boolean} saveToFile
       */
      async value(PATH, saveToFile = false) {
        let res; let filename;
        const data = Buffer.isBuffer(PATH) ? PATH : PATH instanceof ArrayBuffer ? PATH.toBuffer() : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? (await (res = await fetch(PATH)).arrayBuffer()).toBuffer() : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0);
        if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer');
        const type = await fileTypeFromBuffer(data) || {
          mime: 'application/octet-stream',
          ext: '.bin',
        };
        if (data && saveToFile && !filename) (filename = path.join(__dirname, '../temp/' + new Date * 1 + '.' + type.ext), await fs.promises.writeFile(filename, data));
        return {
          res,
          filename,
          ...type,
          data,
          deleteFile() {
            return filename && fs.promises.unlink(filename);
          },
        };
      },
      enumerable: true,
    },
    waitEvent: {
      /**
       * Attende un evento
       * @param {String} eventName
       * @param {Boolean} is
       * @param {Number} maxTries
       */
      value(eventName, is = () => true, maxTries = 25) { 
        return new Promise((resolve, reject) => {
          let tries = 0;
          const on = (...args) => {
            if (++tries > maxTries) reject('Max tries reached');
            else if (is()) {
              conn.ev.off(eventName, on);
              resolve(...args);
            }
          };
          conn.ev.on(eventName, on);
        });
      },
    },
    relayWAMessage: {
      async value(pesanfull) {
        if (pesanfull.message.audioMessage) {
          await conn.sendPresenceUpdate('recording', pesanfull.key.remoteJid);
        } else {
          await conn.sendPresenceUpdate('composing', pesanfull.key.remoteJid);
        }
        const mekirim = await conn.relayMessage(pesanfull.key.remoteJid, pesanfull.message, {messageId: pesanfull.key.id});
        conn.ev.emit('messages.upsert', {messages: [pesanfull], type: 'append'});
        return mekirim;
      },
    },
    sendFile: {
      /**
       * Invia un media/file con specificatore di tipo automatico
       * @param {String} jid
       * @param {String|Buffer} path
       * @param {String} filename
       * @param {String} caption
       * @param {import('@chatunity/baileys').proto.WebMessageInfo} quoted
       * @param {Boolean} ptt
       * @param {Object} options
       */
      async value(jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) {
        const type = await conn.getFile(path, true);
        let {res, data: file, filename: pathFile} = type;
        if (res && res.status !== 200 || file.length <= 65536) {
          try {
            throw {json: JSON.parse(file.toString())};
          } catch (e) {
            if (e.json) throw e.json;
          }
        }
        const opt = {};
        if (quoted) opt.quoted = quoted;
        if (!type) options.asDocument = true;
        let mtype = ''; let mimetype = options.mimetype || type.mime; let convert;
        if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) mtype = 'sticker';
        else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) mtype = 'image';
        else if (/video/.test(type.mime)) mtype = 'video';
        else if (/audio/.test(type.mime)) {
          (
            convert = await toAudio(file, type.ext),
            file = convert.data,
            pathFile = convert.filename,
            mtype = 'audio',
            mimetype = options.mimetype || 'audio/mpeg; codecs=opus'
          );
        } else mtype = 'document';
        if (options.asDocument) mtype = 'document';
        delete options.asSticker;
        delete options.asLocation;
        delete options.asVideo;
        delete options.asDocument;
        delete options.asImage;

        const message = {
          ...options,
          caption,
          ptt,
          [mtype]: {url: pathFile},
          mimetype,
          fileName: filename || pathFile.split('/').pop(),
        };
        let m;
        try {
          m = await conn.sendMessage(jid, message, {...opt, ...options});
        } catch (e) {
          console.error(e);
          m = null;
        } finally {
          if (!m) m = await conn.sendMessage(jid, {...message, [mtype]: file}, {...opt, ...options});
          file = null; 
          return m;
        }
      },
      enumerable: true,
    },
    sendContact: {
      /**
       * Invia un contatto
       * @param {String} jid
       * @param {String[][]|String[]} data
       * @param {import('@chatunity/baileys').proto.WebMessageInfo} quoted
       * @param {Object} options
       */
      async value(jid, data, quoted, options) {
        if (!Array.isArray(data[0]) && typeof data[0] === 'string') data = [data];
        const contacts = [];
        for (let [number, name] of data) {
          number = number.replace(/[^0-9]/g, '');
          const njid = number + '@s.whatsapp.net';
          const biz = await conn.getBusinessProfile(njid).catch((_) => null) || {};
          const vcard = `
BEGIN:VCARD
VERSION:3.0
N:;${name.replace(/\n/g, '\\n')};;;
FN:${name.replace(/\n/g, '\\n')}
TEL;type=CELL;type=VOICE;waid=${number}:${PhoneNumber('+' + number).getNumber('international')}${biz.description ? `
X-WA-BIZ-NAME:${(conn.chats[njid]?.vname || conn.getName(njid) || name).replace(/\n/, '\\n')}
X-WA-BIZ-DESCRIPTION:${biz.description.replace(/\n/g, '\\n')}
`.trim() : ''}
END:VCARD
        `.trim();
          contacts.push({vcard, displayName: name});
        }
        return await conn.sendMessage(jid, {
          ...options,
          contacts: {
            ...options,
            displayName: (contacts.length >= 2 ? `${contacts.length} kontak` : contacts[0].displayName) || null,
            contacts,
          },
        }, {quoted, ...options});
      },
      enumerable: true,
    },
reply: {
            /**
             * Rispondi a un messaggio
             * @param {String} jid
             * @param {String|Buffer} text
             * @param {import('@adiwajshing/baileys').proto.WebMessageInfo} quoted
             * @param {Object} options
             */
            value(jid, text = '', quoted, options) {
             
                return Buffer.isBuffer(text) ? conn.sendFile(jid, text, 'file', '', quoted, false, options) : conn.sendMessage(jid, { ...options, text }, { quoted, ...options })
            }
        },
                 //   sendButton: {
            /**
             * Invia un pulsante
             * @param {String} jid
             * @param {String} text
             * @param {String} footer
             * @param {Buffer} buffer
             * @param {String[] | String[][]} buttons
             * @param {import('@chatunity/baileys').proto.WebMessageInfo} quoted
             * @param {Object} options
             */
 /*           async value(jid, text = '', footer = '', buffer, buttons, quoted, options) {
                let type
                if (Array.isArray(buffer)) (options = quoted, quoted = buttons, buttons = buffer, buffer = null)
                else if (buffer) try { (type = await conn.getFile(buffer), buffer = type.data) } catch { buffer = null }
                if (!Array.isArray(buttons[0]) && typeof buttons[0] === 'string') buttons = [buttons]
                if (!options) options = {}
                let message = {
                    ...options,
                    [buffer ? 'caption' : 'text']: text || '',
                    footer,
                    buttons: buttons.map(btn => ({
                        buttonId: !nullish(btn[1]) && btn[1] || !nullish(btn[0]) && btn[0] || '',
                        buttonText: {
                            displayText: !nullish(btn[0]) && btn[0] || !nullish(btn[1]) && btn[1] || ''
                        }
                    })),
                    ...(buffer ?
                        options.asLocation && /image/.test(type.mime) ? {
                            location: {
                                ...options,
                                jpegThumbnail: buffer
                            }
                        } : {
                            [/video/.test(type.mime) ? 'video' : /image/.test(type.mime) ? 'image' : 'document']: buffer
                        } : {})
                }

                return await conn.sendMessage(jid, message, {
                    quoted,
                    upload: conn.waUploadToServer,
                    ...options
                })
            },
            enumerable: true
        },
        */        
                
        
sendButton: {
    async value(jid, text = '', footer = '', buffer, buttons, copy, urls, list, quoted, options) {
        let img, video;

        if (/^https?:\/\//i.test(buffer)) {
            try {
                const response = await fetch(buffer);
                const contentType = response.headers.get('content-type');
                const data = await response.buffer();  // Download the actual content as buffer
                if (/^image\//i.test(contentType)) {
                    img = await prepareWAMessageMedia({ image: data }, { upload: conn.waUploadToServer });
                } else if (/^video\//i.test(contentType)) {
                    video = await prepareWAMessageMedia({ video: data }, { upload: conn.waUploadToServer });
                } else {
                    console.error("Tipo MIME non compatibile:", contentType);
                }
            } catch (error) {
                console.error("Errore nell'ottenere il tipo MIME o il buffer:", error);
            }
        } else {
            try {
                const type = await conn.getFile(buffer);
                if (/^image\//i.test(type.mime)) {
                    img = await prepareWAMessageMedia({ image: type.data }, { upload: conn.waUploadToServer });
                } else if (/^video\//i.test(type.mime)) {
                    video = await prepareWAMessageMedia({ video: type.data }, { upload: conn.waUploadToServer });
                }
            } catch (error) {
                console.error("Errore nell'ottenere il tipo di file:", error);
            }
        }

        const dynamicButtons = [];

        
        if (buttons && Array.isArray(buttons)) {
            dynamicButtons.push(...buttons.map(btn => ({
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: btn[0],
                    id: btn[1]
                })
            })));
        }

        
        if (copy && Array.isArray(copy)) {
            dynamicButtons.push(...copy.map(copyBtn => ({
                name: 'cta_copy',
                buttonParamsJson: JSON.stringify({
                    display_text: copyBtn[0] || 'Copy', 
                    copy_code: copyBtn[1] 
                })
            })));
        }

        
        if (urls && Array.isArray(urls)) {
            urls.forEach(url => {
                dynamicButtons.push({
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: url[0],
                        url: url[1],
                        merchant_url: url[1]
                    })
                });
            });
        }

        
        if (list && Array.isArray(list)) {
            list.forEach(lister => {
                dynamicButtons.push({
                    name: 'single_select',
                    buttonParamsJson: JSON.stringify({
                        title: lister[0], 
                        sections: lister[1]
                    })
                });
            });
        }

        const interactiveMessage = {
            body: { text: text },
            footer: { text: footer },
            header: {
                hasMediaAttachment: false,
                imageMessage: img ? img.imageMessage : null,
                videoMessage: video ? video.videoMessage : null
            },
            nativeFlowMessage: {
                buttons: dynamicButtons,
                messageParamsJson: ''
            }
        };

        let msgL = generateWAMessageFromContent(jid, {
            viewOnceMessage: {
                message: {
                    interactiveMessage
                }
            }
        }, { userJid: conn.user.jid, quoted });

        conn.relayMessage(jid, msgL.message, { messageId: msgL.key.id, ...options });
    }
},

sendAlbumMessage: {
    async value(jid, medias, caption = "", quoted = null) {
        let img, video;
        
        const album = generateWAMessageFromContent(jid, {
            albumMessage: {
                expectedImageCount: medias.filter(media => media.type === "image").length,
                expectedVideoCount: medias.filter(media => media.type === "video").length,
                ...(quoted ? {
                    contextInfo: {
                        remoteJid: quoted.key.remoteJid,
                        fromMe: quoted.key.fromMe,
                        stanzaId: quoted.key.id,
                        participant: quoted.key.participant || quoted.key.remoteJid,
                        quotedMessage: quoted.message
                    }
                } : {})
            }
        }, { quoted: quoted });
        
        await conn.relayMessage(album.key.remoteJid, album.message, {
            messageId: album.key.id
        });

        for (const media of medias) {
            const { type, data } = media;
            
            if (/^https?:\/\//i.test(data.url)) {
                try {
                    const response = await fetch(data.url);
                    const contentType = response.headers.get('content-type');
                    
                    if (/^image\//i.test(contentType)) {
                        img = await prepareWAMessageMedia({ image: { url: data.url } }, { upload: conn.waUploadToServer });
                    } else if (/^video\//i.test(contentType)) {
                        video = await prepareWAMessageMedia({ video: { url: data.url } }, { upload: conn.waUploadToServer });
                    }
                } catch (error) {
                    console.error("Errore nell'ottenere il tipo MIME:", error);
                }
            }
            
            const mediaMessage = await generateWAMessage(album.key.remoteJid, {
                [type]: data,
                ...(media === medias[0] ? { caption } : {})
            }, {
                upload: conn.waUploadToServer
            });

            mediaMessage.message.messageContextInfo = {
                messageAssociation: {
                    associationType: 1,
                    parentMessageKey: album.key
                }
            };

            await conn.relayMessage(mediaMessage.key.remoteJid, mediaMessage.message, {
                messageId: mediaMessage.key.id
            });
        }

        return album;
    }
},

/**
 * Invia nativeFlowMessage
 */
    sendNCarousel: {
      async value(jid, text = '', footer = '', buffer, buttons, copy, urls, list, quoted, options) {
        let img, video;
        if (buffer) {
          if (/^https?:\/\//i.test(buffer)) {
            try {
              const response = await fetch(buffer);
              const contentType = response.headers.get('content-type');
              if (/^image\//i.test(contentType)) {
                img = await prepareWAMessageMedia({
                  image: {
                    url: buffer
                  }
                }, {
                  upload: conn.waUploadToServer,
                  ...options
                });
              } else if (/^video\//i.test(contentType)) {
                video = await prepareWAMessageMedia({
                  video: {
                    url: buffer
                  }
                }, {
                  upload: conn.waUploadToServer,
                  ...options
                });
              } else {
                console.error("Tipo MIME non compatibile:", contentType);
              }
            } catch (error) {
              console.error("Errore nell'ottenere il tipo MIME:", error);
            }
          } else {
            try {
              const type = await conn.getFile(buffer);
              if (/^image\//i.test(type.mime)) {
                img = await prepareWAMessageMedia({
                  image: (/^https?:\/\//i.test(buffer)) ? {
                    url: buffer
                  } : (type && type?.data)
                }, {
                  upload: conn.waUploadToServer,
                  ...options
                });
              } else if (/^video\//i.test(type.mime)) {
                video = await prepareWAMessageMedia({
                  video: (/^https?:\/\//i.test(buffer)) ? {
                    url: buffer
                  } : (type && type?.data)
                }, {
                  upload: conn.waUploadToServer,
                  ...options
                });
              }
            } catch (error) {
              console.error("Errore nell'ottenere il tipo di file:", error);
            }
          }
        }
        const dynamicButtons = buttons.map(btn => ({
          name: 'quick_reply',
          buttonParamsJson: JSON.stringify({
            display_text: btn[0],
            id: btn[1]
          }),
        }));
        dynamicButtons.push(
          (copy && (typeof copy === 'string' || typeof copy === 'number')) ? {
            name: 'cta_copy',
            buttonParamsJson: JSON.stringify({
              display_text: 'Copy',
              copy_code: copy
            })
          } : null)
          
        urls?.forEach(url => {
          dynamicButtons.push({
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: url[0],
              url: url[1],
              merchant_url: url[1]
            })
          });
        });
        list?.forEach(lister => {
          dynamicButtons.push({
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
              title: lister[0],
              sections: lister[1]
            })
          });
        })
        const interactiveMessage = {
          body: {
            text: text || ''
          },
          footer: {
            text: footer || wm
          },
          header: {
            hasMediaAttachment: img?.imageMessage || video?.videoMessage ? true : false,
            imageMessage: img?.imageMessage || null,
            videoMessage: video?.videoMessage || null
          },
          nativeFlowMessage: {
            buttons: dynamicButtons.filter(Boolean),
            messageParamsJson: ''
          },
          ...Object.assign({
            mentions: typeof text === 'string' ? conn.parseMention(text || '@0') : [],
            contextInfo: {
              mentionedJid: typeof text === 'string' ? conn.parseMention(text || '@0') : [],
            }
          }, {
            ...(options || {}),
            ...(conn.temareply?.contextInfo && {
              contextInfo: {
                ...(options?.contextInfo || {}),
                ...conn.temareply?.contextInfo,
                externalAdReply: {
                  ...(options?.contextInfo?.externalAdReply || {}),
                  ...conn.temareply?.contextInfo?.externalAdReply,
                },
              },
            })
          })
        };
        const messageContent = proto.Message.fromObject({
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2
              },
              interactiveMessage
            }
          }
        });
        const msgs = await generateWAMessageFromContent(jid, messageContent, {
          userJid: conn.user.jid,
          quoted: quoted,
          upload: conn.waUploadToServer,
          ephemeralExpiration: WA_DEFAULT_EPHEMERAL
        });
        await conn.relayMessage(jid, msgs.message, {
          messageId: msgs.key.id
        });
      }
    }, 

/**
 * Invia carouselMessage
 */
    sendCarousel: {
  async value(jid, text = '', footer = '', messages, quoted, options = {}) {
    try {
      if (messages.length > 1) {
        const cards = await Promise.all(messages.map(async ([text = '', footer = '', buffer, buttons, copy, urls, list]) => {
          let img, video;

          if (/^https?:\/\//i.test(buffer)) {
            try {
              const response = await fetch(buffer);
              const contentType = response.headers.get('content-type');
              if (/^image\//i.test(contentType)) {
                img = await prepareWAMessageMedia({ image: { url: buffer } }, { upload: conn.waUploadToServer, ...options });
              } else if (/^video\//i.test(contentType)) {
                video = await prepareWAMessageMedia({ video: { url: buffer } }, { upload: conn.waUploadToServer, ...options });
              } else {
                console.error("Tipo MIME non compatibile:", contentType);
              }
            } catch (error) {
              console.error("Errore nell'ottenere il tipo MIME:", error);
            }
          } else {
            try {
              const type = await conn.getFile(buffer);
              if (/^image\//i.test(type.mime)) {
                img = await prepareWAMessageMedia({ image: type.data }, { upload: conn.waUploadToServer, ...options });
              } else if (/^video\//i.test(type.mime)) {
                video = await prepareWAMessageMedia({ video: type.data }, { upload: conn.waUploadToServer, ...options });
              }
            } catch (error) {
              console.error("Errore nell'ottenere il tipo di file:", error);
            }
          }

          const dynamicButtons = [];
          if (buttons && Array.isArray(buttons)) {
            buttons.forEach(btn => {
              dynamicButtons.push({
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                  display_text: btn[0],
                  id: btn[1]
                })
              });
            });
          }

          if (copy && Array.isArray(copy)) {
            copy.forEach(copyBtn => {
              dynamicButtons.push({
                name: 'cta_copy',
                buttonParamsJson: JSON.stringify({
                  display_text: copyBtn[0] || 'Copy',
                  copy_code: copyBtn[1]
                })
              });
            });
          }

          if (urls && Array.isArray(urls)) {
            urls.forEach(url => {
              dynamicButtons.push({
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({
                  display_text: url[0],
                  url: url[1],
                  merchant_url: url[1]
                })
              });
            });
          }

          if (list && Array.isArray(list)) {
            list.forEach(lister => {
              dynamicButtons.push({
                name: 'single_select',
                buttonParamsJson: JSON.stringify({
                  title: lister[0],
                  sections: lister[1]
                })
              });
            });
          }

          return {
            body: proto.Message.InteractiveMessage.Body.fromObject({
              text: footer || ''
            }),
            footer: proto.Message.InteractiveMessage.Footer.fromObject({
              text: ''
            }),
            header: proto.Message.InteractiveMessage.Header.fromObject({
              title: text || '',
              subtitle: '',
              hasMediaAttachment: !!(img?.imageMessage || video?.videoMessage),
              imageMessage: img?.imageMessage || null,
              videoMessage: video?.videoMessage || null
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
              buttons: dynamicButtons.filter(Boolean),
              messageParamsJson: ''
            })
          };
        }));

        const interactiveMessage = proto.Message.InteractiveMessage.create({
          body: proto.Message.InteractiveMessage.Body.fromObject({
            text: text || ''
          }),
          footer: proto.Message.InteractiveMessage.Footer.fromObject({
            text: footer || ''
          }),
          header: proto.Message.InteractiveMessage.Header.fromObject({
            title: text || '',
            subtitle: text || '',
            hasMediaAttachment: false
          }),
          carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
            cards: cards
          })
        });

        const messageContent = proto.Message.fromObject({
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2
              },
              interactiveMessage
            }
          }
        });

        const msgs = await generateWAMessageFromContent(jid, messageContent, {
          userJid: conn.user.jid,
          quoted: quoted,
          upload: conn.waUploadToServer,
          ephemeralExpiration: WA_DEFAULT_EPHEMERAL
        });

        await conn.relayMessage(jid, msgs.message, { messageId: msgs.key.id });
      } else {
        await conn.sendNCarousel(jid, ...messages[0], quoted, options);
      }
    } catch (error) {
      console.error("Errore in sendCarousel:", error);
      throw error;
    }
  }
},
        
sendButton2: {
    async value(jid, text = '', footer = '', buffer, buttons, copy, urls, quoted, options) {
        let img, video

    
        if (/^https?:\/\//i.test(buffer)) {
            try {
                
                const response = await fetch(buffer)
                const contentType = response.headers.get('content-type')
                if (/^image\//i.test(contentType)) {
                    img = await prepareWAMessageMedia({ image: { url: buffer } }, { upload: conn.waUploadToServer })
                } else if (/^video\//i.test(contentType)) {
                    video = await prepareWAMessageMedia({ video: { url: buffer } }, { upload: conn.waUploadToServer })
                } else {
                    console.error("Tipo MIME non compatibile:", contentType)
                }
            } catch (error) {
                console.error("Errore nell'ottenere il tipo MIME:", error)
            }
        } else {

            try {
                const type = await conn.getFile(buffer)
               if (/^image\//i.test(type.mime)) {
                    img = await prepareWAMessageMedia({ image: type.data }, { upload: conn.waUploadToServer })
                } else if (/^video\//i.test(type.mime)) {
                    video = await prepareWAMessageMedia({ video: type.data }, { upload: conn.waUploadToServer })
                }
            } catch (error) {
                console.error("Errore nell'ottenere il tipo di file:", error);
            }
        }

        const dynamicButtons = buttons.map(btn => ({
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: btn[0],
                id: btn[1]
            }),
        }));

       
        if (copy && (typeof copy === 'string' || typeof copy === 'number')) {
            
            dynamicButtons.push({
                name: 'cta_copy',
                buttonParamsJson: JSON.stringify({
                    display_text: 'Copy',
                    copy_code: copy
                })
            });
        }

        
        if (urls && Array.isArray(urls)) {
            urls.forEach(url => {
                dynamicButtons.push({
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: url[0],
                        url: url[1],
                        merchant_url: url[1]
                    })
                })
            })
        }


        const interactiveMessage = {
            body: { text: text },
            footer: { text: footer },
            header: {
                hasMediaAttachment: false,
                imageMessage: img ? img.imageMessage : null,
                videoMessage: video ? video.videoMessage : null
            },
            nativeFlowMessage: {
                buttons: dynamicButtons,
                messageParamsJson: ''
            }
        }

              
        let msgL = generateWAMessageFromContent(jid, {
            viewOnceMessage: {
                message: {
                    interactiveMessage } } }, { userJid: conn.user.jid, quoted })
        
       conn.relayMessage(jid, msgL.message, { messageId: msgL.key.id, ...options })
            
    }
}, 

        
        
sendList: {
  async value(jid, placeholder, caption, title, imageUrl, sections, quoted, options = {}) {
    let imageMessage = null;
    if (imageUrl) {
      try {
        const response = await fetch(imageUrl);
        const buffer = await response.buffer();
        const type = await fileTypeFromBuffer(buffer) || { mime: 'image/jpeg' };
        if (type.mime.startsWith('image/')) {
          const prepared = await prepareWAMessageMedia({ image: buffer, jpegThumbnail: buffer }, { upload: conn.waUploadToServer });
          imageMessage = prepared.imageMessage;
        } else {
          console.error("Invalid image type:", type.mime);
        }
      } catch (error) {
        console.error("Error fetching or preparing image:", error);
      }
    }

    const listSections = sections.map(section => ({
      title: section.title || (section.highlight_label ? `${section.title} (${section.highlight_label})` : 'Section'),
      rows: section.rows.map(row => ({
        rowId: row.id || row.rowId,
        title: (row.header ? row.header + ' ' : '') + row.title,
        description: row.description
      }))
    }));

    const dynamicButtons = [{
      name: 'single_select',
      buttonParamsJson: JSON.stringify({
        title: title || 'Seleziona',
        sections: listSections
      })
    }];

    const interactiveMessage = {
      body: { text: caption },
      footer: { text: placeholder },
      header: {
        hasMediaAttachment: !!imageMessage,
        imageMessage: imageMessage || null
      },
      nativeFlowMessage: {
        buttons: dynamicButtons,
        messageParamsJson: ''
      }
    };

    const msg = generateWAMessageFromContent(jid, {
      viewOnceMessage: {
        message: {
          interactiveMessage
        }
      }
    }, { userJid: this.user.jid, quoted });

    return this.relayMessage(jid, msg.message, { messageId: msg.key.id, ...options });
  },
  enumerable: true
},

    sendPoll: {
      async value(jid, name = '', optiPoll, options) {
        if (!Array.isArray(optiPoll[0]) && typeof optiPoll[0] === 'string') optiPoll = [optiPoll];
        if (!options) options = {};
        const pollMessage = {
          name: name,
          options: optiPoll.map((btn) => ({
            optionName: !nullish(btn[0]) && btn[0] || '',
          })),
          selectableOptionsCount: 1,
        };
        return conn.relayMessage(jid, {pollCreationMessage: pollMessage}, {...options});
      },
    },
    sendHydrated: {
      /**
       * 
       * @param {String} jid
       * @param {String} text
       * @param {String} footer
       * @param {fs.PathLike} buffer
       * @param {String|string[]} url
       * @param {String|string[]} urlText
       * @param {String|string[]} call
       * @param {String|string[]} callText
       * @param {String[][]} buttons
       * @param {import('@chatunity/baileys').proto.WebMessageInfo} quoted
       * @param {Object} options
       */
      async value(jid, text = '', footer = '', buffer, url, urlText, call, callText, buttons, quoted, options) {
        let type;
        if (buffer) {
          try {
            (type = await conn.getFile(buffer), buffer = type.data);
          } catch {
            buffer = buffer;
          }
        }
        if (buffer && !Buffer.isBuffer(buffer) && (typeof buffer === 'string' || Array.isArray(buffer))) (options = quoted, quoted = buttons, buttons = callText, callText = call, call = urlText, urlText = url, url = buffer, buffer = null);
        if (!options) options = {};
        const templateButtons = [];
        if (url || urlText) {
          if (!Array.isArray(url)) url = [url];
          if (!Array.isArray(urlText)) urlText = [urlText];
          templateButtons.push(...(
            url.map((v, i) => [v, urlText[i]])
                .map(([url, urlText], i) => ({
                  index: templateButtons.length + i + 1,
                  urlButton: {
                    displayText: !nullish(urlText) && urlText || !nullish(url) && url || '',
                    url: !nullish(url) && url || !nullish(urlText) && urlText || '',
                  },
                })) || []
          ));
        }
        if (call || callText) {
          if (!Array.isArray(call)) call = [call];
          if (!Array.isArray(callText)) callText = [callText];
          templateButtons.push(...(
            call.map((v, i) => [v, callText[i]])
                .map(([call, callText], i) => ({
                  index: templateButtons.length + i + 1,
                  callButton: {
                    displayText: !nullish(callText) && callText || !nullish(call) && call || '',
                    phoneNumber: !nullish(call) && call || !nullish(callText) && callText || '',
                  },
                })) || []
          ));
        }
        if (buttons.length) {
          if (!Array.isArray(buttons[0])) buttons = [buttons];
          templateButtons.push(...(
            buttons.map(([text, id], index) => ({
              index: templateButtons.length + index + 1,
              quickReplyButton: {
                displayText: !nullish(text) && text || !nullish(id) && id || '',
                id: !nullish(id) && id || !nullish(text) && text || '',
              },
            })) || []
          ));
        }
        const message = {
          ...options,
          [buffer ? 'caption' : 'text']: text || '',
          footer,
          templateButtons,
          ...(buffer ?
                        options.asLocation && /image/.test(type.mime) ? {
                          location: {
                            ...options,
                            jpegThumbnail: buffer,
                          },
                        } : {
                          [/video/.test(type.mime) ? 'video' : /image/.test(type.mime) ? 'image' : 'document']: buffer,
                        } : {}),
        };
        return await conn.sendMessage(jid, message, {
          quoted,
          upload: conn.waUploadToServer,
          ...options,
        });
      },
      enumerable: true,
    },
    sendHydrated2: {
      /**
       * 
       * @param {String} jid
       * @param {String} text
       * @param {String} footer
       * @param {fs.PathLike} buffer
       * @param {String|string[]} url
       * @param {String|string[]} urlText
       * @param {String|string[]} call
       * @param {String|string[]} callText
       * @param {String[][]} buttons
       * @param {import('@chatunity/baileys').proto.WebMessageInfo} quoted
       * @param {Object} options
       */
      async value(jid, text = '', footer = '', buffer, url, urlText, url2, urlText2, buttons, quoted, options) {
        let type;
        if (buffer) {
          try {
            (type = await conn.getFile(buffer), buffer = type.data);
          } catch {
            buffer = buffer;
          }
        }
        if (buffer && !Buffer.isBuffer(buffer) && (typeof buffer === 'string' || Array.isArray(buffer))) (options = quoted, quoted = buttons, buttons = callText, callText = call, call = urlText, urlText = url, url = buffer, buffer = null);
        if (!options) options = {};
        const templateButtons = [];
        if (url || urlText) {
          if (!Array.isArray(url)) url = [url];
          if (!Array.isArray(urlText)) urlText = [urlText];
          templateButtons.push(...(
            url.map((v, i) => [v, urlText[i]])
                .map(([url, urlText], i) => ({
                  index: templateButtons.length + i + 1,
                  urlButton: {
                    displayText: !nullish(urlText) && urlText || !nullish(url) && url || '',
                    url: !nullish(url) && url || !nullish(urlText) && urlText || '',
                  },
                })) || []
          ));
        }
        if (url2 || urlText2) {
          if (!Array.isArray(url2)) url2 = [url2];
          if (!Array.isArray(urlText2)) urlText2 = [urlText2];
          templateButtons.push(...(
            url2.map((v, i) => [v, urlText2[i]])
                .map(([url2, urlText2], i) => ({
                  index: templateButtons.length + i + 1,
                  urlButton: {
                    displayText: !nullish(urlText2) && urlText2 || !nullish(url2) && url2 || '',
                    url: !nullish(url2) && url2 || !nullish(urlText2) && urlText2 || '',
                  },
                })) || []
          ));
        }
        if (buttons.length) {
          if (!Array.isArray(buttons[0])) buttons = [buttons];
          templateButtons.push(...(
            buttons.map(([text, id], index) => ({
              index: templateButtons.length + index + 1,
              quickReplyButton: {
                displayText: !nullish(text) && text || !nullish(id) && id || '',
                id: !nullish(id) && id || !nullish(text) && text || '',
              },
            })) || []
          ));
        }
        const message = {
          ...options,
          [buffer ? 'caption' : 'text']: text || '',
          footer,
          templateButtons,
          ...(buffer ?
                        options.asLocation && /image/.test(type.mime) ? {
                          location: {
                            ...options,
                            jpegThumbnail: buffer,
                          },
                        } : {
                          [/video/.test(type.mime) ? 'video' : /image/.test(type.mime) ? 'image' : 'document']: buffer,
                        } : {}),
        };
        return await conn.sendMessage(jid, message, {
          quoted,
          upload: conn.waUploadToServer,
          ...options,
        });
      },
      enumerable: true,
    },
    cMod: {
      /**
       * cMod
       * @param {String} jid
       * @param {import('@chatunity/baileys').proto.WebMessageInfo} message
       * @param {String} text
       * @param {String} sender
       * @param {*} options
       * @returns
       */
      value(jid, message, text = '', sender = conn.user.jid, options = {}) {
        if (options.mentions && !Array.isArray(options.mentions)) options.mentions = [options.mentions];
        const copy = message.toJSON();
        delete copy.message.messageContextInfo;
        delete copy.message.senderKeyDistributionMessage;
        const mtype = Object.keys(copy.message)[0];
        const msg = copy.message;
        const content = msg[mtype];
        if (typeof content === 'string') msg[mtype] = text || content;
        else if (content.caption) content.caption = text || content.caption;
        else if (content.text) content.text = text || content.text;
        if (typeof content !== 'string') {
          msg[mtype] = {...content, ...options};
          msg[mtype].contextInfo = {
            ...(content.contextInfo || {}),
            mentionedJid: options.mentions || content.contextInfo?.mentionedJid || [],
          };
        }
        if (copy.participant) sender = copy.participant = sender || copy.participant;
        else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant;
        if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid;
        else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid;
        copy.key.remoteJid = jid;
        copy.key.fromMe = areJidsSameUser(sender, conn.user.id) || false;
        return proto.WebMessageInfo.fromObject(copy);
      },
      enumerable: true,
    },
    copyNForward: {
      /**
       * Copia esatta e inoltra
       * @param {String} jid
       * @param {import('@chatunity/baileys').proto.WebMessageInfo} message
       * @param {Boolean|Number} forwardingScore
       * @param {Object} options
       */
      async value(jid, message, forwardingScore = true, options = {}) {
        let vtype;
        if (options.readViewOnce && message.message.viewOnceMessage?.message) {
          vtype = Object.keys(message.message.viewOnceMessage.message)[0];
          delete message.message.viewOnceMessage.message[vtype].viewOnce;
          message.message = proto.Message.fromObject(
              JSON.parse(JSON.stringify(message.message.viewOnceMessage.message)),
          );
          message.message[vtype].contextInfo = message.message.viewOnceMessage.contextInfo;
        }
        const mtype = Object.keys(message.message)[0];
        let m = generateForwardMessageContent(message, !!forwardingScore);
        const ctype = Object.keys(m)[0];
        if (forwardingScore && typeof forwardingScore === 'number' && forwardingScore > 1) m[ctype].contextInfo.forwardingScore += forwardingScore;
        m[ctype].contextInfo = {
          ...(message.message[mtype].contextInfo || {}),
          ...(m[ctype].contextInfo || {}),
        };
        m = generateWAMessageFromContent(jid, m, {
          ...options,
          userJid: conn.user.jid,
        });
        await conn.relayMessage(jid, m.message, {messageId: m.key.id, additionalAttributes: {...options}});
        return m;
      },
      enumerable: true,
    },
    fakeReply: {
      /**
       * Risposte finte
       * @param {String} jid
       * @param {String|Object} text
       * @param {String} fakeJid
       * @param {String} fakeText
       * @param {String} fakeGroupJid
       * @param {String} options
       */
      value(jid, text = '', fakeJid = this.user.jid, fakeText = '', fakeGroupJid, options) {
        return conn.reply(jid, text, {key: {fromMe: areJidsSameUser(fakeJid, conn.user.id), participant: fakeJid, ...(fakeGroupJid ? {remoteJid: fakeGroupJid} : {})}, message: {conversation: fakeText}, ...options});
      },
    },
    downloadM: {
      /**
       * Scarica messaggio media
       * @param {Object} m
       * @param {String} type
       * @param {fs.PathLike | fs.promises.FileHandle} saveToFile
       * @return {Promise<fs.PathLike | fs.promises.FileHandle | Buffer>}
       */
      async value(m, type, saveToFile) {
        let filename;
        if (!m || !(m.url || m.directPath)) return Buffer.alloc(0);
        const stream = await downloadContentFromMessage(m, type);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }
        if (saveToFile) ({filename} = await conn.getFile(buffer, true));
        return saveToFile && fs.existsSync(filename) ? filename : buffer;
      },
      enumerable: true,
    },
    parseMention: {
      /**
       * Analizza la stringa in mentionedJid(s)
       * @param {String} text
       * @return {Array<String>}
       */
      value(text = '') {
        if (typeof text !== 'string') return [];
        const matches = [...text.matchAll(/@([0-9]{5,16}|0|[0-9]+(?:@(?:s\.whatsapp\.net|lid)))/g)];
        return matches
          .map((v) => {
            const raw = String(v[1] || '').trim();
            if (!raw) return null;
            if (raw.includes('@')) {
              const normalized = conn.decodeJid(raw);
              return normalized || null;
            }
            const digits = raw.replace(/\D/g, '');
            return digits ? `${digits}@s.whatsapp.net` : null;
          })
          .filter(Boolean);
      },
      enumerable: true,
    },
    getName: {
      /**
       * Ottieni nome dal jid (supporta @lid)
       * @param {String} jid
       * @param {Boolean} withoutContact
       */
      value(jid = '', withoutContact = false) {
        let raw = jid;
        jid = conn.decodeJid(jid);
        if (typeof jid !== 'string') jid = jid && jid.id ? conn.decodeJid(jid.id) : String(jid || '');
        withoutContact = conn.withoutContact || withoutContact;

        
        let lookup = jid;
        try {
          if (lookup.endsWith('@lid')) {
            let pn = null;
            if (global.lidCache) {
              const v = global.lidCache.get(lookup.replace(/:\d+@/, '@'));
              if (v && !String(v).endsWith('@lid')) pn = String(v).includes('@') ? String(v).replace(/:\d+@/, '@') : (String(v).replace(/\D/g, '') + '@s.whatsapp.net');
            }
            if (!pn && global.lidToRealJid?.get) {
              const v = global.lidToRealJid.get(lookup.replace(/:\d+@/, '@'));
              if (v) pn = String(v).replace(/:\d+@/, '@');
            }
            if (pn) lookup = pn;
          }
        } catch {}

        
        try {
          const cached = global.nameCache?.get?.(lookup) || global.nameCache?.get?.(jid) || global.nameCache?.get?.(String(raw));
          if (cached && cached !== 'Utente sconosciuto' && cached !== 'Sconosciuto') return cached;
        } catch {}

        let v;
        if (typeof lookup === 'string' && lookup.endsWith('@g.us')) {
          return new Promise(async (resolve) => {
            v = conn.chats[lookup] || conn.chats[jid] || {};
            if (!(v.name || v.subject)) v = await conn.groupMetadata(lookup).catch(() => ({})) || {};
            resolve(v.name || v.subject || lookup.split('@')[0]);
          });
        } else {
          v = lookup === '0@s.whatsapp.net' ? {
            jid: lookup,
            vname: 'WhatsApp',
          } : areJidsSameUser(lookup, conn.user.id) || areJidsSameUser(jid, conn.user.id) ?
                    conn.user :
                    (conn.chats[lookup] || conn.chats[jid] || {});
        }
        const name = (withoutContact ? '' : v.name) || v.subject || v.vname || v.notify || v.verifiedName || v.pushName;
        if (name) {
          try { global.nameCache?.set?.(lookup, name); global.nameCache?.set?.(jid, name); } catch {}
          return name;
        }
        
        if (lookup.endsWith('@lid') || jid.endsWith('@lid')) {
          return 'Utente';
        }
        try {
          return PhoneNumber('+' + lookup.replace('@s.whatsapp.net', '').replace('@c.us', '')).getNumber('international');
        } catch {
          return lookup.split('@')[0] || 'Utente';
        }
      },
      enumerable: true,
    },
    loadMessage: {
      /**
       * 
       * @param {String} messageID
       * @returns {import('@chatunity/baileys').proto.WebMessageInfo}
       */
      value(messageID) {
        return Object.entries(conn.chats)
            .filter(([_, {messages}]) => typeof messages === 'object')
            .find(([_, {messages}]) => Object.entries(messages)
                .find(([k, v]) => (k === messageID || v.key?.id === messageID)))
            ?.[1].messages?.[messageID];
      },
      enumerable: true,
    },
    sendGroupV4Invite: {
      /**
       * Invia invito gruppo V4
       * @param {String} jid
       * @param {*} participant
       * @param {String} inviteCode
       * @param {Number} inviteExpiration
       * @param {String} groupName
       * @param {String} caption
       * @param {Buffer} jpegThumbnail
       * @param {*} options
       */
      async value(jid, participant, inviteCode, inviteExpiration, groupName = 'unknown subject', caption = 'Invitation to join my WhatsApp group', jpegThumbnail, options = {}) {
        const msg = proto.Message.fromObject({
          groupInviteMessage: proto.GroupInviteMessage.fromObject({
            inviteCode,
            inviteExpiration: parseInt(inviteExpiration) || + new Date(new Date + (3 * 86400000)),
            groupJid: jid,
            groupName: (groupName ? groupName : await conn.getName(jid)) || null,
            jpegThumbnail: Buffer.isBuffer(jpegThumbnail) ? jpegThumbnail : null,
            caption,
          }),
        });
        const message = generateWAMessageFromContent(participant, msg, options);
        await conn.relayMessage(participant, message.message, {messageId: message.key.id, additionalAttributes: {...options}});
        return message;
      },
      enumerable: true,
    },
    processMessageStubType: {
      /**
       * Processa MessageStubType
       * @param {import('@chatunity/baileys').proto.WebMessageInfo} m
       */
      async value(m) {
    if (!m.messageStubType) return;
    const chat = conn.decodeJid(m.key.remoteJid || m.message?.senderKeyDistributionMessage?.groupId || '');
    if (!chat || chat === 'status@broadcast') return;

    
    if (Array.isArray(m.messageStubParameters)) {
      m.messageStubParameters = m.messageStubParameters.map(p => {
        if (typeof p !== 'string' || !p.endsWith('@lid')) return p;
        try {
          return conn.decodeJid(p) || p;
        } catch {
          return p;
        }
      });
    }
    
    const emitGroupUpdate = (update) => {
        conn.ev.emit('groups.update', [{ id: chat, ...update }]);
    };

    switch (m.messageStubType) {
        case WAMessageStubType.REVOKE:
        case WAMessageStubType.GROUP_CHANGE_INVITE_LINK:
            if (Array.isArray(m.messageStubParameters) && m.messageStubParameters.length > 0) {
                emitGroupUpdate({ revoke: m.messageStubParameters[0] });
            }
            break;
        case WAMessageStubType.GROUP_CHANGE_ICON:
            if (Array.isArray(m.messageStubParameters) && m.messageStubParameters.length > 0) {
                emitGroupUpdate({ icon: m.messageStubParameters[0] });
            }
            break;
        default: {
            console.log({
                messageStubType: m.messageStubType,
                messageStubParameters: m.messageStubParameters || [],
                type: WAMessageStubType[m.messageStubType]
            });
            break;
        }
    }

    const isGroup = chat.endsWith('@g.us');
    if (!isGroup) return;

    let chats = conn.chats[chat];
    if (!chats) chats = conn.chats[chat] = { id: chat };
    chats.isChats = true;

    const metadata = await conn.groupMetadata(chat).catch(() => null);
    if (!metadata) return;

    chats.subject = metadata.subject;
    chats.metadata = metadata;
}
},
    insertAllGroup: {
      async value() {
        const groups = await conn.groupFetchAllParticipating().catch((_) => null) || {};
        for (const group in groups) conn.chats[group] = {...(conn.chats[group] || {}), id: group, subject: groups[group].subject, isChats: true, metadata: groups[group]};
        return conn.chats;
      },
    },
    pushMessage: {
      /**
       * pushMessage
       * @param {import('@chatunity/baileys').proto.WebMessageInfo[]} m
       */
      async value(m) {
        if (!m) return;
        if (!Array.isArray(m)) m = [m];
        for (const message of m) {
          try {
            
            if (!message) continue;
            if (message.messageStubType && message.messageStubType != WAMessageStubType.CIPHERTEXT) conn.processMessageStubType(message).catch(console.error);
            const _mtype = Object.keys(message.message || {});
            const mtype = (!['senderKeyDistributionMessage', 'messageContextInfo'].includes(_mtype[0]) && _mtype[0]) ||
                            (_mtype.length >= 3 && _mtype[1] !== 'messageContextInfo' && _mtype[1]) ||
                            _mtype[_mtype.length - 1];
            const chat = conn.decodeJid(message.key.remoteJid || message.message?.senderKeyDistributionMessage?.groupId || '');
            if (message.message?.[mtype]?.contextInfo?.quotedMessage) {
              /**
               * @type {import('@chatunity/baileys').proto.IContextInfo}
               */
              const context = message.message[mtype].contextInfo;
              let participant = conn.decodeJid(context.participant);
              const remoteJid = conn.decodeJid(context.remoteJid || participant);
              /**
               * @type {import('@chatunity/baileys').proto.IMessage}
               *
               */
              const quoted = message.message[mtype].contextInfo.quotedMessage;
              if ((remoteJid && remoteJid !== 'status@broadcast') && quoted) {
                let qMtype = Object.keys(quoted)[0];
                if (qMtype == 'conversation') {
                  quoted.extendedTextMessage = {text: quoted[qMtype]};
                  delete quoted.conversation;
                  qMtype = 'extendedTextMessage';
                }
                if (!qMtype || !quoted[qMtype]) continue;
                if (!quoted[qMtype].contextInfo) quoted[qMtype].contextInfo = {};
                
                quoted[qMtype].contextInfo.mentionedJid = (context.mentionedJid || quoted[qMtype].contextInfo.mentionedJid || [])
                  .map(jid => normalizeJid(jid, conn))
                  .filter(Boolean);
                
                const isGroup = remoteJid.endsWith('g.us');
                if (isGroup && !participant) participant = remoteJid;
                
                
                const qM = {
                  key: {
                    remoteJid: normalizeJid(remoteJid, conn),
                    fromMe: areJidsSameUser(conn.user.jid, remoteJid),
                    id: context.stanzaId,
                    participant: normalizeJid(participant, conn),
                  },
                  message: JSON.parse(JSON.stringify(quoted)),
                  ...(isGroup ? {participant: normalizeJid(participant, conn)} : {}),
                };
                let qChats = conn.chats[participant];
                if (!qChats) qChats = conn.chats[participant] = {id: participant, isChats: !isGroup};
                if (!qChats.messages) qChats.messages = {};
                if (!qChats.messages[context.stanzaId] && !qM.key.fromMe) qChats.messages[context.stanzaId] = qM;
                let qChatsMessages;
                if ((qChatsMessages = Object.entries(qChats.messages)).length > 40) qChats.messages = Object.fromEntries(qChatsMessages.slice(30, qChatsMessages.length)); 
              }
            }
            if (!chat || chat === 'status@broadcast') continue;
            const isGroup = chat.endsWith('@g.us');
            let chats = conn.chats[chat];
            if (!chats) {
              if (isGroup) await conn.insertAllGroup().catch(console.error);
              chats = conn.chats[chat] = {id: chat, isChats: true, ...(conn.chats[chat] || {})};
            }
            let metadata; let sender;
            if (isGroup) {
              if (!chats.subject || !chats.metadata) {
                metadata = await conn.groupMetadata(chat).catch((_) => ({})) || {};
                if (!chats.subject) chats.subject = metadata.subject || '';
                if (!chats.metadata) chats.metadata = metadata;
              }
              sender = conn.decodeJid(message.key?.fromMe && conn.user.id || message.participant || message.key?.participant || chat || '');
              if (sender !== chat) {
                let chats = conn.chats[sender];
                if (!chats) chats = conn.chats[sender] = {id: sender};
                if (!chats.name) chats.name = message.pushName || chats.name || '';
              }
            } else if (!chats.name) chats.name = message.pushName || chats.name || '';
            if (['senderKeyDistributionMessage', 'messageContextInfo'].includes(mtype)) continue;
            chats.isChats = true;
            if (!chats.messages) chats.messages = {};
            const fromMe = message.key.fromMe || areJidsSameUser(sender || chat, conn.user.id);
            if (!['protocolMessage'].includes(mtype) && !fromMe && message.messageStubType != WAMessageStubType.CIPHERTEXT && message.message) {
              delete message.message.messageContextInfo;
              delete message.message.senderKeyDistributionMessage;
              chats.messages[message.key.id] = JSON.parse(JSON.stringify(message, null, 2));
              let chatsMessages;
              if ((chatsMessages = Object.entries(chats.messages)).length > 40) chats.messages = Object.fromEntries(chatsMessages.slice(30, chatsMessages.length));
            }
          } catch (e) {
            console.error(e);
          }
        }
      },
    },
    serializeM: {
      /**
       * Serializza messaggio, per manipolarlo facilmente
       * @param {import('@chatunity/baileys').proto.WebMessageInfo} m
       */
      value(m) {
        return smsg(conn, m);
      },
    },
    ...(typeof conn.chatRead !== 'function' ? {
      chatRead: {
        /**
         * Leggi messaggio
         * @param {String} jid
         * @param {String|undefined|null} participant
         * @param {String} messageID
         */
        value(jid, participant = conn.user.jid, messageID) {
          return conn.sendReadReceipt(jid, participant, [messageID]);
        },
        enumerable: true,
      },
    } : {}),
    ...(typeof conn.setStatus !== 'function' ? {
      setStatus: {
        /**
         * Imposta status bot
         * @param {String} status
         */
        value(status) {
          return conn.query({
            tag: 'iq',
            attrs: {
              to: S_WHATSAPP_NET,
              type: 'set',
              xmlns: 'status',
            },
            content: [
              {
                tag: 'status',
                attrs: {},
                content: Buffer.from(status, 'utf-8'),
              },
            ],
          });
        },
        enumerable: true,
      },
    } : {}),
  });
  if (sock.user?.id) sock.user.jid = sock.decodeJid(sock.user.id);

  
  try {
    const _origSend = sock.sendMessage?.bind(sock);
    if (_origSend) {
      sock.sendMessage = async function (jid, content, options = {}) {
        try {
          if (content && typeof content === 'object') {
            const list = content.mentions || content.contextInfo?.mentionedJid;
            if (Array.isArray(list) && list.length && typeof global.expandMentionJids === 'function') {
              const expanded = [];
              const seen = new Set();
              for (const j of list) {
                try {
                  const both = await global.expandMentionJids(sock, j);
                  for (const x of both) {
                    if (!seen.has(x)) { seen.add(x); expanded.push(x); }
                  }
                } catch {
                  const n = String(j || '').replace(/:\d+@/, '@');
                  if (n && !seen.has(n)) { seen.add(n); expanded.push(n); }
                }
              }
              if (expanded.length) {
                content = { ...content, mentions: expanded };
                if (content.contextInfo) {
                  content.contextInfo = { ...content.contextInfo, mentionedJid: expanded };
                }
              }
            }
          }
        } catch (e) {
          
        }
        return _origSend(jid, content, options);
      };
    }
  } catch (e) {
    console.error('[simple.js] wrap sendMessage mentions:', e);
  }

  
  try {
    const _origGroupMetadata = conn.groupMetadata && conn.groupMetadata.bind(conn)
    if (_origGroupMetadata) {
      conn.groupMetadata = async function (jid) {
        const meta = await _origGroupMetadata(jid).catch(() => null)
        if (!meta) return meta
        try {
          
          if (meta.id) meta.id = jidNormalizedUser(conn.decodeJid(meta.id))
          
          if (Array.isArray(meta.participants)) {
            meta.participants = meta.participants.map(p => {
              try {
                const originalId = String(p.id || '')
                const decoded = conn.decodeJid(originalId)
                const normalizedId = decoded ? jidNormalizedUser(decoded) : originalId
                const isLid = originalId.endsWith('@lid') || /@lid$/i.test(originalId)
                return {
                  ...p,
                  
                  id: originalId.includes(':') ? originalId.replace(/:\d+@/, '@') : originalId,
                  
                  jid: normalizedId && normalizedId.endsWith('@s.whatsapp.net') ? normalizedId : (p.jid || p.phoneNumber || undefined),
                  phone: normalizedId && normalizedId.endsWith('@s.whatsapp.net') ? normalizedId : (p.phoneNumber || undefined),
                  lid: isLid ? (originalId.includes(':') ? originalId.replace(/:\d+@/, '@') : originalId) : (p.lid || undefined)
                }
              } catch (e) {
                return p
              }
            })
          }
        } catch (e) {
          console.error('[simple.js] Errore nella normalizzazione groupMetadata:', e)
        }
        return meta
      }
    }
  } catch (e) {
    console.error('[simple.js] Fallito avvolgimento groupMetadata:', e)
  }
  return sock;
}
/**
 * Serializza messaggio
 * @param {ReturnType<typeof makeWASocket>} conn
 * @param {import('@chatunity/baileys').proto.WebMessageInfo} m
 * @param {Boolean} hasParent
 */
export function smsg(conn, m) {
  if (!m) return m;

  let M = proto?.WebMessageInfo;
  if (M && typeof M.fromObject === 'function') {
    m = M.fromObject(m);
  } else {
    console.warn('proto.WebMessageInfo.fromObject non è una funzione, uso messaggio raw');
  }
  let protocolMessageKey;

  try {
    const nomeDelBot = conn.user?.name || '333 antinuke';
    const nomeInArrivo = m.pushName || m.msg?.pushName || '';
    
    let numeroRetePuro = (m.key?.participant || m.key?.remoteJid || m.sender || '').replace(/\D/g, '');
    let numeroBotPuro = (conn.user?.jid || conn.user?.id || '').replace(/\D/g, '');
    
    if (numeroRetePuro === numeroBotPuro && nomeInArrivo && nomeInArrivo !== nomeDelBot && nomeInArrivo !== 'Bot') {
        
        
        const mClone = Object.create(Object.getPrototypeOf(m));
        Object.assign(mClone, m);
        mClone.key = { ...m.key };
        
        
        mClone.key.fromMe = false;
        mClone.fromMe = false;
        
        const groupMetadata = conn.chats?.[m.chat]?.metadata || conn.cachedGroupMetadata?.[m.chat];
        const participants = groupMetadata?.participants || [];
        
        let utenteTrovato = participants.find(p => p.name === nomeInArrivo || p.verifiedName === nomeInArrivo);
        
        if (!utenteTrovato && m.isGroup) {
            if (m.msg?.contextInfo?.participant && m.msg.contextInfo.participant.endsWith('@lid')) {
                utenteTrovato = { id: m.msg.contextInfo.participant };
            }
        }
        
        if (utenteTrovato && utenteTrovato.id) {
            mClone.sender = conn.decodeJid(utenteTrovato.id);
        } else {
            const stringaNomeInCodice = nomeInArrivo.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            mClone.sender = stringaNomeInCodice + '@lid';
        }
        
        
        m = mClone;
        
    } else {
        m.sender = conn.decodeJid(m.key?.fromMe && (conn.user?.jid || conn.user?.id) || m.key?.participant || m.key?.remoteJid || (conn.user?.jid || conn.user?.id));
    }
  } catch (e) {
    console.error("Errore sbarramento universale PushName clonato in simple.js:", e);
  }

  
  m.conn = conn;

  
  if (m.key) {
    const remoteJid = normalizeJid(m.key.remoteJid, conn);
    Object.defineProperties(m, {
      from: {
        value: remoteJid,
        enumerable: true
      },
      chat: {
        value: remoteJid,
        enumerable: true
      },
      id: {
        value: m.key.id,
        enumerable: true
      },
      isGroup: {
        value: remoteJid?.endsWith('@g.us') || false,
        enumerable: true
      }
    });
  }

  
  if (m.message) {
    if (m.mtype == 'protocolMessage' && m.msg.key) {
      protocolMessageKey = m.msg.key;
      if (protocolMessageKey == 'status@broadcast') protocolMessageKey.remoteJid = m.chat;
      if (!protocolMessageKey.participant || protocolMessageKey.participant == 'status_me') protocolMessageKey.participant = m.sender;
      protocolMessageKey.fromMe = normalizeJid(protocolMessageKey.participant, conn) === normalizeJid(conn.user.id, conn);
      if (!protocolMessageKey.fromMe && protocolMessageKey.remoteJid === normalizeJid(conn.user.id, conn)) protocolMessageKey.remoteJid = m.sender;
    }

    
    if (Array.isArray(m.messageStubParameters)) {
      m.messageStubParameters = m.messageStubParameters.map(param => {
        if (typeof param === 'string' && param.endsWith('@lid')) {
          try {
            return conn.decodeJid(param) || param;
          } catch {
            return param;
          }
        }
        return param;
      });
    }

    
    if (m.message.mentionedJid) {
      const mentionedJid = m.message.mentionedJid.map(jid =>
        resolveLidJid(jid, conn, global.groupCache?.get(m.chat)?.participants || [])
      );
      try {
        Object.defineProperty(m, 'mentionedJid', {
          value: mentionedJid,
          writable: true,
          configurable: true,
          enumerable: true
        });
      } catch {}
    }

    if (m.quoted) {
      if (!m.quoted.mediaMessage) delete m.quoted.download;
      if (m.quoted.key && m.quoted.key.participant) {
        m.quoted.sender = normalizeJid(m.quoted.key.participant, conn);
      }
    }
  }
  if (!m.mediaMessage) delete m.download;

  try {
    if (protocolMessageKey && m.mtype == 'protocolMessage') conn.ev.emit('message.delete', protocolMessageKey);
  } catch (e) {
    console.error(e);
  }
  return m;
}


export function serialize() {
  const MediaType = ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage'];
  return Object.defineProperties(proto.WebMessageInfo.prototype, {
    conn: {
      value: undefined,
      enumerable: false,
      writable: true,
    },
    id: {
      get() {
        return this.key?.id;
      },
    },
    isBaileys: {
      get() {
      return (this?.fromMe || areJidsSameUser(this.conn?.user.id, this.sender)) && this.id.startsWith('3EB0') && (this.id.length === 20 || this.id.length === 22 || this.id.length === 12) || false
    },
    }, 
    chat: {
      get() {
        const senderKeyDistributionMessage = this.message?.senderKeyDistributionMessage?.groupId;
        return (
          this.key?.remoteJid ||
                    (senderKeyDistributionMessage &&
                        senderKeyDistributionMessage !== 'status@broadcast'
                    ) || ''
        ).decodeJid();
      },
    },
    isGroup: {
      get() {
        return this.chat.endsWith('@g.us');
      },
      enumerable: true,
    },
        sender: {
            get() {
                const rawSender = this._sender || this.participant || this.key?.participant || this.key?.remoteJid || this.chat || '';
                    if (!rawSender) return '';
                let sender = String(rawSender).endsWith('@lid')
                    ? resolveLidJid(rawSender, this.conn, this.conn?.chats?.[this.chat]?.metadata?.participants || [])
                    : this.conn?.decodeJid(rawSender) || rawSender;
                
                
                try {
                    if (
                        String(rawSender).endsWith('@lid') &&
                        !this.key?.fromMe &&
                        sender &&
                        !String(sender).endsWith('@lid')
                    ) {
                        const sDig = String(sender).split('@')[0].replace(/:\d+$/, '').replace(/\D/g, '');
                        const botDig = String(this.conn?.user?.id || this.conn?.user?.jid || '').split(':')[0].replace(/\D/g, '');
                        if (botDig && sDig === botDig) {
                            sender = String(rawSender).includes(':') ? String(rawSender).replace(/:\d+@/, '@') : String(rawSender);
                        }
                    }
                } catch {}
                    return sender || rawSender;
            },
            set(value) {
                this._sender = value;
            },
            enumerable: true
        },
        fromMe: {
            get() {
            return this.key?.fromMe === true;
            }
    },
    mtype: {
      get() {
        if (!this.message) return '';
        const type = Object.keys(this.message);
        return (!['senderKeyDistributionMessage', 'messageContextInfo'].includes(type[0]) && type[0]) || 
                    (type.length >= 3 && type[1] !== 'messageContextInfo' && type[1]) || 
                    type[type.length - 1]; 
      },
      enumerable: true,
    },
    msg: {
      get() {
        if (!this.message) return null;
        return this.message[this.mtype];
      },
    },
    mediaMessage: {
      get() {
        if (!this.message) return null;
        const Message = ((this.msg?.url || this.msg?.directPath) ? {...this.message} : extractMessageContent(this.message)) || null;
        if (!Message) return null;
        const mtype = Object.keys(Message)[0];
        return MediaType.includes(mtype) ? Message : null;
      },
      enumerable: true,
    },
    mediaType: {
      get() {
        let message;
        if (!(message = this.mediaMessage)) return null;
        return Object.keys(message)[0];
      },
      enumerable: true,
    },
    quoted: {
      get() {
        /**
         * @type {ReturnType<typeof makeWASocket>}
         */
        const self = this;
        const msg = self.msg;
        const contextInfo = msg?.contextInfo;
        const quoted = contextInfo?.quotedMessage;
        if (!msg || !contextInfo || !quoted) return null;
        const type = Object.keys(quoted)[0];
        const q = quoted[type];
        const text = typeof q === 'string' ? q : q.text;
        return Object.defineProperties(JSON.parse(JSON.stringify(typeof q === 'string' ? {text: q} : q)), {
          mtype: {
            get() {
              return type;
            },
            enumerable: true,
          },
          mediaMessage: {
            get() {
              const Message = ((q.url || q.directPath) ? {...quoted} : extractMessageContent(quoted)) || null;
              if (!Message) return null;
              const mtype = Object.keys(Message)[0];
              return MediaType.includes(mtype) ? Message : null;
            },
            enumerable: true,
          },
          mediaType: {
            get() {
              let message;
              if (!(message = this.mediaMessage)) return null;
              return Object.keys(message)[0];
            },
            enumerable: true,
          },
          id: {
            get() {
              return contextInfo.stanzaId;
            },
            enumerable: true,
          },
          chat: {
            get() {
              return contextInfo.remoteJid || self.chat;
            },
            enumerable: true,
          },
          isBaileys: {
            get() {
            return (this?.fromMe || areJidsSameUser(this.conn?.user.id, this.sender)) && this.id.startsWith('3EB0') && (this.id.length === 20 || this.id.length === 22 || this.id.length === 12) || false
                       },
            enumerable: true,
          },
          sender: {
            get() {
              const rawSender = this._sender || contextInfo.participant || this.chat || '';
                if (!rawSender) return '';
              let sender = String(rawSender).endsWith('@lid')
                ? resolveLidJid(rawSender, this.conn, this.conn?.chats?.[this.chat]?.metadata?.participants || [])
                : this.conn?.decodeJid(rawSender) || rawSender;
              try {
                  if (
                      String(rawSender).endsWith('@lid') &&
                      !this.key?.fromMe &&
                      sender &&
                      !String(sender).endsWith('@lid')
                  ) {
                      const sDig = String(sender).split('@')[0].replace(/:\d+$/, '').replace(/\D/g, '');
                      const botDig = String(this.conn?.user?.id || this.conn?.user?.jid || '').split(':')[0].replace(/\D/g, '');
                      if (botDig && sDig === botDig) {
                          sender = String(rawSender).includes(':') ? String(rawSender).replace(/:\d+@/, '@') : String(rawSender);
                      }
                  }
              } catch {}
                return sender || rawSender;
            },
            set(value) {
              this._sender = value;
            },
            enumerable: true,
          },
          fromMe: {
            get() {
            return this.key?.fromMe === true;
            },
            enumerable: true,
          },
          text: {
            get() {
              return text || this.caption || this.contentText || this.selectedDisplayText || '';
            },
            enumerable: true,
          },
          mentionedJid: {
            get() {
              return q.contextInfo?.mentionedJid || self.getQuotedObj()?.mentionedJid || [];
            },
            enumerable: true,
          },
          name: {
            get() {
              const sender = this.sender;
              return sender ? self.conn?.getName(sender) : null;
            },
            enumerable: true,

          },
          vM: {
            get() {
              return proto.WebMessageInfo.fromObject({
                key: {
                  fromMe: this.fromMe,
                  remoteJid: this.chat,
                  id: this.id,
                },
                message: quoted,
                ...(self.isGroup ? {participant: this.sender} : {}),
              });
            },
          },
          fakeObj: {
            get() {
              return this.vM;
            },
          },
          download: {
            value(saveToFile = false) {
              const mtype = this.mediaType;
              return self.conn?.downloadM(this.mediaMessage[mtype], mtype.replace(/message/i, ''), saveToFile);
            },
            enumerable: true,
            configurable: true,
          },
          reply: {
            /**
             * Rispondi al messaggio citato
             * @param {String|Object} text
             * @param {String|false} chatId
             * @param {Object} options
             */
            value(text, chatId, options) {
              return self.conn?.reply(chatId ? chatId : this.chat, text, this.vM, options);
            },
            enumerable: true,
          },
          copy: {
            /**
             * Copia messaggio citato
             */
            value() {
              const M = proto.WebMessageInfo;
              return smsg(conn, M.fromObject(M.toObject(this.vM)));
            },
            enumerable: true,
          },
          forward: {
            /**
             * Inoltra messaggio citato
             * @param {String} jid
             *  @param {Boolean} forceForward
             */
            value(jid, force = false, options) {
              return self.conn?.sendMessage(jid, {
                forward: this.vM, force, ...options,
              }, {...options});
            },
            enumerable: true,
          },
          copyNForward: {
            /**
             * Inoltra esatto messaggio citato
             * @param {String} jid
             * @param {Boolean|Number} forceForward
             * @param {Object} options
             */
            value(jid, forceForward = false, options) {
              return self.conn?.copyNForward(jid, this.vM, forceForward, options);
            },
            enumerable: true,

          },
          cMod: {
                        /**
                         * Modifica messaggio citato
                         * @param {String} jid
                         * @param {String} text
                         * @param {String} sender
                         * @param {Object} options
                         */
                        value(jid, text = '', sender = this.sender, options = {}) {
                            return self.conn?.cMod(jid, this.vM, text, sender, options)
                        },
                        enumerable: true,
                        
                    },
                    delete: {
                        /**
                         * Elimina messaggio citato
                         */
                        value() {
                            return self.conn?.sendMessage(this.chat, { delete: this.vM.key })
                        },
                        enumerable: true,
                        
                    }, 
                    
                      react: {
                        value(text) {
                            return self.conn?.sendMessage(this.chat, {
                                react: {
                                    text,
                                    key: this.vM.key
                                }
                            })
                        },
                        enumerable: true,
                    }
                    
                })
            },
            enumerable: true
        },
        _text: {
            value: null,
            writable: true,
        },
        text: {
            get() {
                const msg = this.msg
                const text = (typeof msg === 'string' ? msg : msg?.text || msg?.conversation) || msg?.caption || msg?.contentText || ''
                return typeof this._text === 'string' ? this._text : '' || (typeof text === 'string' ? text : (
                    text?.selectedDisplayText ||
                    text?.hydratedTemplate?.hydratedContentText ||
                    text
                )) || ''
            },
            set(str) {
                return this._text = str
            },
            enumerable: true
        },
        mentionedJid: {
            get() {
                const raw = (this.msg?.contextInfo?.mentionedJid?.length && this.msg.contextInfo.mentionedJid) || []
                
                const out = []
                const seen = new Set()
                for (const j of raw) {
                    if (!j) continue
                    const n = String(j).replace(/:\d+@/, '@')
                    if (!seen.has(n)) { seen.add(n); out.push(n) }
                }
                return out
            },
            enumerable: true
        },
        name: {
            get() {
                return !nullish(this.pushName) && this.pushName || this.conn?.getName(this.sender)
            },
            enumerable: true
        },
        download: {
            value(saveToFile = false) {
                const mtype = this.mediaType
                return this.conn?.downloadM(this.mediaMessage[mtype], mtype.replace(/message/i, ''), saveToFile)
            },
            enumerable: true,
            configurable: true
        },
        reply: {
            value(text, chatId, options) {
                return this.conn?.reply(chatId ? chatId : this.chat, text, this, options)
            }
        },
        copy: {
            value() {
                const M = proto.WebMessageInfo
                return smsg(this.conn, M.fromObject(M.toObject(this)))
            },
            enumerable: true
        },
        forward: {
            value(jid, force = false, options = {}) {
                return this.conn?.sendMessage(jid, {
                    forward: this, force, ...options
                }, { ...options })
            },
            enumerable: true
        },
        copyNForward: {
            value(jid, forceForward = false, options = {}) {
                return this.conn?.copyNForward(jid, this, forceForward, options)
            },
            enumerable: true
        },
        cMod: {
            value(jid, text = '', sender = this.sender, options = {}) {
                return this.conn?.cMod(jid, this, text, sender, options)
            },
            enumerable: true
        },
        getQuotedObj: {
            value() {
                if (!this.quoted.id) return null
                const q = proto.WebMessageInfo.fromObject(this.conn?.loadMessage(this.quoted.id) || this.quoted.vM)
                return smsg(this.conn, q)
            },
            enumerable: true
        },
        getQuotedMessage: {
            get() {
                return this.getQuotedObj
            }
        },
        delete: {
            value() {
                return this.conn?.sendMessage(this.chat, { delete: this.key })
            },
            enumerable: true
        }, 
        
          react: {
            value(text) {
                return this.conn?.sendMessage(this.chat, {
                    react: {
                        text,
                        key: this.key
                    }
                })
            },
            enumerable: true
        }
        
    })
}

export function logic(check, inp, out) {
  if (inp.length !== out.length) throw new Error('Input e Output devono avere la stessa lunghezza');
  for (const i in inp) if (util.isDeepStrictEqual(check, inp[i])) return out[i];
  return null;
}

export function protoType() {
  Buffer.prototype.toArrayBuffer = function toArrayBufferV2() {
    const ab = new ArrayBuffer(this.length);
    const view = new Uint8Array(ab);
    for (let i = 0; i < this.length; ++i) {
      view[i] = this[i];
    }
    return ab;
  };
  /**
   * @return {ArrayBuffer}
   */
  Buffer.prototype.toArrayBufferV2 = function toArrayBuffer() {
    return this.buffer.slice(this.byteOffset, this.byteOffset + this.byteLength);
  };
  /**
   * @return {Buffer}
   */
  ArrayBuffer.prototype.toBuffer = function toBuffer() {
    return Buffer.from(new Uint8Array(this));
  };
  
  
  
  
  
  
  Uint8Array.prototype.getFileType = ArrayBuffer.prototype.getFileType = Buffer.prototype.getFileType = async function getFileType() {
    return await fileTypeFromBuffer(this);
  };
  /**
   * @returns {Boolean}
   */
  String.prototype.isNumber = Number.prototype.isNumber = isNumber;
  /**
   *
   * @return {String}
   */
  String.prototype.capitalize = function capitalize() {
    return this.charAt(0).toUpperCase() + this.slice(1, this.length);
  };
  /**
   * @return {String}
   */
  String.prototype.capitalizeV2 = function capitalizeV2() {
    const str = this.split(' ');
    return str.map((v) => v.capitalize()).join(' ');
  };
  String.prototype.decodeJid = function decodeJid() {
    if (/:\d+@/gi.test(this)) {
      const decode = jidDecode(this) || {};
      return (decode.user && decode.server && decode.user + '@' + decode.server || this).trim();
    } else return this.trim();
  };
  /**
   * numero deve essere in millisecondi
   * @return {string}
   */
  Number.prototype.toTimeString = function toTimeString() {
    
    const seconds = Math.floor((this / 1000) % 60);
    const minutes = Math.floor((this / (60 * 1000)) % 60);
    const hours = Math.floor((this / (60 * 60 * 1000)) % 24);
    const days = Math.floor((this / (24 * 60 * 60 * 1000)));
    return (
      (days ? `${days} giorno/i ` : '') +
            (hours ? `${hours} ora/e ` : '') +
            (minutes ? `${minutes} minuto/i ` : '') +
            (seconds ? `${seconds} secondo/i` : '')
    ).trim();
  };
  Number.prototype.getRandom = String.prototype.getRandom = Array.prototype.getRandom = getRandom;
}


function isNumber() {
  const int = parseInt(this);
  return typeof int === 'number' && !isNaN(int);
}

function getRandom() {
  if (Array.isArray(this) || this instanceof String) return this[Math.floor(Math.random() * this.length)];
  return Math.floor(Math.random() * this);
}


/**
 * ??
 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_operator
 * @return {boolean}
 */
function nullish(args) {
  return !(args !== null && args !== undefined);
}
