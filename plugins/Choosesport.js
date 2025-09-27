// Fix: Crea il file rss_sources.json se non esiste (workaround per errori di altri moduli che lo richiedono)
import fs from 'fs'
const rssPath = './rss_sources.json'
if (!fs.existsSync(rssPath)) {
  fs.writeFileSync(rssPath, JSON.stringify([]))
}

let handler = async (m, { conn }) => {
  global.db.data.users[m.sender] = global.db.data.users[m.sender] || {};

  const sports = [
    { name: '⚽ Calcio', id: 'calcio' },
    { name: '🏀 Basket', id: 'basket' },
    { name: '🎾 Tennis', id: 'tennis' },
    { name: '🏎️ Formula 1', id: 'formula1' },
    { name: '🥊 MMA', id: 'mma' },
    { name: '🚴‍♂️ Ciclismo', id: 'ciclismo' }
  ];

  const buttons = sports.map(sport => ({
    buttonId: `.sportselect ${sport.id}`,
    buttonText: { displayText: sport.name },
    type: 1
  }));

  return await conn.sendMessage(m.chat, {
    text: '📌 *Scegli lo sport che vuoi seguire per ricevere le notizie personalizzate:*',
    footer: '💡 Puoi cambiarlo in qualsiasi momento',
    buttons,
    headerType: 1
  }, { quoted: m });
};

handler.command = /^chooseSport$/i;
handler.help = ['chooseSport'];
handler.tags = ['settings'];
export default handler;