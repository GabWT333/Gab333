import fetch from 'node-fetch';

const PINTEREST_SEARCH_URL = 'https://www.pinterest.com/resource/BaseSearchResource/get/';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function parseCookies(cookieHeader) {
  if (!cookieHeader) return [];
  return cookieHeader
    .split(/,(?=[^;]+?=)/)
    .map(cookie => cookie.split(';')[0].trim())
    .filter(Boolean);
}

async function fetchPinterestResults(query, limit = 4) {
  const searchUrl = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;
  const sourceUrl = `/search/pins/?q=${encodeURIComponent(query)}`;
  const data = JSON.stringify({
    options: {
      query,
      scope: 'pins',
      rs: 'typed',
      page_size: limit
    }
  });

  const initRes = await fetch(searchUrl, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'text/html,application/xhtml+xml'
    }
  });

  if (!initRes.ok) throw new Error(`Errore pagina Pinterest: ${initRes.status}`);

  const cookieHeader = initRes.headers.get('set-cookie') || '';
  const cookies = parseCookies(cookieHeader);
  const csrf = cookies.find(cookie => cookie.startsWith('csrftoken='))?.split('=')[1] || '';

  const res = await fetch(PINTEREST_SEARCH_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'User-Agent': USER_AGENT,
      'X-Requested-With': 'XMLHttpRequest',
      Referer: searchUrl,
      Accept: 'application/json, text/javascript, */*; q=0.01',
      'X-CSRFToken': csrf,
      Cookie: cookies.join('; ')
    },
    body: new URLSearchParams({ source_url: sourceUrl, data }).toString()
  });

  if (!res.ok) throw new Error(`Errore richiesta Pinterest: ${res.status}`);

  const json = await res.json();
  const rawResults = json?.resource_response?.data?.results || [];

  return rawResults.slice(0, limit).map(pin => {
    const title = (pin.grid_title || pin.title || pin.description || pin.seo_alt_text || 'Pinterest').toString().replace(/\s+/g, ' ').trim();
    const imageUrl = pin.images?.orig?.url || pin.images?.['736x']?.url || pin.images?.['474x']?.url || pin.images?.['236x']?.url || null;
    const id = pin.id;
    const link = id ? `https://www.pinterest.com/pin/${id}/` : `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;

    return { title, imageUrl, link };
  });
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text?.trim()) {
    return conn.reply(m.chat, `🔎 Uso: *${usedPrefix}${command}* <ricerca>\nEsempio: *${usedPrefix}${command} gatto elegante*`, m);
  }

  const query = text.trim();
  await conn.reply(m.chat, `🔍 Cerco su Pinterest per: *${query}*...`, m);

  try {
    const results = await fetchPinterestResults(query, 4);

    if (!results.length) {
      return conn.reply(m.chat, 'Nessun risultato trovato.', m);
    }

    const cards = results.map((pin, index) => ({
      ...(pin.imageUrl ? { image: { url: pin.imageUrl } } : {}),
      title: `Immagine ${index + 1}`,
      body: pin.title || 'Risultato Pinterest',
      footer: 'Pinterest',
      buttons: [{
        buttonId: pin.link,
        buttonText: { displayText: '🔗 Guarda su Pinterest' },
        type: 1
      }]
    }));

    await conn.sendMessage(m.chat, {
      text: `📌 *Risultati Pinterest per:* ${query}`,
      footer: 'Pinterest',
      cards
    }, { quoted: m });
  } catch (e) {
    console.error('Errore nel recupero dei dati da Pinterest:', e);
    conn.reply(m.chat, 'Si è verificato un errore durante il recupero dei dati da Pinterest', m);
  }
};

handler.command = ['pinterest'];

export default handler;