//Plugin by Gab, Lucifero & 333 staff


const ACTIONS = {
  accetta: 'approve',
  approva: 'approve',
  approve: 'approve',
  accept: 'approve',
  rifiuta: 'reject',
  rifiuto: 'reject',
  reject: 'reject',
  refuse: 'reject',
}

const normalizeRequestJid = (request, conn) => {
  let jid = request.user || request.requester || request.id || request.jid || request.participant || request.lid || ''
  if (!jid) return ''
  if (conn && typeof conn.decodeJid === 'function') {
    jid = conn.decodeJid(jid)
  }
  return jid
}

const formatRequestDisplay = (request) => {
  const jid = normalizeRequestJid(request)
  if (!jid) return JSON.stringify(request)
  return `@${jid.replace(/@.*$/, '')}`
}

let handler = async (m, { conn, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return m.reply('❌ Questo comando si usa solo nei gruppi.')
  if (!isBotAdmin) return m.reply('❌ Devo essere admin per controllare le richieste.')
  if (!isAdmin) return m.reply('❌ Solo gli admin del gruppo possono usare questo comando.')

  try {
    const groupId = m.chat
    const fullText = (m.text || '').trim()
    const parts = fullText.split(/\s+/).slice(1)
    const actionArg = parts[0]?.toLowerCase()
    const indexArg = parts[1]

    const pending = await conn.groupRequestParticipantsList(groupId)
    if (!pending?.length) return m.reply('✅ Non ci sono richieste di partecipazione in sospeso.')

    const totalRequests = pending.length
    const requests = []
    const getSafeName = async (jid) => {
      const fallback = jid ? jid.split('@')[0] : ''
      if (!conn.getName) return fallback
      try {
        const name = await Promise.resolve(conn.getName(jid))
        return typeof name === 'string' && name ? name : fallback
      } catch {
        return fallback
      }
    }

    for (let i = 0; i < pending.length; i++) {
      const req = pending[i]
      const jid = normalizeRequestJid(req, conn)
      const name = jid ? await getSafeName(jid) : JSON.stringify(req)
      requests.push({ index: i + 1, jid, display: `@${name}`, raw: req })
    }

    const action = actionArg ? ACTIONS[actionArg] : null

    if (!action) {
      const listText = requests.slice(0, 20).map(req => `*${req.index}.* ${req.display}`).join('\n\n')
      const extra = totalRequests > 20 ? `\n...e altre ${totalRequests - 20} richieste` : ''
      const message = `📊 Ci sono *${totalRequests}* richieste di partecipazione in sospeso.\n\n${listText}${extra}\n\n` +
        `Usa i pulsanti qui sotto per approvare o rifiutare tutte le richieste.`

      const buttons = [
        ['✅ Accetta tutte', '.richieste accetta'],
        ['❌ Rifiuta tutte', '.richieste rifiuta'],
      ]

      const btns = buttons.map(b => ({ buttonId: b[1], buttonText: { displayText: b[0] }, type: 1 }))

      return await conn.sendMessage(m.chat, {
        text: message,
        footer: 'Gestione Richieste 333',
        buttons: btns,
        headerType: 1,
        contextInfo: { mentionedJid: requests.map(r => r.jid).filter(Boolean) },
        mentions: requests.map(r => r.jid).filter(Boolean)
      }, { quoted: m })
    }

    let targets = []
    if (!indexArg || indexArg === 'tutti' || indexArg === 'tutte' || indexArg === 'all') {
      targets = requests
    } else {
      const idx = parseInt(indexArg, 10)
      if (Number.isNaN(idx) || idx < 1 || idx > requests.length) {
        return m.reply(`❌ Indice non valido. Usa un numero tra 1 e ${requests.length} oppure usa ".richieste ${actionArg}" per tutte le richieste.`)
      }
      targets = [requests[idx - 1]]
    }


    const targetJids = targets.map(req => req.jid).filter(Boolean)
    if (!targetJids.length) {
      return m.reply('❌ Impossibile trovare gli ID utente delle richieste selezionate.')
    }

    const result = await conn.groupRequestParticipantsUpdate(groupId, targetJids, action)
    const successful = result.filter(r => r.status === '200' || r.status === '201' || r.status === 'success')
    const failed = result.filter(r => r.status !== '200' && r.status !== '201' && r.status !== 'success')

    const successText = successful.length
      ? `✅ ${action === 'approve' ? 'Approvo' : 'Rifiuto'} con successo ${successful.length} richiesta${successful.length > 1 ? 'e' : ''}.`
      : `⚠️ Nessuna richiesta ${action === 'approve' ? 'approvata' : 'rifiutata'}.`

    const failureText = failed.length
      ? `\n\n❌ Errore per ${failed.length} richiesta${failed.length > 1 ? 'e' : ''}:\n` + failed.map(r => `- ${r.jid}: ${r.status || 'errore'}`).join('\n')
      : ''

    const targetList = targets.map(req => `• ${req.display}`).join('\n')
    const replyText = `${successText}\n\n${action === 'approve' ? 'Richieste approvate:' : 'Richieste rifiutate:'}\n${targetList}${failureText}`
    await conn.sendMessage(m.chat, { text: replyText, contextInfo: { mentionedJid: targetJids }, mentions: targetJids }, { quoted: m })
    return
  } catch (err) {
    console.error('[ERRORE RICHIESTE]', err)
    m.reply('❌ Errore durante la gestione delle richieste.')
  }
}

handler.command = ['richieste', 'requests']
handler.tags = ['gruppo']
handler.help = ['richieste - mostra e gestisce le richieste di partecipazione con pulsanti']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
