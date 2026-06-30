import fetch from 'node-fetch';
import { load } from 'cheerio';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const NEWS_TTL_MS = 60 * 60 * 1000;
const FEEDS = [
  'https://news.google.com/rss?hl=it&gl=IT&ceid=IT:it',
  'https://feeds.bbci.co.uk/news/rss.xml',
  'https://www.repubblica.it/rss/homepage/rss2.0.xml',
  'https://www.ansa.it/sito/ansait_rss.xml'
];

const normalizeText = (text = '') => text.replace(/\s+/g, ' ').trim();
const stripHtml = (html = '') => {
  if (!html) return '';
  const $ = load(html, { decodeEntities: true });
  return normalizeText($.text());
};

const buildFeedUrls = (query = '') => {
  if (!query?.trim()) return FEEDS;
  const q = encodeURIComponent(query.trim());
  return [
    `https://news.google.com/rss/search?q=${q}&hl=it&gl=IT&ceid=IT:it`,
    `https://news.google.com/rss/search?q=${q}&hl=it&gl=IT&ceid=IT:it&tbm=nws`
  ];
};

const getCacheKey = (query = '') => `news:${(query || '').trim().toLowerCase()}`;

const ensureNewsCache = async (query = '', force = false) => {
  const cacheKey = getCacheKey(query);
  const now = Date.now();

  if (!force) {
    const cached = global.__newsCache?.[cacheKey];
    if (cached && now - cached.fetchedAt < NEWS_TTL_MS) {
      return cached.items;
    }
  }

  const feedUrls = buildFeedUrls(query);
  let parsedItems = [];

  for (const feedUrl of feedUrls) {
    try {
      const res = await fetch(feedUrl, {
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'application/xml, text/xml, application/rss+xml'
        }
      });

      if (!res.ok) continue;

      const xml = await res.text();
      const $ = load(xml, { xmlMode: true, decodeEntities: true });
      const items = [];

      $('channel > item').each((_, el) => {
        const title = normalizeText($(el).find('title').first().text() || '');
        const link = $(el).find('link').first().text() || '';
        const description = stripHtml($(el).find('description').first().text() || '');
        const pubDate = normalizeText($(el).find('pubDate').first().text() || '');
        const image = (
          $(el).find('content').attr('url') ||
          $(el).find('thumbnail').attr('url') ||
          $(el).find('enclosure').attr('url') ||
          null
        );

        if (title && link) {
          items.push({
            title: title.replace(/\s*-\s*[^-]+$/, '').replace(/\s*[-–]\s*Google News$/, ''),
            description,
            link,
            image,
            pubDate
          });
        }
      });

      if (items.length) {
        parsedItems = items.slice(0, 5);
        break;
      }
    } catch (error) {
      console.warn('[news] feed failed', feedUrl, error.message);
    }
  }

  if (!parsedItems.length) {
    throw new Error('Nessun feed valido disponibile');
  }

  global.__newsCache = global.__newsCache || {};
  global.__newsCache[cacheKey] = { fetchedAt: now, items: parsedItems };
  return parsedItems;
};

if (!global.__newsRefreshTimer) {
  global.__newsRefreshTimer = setInterval(() => {
    ensureNewsCache('', true).catch(() => {});
  }, NEWS_TTL_MS);
}

const handler = async (m, { conn, text }) => {
  const query = (text || '').trim();
  const topicLabel = query ? ` per: *${query}*` : '';

  await conn.reply(m.chat, `📰 Sto aggiornando le notizie${topicLabel}...`, m);

  try {
    const items = await ensureNewsCache(query);

    if (!items.length) {
      return conn.reply(m.chat, 'Nessuna notizia trovata al momento.', m);
    }

    const cards = items.map((item, index) => ({
      ...(item.image ? { image: { url: item.image } } : {}),
      title: `Notizia ${index + 1}`,
      body: item.title.length > 90 ? `${item.title.slice(0, 87)}...` : item.title,
      footer: item.pubDate ? item.pubDate : 'News aggiornata',
      buttons: [{
        buttonId: item.link,
        buttonText: { displayText: '� Apri notizia' },
        type: 1
      }]
    }));

    await conn.sendMessage(m.chat, {
      text: `📰 *Notizie aggiornate*${topicLabel}\n\nAggiornate automaticamente ogni ora.`,
      footer: 'News',
      cards
    }, { quoted: m });
  } catch (error) {
    console.error('[news]', error);
    await conn.reply(m.chat, '⚠️ Non ho potuto recuperare le notizie in questo momento.', m);
  }
};

handler.help = ['news [argomento]'];
handler.tags = ['search'];
handler.command = ['news', 'notizie'];

export default handler;
