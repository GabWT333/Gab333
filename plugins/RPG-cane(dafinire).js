//Plugin by Gab, Lucifero & 333 staff

const BREEDS = [
  { id: 'breed_1', name: '🐶 Meticcio', price: 80, vibe: 'Economico' },
  { id: 'breed_2', name: '🐕 Bassotto', price: 150, vibe: 'Piccolo' },
  { id: 'breed_3', name: '🐕 Labrador', price: 300, vibe: 'Amichevole' },
  { id: 'breed_4', name: '🐩 Poodle', price: 500, vibe: 'Elegante' },
  { id: 'breed_5', name: '🦮 Pastore tedesco', price: 900, vibe: 'Prestigioso' },
  { id: 'breed_6', name: '🐾 Siberiano', price: 1400, vibe: 'Regale' }
]

const NEEDS = {
  water: { label: 'acqua', stat: 'thirst', threshold: 35, cost: [10, 25, 50], gain: [20, 35, 50] },
  food: { label: 'cibo', stat: 'hunger', threshold: 35, cost: [15, 35, 70], gain: [20, 35, 50] },
  sleep: { label: 'sonno', stat: 'sleep', threshold: 35, cost: [20, 40, 80], gain: [20, 35, 50] },
  hygiene: { label: 'igiene', stat: 'hygiene', threshold: 35, cost: [12, 28, 55], gain: [18, 30, 45] }
}

const ensureDogState = () => {
  if (!global.db.data.cani) global.db.data.cani = {}
  return global.db.data.cani
}

const ensureUser = (jid) => {
  if (!global.db.data.users[jid]) global.db.data.users[jid] = {}
  return global.db.data.users[jid]
}

const getDogByName = (name) => {
  const dogs = ensureDogState()
  return Object.values(dogs).find(dog => dog.alive && dog.name && dog.name.toLowerCase() === String(name).toLowerCase()) || null
}

const getDogById = (id) => ensureDogState()[id] || null

const isNameTaken = (name) => {
  const dogs = ensureDogState()
  return Object.values(dogs).some(dog => dog.name && dog.name.toLowerCase() === String(name).toLowerCase())
}

const getCoupleDogs = (owner1, owner2) => {
  const dogs = ensureDogState()
  return Object.values(dogs).filter(dog => dog.alive && (dog.owner1 === owner1 || dog.owner2 === owner1 || dog.owner1 === owner2 || dog.owner2 === owner2))
}

const sendCarePrompt = async (conn, dog, need) => {
  const owners = [dog.owner1, dog.owner2].filter(Boolean)
  const needConf = NEEDS[need]
  const labels = {
    water: ['💧 Poca acqua • 10€', '💧 Acqua media • 25€', '💧 Tutta l\'acqua • 50€'],
    food: ['🍖 Poco cibo • 15€', '🍽️ Cibo medio • 35€', '🥩 Tutto il cibo • 70€'],
    sleep: ['😴 Poco sonno • 20€', '🌙 Sonno medio • 40€', '🌅 Tanta calma • 80€'],
    hygiene: ['🫧 Pulizia leggera • 12€', '🧼 Pulizia media • 28€', '✨ Pulizia completa • 55€']
  }

  const buttons = [1, 2, 3].map(level => ({
    buttonId: `cane_care_${dog.id}_${need}_${level}`,
    buttonText: { displayText: labels[need][level - 1] },
    type: 1
  }))

  await conn.sendMessage(dog.groupId, {
    text: `🐶 Hey ${owners.map(jid => '@' + jid.split('@')[0]).join(' ')}, il cane *${dog.name}* ha bisogno di ${needConf.label}.\n\nScegli come aiutarlo.`,
    mentions: owners,
    buttons,
    headerType: 1
  })
}

const applyCare = async (conn, m, sender, dog, need, level) => {
  const user = ensureUser(sender)
  const needConf = NEEDS[need]
  const cost = needConf.cost[level - 1]
  const gain = needConf.gain[level - 1]

  if ((user.money || 0) < cost) {
    await conn.sendMessage(m.chat, {
      text: `💸 Non hai abbastanza soldi per questo aiuto. Servono ${cost}€.`
    }, { quoted: m })
    return false
  }

  user.money = (user.money || 0) - cost
  dog[needConf.stat] = Math.min(100, (dog[needConf.stat] || 50) + gain)
  dog.life = Math.min(100, (dog.life || 100) + Math.round(gain / 3))
  dog.lastCare = Date.now()
  dog.alerts = dog.alerts || {}
  dog.alerts[need] = 0

  await conn.sendMessage(m.chat, {
    text: `✅ Hai curato ${dog.name} con ${needConf.label}.\n💰 Speso: ${cost}€\n💚 Stato attuale: ${dog[needConf.stat]}%`
  }, { quoted: m })

  return true
}

