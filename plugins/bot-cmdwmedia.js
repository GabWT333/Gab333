//Plugin by Gab, Lucifero & 333 staff

const {
  proto,
  generateWAMessage,
  areJidsSameUser,
} = (await import('@chatunity/baileys')).default;
export async function all(m, chatUpdate) {
  try {
    if (!isValidMessage(m)) return;
    const stickerHash = getStickerHash(m);
    if (!stickerHash) return;
    const stickerData = getStickerData(stickerHash);
    if (!stickerData) return;
    await sendStickerResponse(m, chatUpdate, stickerData);
  } catch (error) {
    console.error('Errore nel handler degli sticker:', error);
  }
}
function isValidMessage(m) {
  return !m.isBaileys && 
         m.message && 
         m.msg?.fileSha256;
}
function getStickerHash(m) {
  try {
    return Buffer.from(m.msg.fileSha256).toString('base64');
  } catch (error) {
    console.warn('Errore nella conversione dell\'hash dello sticker:', error);
    return null;
  }
}
function getStickerData(hash) {
  return global.db?.data?.sticker?.[hash] || null;
}
async function sendStickerResponse(m, chatUpdate, stickerData) {
  const { text, mentionedJid } = stickerData;
  const messages = await generateWAMessage(
    m.chat, 
    { 
      text: text, 
      mentions: mentionedJid || [] 
    }, 
    {
      userJid: this.user.id,
      quoted: m.quoted?.fakeObj || null,
    }
  );
  configureMessageProperties(messages, m);
  emitMessageUpdate(chatUpdate, messages);
}
function configureMessageProperties(messages, originalMessage) {
  messages.key.fromMe = areJidsSameUser(originalMessage.sender, this.user.id);
  messages.key.id = originalMessage.key.id;
  messages.pushName = originalMessage.pushName;
  
  if (originalMessage.isGroup) {
    messages.participant = originalMessage.sender;
  }
}
function emitMessageUpdate(chatUpdate, messages) {
  const messageUpdate = {
    ...chatUpdate,
    messages: [proto.WebMessageInfo.fromObject(messages)],
    type: 'append',
  };
  
  this.ev.emit('messages.upsert', messageUpdate);
}