//Plugin by Gab, Lucifero & 333 staff

const pendingPrelievo = global.pendingPrelievo || (global.pendingPrelievo = {})

const parsePrelievoInput = (input, bank) => {
  input = input.trim().toLowerCase()
  if (input === 'tutto') return { amount: bank }
  if (input.endsWith('%')) {
    const percent = parseInt(input.replace('%', ''))
    if (isNaN(percent) || percent <= 0) return { error: '𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐮𝐧 𝐩𝐞𝐫𝐜𝐞𝐧𝐭𝐨 𝐯𝐚𝐥𝐢𝐝𝐨.' }
    return { amount: Math.floor(bank * percent / 100) }
  }
  if (!isNaN(input)) {
    const value = Number(input)
    if (value <= 0) return { error: '𝐋\'𝐢𝐦𝐩𝐨𝐫𝐭𝐨 𝐝𝐞𝐯𝐞 𝐞𝐬𝐬𝐞𝐫𝐞 𝐦𝐚𝐠𝐠𝐢𝐨𝐫𝐞 𝐝𝐢 0.' }
    return { amount: value }
  }
  return { error: '𝐀𝐬𝐬𝐢𝐜𝐮𝐫𝐚𝐭𝐢 𝐝𝐢 𝐢𝐧𝐬𝐞𝐫𝐢𝐫𝐞 𝐮𝐧 𝐧𝐮𝐦𝐞𝐫𝐨, 25%, 50%, 75% 𝐨 𝐭𝐮𝐭𝐭𝐨.' }
}

let handler = async (m, { conn, text }) => {
  let users = global.db.data.users
  const who = m.sender

  if (!users[who]) users[who] = {}

  users[who].bank = Number(users[who].bank) || 0
  users[who].money = Number(users[who].money) || 0

  const buttons = [
    { buttonId: '.preleva 25%', buttonText: { displayText: '25%' }, type: 1 },
    { buttonId: '.preleva 50%', buttonText: { displayText: '50%' }, type: 1 },
    { buttonId: '.preleva 75%', buttonText: { displayText: '75%' }, type: 1 },
    { buttonId: '.preleva tutto', buttonText: { displayText: 'Preleva tutto' }, type: 1 }
  ]

  const totale = users[who].bank + users[who].money
  const prelievoInput = text?.trim().split(/\s+/)[0].toLowerCase() || ''

  if (pendingPrelievo[who] && prelievoInput) {
    const parsed = parsePrelievoInput(prelievoInput, users[who].bank)
    if (parsed.error) {
      const message = `══════ •⊰✦⊱• ══════\n𝐄𝐫𝐫𝐨𝐫𝐞: ${parsed.error}\n\n𝐒𝐜𝐞𝐠𝐥𝐢 𝐜𝐨𝐧 𝐢 𝐩𝐮𝐥𝐬𝐚𝐧𝐭𝐢 𝐨 𝐬𝐜𝐫𝐢𝐯𝐢 𝐥\'𝐢𝐦𝐩𝐨𝐫𝐭𝐨 𝐬𝐞𝐧𝐳𝐚 𝐩𝐮𝐧𝐭𝐨.`
      return conn.sendMessage(m.chat, { text: message, buttons, headerType: 1 }, { quoted: m })
    }

    const prelievo = parsed.amount
    if (prelievo > users[who].bank) {
      const message = `══════ •⊰✦⊱• ══════\n🏦 𝐍𝐨𝐧 𝐡𝐚𝐢 𝐚𝐛𝐛𝐚𝐬𝐭𝐚𝐧𝐳𝐚 𝐬𝐨𝐥𝐝𝐢 𝐢𝐧 𝐛𝐚𝐧𝐜𝐚 👛\n\n𝐒𝐜𝐞𝐠𝐥𝐢 𝐜𝐨𝐧 𝐢 𝐩𝐮𝐥𝐬𝐚𝐧𝐭𝐢 𝐨 𝐬𝐜𝐫𝐢𝐯𝐢 𝐥\'𝐢𝐦𝐩𝐨𝐫𝐭𝐨 𝐬𝐞𝐧𝐳𝐚 𝐩𝐮𝐧𝐭𝐨.`
      return conn.sendMessage(m.chat, { text: message, buttons, headerType: 1 }, { quoted: m })
    }

    users[who].bank -= prelievo
    users[who].money += prelievo
    users[who].ultimoprelievo = prelievo
    if (pendingPrelievo[who]?.timeout) clearTimeout(pendingPrelievo[who].timeout)
    delete pendingPrelievo[who]

    let testo = `══════ •⊰✦⊱• ══════\n𝐇𝐚𝐢 𝐩𝐫𝐞𝐥𝐞𝐯𝐚𝐭𝐨 *${prelievo}* €\n\n💰𝐂𝐨𝐧𝐭𝐚𝐧𝐭𝐢: ${users[who].money} €\n🏦 𝐁𝐚𝐧𝐜𝐚: ${users[who].bank} €\n══════ •⊰✦⊱• ══════`
    return conn.reply(m.chat, testo, m)
  }

  if (pendingPrelievo[who]?.timeout) clearTimeout(pendingPrelievo[who].timeout)
  pendingPrelievo[who] = {
    chat: m.chat,
    timeout: setTimeout(() => delete pendingPrelievo[who], 60000)
  }

  let message = `══════ •⊰✦⊱• ══════\n𝐐𝐮𝐚𝐧𝐭𝐢 𝐬𝐨𝐥𝐝𝐢 𝐯𝐮𝐨𝐢 𝐩𝐫𝐞𝐥𝐞𝐯𝐚𝐫𝐞?\n𝐒𝐨𝐥𝐝𝐢 𝐢𝐧 𝐛𝐚𝐧𝐜𝐚: ${users[who].bank} €\n𝐓𝐨𝐭𝐚𝐥𝐞: ${totale} €\n\n𝐒𝐜𝐞𝐠𝐥𝐢 𝐜𝐨𝐧 𝐢 𝐩𝐮𝐥𝐬𝐚𝐧𝐭𝐢 𝐨 𝐬𝐜𝐫𝐢𝐯𝐢 𝐪𝐮𝐚𝐧𝐭𝐢 𝐬𝐨𝐥𝐝𝐢 𝐩𝐫𝐞𝐥𝐞𝐯𝐚𝐫𝐞 𝐬𝐞𝐧𝐳𝐚 𝐩𝐮𝐧𝐭𝐨.`

  return conn.sendMessage(m.chat, { text: message, buttons, headerType: 1 }, { quoted: m })
}

