//Plugin by Gab, Lucifero & 333 staff

import fetch from 'node-fetch'


let handler = async (m, { conn, args, command }) => {

    let pp
    try {
      pp = await conn.profilePictureUrl(m.chat, 'image')
    } catch {
      pp = null
    }

    const ppBuffer = pp
      ? await (await fetch(pp)).buffer()
      : await (await fetch('https://telegra.ph/file/17e7701f8b0a63806e312.png')).buffer()

    const fake = {
      key: {
        participants: '0@s.whatsapp.net',
        fromMe: false,
        id: '333BotAttivo'
      },
      message: {
        locationMessage: {
          name: '*BOT USCITO*',
          jpegThumbnail: ppBuffer.toString('base64'),
          vcard: 'BEGIN:VCARD\nVERSION:3.0\nN:;Admin;;;\nFN:Admin\nEND:VCARD'
        }
      },
      participant: '0@s.whatsapp.net'
    }

    const caption = `Me so cagato il cazzo di fare il bot di turno qua dentro! 💩`;

  await conn.sendMessage(m.chat, { text: caption }, { quoted: fake });


  await conn.groupLeave(m.chat);
};
handler.help = ['𝐨𝐮𝐭'];
handler.command = /^(out|leavegc|leave|salirdelgrupo)$/i;
handler.group = true;
handler.tags = ['owner'];
handler.owner = true;
export default handler;