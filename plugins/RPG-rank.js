//Plugin by Gab, Lucifero & 333 staff

import { getRpgXpStatus } from '../lib/rpg-xp.js'

let handler = async (m, { conn }) => {

  const user = global.db.data.users[m.sender] || (global.db.data.users[m.sender] = {})

  if (typeof user.lvl !== 'number') user.lvl = Number(user.level ?? user.rankData?.level ?? 0) || 0
  if (typeof user.msgCount !== 'number') user.msgCount = Number(user.rankData?.messages ?? 0) || 0
  if (!user.money) user.money = 0
  if (typeof user.rankMoneyEarned !== 'number') user.rankMoneyEarned = 0
  if (typeof user.rankXpEarned !== 'number') user.rankXpEarned = 0
  if (!user.level && typeof user.lvl === 'number') user.level = user.lvl
  user.rankData = user.rankData || {}
  user.rankData.level = user.lvl
  user.rankData.messages = user.msgCount

  const rpgStatus = getRpgXpStatus(user)
  const currencyTotal = (Number(user.money) || 0) + (Number(user.bank) || 0)
  const nextRankReward = (user.lvl + 1) * 50

  const LEVEL_STEP = 300 

  let percent = Math.floor((user.msgCount / LEVEL_STEP) * 100)
  if (percent > 100) percent = 100

  let bar = "█".repeat(Math.floor(percent / 10)) + "░".repeat(10 - Math.floor(percent / 10))

  let missing = LEVEL_STEP - user.msgCount
  if (missing < 0) missing = 0

  let text = `
📊 *RANK SYSTEM*

👤 @${m.sender.split('@')[0]}

🏆 Livello: ${user.lvl}
💬 Progress: ${user.msgCount}/${LEVEL_STEP}
⚡ XP333 disponibili: ${currencyTotal}
🎰 Moltiplicatore RPG: x${rpgStatus.multiplier.toFixed(2)}

${bar} ${percent}%

📈 Mancano: ${missing}
💰 XP333 guadagnati coi rank: ${user.rankMoneyEarned}
💰 Prossimo guadagno: ${nextRankReward} XP333
`

  await conn.sendMessage(m.chat, {
    text,
    mentions: [m.sender]
  }, { quoted: m })
}

handler.command = ['rank']
handler.modoadminBypass = true
export default handler