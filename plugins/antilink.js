//Codice di antilink.js

//Plugin by Gab, Lucifero & 333 staff

import jsQR from 'jsqr'
import Jimp from 'jimp'

let inviteCache = {}
let lastCheck = {}

async function decodeQrFromBuffer(buffer) {
  try {
    const image = await Jimp.read(buffer)
    const { data, width, height } = image.bitmap
    const qr = jsQR(data, width, height)
    return qr?.data || null
  } catch (e) {
    console.log('Errore lettura QR con jimp:', e)
    return null
  }
}

export async function before(m, { conn, isAdmin, isBotAdmin }) {
  if (m.isBaileys && m.fromMe) return true
  if (!m.isGroup) return false

  const chat = global.db.data.chats[m.chat]
  if (!chat.antiLink || chat.isBanned) return true

  if (isAdmin || !isBotAdmin) return true

  const text = m.text || ''
  const linkRegex = /(https?:\/\/)?(chat\.whatsapp\.com|wa\.me|whatsapp\.com)\/\S+/gi

  if (lastCheck[m.chat] && Date.now() - lastCheck[m.chat] < 3000) return true

  if (linkRegex.test(text)) {

    lastCheck[m.chat] = Date.now()

    let thisGroupCode = inviteCache[m.chat]

    if (!thisGroupCode) {
      try {
        thisGroupCode = await conn.groupInviteCode(m.chat)
        inviteCache[m.chat] = thisGroupCode

        setTimeout(() => {
          delete inviteCache[m.chat]
        }, 10 * 60 * 1000)

      } catch (e) {
        console.log('Errore invite:', e)
        return true
      }
    }

    if (text.includes(thisGroupCode)) return true

    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: m.key.id,
        participant: m.sender
      }
    })

    let warningMessage = `🚫 𝐔𝐓𝐄𝐍𝐓𝐄 𝐄𝐒𝐏𝐔𝐋𝐒𝐎 𝐏𝐄𝐑 𝐋𝐈𝐍𝐊!\n\n`
    warningMessage += `👤 𝐔𝐭𝐞𝐧𝐭𝐞: @${m.sender.split('@')[0]}\n`
    warningMessage += `📝 𝐌𝐨𝐭𝐢𝐯𝐨: 𝐋𝐢𝐧𝐤 𝐰𝐡𝐚𝐭𝐬𝐚𝐩𝐩 𝐧𝐨𝐧 𝐜𝐨𝐧𝐬𝐞𝐧𝐭𝐢𝐭𝐨\n`
    warningMessage += `⚠️ 𝐀𝐳𝐢𝐨𝐧𝐞: 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐞𝐥𝐢𝐦𝐢𝐧𝐚𝐭𝐨 𝐞 𝐮𝐭𝐞𝐧𝐭𝐞 𝐞𝐬𝐩𝐮𝐥𝐬𝐨`

    await conn.sendMessage(m.chat, {
      text: warningMessage,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363341274693350@newsletter',
          serverMessageId: -1,
          newsletterName: global.nomebot || '333'
        }
      }
    })

    try {
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
    } catch (e) {
      console.error('Errore durante espulsione:', e)
    }

    return false
  }

  if (m.mtype === 'imageMessage' || m.mtype === 'stickerMessage') {
    try {
      const buffer = await m.download()

      const qrData = await decodeQrFromBuffer(buffer)

      if (!qrData) return true

      const qrText = qrData.toLowerCase()

      if (!qrText.includes('chat.whatsapp.com') && !qrText.includes('wa.me')) return true

      if (lastCheck[m.chat] && Date.now() - lastCheck[m.chat] < 3000) return true
      lastCheck[m.chat] = Date.now()

      let thisGroupCode = inviteCache[m.chat]

      if (!thisGroupCode) {
        try {
          thisGroupCode = await conn.groupInviteCode(m.chat)
          inviteCache[m.chat] = thisGroupCode

          setTimeout(() => {
            delete inviteCache[m.chat]
          }, 10 * 60 * 1000)

        } catch (e) {
          console.log('Errore invite QR:', e)
          return true
        }
      }

      if (qrText.includes(thisGroupCode)) return true

      await conn.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: false,
          id: m.key.id,
          participant: m.sender
        }
      })

      let warningMessage = `🚫 𝐔𝐓𝐄𝐍𝐓𝐄 𝐄𝐒𝐏𝐔𝐋𝐒𝐎 𝐏𝐄𝐑 𝐋𝐈𝐍𝐊 𝐐𝐑!\n\n`
      warningMessage += `👤 𝐔𝐭𝐞𝐧𝐭𝐞: @${m.sender.split('@')[0]}\n`
      warningMessage += `📝 𝐌𝐨𝐭𝐢𝐯𝐨: 𝐐𝐫 𝐜𝐨𝐧 𝐥𝐢𝐧𝐤 𝐰𝐡𝐚𝐭𝐬𝐚𝐩𝐩\n`
      warningMessage += `⚠️ 𝐀𝐳𝐢𝐨𝐧𝐞: 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐞𝐥𝐢𝐦𝐢𝐧𝐚𝐭𝐨 𝐞 𝐮𝐭𝐞𝐧𝐭𝐞 𝐞𝐬𝐩𝐮𝐥𝐬𝐨`

      await conn.sendMessage(m.chat, {
        text: warningMessage,
        contextInfo: {
          mentionedJid: [m.sender],
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363341274693350@newsletter',
            serverMessageId: -1,
            newsletterName: global.nomebot || '333'
          }
        }
      })

      try {
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
      } catch (e) {
        console.error('Errore espulsione QR:', e)
      }

      return false

    } catch (e) {
      console.log('Errore QR:', e)
    }
  }

  return true
}

export const disabled = false