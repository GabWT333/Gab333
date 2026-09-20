//Plugin by Gab, Lucifero & 333 staff

import { addRpgXp } from '../lib/rpg-xp.js'

export async function before(m) {

  let user = global.db.data.users[m.sender]
  if (!user) return

  if (typeof user.lvl !== 'number') user.lvl = Number(user.level ?? user.rankData?.level ?? 0) || 0
  if (!user.money) user.money = 0
  if (typeof user.rankMoneyEarned !== 'number') user.rankMoneyEarned = 0
  if (typeof user.rankXpEarned !== 'number') user.rankXpEarned = 0

  if (typeof user.msgCount !== 'number') user.msgCount = Number(user.rankData?.messages ?? 0) || 0
  if (!user.rankStart) {
    user.rankStart = Date.now()
  }

  if (m.fromMe || m.isBaileys || !m.text) return

  user.msgCount += 1

  const LEVEL_STEP = 300

  if (user.msgCount >= LEVEL_STEP) {

    user.msgCount = 0
    user.lvl += 1

    let reward = user.lvl * 50
    let xpReward = user.lvl * 100
    user.money += reward
    user.rankMoneyEarned += reward
    user.rankXpEarned += xpReward
    addRpgXp(user, xpReward)

    await global.conn.sendMessage(m.chat, {
      text: `
🎉 LEVEL UP!

@${m.sender.split('@')[0]}

🏆 Livello: ${user.lvl}
💰 +${reward} XP333
📊 *prossimo rank tra 300 messaggi*
> *digita ‘’.rank’’ per vedere il tuo rank*
`,
      mentions: [m.sender]
    })
  }

  if (!user.level && typeof user.lvl === 'number') user.level = user.lvl
  user.rankData = user.rankData || {}
  user.rankData.level = user.lvl
  user.rankData.messages = user.msgCount
}
