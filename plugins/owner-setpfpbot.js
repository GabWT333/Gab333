//Plugin by Gab, Lucifero & 333 staff

import Jimp from 'jimp';

let handler = async (m, { args, conn, command }) => {
  const numeroAutorizzato = '393882471151@s.whatsapp.net';
  const gruppoNotifica = '120363396779012019@g.us';

  if (m.sender !== numeroAutorizzato) {
    let alertMessage = `⚠️ Numero *${m.sender.split('@')[0]}* ha provato a usare il comando *setppbot*!`;
    
    await conn.sendMessage(gruppoNotifica, {
      text: alertMessage,
      mentions: [m.sender]
    });

    await m.reply('⚠️ Non hai il permesso di usare questo comando!');
    return;
  }

  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || q.mediaType || '';
  
  if (!/image/g.test(mime)) {
    return m.reply('Rispondi a un\'immagine.');
  }

  let media = await q.download();

  if (args[0] === '--full') {
    let { img } = await pepe(media);
    await conn.query({
      tag: 'iq',
      attrs: {
        to: conn.user.jid,
        type: 'set',
        xmlns: 'w:profile:picture'
      },
      content: [{
        tag: 'picture',
        attrs: { type: 'image' },
        content: img
      }]
    });
    return m.reply('La foto profilo del bot è stata cambiata con successo.');
  }

  await conn.updateProfilePicture(conn.user.jid, media);
  await m.reply('La foto profilo del bot è stata cambiata con successo.');
};

handler.help = ['𝐬𝐞𝐭𝐩𝐩𝐛𝐨𝐭'];
handler.tags = ['owner'];
handler.command = /^setpp|setppbot|immagineprofilo?$/i;
handler.owner = true;

export default handler;

async function pepe(media) {
  const jimp_1 = await Jimp.read(media);
  const min = jimp_1.getWidth();
  const max = jimp_1.getHeight();
  const cropped = jimp_1.crop(0, 0, min, max);
  return {
    img: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
    preview: await cropped.normalize().getBufferAsync(Jimp.MIME_JPEG)
  };
}