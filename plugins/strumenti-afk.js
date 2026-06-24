//Plugin by 333(Giuse)

import path from 'path'


function cleanJid(jid) {
  if (!jid) return '';
  return jid.replace(/[\u200B-\u200D\uFEFF\u202A-\u202E\u2066-\u2069]/g, '').trim();
}


function toMathBold(str) {
  if (!str) return '';
  return str.replace(/[A-Za-z0-9]/g, (char) => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      return String.fromCodePoint(code + 119743); // Upper Bold
    } else if (code >= 97 && code <= 122) {
      return String.fromCodePoint(code + 119737); // Lower Bold
    } else if (code >= 48 && code <= 57) {
      return String.fromCodePoint(code + 120734); // Numbers Bold
    }
    return char;
  });
}


function formatTime(ms) {
  let seconds = Math.floor((ms / 1000) % 60);
  let minutes = Math.floor((ms / (1000 * 60)) % 60);
  let hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  let days = Math.floor(ms / (1000 * 60 * 60 * 24));

  let res = [];
  if (days > 0) res.push(`${days}g`);
  if (hours > 0) res.push(`${hours}h`);
  if (minutes > 0) res.push(`${minutes}m`);
  if (seconds > 0 || res.length === 0) res.push(`${seconds}s`);
  return res.join(' ');
}

// --- COMANDO DI ATTIVAZIONE AFK ---
let handler = async (m, { conn, args, isOwner }) => {
  const chatId = m.chat
  const sender = cleanJid(m.sender)
  const reason = args.join(' ').trim() || 'Nessun motivo specificato'
  
  if (!global.db.data.users[sender]) {
    global.db.data.users[sender] = { afk: 0, afkReason: '' }
  }

  // Salvataggio nel database integrato del bot (nessun I/O bloccante su file)
  global.db.data.users[sender].afk = Date.now()
  global.db.data.users[sender].afkReason = reason
  if (typeof global.markDbDirty === 'function') global.markDbDirty();

  if (isOwner) {
    return conn.sendMessage(chatId, {
      text: `╔═ 🤫 *${toMathBold('AFK ATTIVATO')}* ═╗
┃
┃ _Non rompetemi le palle da questo_
┃ _momento in poi, sono offline!_ 🖕💤
┃
┃ 📝 *Motivo:* ${reason}
┃
╚═════════════════════╝`
    }, { quoted: m })
  }

  return conn.sendMessage(chatId, {
    text: `╔═ 💤 *${toMathBold('AFK ATTIVATO')}* ═╗
┃
┃ _Da questo momento sei in AFK._
┃ _Buon riposo!_ 💤
┃
┃ 📝 *Motivo:* ${reason}
┃
╚═════════════════════╝`
  }, { quoted: m })
}

// --- MESSAGGI IN BACKGROUND ---
handler.before = async function (m, { conn, isOwner }) {
  if (!m.isGroup || m.fromMe || !m.sender) return false

  const chatId = m.chat
  const sender = cleanJid(m.sender)
  const pref = global.prefix || '.'
  
  const textMsg = (m.text || '').trim().toLowerCase()
  const isEnteringAfk = textMsg.startsWith(`${pref}afk`)

  // 1. L'UTENTE AFK RITORNA ATTIVO (TORNATO ON)
  const userData = global.db.data.users[sender]
  if (userData && userData.afk > 0 && !isEnteringAfk) {
    const tempoTrascorso = formatTime(Date.now() - userData.afk)
    
    userData.afk = 0
    userData.afkReason = ''
    if (typeof global.markDbDirty === 'function') global.markDbDirty();

    const username = sender.split('@')[0]
    await conn.sendMessage(chatId, {
      text: `╔═ 👋 *${toMathBold('BENTORNATO')}* ═╗
┃
┃ @${username} è tornato operativo
┃ dopo essere stato offline per:
┃ ⏱️ *${tempoTrascorso}*
┃
╚════════════════════╝`,
      mentions: [sender]
    }, { quoted: m })
  }

  // 2. QUALCUNO TAGGA O RISPONDE A UN UTENTE AFK
  let targets = []
  if (m.mentionedJid && m.mentionedJid.length > 0) {
    targets.push(...m.mentionedJid)
  }
  if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
    targets.push(...m.message.extendedTextMessage.contextInfo.mentionedJid)
  }
  if (m.quoted && m.quoted.sender) {
    targets.push(m.quoted.sender)
  }

  const uniqueTargets = [...new Set(targets.map(cleanJid))]

  for (const target of uniqueTargets) {
    const targetData = global.db.data.users[target]
    if (targetData && targetData.afk > 0 && target !== sender) {
      const tempoTrascorso = formatTime(Date.now() - targetData.afk)
      const targetName = target.split('@')[0]
      
      // Controllo se il target è un Owner del bot
      const targetPhone = target.split('@')[0]
      const isTargetOwner = Array.isArray(global.owner)
        ? global.owner.some(([number]) => number === targetPhone)
        : global.owner === targetPhone;

      if (isTargetOwner) {
        await conn.sendMessage(chatId, {
          text: `╔═ ⚠️ *${toMathBold('NON DISTURBARE')}* ═╗
┃
┃ Non rompere i coglioni a @${targetName}!
┃ È offline da: *${tempoTrascorso}*
┃
┃ 📝 *Stato:* ${targetData.afkReason}
┃
╚═════════════════════════╝`,
          mentions: [target]
        }, { quoted: m })
      } else {
        await conn.sendMessage(chatId, {
          text: `╔═ 💤 *${toMathBold('UTENTE AFK')}* ═╗
┃
┃ L'utente @${targetName} è offline
┃ da: *${tempoTrascorso}*
┃
┃ 📝 *Motivo:* ${targetData.afkReason}
┃
╚════════════════════════╝`,
          mentions: [target]
        }, { quoted: m })
      }
    }
  }

  return false
}

handler.command = /^afk$/i
handler.group = true

export default handler