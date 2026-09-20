const ANTIBAN_DELAY = 3000;

const wait = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));

const handler = () => {};

handler.before = async function (m, { conn, match }) {
  const chat = global.db.data.chats[m.chat] || {};
  if (!chat.antiban || !match?.[0] || m.fromMe || m.isBaileys) return false;

  await conn.sendPresenceUpdate('composing', m.chat).catch(() => {});
  await wait(ANTIBAN_DELAY);
  await conn.sendPresenceUpdate('paused', m.chat).catch(() => {});

  return false;
};

export default handler;
