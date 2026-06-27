//Plugin by Gab, Lucifero & 333 staff

const handler = async (m, { conn, groupMetadata }) => {
  if (!m.isGroup) return await conn.sendMessage(m.chat, { text: 'Questo comando funziona solo nei gruppi.' })

  groupMetadata = groupMetadata || await conn.groupMetadata?.(m.chat).catch(() => null)
  const participants = groupMetadata?.participants || []

  if (!participants.length) {
    return await conn.sendMessage(m.chat, { text: 'Impossibile recuperare i membri del gruppo.' })
  }

  const chat = global.db.data.chats[m.chat] || {}
  const topBlasphemy = chat.topBlasphemy || {}

  const values = Object.entries(topBlasphemy)
    .map(([jid, total]) => ({
      jid,
      total: Number(total) || 0
    }))
    .filter(user => user.jid && user.total > 0)

  if (!values.length) {
    return await conn.sendMessage(m.chat, { text: 'Nessun dato di bestemmie disponibile per questo gruppo.' })
  }

  values.sort((a, b) => b.total - a.total)
  const top = values.slice(0, 10)

  const header = `🚨 𝐓𝐎𝐏 𝟏𝟎 𝐁𝐄𝐒𝐓𝐄𝐌𝐌𝐈𝐀𝐓𝐎𝐑𝐈 𝐃𝐄𝐋 𝐆𝐑𝐔𝐏𝐏𝐎\n` +
    `👥 Gruppo: ${groupMetadata.subject || m.chat.split('@')[0]}\n\n`

  const lines = top.map((user, idx) => {
    const rank = ['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'][idx] || `${idx + 1}.`
    return `${rank} @${user.jid.split('@')[0]} — ${user.total.toLocaleString('it-IT')} bestemmie`
  }).join('\n')

  await conn.sendMessage(m.chat, {
    text: header + lines,
    mentions: top.map(user => user.jid)
  })
}

handler.help = ['topbestemmatori', 'topbestemmie', 'bestemmatori']
handler.tags = ['group', 'fun']
handler.command = ['topbestemmatori', 'topbestemmie', 'bestemmatori']

export default handler
