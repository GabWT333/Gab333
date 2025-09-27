//Créditos del código DanielDiod 

import cheerio from 'cheerio';
import axios from 'axios';

let handler = async (m, { conn, args, command, usedPrefix }) => {
  const emoji = "🔞";
  const emoji2 = "😕";
  const msm = "❗";

  // Solo se attivo solomaggiorenni nel gruppo
  const chat = global.db.data.chats[m.chat];
  if (!chat?.solomaggiorenni) {
    return conn.reply(m.chat, `${emoji} Il comando è disponibile solo se attivi *Solo Maggiorenni* con .attiva solomaggiorenni`, m);
  }

  if (!args[0]) {
    return conn.reply(m.chat, `${emoji} Inserisci la ricerca che vuoi fare su Pornhub.\nEsempio: ${usedPrefix + command} con la mia amica`, m);
  }

  try {
    let searchResults = await searchPornhub(args[0]);
    let teks = searchResults.result.map((v, i) => 
      `「 *P O R N H U B  -  R I C E R C A* 」
🎞️ *Titolo:* ${v.title}
🕒 *Durata:* ${v.duration}
👀 *Visualizzazioni:* ${v.views}
🔗 *Link:* ${v.url}
---------------------------------------------------\n`).join('\n\n');

    if (searchResults.result.length === 0) {
      teks = `${emoji2} Nessun risultato trovato...`;
    }

    conn.reply(m.chat, teks, m);
  } catch (e) {
    return conn.reply(m.chat, `${msm} Errore: ${e.message}`, m);
  }
};

handler.tags = ['+18']; 
handler.help = ['pornhubsearch']; 
handler.command = ['phsearch', 'pornhubsearch'];
export default handler;

async function searchPornhub(search) {
  try {
    const response = await axios.get(`https://www.pornhub.com/video/search?search=${search}`);
    const html = response.data;
    const $ = cheerio.load(html);
    const result = [];
    
    $('ul#videoSearchResult > li.pcVideoListItem').each(function(a, b) {
      const _title = $(b).find('a').attr('title');
      const _duration = $(b).find('var.duration').text().trim();
      const _views = $(b).find('var.views').text().trim();
      const _url = 'https://www.pornhub.com' + $(b).find('a').attr('href');
      const hasil = { title: _title, duration: _duration, views: _views, url: _url };
      result.push(hasil);
    });
    
    return { result };
  } catch (error) {
    console.error(`${msm} Ocurrió un error al buscar en Pornhub:`, error);
    return { result: [] };
  }
}