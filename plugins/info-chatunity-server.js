const handler = async (m, { conn }) => {
  await conn.sendMessage(m.chat, {
    text: "🚧 *Funzionalità in arrivo!*\nPresto qui troverai tutte le info sul server ChatUnity.",
  }, { quoted: m });
};

handler.help = ['server'];
handler.tags = ['info'];
handler.command = /^server$/i;

export default handler;
