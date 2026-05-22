//Plugin by Gab, Lucifero & 333 staff

const COOLDOWN = 2 * 60 * 1000; // 2 minuti

let handler = async (m, { conn }) => {
  const users = global.db.data.users;
  if (!users[m.sender]) users[m.sender] = { money: 0, bank: 0, lastGratta: 0 };
  const user = users[m.sender];

  const now = Date.now();
  const timePassed = now - (user.lastGratta || 0);

  if (timePassed < COOLDOWN) {
    const remaining = msToTime(COOLDOWN - timePassed);
    return conn.sendMessage(m.chat, {
      text: `⏳ 𝐃𝐞𝐯𝐢 𝐚𝐬𝐩𝐞𝐭𝐭𝐚𝐫𝐞 *${remaining}* 𝐏𝐫𝐢𝐦𝐚 𝐝𝐢 𝐠𝐫𝐚𝐭𝐭𝐚𝐫𝐞 𝐝𝐢 𝐧𝐮𝐨𝐯𝐨.`
    }, { quoted: m });
  }

  if (user.money < 500) {
    return conn.sendMessage(m.chat, {
      text: "❌ 𝐓𝐢 𝐬𝐞𝐫𝐯𝐨𝐧𝐨 𝟓𝟎𝟎€ 𝐩𝐞𝐫 𝐜𝐨𝐦𝐩𝐫𝐚𝐫𝐞 𝐮𝐧 𝐠𝐫𝐚𝐭𝐭𝐚 & 𝐯𝐢𝐧𝐜𝐢."
    }, { quoted: m });
  }

  user.money -= 500; 
  user.lastGratta = now;

  const simboli = ["💎", "💰", "🍀", "🔥", "💣", "🩸"];
  const griglia = [
    simboli[Math.floor(Math.random() * simboli.length)],
    simboli[Math.floor(Math.random() * simboli.length)],
    simboli[Math.floor(Math.random() * simboli.length)]
  ];

  let premio = 0;
  let risultato = "";
  const chance = Math.random() * 100;


  if (chance < 1) {
    griglia[0] = "🩸";
    griglia[1] = "🩸";
    griglia[2] = "🩸";
    premio = 15000;
    risultato = "𝐉𝐀𝐂𝐊𝐏𝐎𝐓 𝟑𝟑𝟑!! 𝐇𝐀𝐈 𝐕𝐈𝐍𝐓𝐎 𝟏𝟓𝟎𝟎𝟎€";
    user.money += premio;
  }
 
    else if (griglia.includes("💣")) {
    risultato = "💥 𝐁𝐎𝐌𝐁𝐀! 𝐇𝐚𝐢 𝐩𝐞𝐫𝐬𝐨 𝟐𝟎𝟎𝟎€!";
    user.bank = Math.max(0, user.bank - 2000);
  }

  else if (griglia[0] === griglia[1] && griglia[1] === griglia[2]) {
    premio = 2000;
    risultato = "✨ 𝐓𝐫𝐢𝐩𝐥𝐚 𝐜𝐨𝐦𝐛𝐢𝐧𝐚𝐳𝐢𝐨𝐧𝐞! 𝐇𝐚𝐢 𝐯𝐢𝐧𝐭𝐨 𝟐𝟎𝟎𝟎€";
    user.money += premio;
  }

  else {
    risultato = "❌ 𝐍𝐞𝐬𝐬𝐮𝐧𝐚 𝐯𝐢𝐧𝐜𝐢𝐭𝐚";
  }

  let messaggio = `
╔══『 ꙰  𝟥𝟥𝟥 𝔹𝕆𝕋  ꙰ 』══╗
┃
┃   ${griglia[0]}  │  ${griglia[1]}  │  ${griglia[2]}
┃━━━━━━━━━━━━━━
┃ 🎟️ 𝐂𝐨𝐬𝐭𝐨: 500€
┃ 🧾 𝐑𝐢𝐬𝐮𝐥𝐭𝐚𝐭𝐨: ${risultato}
┃ 💵 𝐂𝐨𝐧𝐭𝐚𝐧𝐭𝐢: ${user.money}€
┃ 🏦 𝐁𝐚𝐧𝐜𝐚: ${user.bank}€
┃
╚═════════╝
`.trim();

  conn.sendMessage(m.chat, { text: messaggio }, { quoted: m });
};

handler.command = /^gratta$/i;
handler.tags = ['rpg','fun'];
handler.help = ['gratta'];

export default handler;

function msToTime(duration) {
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let seconds = Math.floor((duration / 1000) % 60);

  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  return `${minutes}m ${seconds}s`;
}