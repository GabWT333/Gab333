//Plugin by Gab, Lucifero & 333 staff

import fetch from 'node-fetch';

const pendingGoodbyes = new Map();
const goodbyeBatchDelay = 3000;

async function sendGoodbyeBatch(chatId, conn, users) {
  const chat = global.db.data.chats[chatId];
  if (!chat?.goodbye || !users.length) return;

  const groupMetadata = await conn.groupMetadata(chatId) || (conn.chats[chatId] || {}).metadata;
  if (!groupMetadata) return;

  let profilePic;
  try {
    profilePic = await conn.profilePictureUrl(users[0], 'image');
  } catch {
    profilePic = 'https://telegra.ph/file/8ca14ef9fa43e99d1d196.jpg';
  }

  let ppBuffer;
  try {
    ppBuffer = await (await fetch(profilePic)).buffer();
  } catch {
    ppBuffer = await (await fetch('https://telegra.ph/file/8ca14ef9fa43e99d1d196.jpg')).buffer();
  }

  const goodbyeText = users.map(user => {
    let text = chat.sBye || `@${user.split('@')[0]} 𝐡𝐚 𝐥𝐚𝐬𝐜𝐢𝐚𝐭𝐨 𝐢𝐥 𝐠𝐫𝐮𝐩𝐩𝐨`;

    return text
      .replace(/@user/g, `@${user.split('@')[0]}`)
      .replace(/@group/g, groupMetadata.subject)
      .replace(/@count/g, groupMetadata.participants.length);
  }).join('\n');

  const fakeBye = {
    key: {
      participants: '0@s.whatsapp.net',
      fromMe: false,
      id: '333Bye'
    },
    message: {
      locationMessage: {
        name: '𝐀𝐝𝐝𝐢𝐨 👋',
        jpegThumbnail: ppBuffer.toString('base64'),
        vcard: 'BEGIN:VCARD\nVERSION:3.0\nN:;Bye;;;\nFN:Bye\nEND:VCARD'
      }
    },
    participant: '0@s.whatsapp.net'
  };

  await conn.sendMessage(chatId, {
    text: `${goodbyeText}\n\n👥 𝐌𝐞𝐦𝐛𝐫𝐢 𝐫𝐢𝐦𝐚𝐧𝐞𝐧𝐭𝐢: ${groupMetadata.participants.length}`,
    mentions: users
  }, { quoted: fakeBye });
}

export async function before(m, { conn, participants }) {
  if (!m.isGroup) return;

  const chat = global.db.data.chats[m.chat];
  if (!chat?.goodbye || m.messageStubType !== 28) return;

  const participantsNew = m.messageStubParameters || [];
  if (!participantsNew.length) return;

  const batch = pendingGoodbyes.get(m.chat) || { conn, users: new Set(), timer: null };
  for (const user of participantsNew) batch.users.add(user);
  batch.conn = conn;

  if (batch.timer) clearTimeout(batch.timer);
  batch.timer = setTimeout(async () => {
    pendingGoodbyes.delete(m.chat);
    try {
      await sendGoodbyeBatch(m.chat, batch.conn, [...batch.users]);
    } catch (error) {
      console.error('Errore nell invio dell addio:', error);
    }
  }, goodbyeBatchDelay);

  pendingGoodbyes.set(m.chat, batch);
}