handler.before = async function (m, { conn }) {
  const who = m.sender
  const pending = pendingPrelievo[who]
  if (!pending) return

  const text = m.text?.trim()
  if (!text) return
  if (/^[.!\/#?]/.test(text)) return

  const prelievoInput = text.split(/\s+/)[0].toLowerCase()
  if (!/^\d+$/.test(prelievoInput) && prelievoInput !== 'tutto' && !/^\d+%$/.test(prelievoInput)) return

  let users = global.db.data.users
  if (!users[who]) users[who] = {}
  users[who].bank = Number(users[who].bank) || 0
  users[who].money = Number(users[who].money) || 0

  const parsed = parsePrelievoInput(prelievoInput, users[who].bank)
  if (parsed.error) {
    const message = `𝐄𝐫𝐫𝐨𝐫𝐞: ${parsed.error}\n\n𝐒𝐜𝐞𝐠𝐥𝐢 𝐜𝐨𝐧 𝐢 𝐩𝐮𝐥𝐬𝐚𝐧𝐭𝐢 𝐨 𝐬𝐜𝐫𝐢𝐯𝐢 𝐥\'𝐢𝐦𝐩𝐨𝐫𝐭𝐨 𝐬𝐞𝐧𝐳𝐚 𝐩𝐮𝐧𝐭𝐨.`
    await conn.sendMessage(m.chat, { text: message, buttons: [
      { buttonId: '.preleva 25%', buttonText: { displayText: '25%' }, type: 1 },
      { buttonId: '.preleva 50%', buttonText: { displayText: '50%' }, type: 1 },
      { buttonId: '.preleva 75%', buttonText: { displayText: '75%' }, type: 1 },
      { buttonId: '.preleva tutto', buttonText: { displayText: 'Preleva tutto' }, type: 1 }
    ], headerType: 1 }, { quoted: m })
    return true
  }

  const prelievo = parsed.amount
  if (prelievo > users[who].bank) {
    const message = `𝐍𝐨𝐧 𝐡𝐚𝐢 𝐚𝐛𝐛𝐚𝐬𝐭𝐚𝐧𝐳𝐚 𝐬𝐨𝐥𝐝𝐢 𝐢𝐧 𝐛𝐚𝐧𝐜𝐚 👛\n\n𝐒𝐜𝐞𝐠𝐥𝐢 𝐜𝐨𝐧 𝐢 𝐩𝐮𝐥𝐬𝐚𝐧𝐭𝐢 𝐨 𝐬𝐜𝐫𝐢𝐯𝐢 𝐥\'𝐢𝐦𝐩𝐨𝐫𝐭𝐨 𝐬𝐞𝐧𝐳𝐚 𝐩𝐮𝐧𝐭𝐨.`
    await conn.sendMessage(m.chat, { text: message, buttons: [
      { buttonId: '.preleva 25%', buttonText: { displayText: '25%' }, type: 1 },
      { buttonId: '.preleva 50%', buttonText: { displayText: '50%' }, type: 1 },
      { buttonId: '.preleva 75%', buttonText: { displayText: '75%' }, type: 1 },
      { buttonId: '.preleva tutto', buttonText: { displayText: 'Preleva tutto' }, type: 1 }
    ], headerType: 1 }, { quoted: m })
    return true
  }

  users[who].bank -= prelievo
  users[who].money += prelievo
  users[who].ultimoprelievo = prelievo
  if (pending.timeout) clearTimeout(pending.timeout)
  delete pendingPrelievo[who]

  const testo = `══════ •⊰✦⊱• ══════\n𝐇𝐚𝐢 𝐩𝐫𝐞𝐥𝐞𝐯𝐚𝐭𝐨 *${prelievo}* €\n\n💰𝐂𝐨𝐧𝐭𝐚𝐧𝐭𝐢: ${users[who].money} €\n🏦 𝐁𝐚𝐧𝐜𝐚: ${users[who].bank} €\n══════ •⊰✦⊱• ══════`
  await conn.reply(m.chat, testo, m)
  return true
}

handler.command = /^(preleva|prelievo|ritira)$/i
handler.tags = ['RPG']

export default handler
