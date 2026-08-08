//Plugin by Gab, Lucifero & 333 staff

const ringOptions = [
  { id: 'ring_1', name: '🪨 Anello di plastica', price: 100, vibe: 'Economico' },
  { id: 'ring_2', name: '🥈 Anello d’argento', price: 300, vibe: 'Semplice' },
  { id: 'ring_3', name: '💍 Anello classico', price: 600, vibe: 'Elegante' },
  { id: 'ring_4', name: '💎 Anello elegante', price: 1000, vibe: 'Lussuoso' },
  { id: 'ring_5', name: '👑 Anello da re', price: 2000, vibe: 'Regale' }
]

const waitForButtonChoice = (conn, sender, timeout = 60000) => new Promise(resolve => {
  const listener = async ({ messages }) => {
    const msg = messages[0]
    if (!msg?.message) return

    const from = msg.key.participant || msg.key.remoteJid
    if (from !== sender) return

    const id = msg.message?.buttonsResponseMessage?.selectedButtonId
    if (!id) return

    conn.ev.off('messages.upsert', listener)
    resolve(id)
  }

  conn.ev.on('messages.upsert', listener)

  setTimeout(() => {
    conn.ev.off('messages.upsert', listener)
    resolve(null)
  }, timeout)
})

let handler = async (m, { conn, command }) => {
  const users = global.db.data.users
  const sender = m.sender
  const target = m.mentionedJid?.[0] || m.quoted?.sender

  if (!users[sender]) users[sender] = {}
  const user = users[sender]

  if (command === 'sposa') {
    if (!target) return m.reply('❌ Tagga qualcuno per fare la proposta.')
    if (target === sender) return m.reply('❌ Non puoi sposare te stesso, dai.')

    if (!users[target]) users[target] = {}
    const partner = users[target]

    if (user.sposato && user.coniuge) {
      return conn.sendMessage(m.chat, {
        text: `💀 *SEI GIÀ SPOSATO/A*\nHai tradito @${user.coniuge.split('@')[0]}... e adesso devi convivere con la scelta.`,
        mentions: [user.coniuge]
      }, { quoted: m })
    }

    if (partner.sposato) {
      return m.reply('❌ Questa persona è già sposata. Non fare il disgraziato.')
    }

    await conn.sendMessage(m.chat, {
      text: `╭─── 💍 *PROPOSTA DI MATRIMONIO* ───╮
│
│ @${target.split('@')[0]}
│ hai ricevuto una proposta da
│ @${sender.split('@')[0]}
│
│ 💌 Vuoi accettare?
│
│ ⏳ Hai 60 secondi per decidere
╰──────────────────────────────╯`,
      mentions: [sender, target],
      buttons: [
        { buttonId: `accetta_${sender}`, buttonText: { displayText: '💖 Accetta' }, type: 1 },
        { buttonId: `rifiuta_${sender}`, buttonText: { displayText: '💔 Rifiuta' }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })

    const collected = await new Promise(resolve => {
      const listener = async ({ messages }) => {
        const msg = messages[0]
        if (!msg?.message) return

        const from = msg.key.participant || msg.key.remoteJid
        if (from !== target) return

        const id = msg.message?.buttonsResponseMessage?.selectedButtonId
        if (!id) return

        if (id === `accetta_${sender}` || id === `rifiuta_${sender}`) {
          conn.ev.off('messages.upsert', listener)
          resolve(id)
        }
      }

      conn.ev.on('messages.upsert', listener)

      setTimeout(() => {
        conn.ev.off('messages.upsert', listener)
        resolve(null)
      }, 60000)
    })

    if (!collected) {
      return conn.sendMessage(m.chat, {
        text: `⏱️ @${target.split('@')[0]} non ha risposto... la proposta è stata annullata.`,
        mentions: [target]
      })
    }

    if (collected.startsWith('accetta')) {
      let selectedRing = null
      let ringChoice = null

      while (!selectedRing) {
        await conn.sendMessage(m.chat, {
          text: `💍 @${sender.split('@')[0]} scegli l'anello per la cerimonia.\n\n💸 Hai: ${Number(user.money || 0)}€`,
          mentions: [sender],
          buttons: ringOptions.map(ring => ({
            buttonId: ring.id,
            buttonText: { displayText: `${ring.name} • ${ring.price}€` },
            type: 1
          })),
          headerType: 1
        }, { quoted: m })

        ringChoice = await waitForButtonChoice(conn, sender)
        if (!ringChoice) {
          return conn.sendMessage(m.chat, {
            text: `⏳ Tempo scaduto. La cerimonia è stata annullata.`
          })
        }

        selectedRing = ringOptions.find(ring => ring.id === ringChoice)
        if (!selectedRing) {
          await conn.sendMessage(m.chat, {
            text: `❌ Scelta dell'anello non valida. Prova ancora.`
          })
          continue
        }

        const currentMoney = Number(user.money || 0)
        if (currentMoney < selectedRing.price) {
          await conn.sendMessage(m.chat, {
            text: `💸 Non hai abbastanza soldi per ${selectedRing.name}.\nHai ${currentMoney}€ ma servono ${selectedRing.price}€.\n\nScegli un altro anello.`
          })
          selectedRing = null
        }
      }

      user.money = Number(user.money || 0) - selectedRing.price

      await conn.sendMessage(m.chat, {
        text: `🕯️ @${sender.split('@')[0]} tagga il testimone della cerimonia.`,
        mentions: [sender]
      }, { quoted: m })

      const witnessTag = await new Promise(resolve => {
        const listener = async ({ messages }) => {
          const msg = messages[0]
          if (!msg?.message) return

          const from = msg.key.participant || msg.key.remoteJid
          if (from !== sender) return

          const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
          if (!mentioned.length) return

          conn.ev.off('messages.upsert', listener)
          resolve(mentioned[0])
        }

        conn.ev.on('messages.upsert', listener)

        setTimeout(() => {
          conn.ev.off('messages.upsert', listener)
          resolve(null)
        }, 60000)
      })

      if (!witnessTag || witnessTag === sender || witnessTag === target) {
        return conn.sendMessage(m.chat, {
          text: `❌ Testimone non valido. Seleziona una persona diversa.`
        })
      }

      user.sposato = true
      user.coniuge = target
      user.ex = user.ex || []
      user.anello = selectedRing.name
      user.testimone = witnessTag

      partner.sposato = true
      partner.coniuge = sender
      partner.ex = partner.ex || []
      partner.anello = selectedRing.name
      partner.testimone = witnessTag

      await conn.sendMessage(m.chat, {
        text: `╭─── 💖 *MATRIMONIO* 💖 ───╮
│
│ @${sender.split('@')[0]}
│   🤍
│ @${target.split('@')[0]}
│
│ 💍 Anello: ${selectedRing.name}
│ 💸 Prezzo: ${selectedRing.price}€
│ 🕯️ Testimone: @${witnessTag.split('@')[0]}
│
│ ✨ *SI SONO SPOSATI* ✨
│
│  💫 La cerimonia è stata celebrata.
│  🕒 Vi lascerete dopo 5 minuti.
╰────────────────────────────╯`,
        mentions: [sender, target, witnessTag]
      })
    } else {
      await conn.sendMessage(m.chat, {
        text: `💔 @${target.split('@')[0]} ha rifiutato la proposta. Peccato.`,
        mentions: [target]
      })
    }
  }

  if (command === 'divorzia') {
    if (!user.sposato || !user.coniuge)
      return m.reply('❌ Non sei sposato.')

    const ex = user.coniuge
    if (!users[ex]) users[ex] = {}
    const exUser = users[ex]

    user.ex = user.ex || []
    exUser.ex = exUser.ex || []

    user.ex.push(ex)
    exUser.ex.push(sender)

    user.sposato = false
    user.coniuge = null
    delete user.anello
    delete user.testimone

    exUser.sposato = false
    exUser.coniuge = null
    delete exUser.anello
    delete exUser.testimone

    await conn.sendMessage(m.chat, {
      text: `╭─── 💔 *DIVORZIO* 💔 ───╮
│
│ @${sender.split('@')[0]}
│   💔
│ @${ex.split('@')[0]}
│
│  *La storia è finita.*
╰──────────────────────╯`,
      mentions: [sender, ex]
    })
  }
}

handler.help = ['sposa @tag', 'divorzia']
handler.command = ['sposa', 'divorzia']
handler.tags = ['RPG']
handler.group = true

export default handler