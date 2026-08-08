//Plugin by Gab, Lucifero & 333 staff

const pendingDeposito = global.pendingDeposito || (global.pendingDeposito = {})

const parseDepositInput = (input, money) => {
  input = input.trim().toLowerCase()
  if (input === 'tutto') return { amount: money }
  if (input.endsWith('%')) {
    const percent = parseInt(input.replace('%', ''))
    if (isNaN(percent) || percent <= 0) return { error: '𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐮𝐧 𝐩𝐞𝐫𝐜𝐞𝐧𝐭𝐨 𝐯𝐚𝐥𝐢𝐝𝐨.' }
    return { amount: Math.floor(money * percent / 100) }
  }
  if (!isNaN(input)) {
    const value = Number(input)
    if (value <= 0) return { error: '𝐋\'𝐢𝐦𝐩𝐨𝐫𝐭𝐨 𝐝𝐞𝐯𝐞 𝐞𝐬𝐬𝐞𝐫𝐞 𝐦𝐚𝐠𝐠𝐢𝐨𝐫𝐞 𝐝𝐢 0.' }
    return { amount: value }
  }
  return { error: '𝐀𝐬𝐬𝐢𝐜𝐮𝐫𝐚𝐭𝐢 𝐝𝐢 𝐢𝐧𝐬𝐞𝐫𝐢𝐫𝐞 𝐮𝐧 𝐧𝐮𝐦𝐞𝐫𝐨, 25%, 50%, 75% 𝐨 𝐭𝐮𝐭𝐭𝐨.' }
}

