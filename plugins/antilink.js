//Codice di antilink.js

//Codice di antilink.js

//Plugin by Gab, Lucifero & 333 staff

import jsQR from 'jsqr'

let inviteCache = {}
let lastCheck = {}

async function getGroupCode(conn, chatId) {
  let code = inviteCache[chatId]
  if (code) return code

  try {
    code = await conn.groupInviteCode(chatId)
    inviteCache[chatId] = code

    setTimeout(() => {
      delete inviteCache[chatId]
    }, 10 * 60 * 1000)

    return code
  } catch (e) {
    console.log('Errore invite:', e)
    return null
  }
}

async function kickForLink(m, conn, motivo) {
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
  warningMessage += `📝 𝐌𝐨𝐭𝐢𝐯𝐨: ${motivo}\n`
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
}

export async function before(m, { conn, isAdmin, isBotAdmin }) {
  if (m.isBaileys && m.fromMe) return true
  if (!m.isGroup) return false

  const chat = global.db.data.chats[m.chat]
  if (!chat.antiLink || chat.isBanned) return true

  if (isAdmin || !isBotAdmin) return true

  if (lastCheck[m.chat] && Date.now() - lastCheck[m.chat] < 3000) return true

  const rawMsg = m.message || (m.msg && m.msg.message) || {}
  const groupInvite =
    rawMsg.groupInviteMessage ||
    (m.msg && m.msg.groupInviteMessage) ||
    null

  if (groupInvite) {
    const inviteGroupJid = groupInvite.groupJid
    const inviteCode = groupInvite.inviteCode

    if (inviteGroupJid === m.chat) return true

    const thisGroupCode = await getGroupCode(conn, m.chat)
    if (thisGroupCode && inviteCode === thisGroupCode) return true

    lastCheck[m.chat] = Date.now()
    await kickForLink(m, conn, '𝐈𝐧𝐯𝐢𝐭𝐨 𝐝𝐢 𝐠𝐫𝐮𝐩𝐩𝐨 (𝐛𝐚𝐝𝐠𝐞) 𝐧𝐨𝐧 𝐜𝐨𝐧𝐬𝐞𝐧𝐭𝐢𝐭𝐨')
    return false
  }

  const text = m.text || m.caption || ''
  const rawJson = (() => {
    try {
      return JSON.stringify(rawMsg)
    } catch (e) {
      return ''
    }
  })()

  const hiddenUrls = (rawJson.match(/(https?:\/\/)?(?:chat\.whatsapp\.com|wa\.me|whatsapp\.com)\/[^\s"'<>]+/gi) || []).map(url => url.replace(/["\}]+$/g, ''))
  const deepText = [text, ...new Set(hiddenUrls)].filter(Boolean).join(' ').trim()
  const linkRegex = /(https?:\/\/)?(?:chat\.whatsapp\.com|wa\.me|whatsapp\.com)\/\S+/gi

  if (linkRegex.test(deepText)) {
    lastCheck[m.chat] = Date.now()

    const thisGroupCode = await getGroupCode(conn, m.chat)
    if (thisGroupCode && deepText.includes(thisGroupCode)) return true

    await kickForLink(m, conn, '𝐋𝐢𝐧𝐤 𝐰𝐡𝐚𝐭𝐬𝐚𝐩𝐩 𝐧𝐨𝐧 𝐜𝐨𝐧𝐬𝐞𝐧𝐭𝐢𝐭𝐨')
    return false
  }

  async function handleQrMedia(buffer) {
    let createCanvas, loadImage
    try {
      ({ createCanvas, loadImage } = await import('@napi-rs/canvas'))
    } catch (err) {
      ({ createCanvas, loadImage } = await import('canvas'))
    }

    const img = await loadImage(buffer)
    const canvas = createCanvas(img.width, img.height)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const qr = jsQR(imageData.data, canvas.width, canvas.height)

    if (!qr?.data) return true

    let qrText = qr.data.toLowerCase()
    if (!qrText.includes('chat.whatsapp.com') && !qrText.includes('wa.me')) return true

    if (lastCheck[m.chat] && Date.now() - lastCheck[m.chat] < 3000) return true
    lastCheck[m.chat] = Date.now()

    const thisGroupCode = await getGroupCode(conn, m.chat)
    if (thisGroupCode && qrText.includes(thisGroupCode)) return true

    await kickForLink(m, conn, '𝐐𝐫 𝐜𝐨𝐧 𝐥𝐢𝐧𝐤 𝐰𝐡𝐚𝐭𝐬𝐚𝐩𝐩')
    return false
  }

  if (m.mtype === 'imageMessage' || m.mtype === 'stickerMessage') {
    try {
      let buffer = await m.download()
      return await handleQrMedia(buffer)
    } catch (e) {
      console.log('Errore QR:', e)
    }
  }

  return true
}

export const disabled = false
