
import axios from 'axios';
import cheerio from 'cheerio';

const handler = async (m, { conn, text }) => {
  if (!text) return m.reply('✧ Inserisci il nome della canzone nel formato:\n*artista - titolo* oppure *artista titolo*');

  try {
    // Normalizza il testo di input
    const searchText = text.trim();
    let artist, title;

    // Cerca di dividere artista e titolo
    if (searchText.includes('-')) {
      [artist, title] = searchText.split('-').map(s => s.trim());
    } else {
      // Prova a dividere sull'ultimo spazio se non c'è il trattino
      const lastSpaceIndex = searchText.lastIndexOf(' ');
      if (lastSpaceIndex === -1) {
        return m.reply('✧ Formato non valido. Usa:\n*artista - titolo* oppure *artista titolo*');
      }
      artist = searchText.substring(0, lastSpaceIndex).trim();
      title = searchText.substring(lastSpaceIndex + 1).trim();
    }

    if (!artist || !title) {
      return m.reply('✧ Specifica sia artista che titolo nel formato:\n*artista - titolo* oppure *artista titolo*');
    }

    // Pulisci i nomi per l'URL
    const cleanArtist = artist.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const url = `https://www.azlyrics.com/lyrics/${cleanArtist}/${cleanTitle}.html`;

    // Effettua la richiesta
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(data);
    
    // Trova il div con il testo (AZLyrics lo mette in un div specifico)
    const lyricsDiv = $('div.main-page div.col-xs-12.col-lg-8.text-center')
      .find('div:not([class]):not([id])')
      .filter((i, el) => $(el).text().trim().length > 0)
      .first();

    const lyrics = lyricsDiv.text().trim();

    if (!lyrics) throw new Error('Testo non trovato');

    // Invia il testo a pezzi se è troppo lungo
    const maxLength = 2000;
    if (lyrics.length > maxLength) {
      for (let i = 0; i < lyrics.length; i += maxLength) {
        const chunk = lyrics.substring(i, i + maxLength);
        await conn.sendMessage(m.chat, { text: chunk }, { quoted: m });
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } else {
      await conn.sendMessage(m.chat, { text: lyrics }, { quoted: m });
    }

  } catch (error) {
    console.error('Errore nella ricerca del testo:', error);
    m.reply('✧ Testo non trovato. Prova con:\n- Un formato diverso (artista - titolo)\n- Controlla ortografia\n- Prova un altro sito se questo non funziona');
  }
};

handler.help = ['lyrics <artista> - <titolo>'];
handler.tags = ['music'];
handler.command = ['lyrics', 'testo', 'parole'];
handler.examples = [
  'lyrics Coldplay - Viva La Vida',
  'testo Eminem Lose Yourself',
  'parole Queen Bohemian Rhapsody'
];

export default handler;