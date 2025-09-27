const handler = async (m, { conn }) => {
  const text = `
╭━〔 *🌐 CANALI UFFICIALI* 〕━┈⊷
┃─────────────·๏
┃✨ *ChatUnity* 
┃🔗 https://whatsapp.com/channel/0029VaZVlJZHwXb8naJBQN0J
┃
┃🤖 *ChatUnity-Bot*
┃🔗 https://whatsapp.com/channel/0029Vb32UwhA89MZtd6WRS3G
┃
┃🌍 *ChatUnity Server*
┃🔗 https://whatsapp.com/channel/0029VbA4h0pKmCPS5ozJsm3j
┃╰─────────────·๏
╰━━━━━━━━━━━━━━━━━━━⊷

*Unisciti ai nostri canali per restare aggiornato, ricevere supporto e scoprire tutte le novità!*

💎 _Powered by ChatUnity_
`.trim();

  await conn.sendMessage(m.chat, {
    text,
    footer: 'Scegli un canale e unisciti!'
  }, { quoted: m });
};

handler.help = ['canali'];
handler.tags = ['info'];
handler.command = /^canali$/i;

export default handler;
