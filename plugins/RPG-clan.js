//Plugin by Gab, Lucifero & 333 staff

global.clans = global.clans || {};
global.db = global.db || {};
global.warHistory = global.warHistory || {};

const MAX_MEMBERS = 5;
const WAR_COST = 200;
const WIN_REWARD = 500;
const LOSE_PENALTY = 200;
const MAX_WARS = 5;
const COOLDOWN = 10 * 60 * 1000;

function getClanByUser(user, chat) {
  const clans = global.clans[chat] || {};
  return Object.values(clans).find(c => c.members.includes(user));
}

function getMoney(user) {
  const u = global.db.data.users[user];
  return (u?.bank || 0) + (u?.money || 0);
}

function payAmount(user, amount) {
  const u = global.db.data.users[user];
  if (!u) return false;

  if (amount < 0) {
    u.money = (u.money || 0) - amount;
    return true;
  }

  if ((u.bank || 0) >= amount) {
    u.bank -= amount;
    return true;
  }

  let restante = amount - (u.bank || 0);
  u.bank = 0;

  if ((u.money || 0) >= restante) {
    u.money -= restante;
    return true;
  }

  return false;
}

function msToTime(duration) {
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let seconds = Math.floor((duration / 1000) % 60);

  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return `${minutes} minuti ${seconds} secondi`;
}

