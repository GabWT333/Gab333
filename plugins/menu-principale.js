

const SECTIONS = [
  { image: 'icone/333.jpg', title: '👥 STAFF', body: 'Scopri chi gestisce il bot', cmd: 'staff', label: '👥 Apri Staff' },
  { image: 'icone/333.jpg', title: '⚙️ FUNZIONI', body: 'Sicurezza nel gruppo', cmd: 'funzioni', label: '⚙️ Apri Funzioni' },
  { image: 'icone/333.jpg', title: '👑 ADMIN', body: 'Comandi di amministrazione gruppo', cmd: 'admin', label: '👑 Apri Admin' },
  { image: 'icone/333.jpg', title: '🎮 GIOCHI', body: 'Minigiochi e sfide', cmd: 'giochi', label: '🎮 Apri Giochi' },
  { image: 'icone/333.jpg', title: '🎰 RPG', body: 'Il mondo RPG di 333 BOT', cmd: 'rpg', label: '🎰 Apri RPG' },
  { image: 'icone/333.jpg', title: '🔐 OWNER', body: 'Comandi riservati owner', cmd: 'owner', label: '🔐 Apri Owner' },
  { image: 'icone/333.jpg', title: '🛠️ ASSISTENZA', body: 'Numeri, canale, supporto e sito', cmd: 'assistenza', label: '🛠️ Apri Assistenza' }
];

let handler = async (m, { conn, usedPrefix }) => {
  const senderName = await conn.getName(m.sender);
  const targetJid = m.mentionedJid?.[0] || m.quoted?.sender || m.sender;

  const botName = global.db.data.nomedelbot || " ꙰ 𝟥𝟥𝟥 𝔹𝕆𝕋  ꙰";
  const botVersion = global.db.data.version || "𝟏𝟎.𝟐";

  const fake = {
    key: {
      participants: '0@s.whatsapp.net',
      fromMe: false,
      id: '333Menu'
    },
    message: {
      contactMessage: {
        displayName: `⚡️ 𝐌𝐞𝐧𝐮 𝐏𝐫𝐢𝐧𝐜𝐢𝐩𝐚𝐥𝐞`,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${targetJid.split('@')[0]}:${targetJid.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
      }
    },
    participant: '0@s.whatsapp.net'
  }

  const cards = [{
    image: { url: 'icone/333.jpg' },
    title: '📚 Menu principale',
    body: `Seleziona una categoria per aprire il relativo submenu.\n\n🚀 ${botName} • v${botVersion}`,
    footer: '333 bot',
    buttons: [{
      name: 'single_select',
      buttonParamsJson: JSON.stringify({
        title: 'Seleziona categoria',
        sections: [{
          title: 'Categorie',
          rows: SECTIONS.map(section => ({
            title: section.title,
            description: section.body,
            id: `${usedPrefix}${section.cmd}`
          }))
        }]
      })
    }]
  }];

  await conn.sendMessage(m.chat, {
    text: `⚡️ 𝐌𝐄𝐍Ù 𝐏𝐑𝐈𝐍𝐂𝐈𝐏𝐀𝐋𝐄 𝐃𝐈 ${botName}`,
    footer: '333 bot',
    cards,
    mentions: [targetJid]
  }, { quoted: fake });
};

handler.help = ["menu"];
handler.tags = ['menu'];
handler.command = /^(menu|comandi)$/i;

export default handler;