/**
 * Helper menzioni LID + PN
 * - Risolve target da @menzione / quoted / testo
 * - Per l'invio mette sia LID che PN così WhatsApp notifica sempre
 */

export async function resolveMentionJid(conn, jid) {
  if (!jid || typeof jid !== 'string') return null
  let raw = String(jid).trim().replace(/:\d+@/, '@')
  if (!raw.includes('@')) {
    const digits = raw.replace(/\D/g, '')
    if (!digits) return null
    raw = digits + '@s.whatsapp.net'
  }
  if (raw.endsWith('@lid')) return raw

  try {
    const lidMapping = conn?.signalRepository?.lidMapping
    if (lidMapping?.getLIDForPN) {
      const lid = await lidMapping.getLIDForPN(raw)
      if (lid && typeof lid === 'string' && lid.endsWith('@lid')) {
        return lid.includes(':') ? lid.replace(/:\d+@/, '@') : lid
      }
    }
  } catch {}

  try {
    if (global.lidCache && typeof global.lidCache.keys === 'function') {
      for (const k of global.lidCache.keys()) {
        if (!k || !String(k).endsWith('@lid')) continue
        const v = global.lidCache.get(k)
        if (v && String(v).replace(/:\d+@/, '@') === raw) {
          return String(k).replace(/:\d+@/, '@')
        }
      }
    }
  } catch {}

  return raw
}

export async function expandMentionJids(conn, participantOrJid) {
  const results = new Set()
  const push = (j) => {
    if (!j || typeof j !== 'string') return
    const n = j.trim().replace(/:\d+@/, '@')
    if (n.includes('@')) results.add(n)
  }

  if (!participantOrJid) return []

  if (typeof participantOrJid === 'string') {
    push(participantOrJid)
    try { push(await resolveMentionJid(conn, participantOrJid)) } catch {}
    if (String(participantOrJid).endsWith('@lid')) {
      try {
        const pn = conn?.signalRepository?.lidMapping?.getPNForLID
          ? await conn.signalRepository.lidMapping.getPNForLID(participantOrJid)
          : null
        push(pn)
      } catch {}
      try {
        if (global.lidCache) {
          const v = global.lidCache.get(String(participantOrJid).replace(/:\d+@/, '@'))
          if (v) push(String(v).includes('@') ? v : `${String(v).replace(/\D/g, '')}@s.whatsapp.net`)
        }
      } catch {}
    }
    return [...results]
  }

  const p = participantOrJid
  push(p.id); push(p.lid); push(p.jid); push(p.phone); push(p.phoneNumber); push(p.participantPn)
  const primary = p.id || p.jid || p.lid
  if (primary) {
    try { push(await resolveMentionJid(conn, primary)) } catch {}
    if (String(primary).endsWith('@lid')) {
      try {
        const pn = conn?.signalRepository?.lidMapping?.getPNForLID
          ? await conn.signalRepository.lidMapping.getPNForLID(primary)
          : null
        push(pn)
      } catch {}
    }
  }
  return [...results]
}

export async function resolveMentionList(conn, participants = []) {
  const out = []
  const seen = new Set()
  for (const p of participants) {
    try {
      for (const j of await expandMentionJids(conn, p)) {
        if (!seen.has(j)) { seen.add(j); out.push(j) }
      }
    } catch {}
  }
  return out
}

/**
 * Trova il target di un comando tipo `.picchia @user` / reply.
 * Restituisce il JID migliore (preferisce PN se mappabile, altrimenti LID originale).
 * Usato dai plugin al posto di m.mentionedJid[0] grezzo.
 */
export async function getTargetJid(m, text = '', conn = null) {
  const c = conn || m?.conn || global.conn
  let who = null

  
  if (m?.mentionedJid?.length) {
    who = m.mentionedJid[0]
  }
  
  if (!who && m?.quoted?.sender) {
    who = m.quoted.sender
  }
  
  if (!who && text) {
    const atMatch = String(text).match(/@(\d{5,20})/)
    if (atMatch) {
      const digits = atMatch[1]
      
      if (digits.length >= 8 && digits.length <= 15) {
        who = digits + '@s.whatsapp.net'
      } else {
        who = digits + '@lid'
      }
    } else {
      const onlyDigits = String(text).replace(/\D/g, '')
      if (onlyDigits.length >= 8 && onlyDigits.length <= 15) {
        who = onlyDigits + '@s.whatsapp.net'
      }
    }
  }

  if (!who) return null

  who = String(who).replace(/:\d+@/, '@')

  
  if (who.endsWith('@lid') && c) {
    try {
      const pn = c.signalRepository?.lidMapping?.getPNForLID
        ? await c.signalRepository.lidMapping.getPNForLID(who)
        : null
      if (pn && String(pn).endsWith('@s.whatsapp.net')) return String(pn).replace(/:\d+@/, '@')
    } catch {}
    try {
      if (global.lidCache) {
        const v = global.lidCache.get(who)
        if (v && !String(v).endsWith('@lid')) {
          const s = String(v)
          return s.includes('@') ? s.replace(/:\d+@/, '@') : (s.replace(/\D/g, '') + '@s.whatsapp.net')
        }
      }
    } catch {}
  }

  return who
}

/**
 * Per l'invio: array mentions che include sia LID che PN del target (+ sender opzionale)
 */
export async function buildMentions(conn, ...jids) {
  const out = []
  const seen = new Set()
  for (const j of jids) {
    if (!j) continue
    try {
      for (const x of await expandMentionJids(conn, j)) {
        if (!seen.has(x)) { seen.add(x); out.push(x) }
      }
    } catch {
      const n = String(j).replace(/:\d+@/, '@')
      if (!seen.has(n)) { seen.add(n); out.push(n) }
    }
  }
  return out
}

if (typeof global !== 'undefined') {
  global.resolveMentionJid = resolveMentionJid
  global.resolveMentionList = resolveMentionList
  global.expandMentionJids = expandMentionJids
  global.getTargetJid = getTargetJid
  global.buildMentions = buildMentions
}

export default {
  resolveMentionJid,
  resolveMentionList,
  expandMentionJids,
  getTargetJid,
  buildMentions
}
