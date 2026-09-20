//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let chat = global.db.data.chats[m.chat];
  
  if (!text) {
    return m.reply(`ⓘ 𝐔𝐬𝐨 𝐝𝐞𝐥 𝐜𝐨𝐦𝐚𝐧𝐝𝐨:

*𝐕𝐚𝐫𝐢𝐚𝐛𝐢𝐥𝐢 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐢:*
• @user - Menziona l'utente
• @group - Nome del gruppo
• @count - Numero membri

*𝐄𝐬𝐞𝐦𝐩𝐢:*
${usedPrefix}${command} Addio @user, ci mancherai!

*𝐑𝐞𝐬𝐞𝐭:*
${usedPrefix}${command} reset

*𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐚𝐭𝐭𝐮𝐚𝐥𝐞:*
${chat.sBye || '@user 𝐡𝐚 𝐥𝐚𝐬𝐜𝐢𝐚𝐭𝐨 𝐢𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 (predefinito)'}`);
  }
  
  
  if (text.toLowerCase() === 'reset') {
    delete chat.sBye;
    return m.reply(`✅ 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐫𝐢𝐩𝐫𝐢𝐬𝐭𝐢𝐧𝐚𝐭𝐨!

*𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐩𝐫𝐞𝐝𝐞𝐟𝐢𝐧𝐢𝐭𝐨:*
@user 𝐡𝐚 𝐥𝐚𝐬𝐜𝐢𝐚𝐭𝐨 𝐢𝐥 𝐠𝐫𝐮𝐩𝐩𝐨

ⓘ Usa ${usedPrefix}simula addio per testarlo`);
  }
  
  chat.sBye = text;
  
  m.reply(`✅ 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐝𝐢 𝐚𝐝𝐝𝐢𝐨 𝐚𝐠𝐠𝐢𝐨𝐫𝐧𝐚𝐭𝐨!

*𝐍𝐮𝐨𝐯𝐨 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨:*
${text}

ⓘ Usa ${usedPrefix}simula addio per testarlo
ⓘ Usa ${usedPrefix}${command} reset per ripristinare`);
};

handler.help = ['𝐬𝐞𝐭𝐛𝐲𝐞'];
handler.tags = ['admin'];
handler.command = /^setbye|setaddio$/i;
handler.admin = true;
handler.group = true;

export default handler;