let handler = async (m, { conn, command, text }) => {
  let users = global.db.data.users
  const who = m.sender
  const user = users[who] || (users[who] = {})
  user.money = Number(user.money || 0)
  user.bank = Number(user.bank || 0)

  const buttons = [
    { buttonId: '.deposita 25%', buttonText: { displayText: '25%' }, type: 1 },
    { buttonId: '.deposita 50%', buttonText: { displayText: '50%' }, type: 1 },
    { buttonId: '.deposita 75%', buttonText: { displayText: '75%' }, type: 1 },
    { buttonId: '.deposita tutto', buttonText: { displayText: 'Deposita tutto' }, type: 1 }
  ]

  const totale = user.money + user.bank
  const depositoInput = text?.trim().split(/\s+/)[0].toLowerCase() || ''

  if (pendingDeposito[who] && depositoInput) {
    const totale = user.bank + user.money
    const parsed = parseDepositInput(depositoInput, user.money)
    if (parsed.error) {
      const message = `══════ •⊰✦⊱• ══════\n𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐞𝐬𝐞𝐠𝐮𝐢𝐫𝐞 𝐢𝐥 𝐝𝐞𝐩𝐨𝐬𝐢𝐭𝐨: ${parsed.error}\n\n🏦 𝐒𝐨𝐥𝐝𝐢 𝐢𝐧 𝐛𝐚𝐧𝐜𝐚: ${user.bank} €\n👛 𝐒𝐨𝐥𝐝𝐢 𝐧𝐞𝐥 𝐩𝐨𝐫𝐭𝐚𝐟𝐨𝐠𝐥𝐢𝐨: ${user.money} €\n💰 𝐓𝐨𝐭𝐚𝐥𝐞: ${totale} €\n\n𝐒𝐜𝐞𝐠𝐥𝐢 𝐜𝐨𝐧 𝐢 𝐩𝐮𝐥𝐬𝐚𝐧𝐭𝐢 𝐨 𝐬𝐜𝐫𝐢𝐯𝐢 𝐥'𝐢𝐦𝐩𝐨𝐫𝐭𝐨 𝐬𝐞𝐧𝐳𝐚 𝐩𝐮𝐧𝐭𝐨.`
      return conn.sendMessage(m.chat, { text: message, buttons, headerType: 1 }, { quoted: m })
    }

    const deposito = parsed.amount
    if (deposito > user.money) {
      const totale = user.bank + user.money
      const message = `══════ •⊰✦⊱• ══════\n𝐍𝐨𝐧 𝐡𝐚𝐢 𝐚𝐛𝐛𝐚𝐬𝐭𝐚𝐧𝐳𝐚 𝐬𝐨𝐥𝐝𝐢 𝐧𝐞𝐥 𝐩𝐨𝐫𝐭𝐚𝐟𝐨𝐠𝐥𝐢𝐨 👛\n\n🏦 𝐒𝐨𝐥𝐝𝐢 𝐢𝐧 𝐛𝐚𝐧𝐜𝐚: ${user.bank} €\n👛 𝐒𝐨𝐥𝐝𝐢 𝐧𝐞𝐥 𝐩𝐨𝐫𝐭𝐚𝐟𝐨𝐠𝐥𝐢𝐨: ${user.money} €\n💰 𝐓𝐨𝐭𝐚𝐥𝐞: ${totale} €\n\n𝐒𝐜𝐞𝐠𝐥𝐢 𝐜𝐨𝐧 𝐢 𝐩𝐮𝐥𝐬𝐚𝐧𝐭𝐢 𝐨 𝐬𝐜𝐫𝐢𝐯𝐢 𝐥'𝐢𝐦𝐩𝐨𝐫𝐭𝐨 𝐬𝐞𝐧𝐳𝐚 𝐩𝐮𝐧𝐭𝐨.`
      return conn.sendMessage(m.chat, { text: message, buttons, headerType: 1 }, { quoted: m })
    }

    user.bank += deposito
    user.money -= deposito
    user.ultimodeposito = deposito
    if (pendingDeposito[who]?.timeout) clearTimeout(pendingDeposito[who].timeout)
    delete pendingDeposito[who]

    const testo = `══════ •⊰✦⊱• ══════\n𝐇𝐨 𝐝𝐞𝐩𝐨𝐬𝐢𝐭𝐚𝐭𝐨 *${deposito}* € 𝐬𝐮𝐥 𝐭𝐮𝐨 𝐜𝐨𝐧𝐭𝐨\n\n🏦 𝐁𝐚𝐧𝐜𝐚: ${user.bank} €\n\n💰 𝐂𝐨𝐧𝐭𝐚𝐧𝐭𝐢: ${user.money} €\n══════ •⊰✦⊱• ══════`
    return conn.reply(m.chat, testo, m)
  }

  if (pendingDeposito[who]?.timeout) clearTimeout(pendingDeposito[who].timeout)
  pendingDeposito[who] = {
    chat: m.chat,
    timeout: setTimeout(() => delete pendingDeposito[who], 60000)
  }

  let message = `══════ •⊰✦⊱• ══════\n𝐐𝐮𝐚𝐧𝐭𝐢 𝐬𝐨𝐥𝐝𝐢 𝐯𝐮𝐨𝐢 𝐝𝐞𝐩𝐨𝐬𝐢𝐭𝐚𝐫𝐞?\n🏦 𝐒𝐨𝐥𝐝𝐢 𝐢𝐧 𝐛𝐚𝐧𝐜𝐚: ${user.bank} €\n👛 𝐒𝐨𝐥𝐝𝐢 𝐧𝐞𝐥 𝐩𝐨𝐫𝐭𝐚𝐟𝐨𝐠𝐥𝐢𝐨: ${user.money} €\n💰 𝐓𝐨𝐭𝐚𝐥𝐞: ${totale} €\n\n𝐒𝐜𝐞𝐠𝐥𝐢 𝐜𝐨𝐧 𝐢 𝐭𝐚𝐬𝐭𝐢 𝐪𝐮𝐚 𝐬𝐨𝐭𝐭𝐨 𝐨 𝐬𝐜𝐫𝐢𝐯𝐢 𝐪𝐮𝐚𝐧𝐭𝐢 𝐬𝐨𝐥𝐝𝐢 𝐝𝐞𝐩𝐨𝐬𝐢𝐭𝐚𝐫𝐞`

  return conn.sendMessage(m.chat, { text: message, buttons, headerType: 1 }, { quoted: m })
}

