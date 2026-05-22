//Plugin by Gab, Lucifero & 333 staff



const confirmation = {}

async function handler(m, { conn }) {

  if (confirmation[m.sender]) {
    return conn.sendMessage(m.chat, {
      text: '❌ Hai già un bonifico in corso, aspetta.',
      mentions: [m.sender]
    }, { quoted: m })
  }

  const users = global.db.data.users
  if (!users[m.sender]) users[m.sender] = {}

  const user = users[m.sender]

  let text = m.text.replace(/^.\w+\s*/i, '').trim()
  let [countStr, ibanTarget] = text.split(/\s+/)

  const count = Math.max(1, parseInt(countStr)) || 0

  if (isNaN(count) || !ibanTarget) {
    return conn.sendMessage(m.chat, {
      text: `❌ Formato non valido\n\nEsempio:\n.bonifico 100 IT60X0542811101000000123456`,
      mentions: [m.sender]
    }, { quoted: m })
  }

  let who = Object.keys(users).find(jid => users[jid].iban === ibanTarget)

  if (!who) {
    return conn.sendMessage(m.chat, {
      text: '❌ IBAN non trovato.',
      mentions: [m.sender]
    }, { quoted: m })
  }

  if (who === m.sender) {
    return m.reply('❌ Non puoi fare bonifico a te stesso.')
  }

  if ((user.money || 0) < count) {
    return conn.sendMessage(m.chat, {
      text: '❌ 𝐍𝐨𝐧 𝐡𝐚𝐢 𝐚𝐛𝐛𝐚𝐬𝐭𝐚𝐧𝐳𝐚 𝐬𝐨𝐥𝐝𝐢!',
      mentions: [m.sender]
    }, { quoted: m })
  }

  const tag = who.split('@')[0]

  const confirmText = `
🏦 𝐁𝐀𝐍𝐂𝐀 𝟑𝟑𝟑

💸 Stai per inviare: *€${count}*
🏷️ IBAN: ${ibanTarget}

👤 Destinatario: @${tag}

✔️ ACCEPT → conferma
❌ DECLINE → annulla

⏳ 60 secondi
`.trim()


  confirmation[m.sender] = {
    sender: m.sender,
    to: who,
    iban: ibanTarget,
    count,
    timeout: setTimeout(() => {
      if (confirmation[m.sender]) {
        conn.sendMessage(m.chat, {
          text: '❌ Bonifico annullato automaticamente (tempo scaduto).',
          mentions: [m.sender]
        }, { quoted: m })
        delete confirmation[m.sender]
      }
    }, 60000)
  }

  await conn.sendMessage(m.chat, {
    text: confirmText,
    mentions: [who, m.sender],
    buttons: [
      {
        buttonId: `.bonifico_confirm accept ${m.sender}`,
        buttonText: { displayText: "✔️ SI" },
        type: 1
      },
      {
        buttonId: `.bonifico_confirm decline ${m.sender}`,
        buttonText: { displayText: "❌ NO" },
        type: 1
      }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.before = async function (m, { conn }) {

  let id = m.message?.buttonsResponseMessage?.selectedButtonId ||
           m.msg?.selectedButtonId ||
           m.text

  if (!id && m.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson) {
    try {
      const params = JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson)
      id = params.id
    } catch (e) {
      console.error('Errore parsing paramsJson bonifico:', e)
    }
  }

  if (!id || typeof id !== 'string' || !id.startsWith('.bonifico_confirm')) return

  const parts = id.split(' ')
  const action = parts[1]
  const senderId = parts[2]

  const data = confirmation[senderId]
  if (!data) return
  

  if (m.sender !== senderId) {
    return m.reply('❌ Solo chi ha avviato il bonifico può usare questi tasti.')
  }

  const users = global.db.data.users
  const user = users[data.sender]
  const target = users[data.to]

  if (action === 'decline') {
    clearTimeout(data.timeout)
    delete confirmation[senderId]
    return conn.sendMessage(m.chat, {
      text: '❌ Bonifico annullato.',
      mentions: [data.sender]
    }, { quoted: m })
  }

  if (action === 'accept') {
    if ((user.money || 0) < data.count) {
      clearTimeout(data.timeout)
      delete confirmation[senderId]
      return conn.sendMessage(m.chat, { text: '❌ Saldo insufficiente.' }, { quoted: m })
    }

    user.money -= data.count
    target.money = (target.money || 0) + data.count

    clearTimeout(data.timeout)
    delete confirmation[senderId]

    return conn.sendMessage(m.chat, {
      text: `✔️ BONIFICO COMPLETATO\n\n💸 €${data.count}\n👤 @${data.to.split('@')[0]}`,
      mentions: [data.to]
    }, { quoted: m })
  }
}

handler.command = ['bonifico', 'trasferisci']
export default handler