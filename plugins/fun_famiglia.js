//Plugin by Gab, Lucifero & 333 staff

import fetch from 'node-fetch'

const handler = async (m, { conn }) => {
  const users = global.db.data.users
  const mention = m.mentionedJid[0] || m.quoted?.sender
  const who = mention || m.sender

  if (!users[who]) {
    users[who] = {
      sposato: false,
      coniuge: null,
      ex: [],
      adottati: [],
      miglioreamico: null
    }
  }

  const user = users[who]
  const tag = '@' + who.split('@')[0]

  let adottatoDa = null
  for (const jid in users) {
    if (users[jid].adottati && users[jid].adottati.includes(who)) {
      adottatoDa = jid
      break
    }
  }

  const exList = (user.ex || []).map(j => '@' + j.split('@')[0])
  const adopList = (user.adottati || []).map(j => '@' + j.split('@')[0])

  let pic
  try {
    pic = await conn.profilePictureUrl(who, 'image')
  } catch {
    pic = 'https://telegra.ph/file/17e7701f8b0a63806e312.png'
  }

  const ppBuffer = await (await fetch(pic)).buffer()

  const fake = {
    key: {
      participants: '0@s.whatsapp.net',
      fromMe: false,
      id: '333Famiglia'
    },
    message: {
      locationMessage: {
        name: `『 𝐅𝐀𝐌𝐈𝐆𝐋𝐈𝐀 』 ${tag}`,
        jpegThumbnail: ppBuffer.toString('base64'),
        vcard: 'BEGIN:VCARD\nVERSION:3.0\nN:;Famiglia;;;\nFN:Famiglia\nEND:VCARD'
      }
    },
    participant: '0@s.whatsapp.net'
  }

  await conn.sendMessage(m.chat, {
    text: `ೋೋ══ • ══ೋೋ
> 𝐅𝐀𝐌𝐈𝐆𝐋𝐈𝐀
ೋೋ══ • ══ೋೋ
𝐍𝐨𝐦𝐞: ${tag}

𝐒𝐩𝐨𝐬𝐚𝐭𝐨/𝐚: ${user.sposato ? 'si' : 'no'}
𝐂𝐨𝐧𝐢𝐮𝐠𝐞: ${user.coniuge ? '@' + user.coniuge.split('@')[0] : 'nessuno'}

𝐄𝐱 𝐂𝐨𝐧𝐢𝐮𝐠𝐢: ${exList.length ? exList.join(', ') : 'Nessuno'}

𝐀𝐝𝐨𝐭𝐭𝐚𝐭𝐨 𝐝𝐚: ${adottatoDa ? '@' + adottatoDa.split('@')[0] : 'Nessuno'}
𝐅𝐢𝐠𝐥𝐢 𝐚𝐝𝐨𝐭𝐭𝐚𝐭𝐢: ${adopList.length ? adopList.join(', ') : 'Nessuno'}

𝐌𝐢𝐠𝐥𝐢𝐨𝐫𝐞 𝐚𝐦𝐢𝐜𝐨: ${user.miglioreamico ? '@' + user.miglioreamico.split('@')[0] : 'nessuno'}
ೋೋ══ • ══ೋೋ`,
    mentions: [
      who,
      user.coniuge,
      user.miglioreamico,
      adottatoDa,
      ...(user.ex || []),
      ...(user.adottati || [])
    ].filter(Boolean)
  }, { quoted: fake })
}

handler.help = ['famiglia']
handler.tags = ['fun']
handler.command = ['famiglia']

export default handler