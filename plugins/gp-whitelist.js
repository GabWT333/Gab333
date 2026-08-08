//Plugin by Gab, Lucifero & 333 staff

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

let handler = async (m, { conn, args, usedPrefix }) => {
  let who = (m.mentionedJid && m.mentionedJid[0]) || args[0]
  if (!who) return m.reply(`Uso: ${usedPrefix}whitelist @persona`)
  if (!who.includes('@')) who = who + '@s.whatsapp.net'

  const niceText = `✨ *Whitelist* ✨\nA chi vuoi applicare la whitelist? Scegli una delle opzioni qui sotto per proteggere l'utente dalle regole automatiche.`

  const buttons = [
    { buttonId: `whitelist_antivoip_${who}`, buttonText: { displayText: '🛡️ Proteggi da VoIP' }, type: 1 },
    { buttonId: `whitelist_antibusiness_${who}`, buttonText: { displayText: '🏷️ Proteggi da Business' }, type: 1 }
  ]

  await conn.sendMessage(m.chat, {
    text: niceText,
    mentions: [who],
    buttons,
    headerType: 1
  }, { quoted: m })

  const choice = await waitForButtonChoice(conn, m.sender, 60000)
  if (!choice) return conn.sendMessage(m.chat, { text: '⏳ Tempo scaduto. Operazione annullata.' }, { quoted: m })

  const parts = choice.split('_')
  const type = parts[1]
  const targetRaw = parts.slice(2).join('_')
  const jid = targetRaw.includes('@') ? targetRaw : `${targetRaw}@s.whatsapp.net`

  const chat = global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
  chat.whitelist = chat.whitelist || { antivoip: [], antibusiness: [] }

  const list = type === 'antivoip' ? chat.whitelist.antivoip : chat.whitelist.antibusiness
  const already = list.includes(jid)
  if (already) {
    list.splice(list.indexOf(jid), 1)
    return conn.sendMessage(m.chat, { text: `✅ Ho rimosso dalla whitelist *${type}* @${jid.split('@')[0]}`, mentions: [jid] }, { quoted: m })
  } else {
    list.push(jid)
    return conn.sendMessage(m.chat, { text: `✅ Ho aggiunto alla whitelist *${type}* @${jid.split('@')[0]}`, mentions: [jid] }, { quoted: m })
  }
}

handler.help = ['whitelist @user']
handler.tags = ['admin']
handler.command = /^(whitelist)$/i
handler.admin = true;

export default handler