handler.before = async function (m, { conn }) {
  const who = m.sender
  const pending = pendingDeposito[who]
  if (!pending) return

  const text = m.text?.trim()
  if (!text) return
  if (/^[.!\/\?#]/.test(text)) return

  const depositoInput = text.split(/\s+/)[0].toLowerCase()
  if (!/^\d+$/.test(depositoInput) && depositoInput !== 'tutto' && !/^\d+%$/.test(depositoInput)) return

  let users = global.db.data.users
  const user = users[who] || (users[who] = {})
  user.money = Number(user.money || 0)
  user.bank = Number(user.bank || 0)

  const totale = user.bank + user.money
  const parsed = parseDepositInput(depositoInput, user.money)
  if (parsed.error) {
    const message = `══════ •⊰✦⊱• ══════\n𝐄𝐫𝐫𝐨𝐫𝐞: ${parsed.error}\n\n🏦 𝐒𝐨𝐥𝐝𝐢 𝐢𝐧 𝐛𝐚𝐧𝐜𝐚: ${user.bank} €\n👛 𝐒𝐨𝐥𝐝𝐢 𝐧𝐞𝐥 𝐩𝐨𝐫𝐭𝐚𝐟𝐨𝐠𝐥𝐢𝐨: ${user.money} €\n💰 𝐓𝐨𝐭𝐚𝐥𝐞: ${totale} €\n\n𝐒𝐜𝐞𝐠𝐥𝐢 𝐜𝐨𝐧 𝐢 𝐩𝐮𝐥𝐬𝐚𝐧𝐭𝐢 𝐨 𝐬𝐜𝐫𝐢𝐯𝐢 𝐥'𝐢𝐦𝐩𝐨𝐫𝐭𝐨 𝐬𝐞𝐧𝐳𝐚 𝐩𝐮𝐧𝐭𝐨.`
    await conn.sendMessage(m.chat, { text: message, buttons: [
      { buttonId: '.deposita 25%', buttonText: { displayText: '25%' }, type: 1 },
      { buttonId: '.deposita 50%', buttonText: { displayText: '50%' }, type: 1 },
      { buttonId: '.deposita 75%', buttonText: { displayText: '75%' }, type: 1 },
      { buttonId: '.deposita tutto', buttonText: { displayText: 'Deposita tutto' }, type: 1 }
    ], headerType: 1 }, { quoted: m })
    return true
  }

  const deposito = parsed.amount
  if (deposito > user.money) {
    const totale = user.bank + user.money
    const message = `══════ •⊰✦⊱• ══════\n𝐍𝐨𝐧 𝐡𝐚𝐢 𝐚𝐛𝐛𝐚𝐬𝐭𝐚𝐧𝐳𝐚 𝐬𝐨𝐥𝐝𝐢 𝐧𝐞𝐥 𝐩𝐨𝐫𝐭𝐚𝐟𝐨𝐠𝐥𝐢𝐨 👛\n\n🏦 𝐒𝐨𝐥𝐝𝐢 𝐢𝐧 𝐛𝐚𝐧𝐜𝐚: ${user.bank} €\n👛 𝐒𝐨𝐥𝐝𝐢 𝐧𝐞𝐥 𝐩𝐨𝐫𝐭𝐚𝐟𝐨𝐠𝐥𝐢𝐨: ${user.money} €\n💰 𝐓𝐨𝐭𝐚𝐥𝐞: ${totale} €\n\n𝐒𝐜𝐞𝐠𝐥𝐢 𝐜𝐨𝐧 𝐢 𝐩𝐮𝐥𝐬𝐚𝐧𝐭𝐢 𝐨 𝐬𝐜𝐫𝐢𝐯𝐢 𝐥'𝐢𝐦𝐩𝐨𝐫𝐭𝐨 𝐬𝐞𝐧𝐳𝐚 𝐩𝐮𝐧𝐭𝐨.`
    await conn.sendMessage(m.chat, { text: message, buttons: [
      { buttonId: '.deposita 25%', buttonText: { displayText: '25%' }, type: 1 },
      { buttonId: '.deposita 50%', buttonText: { displayText: '50%' }, type: 1 },
      { buttonId: '.deposita 75%', buttonText: { displayText: '75%' }, type: 1 },
      { buttonId: '.deposita tutto', buttonText: { displayText: 'Deposita tutto' }, type: 1 }
    ], headerType: 1 }, { quoted: m })
    return true
  }

  user.bank += deposito
  user.money -= deposito
  user.ultimodeposito = deposito
  if (pending.timeout) clearTimeout(pending.timeout)
  delete pendingDeposito[who]

  const testo = `══════ •⊰✦⊱• ══════\n𝐇𝐨 𝐝𝐞𝐩𝐨𝐬𝐢𝐭𝐚𝐭𝐨 *${deposito}* € 𝐬𝐮𝐥 𝐭𝐮𝐨 𝐜𝐨𝐧𝐭𝐨\n\n🏦 𝐁𝐚𝐧𝐜𝐚: ${user.bank} €\n\n💰 𝐂𝐨𝐧𝐭𝐚𝐧𝐭𝐢: ${user.money} €\n══════ •⊰✦⊱• ══════`
  await conn.reply(m.chat, testo, m)
  return true
}

handler.command = /^(deposita|deposit)$/i
export default handler