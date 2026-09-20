import { addRpgXp, ensureRpgXp } from '../lib/rpg-xp.js';

const theftCooldowns = new Map();
const THEFT_COOLDOWN = 10 * 60 * 1000;
const SUCCESS_CHANCE = 0.4;

const getMentionedUser = (m) => m.mentionedJid?.[0] || m.quoted?.sender || null;

let handler = async (m, { conn, args }) => {
  const targetId = getMentionedUser(m);
  const target = targetId && global.db.data.users[targetId];
  const thief = global.db.data.users[m.sender] || (global.db.data.users[m.sender] = {});

  if (!targetId || targetId === m.sender || !target) {
    return m.reply('Usa il comando menzionando un utente valido diverso da te.');
  }

  const amount = Math.trunc(Number(args.find(arg => /^\d+$/.test(arg))));
  if (!amount || amount < 1) return m.reply('Indica una quantità valida di XP333 da rubare.');

  ensureRpgXp(thief);
  ensureRpgXp(target);

  if (amount > target.rpgXp) {
    return m.reply(`L'utente ha solo ${target.rpgXp} XP333.`);
  }

  const cooldownKey = `${m.chat}:${m.sender}`;
  const lastAttempt = theftCooldowns.get(cooldownKey) || 0;
  if (Date.now() - lastAttempt < THEFT_COOLDOWN) {
    const remaining = Math.ceil((THEFT_COOLDOWN - (Date.now() - lastAttempt)) / 60000);
    return m.reply(`Devi aspettare ancora circa ${remaining} minuto/i prima di tentare un altro furto.`);
  }
  theftCooldowns.set(cooldownKey, Date.now());

  if (Math.random() < SUCCESS_CHANCE) {
    const stolen = Math.max(1, Math.floor(amount * 0.7));
    addRpgXp(target, -amount);
    addRpgXp(thief, stolen);
    return conn.sendMessage(m.chat, {
      text: `🕵️ @${m.sender.split('@')[0]} ha rubato ${stolen} XP333 a @${targetId.split('@')[0]}!`,
      mentions: [m.sender, targetId]
    }, { quoted: m });
  }

  const penalty = Math.max(10, Math.floor(amount * 0.2));
  addRpgXp(thief, -penalty);
  return conn.sendMessage(m.chat, {
    text: `🚨 @${targetId.split('@')[0]} ha scoperto il tentativo di furto!\n@${m.sender.split('@')[0]} perde ${penalty} XP333 come penalità.`,
    mentions: [m.sender, targetId]
  }, { quoted: m });
};

handler.command = /^rub(a|are)xp$/i;
handler.tags = ['rpg'];
handler.help = ['rubaxp @utente quantità'];
handler.group = true;

export default handler;
