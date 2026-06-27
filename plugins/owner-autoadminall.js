const adminSnapshot = {}

let handler = async (m, { conn, command }) => {
  const groupMetadata = await conn.groupMetadata(m.chat)
  const participants = groupMetadata.participants
  const botJid = conn.user.jid
  const ownerJid = global.owner?.[0]?.[0] ? global.owner[0][0] + '@s.whatsapp.net' : null

  if (/^adminall$/i.test(command)) {
    const daPromuovere = participants
      .filter(p => !p.admin && p.id !== botJid)
      .map(p => p.id)

    if (daPromuovere.length === 0) return conn.reply(m.chat, '⚠️ Tutti sono già admin.', m)

    let failed = []
    for (let jid of daPromuovere) {
      try {
        await conn.groupParticipantsUpdate(m.chat, [jid], 'promote')
      } catch (e) { failed.push(jid) }
    }

    return conn.reply(m.chat, `✅ Admin aggiunti: *${daPromuovere.length - failed.length}/${daPromuovere.length}*`, m)
  }

  if (/^demoteall$/i.test(command)) {
    const daDemotare = participants
      .filter(p => p.admin && p.id !== botJid && p.id !== ownerJid)
      .map(p => p.id)

    if (daDemotare.length === 0) return conn.reply(m.chat, '⚠️ Nessun admin da rimuovere.', m)

    adminSnapshot[m.chat] = daDemotare

    let failed = []
    for (let jid of daDemotare) {
      try {
        await conn.groupParticipantsUpdate(m.chat, [jid], 'demote')
      } catch (e) { failed.push(jid) }
    }

    return conn.reply(m.chat, `✅ Admin rimossi: *${daDemotare.length - failed.length}/${daDemotare.length}*\n\nUsa *#ripristinaadmin* per ripristinarli.`, m)
  }

  if (/^ripristinaadmin$/i.test(command)) {
    const snapshot = adminSnapshot[m.chat]

    if (!snapshot || snapshot.length === 0) return conn.reply(m.chat, '⚠️ Nessuno snapshot trovato. Usa prima *#demoteall*.', m)

    let failed = []
    for (let jid of snapshot) {
      try {
        await conn.groupParticipantsUpdate(m.chat, [jid], 'promote')
      } catch (e) { failed.push(jid) }
    }

    delete adminSnapshot[m.chat]
    return conn.reply(m.chat, `✅ Admin ripristinati: *${snapshot.length - failed.length}/${snapshot.length}*`, m)
  }
}

handler.help = ['adminall', 'demoteall', 'ripristinaadmin']
handler.tags = ['owner']
handler.command = /^(adminall|demoteall|ripristinaadmin)$/i
handler.gab = true
handler.group = true
handler.botAdmin = true
export default handler