let handler = async (m, { conn, command, text }) => {
  const sender = m.sender;
  const chat = m.chat;

  global.clans[chat] = global.clans[chat] || {};

  if (command === "clan") {
    if (getClanByUser(sender, chat)) return m.reply("Sei già in un clan");

    const tagged = m.mentionedJid || [];
    if (tagged.length !== 4) return m.reply("𝐈 𝐜𝐥𝐚𝐧 𝐬𝐨𝐧𝐨 𝐜𝐨𝐦𝐩𝐨𝐬𝐭𝐢 𝐝𝐚 𝟓 𝐩𝐞𝐫𝐬𝐨𝐧𝐞, 𝐭𝐚𝐠𝐠𝐚𝐧𝐞 𝟒 𝐩𝐞𝐫 𝐟𝐨𝐧𝐝𝐚𝐫𝐞 𝐮𝐧 𝐜𝐥𝐚𝐧.");

    const name = text.split("@")[0].trim();
    if (!name) return m.reply("𝐃𝐞𝐯𝐢 𝐬𝐜𝐫𝐢𝐯𝐞𝐫𝐞 𝐢𝐥 𝐧𝐨𝐦𝐞 𝐝𝐞𝐥 𝐜𝐥𝐚𝐧 𝐩𝐫𝐢𝐦𝐚 𝐝𝐢 𝐭𝐚𝐠𝐠𝐚𝐫𝐞\n𝐄𝐬𝐞𝐦𝐩𝐢𝐨: .𝐜𝐥𝐚𝐧 𝟑𝟑𝟑 𝐛𝐨𝐭 @𝟏 @𝟐 @𝟑 @𝟒");

    const members = [sender, ...tagged];
    for (let u of members) if (getClanByUser(u, chat)) return m.reply("𝐔𝐧 𝐦𝐞𝐦𝐛𝐫𝐨 𝐭𝐚𝐠𝐠𝐚𝐭𝐨 𝐟𝐚 𝐠𝐢𝐚̀ 𝐩𝐚𝐫𝐭𝐞 𝐝𝐢 𝐮𝐧 𝐜𝐥𝐚𝐧!");

    const id = "clan_" + Date.now();

    global.clans[chat][id] = { id, chat, name, founder: sender, members, reputation: 0 };

    let msg = `𝐂𝐋𝐀𝐍 𝐅𝐎𝐍𝐃𝐀𝐓𝐎!\n\n𝐧𝐨𝐦𝐞 𝐜𝐥𝐚𝐧: *${name}*\n𝐅𝐨𝐧𝐝𝐚𝐭𝐨𝐫𝐞: @${sender.split("@")[0]}\n> 𝐃𝐢𝐠𝐢𝐭𝐚 ’’.𝐞𝐬𝐜𝐢𝐜𝐥𝐚𝐧’’ 𝐩𝐞𝐫 𝐮𝐬𝐜𝐢𝐫𝐞 𝐝𝐚𝐥 𝐜𝐥𝐚𝐧\n> 𝐃𝐢𝐠𝐢𝐭𝐚 ’’.𝐠𝐮𝐞𝐫𝐫𝐚’’ 𝐩𝐞𝐫 𝐚𝐭𝐭𝐚𝐜𝐜𝐚𝐫𝐞 𝐮𝐧 𝐜𝐥𝐚𝐧.\n𝐌𝐞𝐦𝐛𝐫𝐢:\n`;
    members.forEach(u => msg += `- @${u.split("@")[0]}\n`);

    return conn.sendMessage(chat, { text: msg, mentions: members });
  }

  if (command === "esciclan") {
    const clan = getClanByUser(sender, chat);
    if (!clan) return m.reply("𝐍𝐨𝐧 𝐬𝐞𝐢 𝐢𝐧 𝐮𝐧 𝐜𝐥𝐚𝐧");

    if (clan.founder === sender) {
      delete global.clans[chat][clan.id];
      return m.reply("𝐈𝐥 𝐟𝐨𝐧𝐝𝐚𝐭𝐨𝐫𝐞 𝐞̀ 𝐮𝐬𝐜𝐢𝐭𝐨, 𝐢𝐥 𝐜𝐥𝐚𝐧 𝐞̀ 𝐬𝐭𝐚𝐭𝐨 𝐚𝐮𝐭𝐨𝐦𝐚𝐭𝐢𝐜𝐚𝐦𝐞𝐧𝐭𝐞 𝐬𝐜𝐢𝐨𝐥𝐭𝐨");
    }

    clan.members = clan.members.filter(u => u !== sender);
    return m.reply("𝐒𝐞𝐢 𝐮𝐬𝐜𝐢𝐭𝐨 𝐝𝐚𝐥 𝐜𝐥𝐚𝐧");
  }

  if (command === "guerra") {
    const clan = getClanByUser(sender, chat);
    if (!clan) return m.reply("𝐍𝐨𝐧 𝐬𝐞𝐢 𝐢𝐧 𝐧𝐞𝐬𝐬𝐮𝐧 𝐜𝐥𝐚𝐧");

    global.db.data.users[sender] = global.db.data.users[sender] || {};
    const user = global.db.data.users[sender];

    const now = Date.now();
    const timePassed = now - (user.lastWar || 0);

    if (user.warCount >= MAX_WARS && timePassed < COOLDOWN) {
      const remaining = COOLDOWN - timePassed;
      return m.reply(`𝐋𝐢𝐦𝐢𝐭𝐞 𝐝𝐢 𝟓 𝐠𝐮𝐞𝐫𝐫𝐞 𝐫𝐚𝐠𝐠𝐢𝐮𝐧𝐭𝐨.\n𝐈𝐥 𝐥𝐢𝐦𝐢𝐭𝐞 𝐬𝐜𝐚𝐝𝐞 𝐭𝐫𝐚 *${msToTime(remaining)}* `);
    }

    if (timePassed >= COOLDOWN) {
      user.warCount = 0;
      user.lastWar = now;
    }

    const clans = global.clans[chat];
    const enemyClan = Object.values(clans).find(c => c.id !== clan.id);

    if (!enemyClan) return m.reply("𝐍𝐨𝐧 𝐜’𝐞̀ 𝐧𝐞𝐬𝐬𝐮𝐧 𝐜𝐥𝐚𝐧 𝐝𝐚 𝐚𝐭𝐭𝐚𝐜𝐜𝐚𝐫𝐞.");

    await conn.sendMessage(chat, {
      text: `⚔️ 𝐆𝐮𝐞𝐫𝐫𝐚 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨: *${clan.name}* 🆚 *${enemyClan.name}* ⚔️`
    });

    for (let u of clan.members) if (getMoney(u) < WAR_COST) return m.reply("𝐓𝐮𝐭𝐭𝐢 𝐢 𝐦𝐞𝐦𝐛𝐫𝐢 𝐝𝐞𝐥 𝐜𝐥𝐚𝐧 𝐝𝐞𝐯𝐨𝐧𝐨 𝐚𝐯𝐞𝐫𝐞 𝐚𝐥𝐦𝐞𝐧𝐨 𝟐𝟎𝟎€ 𝐭𝐫𝐚 𝐛𝐚𝐧𝐜𝐚 𝐞 𝐩𝐨𝐫𝐭𝐚𝐟𝐨𝐠𝐥𝐢𝐨.");

    clan.members.forEach(u => payAmount(u, WAR_COST));

    const win = Math.random() > 0.5;

    if (win) {
      for (let u of enemyClan.members) if (getMoney(u) < WIN_REWARD) return m.reply("𝐈𝐥 𝐜𝐥𝐚𝐧 𝐧𝐞𝐦𝐢𝐜𝐨 𝐧𝐨𝐧 𝐡𝐚 𝐚𝐛𝐛𝐚𝐬𝐭𝐚𝐧𝐳𝐚 𝐬𝐨𝐥𝐝𝐢.");

      enemyClan.members.forEach(u => payAmount(u, WIN_REWARD));
      clan.members.forEach(u => payAmount(u, -WIN_REWARD));

      clan.reputation += 1;

      user.warCount = (user.warCount || 0) + 1;
      user.lastWar = now;

      return m.reply("𝐆𝐔𝐄𝐑𝐑𝐀 𝐕𝐈𝐍𝐓𝐀!\n+𝟓𝟎𝟎€ 𝐚 𝐭𝐞𝐬𝐭𝐚\n-𝟐𝟎𝟎€ 𝐚 𝐭𝐞𝐬𝐭𝐚 𝐩𝐞𝐫 𝐢𝐥 𝐜𝐥𝐚𝐧 𝐚𝐯𝐯𝐞𝐫𝐬𝐚𝐫𝐢𝐨\n𝐈𝐥 𝐜𝐥𝐚𝐧 𝐜𝐫𝐞𝐬𝐜𝐞 𝐝𝐢 +𝟏 𝐫𝐞𝐩𝐮𝐭𝐚𝐳𝐢𝐨𝐧𝐞");
    } else {
      clan.members.forEach(u => payAmount(u, LOSE_PENALTY));

      enemyClan.reputation += 1;

      user.warCount = (user.warCount || 0) + 1;
      user.lastWar = now;

      return m.reply("𝐆𝐔𝐄𝐑𝐑𝐀 𝐏𝐄𝐑𝐒𝐀.\n-𝟐𝟎𝟎€ 𝐚 𝐭𝐞𝐬𝐭𝐚 𝐩𝐞𝐫 𝐢𝐥 𝐜𝐥𝐚𝐧 𝐜𝐡𝐞 𝐡𝐚 𝐚𝐭𝐭𝐚𝐜𝐜𝐚𝐭𝐨\n+𝟐𝟎𝟎€ 𝐚 𝐭𝐞𝐬𝐭𝐚 𝐩𝐞𝐫 𝐢𝐥 𝐜𝐥𝐚𝐧 𝐯𝐢𝐧𝐜𝐞𝐧𝐭𝐞\n+𝟏 𝐫𝐞𝐩𝐮𝐭𝐚𝐳𝐢𝐨𝐧𝐞 𝐩𝐞𝐫 𝐢𝐥 𝐜𝐥𝐚𝐧 𝐧𝐞𝐦𝐢𝐜𝐨.");
    }
  }

  if (command === "topclan") {
    const clans = Object.values(global.clans[chat] || {});
    if (!clans.length) return m.reply("Non ci sono clan in questo gruppo.");

    let msg = "📜 𝐓𝐎𝐏 𝐂𝐋𝐀𝐍 𝐏𝐄𝐑𝐈𝐂𝐎𝐋𝐎𝐒𝐈:\n\n";

    clans.forEach(c => {
      msg += `- *${c.name}*, 𝐅𝐨𝐧𝐝𝐚𝐭𝐨𝐫𝐞: @${c.founder.split("@")[0]}, 𝐌𝐞𝐦𝐛𝐫𝐢: *${c.members.length}*, 𝐑𝐞𝐩𝐮𝐭𝐚𝐳𝐢𝐨𝐧𝐞 *${c.reputation}*\n`;
    });

    return conn.sendMessage(chat, { text: msg, mentions: clans.map(c => c.members).flat() });
  }
};

handler.command = /^(clan|esciclan|guerra|topclan)$/i;
handler.group = true;

export default handler;