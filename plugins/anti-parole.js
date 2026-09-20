// Plugin by Lucifero

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export async function before(m, { conn, isAdmin, isBotAdmin }) {
  if (m.isBaileys && m.fromMe) return true
  if (!m.isGroup) return false
  if (isAdmin) return false

  const chatId = m.chat
  const chat = (global.db.data.chats[chatId] = global.db.data.chats[chatId] || {})
  const forbidden = chat.forbiddenWords || []
  if (forbidden.length === 0) return false

  const text = (m.text || m.caption || (m.message && (m.message.conversation || (m.message.extendedTextMessage && m.message.extendedTextMessage.text))) || '').toString()
  if (!text) return false

  const lowered = text.toLowerCase()
  const tokens = lowered.split(/[^\p{L}0-9_]+/u).filter(Boolean)

  for (const w of forbidden) {
    if (!w) continue
    const wNorm = w.toLowerCase().trim()
    const pattern = new RegExp('\\b' + escapeRegex(wNorm) + '\\b', 'i')
    if (pattern.test(lowered) || tokens.includes(wNorm) || lowered.includes(wNorm)) {
      if (isBotAdmin) {
        try {
          await conn.sendMessage(chatId, { delete: { remoteJid: chatId, fromMe: false, id: m.key.id, participant: m.sender }})
        } catch (e) {}
      }

      try {
        await conn.reply(chatId, `🚫 @${m.sender.split('@')[0]} *Hai scritto una parola vietata:* "${w}". *Fai attenzione o potresti correre a delle sanzioni.* `, m, { mentions: [m.sender] })
      } catch (e) {}

      return true
    }
  }

  return false
}

const handler = async (m, { conn, text, args, command }) => {
  const chatId = m.chat
  if (!global.db.data.chats[chatId]) global.db.data.chats[chatId] = {}
  const chat = global.db.data.chats[chatId]
  if (!chat.forbiddenWords) chat.forbiddenWords = []

  const cmd = (command || '').toLowerCase()
  const param = (text && text.toString().trim()) || (args && args.join(' ')) || ''

  if (cmd === 'addparola') {
    const word = (param || '').trim()
    if (!word) return conn.reply(chatId, '*Scegli la parola proibita da aggiungere!*\n*Esempio: addparola ciao* ', m)
    const wNorm = word.toLowerCase().trim()
    const existing = chat.forbiddenWords.map(x => x.toLowerCase().trim())
    if (existing.includes(wNorm)) return conn.reply(chatId, 'Questa parola è già presente nella lista.', m)
    chat.forbiddenWords.push(wNorm)
    try { await global.db.write() } catch (e) {}
    return conn.reply(chatId, `✅ Parola proibita aggiunta: ${word}\n> *Usa ''.listaparole'' per visualizzare le parole proibite.* `, m)
  }

  if (cmd === 'delparola') {
    const raw = (param || '').trim()
    if (!raw) return conn.reply(chatId, '*Scegli la parola proibita da rimuovere!*\n*Esempio: delparola ciao* ', m)

    if (/^\d+$/.test(raw)) {
      const idx = parseInt(raw, 10) - 1
      if (idx < 0 || idx >= chat.forbiddenWords.length) return conn.reply(chatId, 'Indice non valido.', m)
      const removed = chat.forbiddenWords.splice(idx, 1)[0]
      try { await global.db.write() } catch (e) {}
      return conn.reply(chatId, `✅ Parola proibita rimossa: ${removed}`, m)
    }

    const wNorm = raw.toLowerCase().trim()
    const listNorm = chat.forbiddenWords.map(x => x.toLowerCase().trim())
    const i = listNorm.indexOf(wNorm)
    if (i === -1) return conn.reply(chatId, 'Parola non trovata nella lista.', m)
    const removed = chat.forbiddenWords.splice(i, 1)[0]
    try { await global.db.write() } catch (e) {}
    return conn.reply(chatId, `✅ Parola proibita rimossa: ${removed}`, m)
  }

  if (cmd === 'listaparole') {
    if (!chat.forbiddenWords || chat.forbiddenWords.length === 0) return conn.reply(chatId, 'Nessuna parola proibita impostata.', m)
    const list = chat.forbiddenWords.map((p, i) => `${i + 1}. ${p}`).join('\n')
    return conn.reply(chatId, `Parole proibite:\n${list}`, m)
  }
}

handler.help = ['addparola <parola>', 'delparola <parola|numero>', 'listaparole']
handler.tags = ['admin']
handler.command = /^(addparola|delparola|listaparole)$/i
handler.group = true
handler.admin = true

handler.before = before

export default handler
