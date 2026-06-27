//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn, text, usedPrefix, command, participants, isOwner, groupMetadata  }) => {
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  let message = "";
    for (const [ownerNumber] of global.owner) {
        message += `\nhttp://wa.me/${ownerNumber}`;
      }

  if (!isOwner) return m.reply(`Comando solo per gli owner se vuoi il bot chiedi a: ${message}`)


  let linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i;

  let [_, code] = text.match(linkRegex) || [];
  if (!code) throw `Link non valido!`;

  let owbot = global.owner[0]; // Assumendo che l'ID del proprietario sia il primo nella lista

  m.reply(`😎 Attendi 3 secondi, sto entrando nel gruppo`);
  await delay(3000);

  try {
      let res = await conn.groupAcceptInvite(code);
      let b = await conn.groupMetadata(res);
      let d = b.participants.map(v => v.id);
      let member = d.toString();
      let e = await d.filter(v => v.endsWith(owbot + '@s.whatsapp.net'));
      let now = new Date() * 1;

      if (e.length) {
          await conn.reply(res, `Ciao amici di ${b.subject}\n\n@${owbot} è il mio padrone\nI miei comandi sono visualizzabili in ${usedPrefix}menu`, m, { mentions: d });
      }

  } catch (e) {
      throw `Il bot è già nel gruppo`;
  }
}

handler.help = ['𝐣𝐨𝐢𝐧 <𝐥𝐢𝐧𝐤 𝐠𝐫𝐮𝐩𝐩𝐨>'];
handler.tags = ['owner'];
handler.command = ['join', 'entra']; 

export default handler;