//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn }) => {
  if (!m.quoted) return m.reply('❌ Rispondi a un messaggio.')

  const msgID = m.quoted.id || m.quoted.key?.id
  const senderJid = m.quoted.sender || m.quoted.key?.participant || 'sconosciuto'
  const tag = senderJid.replace(/@.+/, '')

  let device, icon, desc

  if (!msgID) {
    device = 'Sconosciuto'
    icon = '🕵️'
    desc = 'Impossibile rilevare'
  } else if (/^[a-zA-Z]+-[a-fA-F0-9]+$/.test(msgID)) {
    device = 'Bot'
    icon = '🤖'
    desc = 'Messaggio automatico da bot'
  } else if (msgID.startsWith('false_') || msgID.startsWith('true_')) {
    device = 'WhatsApp Web'
    icon = '🌐'
    desc = 'Connesso da browser'
  } else if (msgID.startsWith('3EB0') && /^[A-Z0-9]+$/.test(msgID)) {
    device = 'Web / Bot'
    icon = '💻'
    desc = 'WhatsApp Web oppure bot'
  } else if (msgID.includes(':')) {
    device = 'WhatsApp Desktop'
    icon = '🖥️'
    desc = 'App desktop installata'
  } else if (/^[A-F0-9]{32}$/i.test(msgID)) {
    device = 'Android'
    icon = '🤖'
    desc = 'Dispositivo Android rilevato'
  } else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(msgID)) {
    device = 'iPhone'
    icon = '🍏'
    desc = 'Dispositivo Apple iOS'
  } else if (/^[A-Z0-9]{20,25}$/i.test(msgID) && !msgID.startsWith('3EB0')) {
    device = 'iPhone'
    icon = '🍏'
    desc = 'UUID tipico di iOS'
  } else if (msgID.startsWith('3EB0')) {
    device = 'Android'
    icon = '🤖'
    desc = 'Prefisso tipico Android'
  } else {
    device = 'Sconosciuto'
    icon = '🕵️'
    desc = 'ID non classificato'
    console.log('[device] ID non riconosciuto:', msgID)
  }

  const bars = '▰▰▰▰▰▰▰▰▰▰'

  const msg = `╔══════════════════╗
║  🔍 *DEVICE SCAN* ║
╚══════════════════╝

👤 *Utente*
   @${tag}

${icon} *Dispositivo rilevato*
   *${device}*
   ╰ ${desc}

📟 *Message ID*
   \`${msgID?.slice(0, 20)}...\`

${bars}
_333 Staff — Device Analyzer_`

  await conn.sendMessage(m.chat, {
    text: msg,
    mentions: [senderJid]
  }, { quoted: m })
}

handler.help = ['check', 'device', 'perquisizione']
handler.tags = ['giochi']
handler.command = /^(check|device|perquisizione)$/i
handler.group = true
handler.admin = true
handler.botAdmin = false
handler.fail = null

export default handler