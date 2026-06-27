let handler = async (m, { conn }) => {
  let imageUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500';

  await conn.sendMessage(m.chat, {
    image: { url: imageUrl },
    caption: `🤖 *333BOT*\nMessaggio con pulsanti og\n\nayo`,
    footer: `© 333Bot`,
    templateButtons: [
      { index: 1, quickReplyButton: { displayText: '📡 Menu', id: '.menu' } },
      { index: 2, quickReplyButton: { displayText: '👤 Profilo', id: '.profilo' } }
    ]
  }, { quoted: m });
};

handler.help = ['menutest'];
handler.tags = ['main'];
handler.command = /^(menutest)$/i;

export default handler;