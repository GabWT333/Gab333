//Plugin by Gab, Lucifero & 333 staff

import fetch from 'node-fetch';

export async function before(m, { conn, participants }) {
  if (!m.isGroup) return;

  let chat = global.db.data.chats[m.chat];
  if (!chat.welcome) return;

  let groupMetadata = await conn.groupMetadata(m.chat) || (conn.chats[m.chat] || {}).metadata;
  let participants_new = m.messageStubParameters;

  for (let user of participants_new) {
    let profilePic;
    try {
      profilePic = await conn.profilePictureUrl(user, 'image');
    } catch {
      profilePic = 'https://telegra.ph/file/8ca14ef9fa43e99d1d196.jpg';
    }

    let ppBuffer;
    try {
      ppBuffer = await (await fetch(profilePic)).buffer();
    } catch {
      ppBuffer = await (await fetch('https://telegra.ph/file/8ca14ef9fa43e99d1d196.jpg')).buffer();
    }

    if (m.messageStubType === 27) {
      let welcomeText = chat.sWelcome || `@${user.split('@')[0]} 𝐞̀ 𝐞𝐧𝐭𝐫𝐚𝐭𝐨 𝐧𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨`;

      welcomeText = welcomeText
        .replace(/@user/g, `@${user.split('@')[0]}`)
        .replace(/@group/g, groupMetadata.subject)
        .replace(/@count/g, groupMetadata.participants.length)
        .replace(/@desc/g, groupMetadata.desc?.toString() || 'Nessuna descrizione');

      welcomeText += `\n\n👥 𝐌𝐞𝐦𝐛𝐫𝐢 𝐧𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨: ${groupMetadata.participants.length}`;

      const fakeWelcome = {
        key: {
          participants: '0@s.whatsapp.net',
          fromMe: false,
          id: '333Welcome'
        },
        message: {
          locationMessage: {
            name: '𝐁𝐞𝐧𝐯𝐞𝐧𝐮𝐭𝐨 👋',
            jpegThumbnail: ppBuffer.toString('base64'),
            vcard: 'BEGIN:VCARD\nVERSION:3.0\nN:;Welcome;;;\nFN:Welcome\nEND:VCARD'
          }
        },
        participant: '0@s.whatsapp.net'
      }

      await conn.sendMessage(m.chat, {
        text: welcomeText,
        mentions: [user]
      }, { quoted: fakeWelcome });
    }
  }
}