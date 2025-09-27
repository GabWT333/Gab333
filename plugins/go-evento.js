let handler = async (m, { conn, text, args, command }) => {
  const jid = m.chat;
  const now = Date.now();
  const startTime = now + 60 * 60 * 1000;
  const endTime = now + 3 * 60 * 60 * 1000;

  await conn.sendMessage(
    jid,
    {
      event: {
        isCanceled: false,
        name: 'mangiamo zozzap',
        description: 'preparate i culi',
        location: {
          degreesLatitude: 45.4642,
          degreesLongitude: 9.19,
          name: 'zozzap'
        },
        startTime,
        endTime,
        extraGuestsAllowed: true
      }
    },
    { quoted: m }
  );
};

handler.command = ['creaevento'];
export default handler;