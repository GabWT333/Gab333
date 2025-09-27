import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const [courier, tracking] = text.split(' ');

  if (!courier || !tracking) {
    return m.reply(`❗ Usa il comando così:\n${usedPrefix + command} <corriere> <tracking number>\nEsempio: ${usedPrefix + command} DHL 123456789`);
  }

  try {
    const options = {
      method: 'GET',
      url: 'https://trackingpackage.p.rapidapi.com/TrackingPackage',
      headers: {
        'x-rapidapi-host': 'trackingpackage.p.rapidapi.com',
        Authorization: 'Basic Ym9sZGNoYXQ6TGZYfm0zY2d1QzkuKz9SLw=='
      },
      params: {
        TrackingNumber: tracking,
        CourierCode: courier
      }
    };

    const { data } = await axios.request(options);

    if (!data || !data.TrackingResults) return m.reply('❌ Nessun risultato trovato per questo tracking.');

    const info = data.TrackingResults;
    let msg = `📦 *Tracking per ${courier.toUpperCase()}*\n\n`;
    msg += `🔍 Numero: ${tracking}\n`;
    msg += `📝 Stato: ${info.StatusDescription || 'Non disponibile'}\n`;
    msg += `📍 Posizione attuale: ${info.CurrentLocation || 'Non disponibile'}\n`;
    msg += `🕒 Ultimo aggiornamento: ${info.UpdatedTime || 'Non disponibile'}\n`;

    m.reply(msg);
  } catch (e) {
    console.error(e);
    m.reply('❌ Errore durante il recupero delle informazioni di tracking. Verifica i dati inseriti.');
  }
};

handler.help = ['track <corriere> <tracking>'];
handler.tags = ['tools'];
handler.command = /^track$/i;

export default handler;