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
  if (!who) return m.reply(`Uso: ${usedPrefix}unwhitelist @persona`)
  if (!who.includes('@')) who = who + '@s.whatsapp.net'

  const text = `🧹 *Rimuovi Whitelist*\nSeleziona quale whitelist rimuovere per @${who.split('@')[0]}.`

  const buttons = [
    { buttonId: `unwl_antivoip_${who}`, buttonText: { displayText: '🛡️ Rimuovi VoIP' }, type: 1 },
    { buttonId: `unwl_antibusiness_${who}`, buttonText: { displayText: '🏷️ Rimuovi Business' }, type: 1 },
    { buttonId: `unwl_all_${who}`, buttonText: { displayText: '🗑️ Rimuovi Tutto' }, type: 1 }
  ]

  await conn.sendMessage(m.chat, {
    text,
    mentions: [who],
    buttons,
    headerType: 1
  }, { quoted: m })

  const choice = await waitForButtonChoice(conn, m.sender, 60000)
  if (!choice) return conn.sendMessage(m.chat, { text: '⏳ Tempo scaduto. Operazione annullata.' }, { quoted: m })

  const parts = choice.split('_')
  const action = parts[1]
  const targetRaw = parts.slice(2).join('_')
  const jid = targetRaw.includes('@') ? targetRaw : `${targetRaw}@s.whatsapp.net`

  const chat = global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
  chat.whitelist = chat.whitelist || { antivoip: [], antibusiness: [] }

  const removed = []
  if (action === 'antivoip' || action === 'all') {
    const idx = chat.whitelist.antivoip.indexOf(jid)
    if (idx !== -1) { chat.whitelist.antivoip.splice(idx, 1); removed.push('antivoip') }
  }
  if (action === 'antibusiness' || action === 'all') {
    const idx2 = chat.whitelist.antibusiness.indexOf(jid)
    if (idx2 !== -1) { chat.whitelist.antibusiness.splice(idx2, 1); removed.push('antibusiness') }
  }

  if (!removed.length) return conn.sendMessage(m.chat, { text: `ℹ️ @${jid.split('@')[0]} non era in nessuna whitelist.`, mentions: [jid] }, { quoted: m })
  return conn.sendMessage(m.chat, { text: `✅ Rimosso ${removed.join(', ')} da whitelist per @${jid.split('@')[0]}`, mentions: [jid] }, { quoted: m })
}

handler.help = ['unwhitelist @user']
handler.tags = ['admin']
handler.command = /^(unwhitelist)$/i
handler.admin = true;

export default handler
