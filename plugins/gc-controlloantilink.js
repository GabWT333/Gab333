//Plugin by Gab, Lucifero & 333 staff

 
let handler = async (m, { conn, command, text }) => {
  if (!m.isGroup) {
    return conn.reply(m.chat, '『 ⚠️ 』 `Questo comando funziona solo nei gruppi.`', m);
  }

  const chat = global.db.data.chats[m.chat];
  
  if (!chat.antiLink) {
    chat.antiLink = false;
  }

  if (!text || (text.toLowerCase() !== 'on' && text.toLowerCase() !== 'off')) {
    const status = chat.antiLink ? 'attivo ✅' : 'disattivo ❌';
    return conn.reply(m.chat, `『 ℹ️ 』 *AntiLink è attualmente:* ${status}\n\n*Uso:*\n.antilink on\n.antilink off`, m);
  }

  const action = text.toLowerCase();

  if (action === 'on') {
    if (chat.antiLink) {
      return conn.reply(m.chat, '『 ℹ️ 』 `AntiLink è già attivo in questo gruppo.`', m);
    }

    chat.antiLink = true;

    let profilePic;
    try {
      profilePic = await conn.profilePictureUrl(m.sender, 'image');
    } catch (e) {
      profilePic = null;
    }

    const messageText = `✅ 𝐀𝐧𝐭𝐢𝐋𝐢𝐧𝐤 𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨

Tutti i link verranno eliminati automaticamente.`;

    await conn.sendMessage(m.chat, {
      text: messageText,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363341274693350@newsletter',
          serverMessageId: -1,
          newsletterName: global.nomebot || '333'
        },
        externalAdReply: {
          title: '『 𝐀𝐍𝐓𝐈 - 𝐋𝐈𝐍𝐊 』 𝐎𝐍',
          body: 'Vai al canale 333',
          mediaType: 1,
          thumbnail: profilePic 
            ? await (await fetch(profilePic)).buffer() 
            : await (await fetch('https://telegra.ph/file/a3b727e38149464863380.png')).buffer(),
          renderLargerThumbnail: false,
          sourceUrl: 'https://whatsapp.com/channel/0029VauhQviCsU9Ibrwlkb0h'
        }
      }
    });

  } else if (action === 'off') {
    if (!chat.antiLink) {
      return conn.reply(m.chat, '『 ℹ️ 』 `AntiLink è già disattivo in questo gruppo.`', m);
    }

    chat.antiLink = false;

    let profilePic;
    try {
      profilePic = await conn.profilePictureUrl(m.sender, 'image');
    } catch (e) {
      profilePic = null;
    }

    const messageText = `❌ 𝐀𝐧𝐭𝐢𝐋𝐢𝐧𝐤 𝐝𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨

I link sono ora consentiti nel gruppo.`;

    await conn.sendMessage(m.chat, {
      text: messageText,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363341274693350@newsletter',
          serverMessageId: -1,
          newsletterName: global.nomebot || '333'
        },
        externalAdReply: {
          title: '『 𝐀𝐍𝐓𝐈 - 𝐋𝐈𝐍𝐊 』 𝐎𝐅𝐅',
          body: 'Vai al canale 333',
          mediaType: 1,
          thumbnail: profilePic 
            ? await (await fetch(profilePic)).buffer() 
            : await (await fetch('https://telegra.ph/file/a3b727e38149464863380.png')).buffer(),
          renderLargerThumbnail: false,
          sourceUrl: 'https://whatsapp.com/channel/0029VauhQviCsU9Ibrwlkb0h'
        }
      }
    });
  }
};

handler.help = ['antilink'];
handler.tags = ['gruppo'];
handler.command = ['antilink'];
handler.group = true;
handler.admin = true;

export default handler;
