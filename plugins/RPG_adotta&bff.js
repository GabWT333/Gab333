//Plugin by Gab, Lucifero & 333 staff

import fetch from 'node-fetch'

const waitButton = (conn, chatId, target, time = 60000) => {
  return new Promise(resolve => {
    const handler = async ({ messages }) => {
      const msg = messages[0]
      if (!msg?.message) return

      const from = msg.key.participant || msg.key.remoteJid
      if (from !== target) return

      const btn =
        msg.message?.buttonsResponseMessage?.selectedButtonId

      if (btn === 'yes' || btn === 'no') {
        conn.ev.off('messages.upsert', handler)
        resolve(btn)
      }
    }

    conn.ev.on('messages.upsert', handler)

    setTimeout(() => {
      conn.ev.off('messages.upsert', handler)
      resolve(null)
    }, time)
  })
}

const adottaHandler = async (m, { conn }) => {
  const users = global.db.data.users
  const mention = m.mentionedJid[0] || m.quoted?.sender

  if (!mention) return conn.reply(m.chat, '❌ Tagga qualcuno.')
  if (mention === m.sender) return conn.reply(m.chat, '❌ Non puoi adottare te stesso.')

  if (!users[m.sender]) users[m.sender] = {}
  if (!users[mention]) users[mention] = {}

  const adopter = users[m.sender]
  adopter.adottati = adopter.adottati || []

  if (adopter.adottati.includes(mention)) {
    return conn.reply(m.chat, '❌ Hai già adottato questa persona.')
  }

  await conn.sendMessage(m.chat, {
    text: `╭─────────────╮
│ 👶 *ADOZIONE*
│
│ @${m.sender.split('@')[0]} vuole adottarti
│
│ Premi un bottone sotto 👇
╰─────────────╯`,
    mentions: [mention, m.sender],
    buttons: [
      { buttonId: 'yes', buttonText: { displayText: '✅ Accetta' }, type: 1 },
      { buttonId: 'no', buttonText: { displayText: '❌ Rifiuta' }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m })

  const res = await waitButton(conn, m.chat, mention)

  if (!res) return conn.reply(m.chat, '⏱️ Tempo scaduto.')

  if (res === 'yes') {
    adopter.adottati.push(mention)
    return conn.sendMessage(m.chat, {
      text: `👶 @${mention.split('@')[0]} ora è figlio adottivo di @${m.sender.split('@')[0]}`,
      mentions: [mention, m.sender]
    })
  } else {
    return conn.sendMessage(m.chat, {
      text: `❌ @${mention.split('@')[0]} ha rifiutato`,
      mentions: [mention]
    })
  }
}

const miglioreamicoHandler = async (m, { conn }) => {
  const users = global.db.data.users
  const mention = m.mentionedJid[0] || m.quoted?.sender

  if (!mention) return conn.reply(m.chat, '❌ Tagga qualcuno.')
  if (mention === m.sender) return conn.reply(m.chat, '❌ Non puoi essere amico di te stesso.')

  if (!users[m.sender]) users[m.sender] = {}
  if (!users[mention]) users[mention] = {}

  const requester = users[m.sender]
  const target = users[mention]

  if (requester.miglioreamico === mention) {
    return conn.reply(m.chat, '❌ Siete già migliori amici.')
  }

  await conn.sendMessage(m.chat, {
    text: `╭─────────────╮
│ 🤝 *MIGLIORI AMICI*
│
│ @${m.sender.split('@')[0]} vuole essere tuo BFF
│
│ Premi un bottone 👇
╰─────────────╯`,
    mentions: [mention, m.sender],
    buttons: [
      { buttonId: 'yes', buttonText: { displayText: '✅ Accetta' }, type: 1 },
      { buttonId: 'no', buttonText: { displayText: '❌ Rifiuta' }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m })

  const res = await waitButton(conn, m.chat, mention)

  if (!res) return conn.reply(m.chat, '⏱️ Tempo scaduto.')

  if (res === 'yes') {
    requester.miglioreamico = mention
    target.miglioreamico = m.sender

    return conn.sendMessage(m.chat, {
      text: `🤝 @${m.sender.split('@')[0]} e @${mention.split('@')[0]} ora sono migliori amici`,
      mentions: [mention, m.sender]
    })
  } else {
    return conn.sendMessage(m.chat, {
      text: `❌ @${mention.split('@')[0]} ha rifiutato`,
      mentions: [mention]
    })
  }
}

const togliAdottaHandler = async (m, { conn }) => {
  const users = global.db.data.users
  const mention = m.mentionedJid[0] || m.quoted?.sender

  if (!mention) return conn.reply(m.chat, '❌ Tagga qualcuno.')

  const adopter = users[m.sender]
  adopter.adottati = adopter.adottati || []

  if (!adopter.adottati.includes(mention)) {
    return conn.reply(m.chat, '❌ Non è tuo figlio.')
  }

  adopter.adottati = adopter.adottati.filter(u => u !== mention)

  return conn.sendMessage(m.chat, {
    text: `❌ @${mention.split('@')[0]} non è più tuo figlio`,
    mentions: [mention]
  })
}

const togliMiglioreamicoHandler = async (m, { conn }) => {
  const users = global.db.data.users
  const requester = users[m.sender]

  if (!requester.miglioreamico) {
    return conn.reply(m.chat, '❌ Non hai un migliore amico.')
  }

  const ex = requester.miglioreamico

  requester.miglioreamico = null
  if (users[ex]) users[ex].miglioreamico = null

  return conn.sendMessage(m.chat, {
    text: `💔 @${ex.split('@')[0]} non è più il tuo migliore amico`,
    mentions: [ex]
  })
}

let handler = async (m, { conn, command }) => {
  if (command === 'adotta') return adottaHandler(m, { conn })
  if (command === 'miglioreamico') return miglioreamicoHandler(m, { conn })
  if (command === 'togliadotta') return togliAdottaHandler(m, { conn })
  if (command === 'toglimiglioreamico') return togliMiglioreamicoHandler(m, { conn })
}

handler.command = ['adotta', 'miglioreamico', 'togliadotta', 'toglimiglioreamico']
handler.tags = ['RPG']
handler.help = ['adotta @user', 'miglioreamico @user']
handler.group = true

export default handler