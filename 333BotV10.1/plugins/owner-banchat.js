//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn }) => {
  const chat = global.db.data.chats[m.chat] || {}

  if (chat.isBanned) {
    return conn.sendMessage(m.chat, {
      text: `⚠️ *CHAT GIÀ BLOCCATA*

Il bot è già disattivato in questo gruppo.`
    }, { quoted: m })
  }

  chat.isBanned = true
  global.db.data.chats[m.chat] = chat

  await conn.sendMessage(m.chat, {
    text: `╭─────────────╮
│ 🚫 *BANCHAT ATTIVATO*
│
│ Il bot è stato disattivato
│ in questo gruppo.
│
│ 📵 Nessun comando verrà eseguito
│ finché non verrà riattivato.
│
│ 👑 Azione eseguita da:
│ @${m.sender.split('@')[0]}
╰─────────────╯`,
    mentions: [m.sender]
  }, { quoted: m })
}

handler.command = ['banchat']
handler.owner = true
handler.group = true

export default handler