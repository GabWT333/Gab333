//Plugin by Gab, Lucifero & 333 staff

import fetch from 'node-fetch'

const handler = m => m
handler.all = async function (m) {
  const chat = global.db.data.chats[m.chat]

  if (m.messageStubType == 29) {
    let pic
    try {
      pic = await conn.profilePictureUrl(m.messageStubParameters[0], 'image')
    } catch {
      pic = null
    }

    const ppBuffer = pic
      ? await (await fetch(pic)).buffer()
      : await (await fetch('https://telegra.ph/file/17e7701f8b0a63806e312.png')).buffer()

    const fake = {
      key: {
        participants: '0@s.whatsapp.net',
        fromMe: false,
        id: '333Promozione'
      },
      message: {
        locationMessage: {
          name: '𝐏𝐫𝐨𝐦𝐨𝐳𝐢𝐨𝐧𝐞 𝐚𝐝𝐦𝐢𝐧 👑',
          jpegThumbnail: ppBuffer.toString('base64'),
          vcard: 'BEGIN:VCARD\nVERSION:3.0\nN:;Admin;;;\nFN:Admin\nEND:VCARD'
        }
      },
      participant: '0@s.whatsapp.net'
    }

    conn.sendMessage(m.chat, {
      text: `@${m.sender.split('@')[0]} 𝐡𝐚 𝐝𝐚𝐭𝐨 𝐢 𝐩𝐨𝐭𝐞𝐫𝐢 𝐚 @${m.messageStubParameters[0].split('@')[0]}`,
      mentions: [m.sender, m.messageStubParameters[0]]
    }, { quoted: fake })
  }

  if (m.messageStubType == 30) {
    let pic
    try {
      pic = await conn.profilePictureUrl(m.messageStubParameters[0], 'image')
    } catch {
      pic = null
    }

    const ppBuffer = pic
      ? await (await fetch(pic)).buffer()
      : await (await fetch('https://telegra.ph/file/17e7701f8b0a63806e312.png')).buffer()

    const fake = {
      key: {
        participants: '0@s.whatsapp.net',
        fromMe: false,
        id: '333Retrocessione'
      },
      message: {
        locationMessage: {
          name: '𝐑𝐞𝐭𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐨𝐧𝐞 𝐚𝐝𝐦𝐢𝐧 🙇🏻‍♂️',
          jpegThumbnail: ppBuffer.toString('base64'),
          vcard: 'BEGIN:VCARD\nVERSION:3.0\nN:;Admin;;;\nFN:Admin\nEND:VCARD'
        }
      },
      participant: '0@s.whatsapp.net'
    }

    conn.sendMessage(m.chat, {
      text: `@${m.sender.split('@')[0]} 𝐡𝐚 𝐥𝐞𝐯𝐚𝐭𝐨 𝐢 𝐩𝐨𝐭𝐞𝐫𝐢 𝐚 @${m.messageStubParameters[0].split('@')[0]}`,
      mentions: [m.sender, m.messageStubParameters[0]]
    }, { quoted: fake })
  }
}

export default handler