const checkDogNeeds = async (conn) => {
  const dogs = ensureDogState()
  const now = Date.now()
  for (const dogId of Object.keys(dogs)) {
    const dog = dogs[dogId]
    if (!dog || !dog.alive) continue

    if (now - (dog.lastTick || now) < 2 * 60 * 1000) continue
    dog.lastTick = now

    dog.thirst = Math.max(0, (dog.thirst || 80) - 8)
    dog.hunger = Math.max(0, (dog.hunger || 80) - 7)
    dog.sleep = Math.max(0, (dog.sleep || 80) - 6)
    dog.hygiene = Math.max(0, (dog.hygiene || 80) - 5)
    dog.life = Math.max(0, (dog.life || 100) - 3)

    const needs = [
      { key: 'thirst', need: 'water', label: 'sete' },
      { key: 'hunger', need: 'food', label: 'fame' },
      { key: 'sleep', need: 'sleep', label: 'sonno' },
      { key: 'hygiene', need: 'hygiene', label: 'igiene' }
    ]

    for (const item of needs) {
      const current = dog[item.key] || 0
      if (current <= NEEDS[item.need].threshold && (!dog.alerts?.[item.need] || now - (dog.alerts[item.need] || 0) > 20 * 60 * 1000)) {
        dog.alerts = dog.alerts || {}
        dog.alerts[item.need] = now
        await sendCarePrompt(conn, dog, item.need)
      }
    }

    if (dog.thirst <= 0) {
      dog.alive = false
      dog.deathReason = 'sete'
    } else if (dog.hunger <= 0) {
      dog.alive = false
      dog.deathReason = 'fame'
    } else if (dog.sleep <= 0) {
      dog.alive = false
      dog.deathReason = 'sonno'
    } else if (dog.hygiene <= 0) {
      dog.alive = false
      dog.deathReason = 'igiene'
    } else if (dog.life <= 0) {
      dog.alive = false
      dog.deathReason = 'esaurimento'
    }

    if (!dog.alive) {
      const owners = [dog.owner1, dog.owner2].filter(Boolean)
      await conn.sendMessage(dog.groupId, {
        text: `💀 Hey ${owners.map(jid => '@' + jid.split('@')[0]).join(' ')}, il vostro cane *${dog.name}* è morto per ${dog.deathReason}.`,
        mentions: owners
      })

      if (dog.owner1) {
        const owner1 = ensureUser(dog.owner1)
        delete owner1.cane
      }
      if (dog.owner2) {
        const owner2 = ensureUser(dog.owner2)
        delete owner2.cane
      }
    }
  }
}

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

const waitForText = (conn, sender, timeout = 60000) => new Promise(resolve => {
  const listener = async ({ messages }) => {
    const msg = messages[0]
    if (!msg?.message) return

    const from = msg.key.participant || msg.key.remoteJid
    if (from !== sender) return

    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || ''
    if (!text.trim()) return

    conn.ev.off('messages.upsert', listener)
    resolve(text.trim())
  }

  conn.ev.on('messages.upsert', listener)

  setTimeout(() => {
    conn.ev.off('messages.upsert', listener)
    resolve(null)
  }, timeout)
})

let handler = async (m, { conn, text, command }) => {
  global.conn = conn

  const users = global.db.data.users
  const sender = m.sender
  if (!users[sender]) users[sender] = {}
  const user = users[sender]

  if (command === 'cane') {
    const sub = (text || '').trim().split(/\s+/)[0]?.toLowerCase()
    const rest = (text || '').trim().slice(sub?.length || 0).trim()

    if (!text || !sub || sub === 'info' || sub === 'status') {
      const ownDog = getCoupleDogs(sender, sender).find(dog => dog.alive)
      if (!ownDog) return m.reply('🐶 Non possiedi ancora un cane. Usa .cane adotta')

      return conn.sendMessage(m.chat, {
        text: `🐶 *STATO CANE*\n\nNome: ${ownDog.name}\nRazza: ${ownDog.breed}\nVita: ${ownDog.life}%\nSete: ${ownDog.thirst}%\nFame: ${ownDog.hunger}%\nSonno: ${ownDog.sleep}%\nIgiene: ${ownDog.hygiene}%\n\nStato: ${ownDog.alive ? 'Vivo' : 'Morto'}`,
        mentions: [ownDog.owner1, ownDog.owner2].filter(Boolean)
      }, { quoted: m })
    }

    if (sub === 'adotta') {
      if (!user.sposato || !user.coniuge) return m.reply('💍 Solo chi è sposato può adottare un cane.')
      if (!users[user.coniuge]) users[user.coniuge] = {}
      const partner = users[user.coniuge]
      if (partner.sposato !== true || partner.coniuge !== sender) return m.reply('💍 Devi essere sposato con la persona giusta per adottare un cane.')

      const existingDog = getCoupleDogs(sender, user.coniuge).find(dog => dog.alive)
      if (existingDog) return m.reply(`🐶 Avete già un cane: *${existingDog.name}*.`)

      await conn.sendMessage(m.chat, {
        text: `🐶 @${sender.split('@')[0]} scegli la razza del cane.`,
        mentions: [sender],
        buttons: BREEDS.map(breed => ({
          buttonId: `cane_breed_${breed.id}`,
          buttonText: { displayText: `${breed.name} • ${breed.price}€` },
          type: 1
        })),
        headerType: 1
      }, { quoted: m })

      const breedChoice = await waitForButtonChoice(conn, sender)
      if (!breedChoice) return m.reply('⏳ Tempo scaduto.')

      const selectedBreed = BREEDS.find(breed => `cane_breed_${breed.id}` === breedChoice)
      if (!selectedBreed) return m.reply('❌ Razza non valida.')

      const currentMoney = Number(user.money || 0)
      if (currentMoney < selectedBreed.price) {
        return m.reply(`💸 Non hai abbastanza soldi per questa razza. Hai ${currentMoney}€ ma servono ${selectedBreed.price}€.`)
      }

      user.money = currentMoney - selectedBreed.price

      await conn.sendMessage(m.chat, {
        text: `🐶 Scrivi il nome del cane.\n\nIl nome deve essere unico e non può essere usato da un altro cane.`,
        mentions: [sender]
      }, { quoted: m })

      const chosenName = await waitForText(conn, sender)
      if (!chosenName || chosenName.length < 2 || chosenName.length > 20) {
        return m.reply('❌ Nome non valido. Deve essere tra 2 e 20 caratteri.')
      }

      if (isNameTaken(chosenName)) {
        return m.reply('❌ Questo nome è già stato usato da un altro cane.')
      }

      const dogId = `dog_${Date.now()}`
      const dogs = ensureDogState()
      dogs[dogId] = {
        id: dogId,
        owner1: sender,
        owner2: user.coniuge,
        name: chosenName,
        breed: selectedBreed.name,
        price: selectedBreed.price,
        life: 100,
        thirst: 80,
        hunger: 80,
        sleep: 80,
        hygiene: 80,
        alive: true,
        deathReason: null,
        groupId: m.chat,
        createdAt: Date.now(),
        lastCare: Date.now(),
        alerts: {}
      }

      user.cane = { id: dogId, name: chosenName, breed: selectedBreed.name }
      partner.cane = { id: dogId, name: chosenName, breed: selectedBreed.name }

      await conn.sendMessage(m.chat, {
        text: `🐶 *CANE ADOPTATO!*\n\nNome: ${chosenName}\nRazza: ${selectedBreed.name}\nPrezzo: ${selectedBreed.price}€\n\nOra il cane vive con voi e potrà essere seguito da questo plugin.`,
        mentions: [sender, user.coniuge]
      }, { quoted: m })
      return
    }

    if (sub === 'lista') {
      const dogs = getCoupleDogs(sender, sender).filter(dog => dog.alive)
      if (!dogs.length) return m.reply('🐶 Non hai cani attivi.')
      return m.reply(`🐶 I tuoi cani: ${dogs.map(dog => `${dog.name} (${dog.breed})`).join(', ')}`)
    }

    const dog = getDogByName(rest)
    if (!dog) return m.reply('🐶 Cane non trovato. Usa .cane adotta o .cane <nome>.')

    return conn.sendMessage(m.chat, {
      text: `🐶 *${dog.name}*\n\nRazza: ${dog.breed}\nVita: ${dog.life}%\nSete: ${dog.thirst}%\nFame: ${dog.hunger}%\nSonno: ${dog.sleep}%\nIgiene: ${dog.hygiene}%`,
      mentions: [dog.owner1, dog.owner2].filter(Boolean)
    }, { quoted: m })
  }

  return true
}

handler.before = async (m, { conn }) => {
  const buttonId = m.message?.buttonsResponseMessage?.selectedButtonId || m.msg?.selectedButtonId || m.text || ''
  if (!buttonId || !buttonId.startsWith('cane_care_')) return true

  const parts = buttonId.split('_')
  const dogId = parts[3]
  const need = parts[4]
  const level = Number(parts[5])

  if (!dogId || !need || !Number.isInteger(level) || level < 1 || level > 3) return true

  const dog = getDogById(dogId)
  if (!dog || !dog.alive) return false

  if (!dog.owner1 || !dog.owner2 || ![dog.owner1, dog.owner2].includes(m.sender)) {
    await conn.sendMessage(m.chat, { text: '🐶 Solo i proprietari possono curare il cane.' }, { quoted: m })
    return false
  }

  await applyCare(conn, m, m.sender, dog, need, level)
  return false
}

handler.help = ['cane adotta', 'cane <nome>', 'cane lista']
handler.tags = ['RPG']
handler.command = /^(cane)$/i

setInterval(() => {
  if (global.conn) checkDogNeeds(global.conn).catch(err => console.error('Errore cane:', err))
}, 2 * 60 * 1000)

export default handler
