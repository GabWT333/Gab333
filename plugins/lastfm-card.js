//Plugin by Gab, Lucifero & 333 staff

/**
 * lastfm-card.js
 * Genera la card Last.fm come Buffer PNG e la invia su WhatsApp.
 *
 * Uso nel plugin:
 *   import { makeCard, sendImage } from './lastfm-card.js'
 *   const buf = await makeCard(track, username)
 *   await sendImage(conn, m, buf, caption, buttons)
 */

import fs from 'fs';



function buildHTML(track, username) {
  const albumArt =
    track.image?.find(i => i.size === 'extralarge')?.[`#text`] ||
    track.image?.find(i => i.size === 'large')?.[`#text`] ||
    'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png';

  const isPlaying  = track['@attr']?.nowplaying === 'true';
  const songName   = track.name            || 'Sconosciuto';
  const artistName = track.artist['#text'] || 'Sconosciuto';
  const albumName  = track.album?.['#text'] || 'Album sconosciuto';

  const titleSize  = Math.max(16, 34 - Math.max(0, songName.length   - 20) * 0.5);
  const artistSize = Math.max(13, 22 - Math.max(0, artistName.length - 25) * 0.3);
  const albumSize  = Math.max(11, 16 - Math.max(0, albumName.length  - 30) * 0.2);

  const statusColor = isPlaying ? '#1DB954' : '#888888';
  const statusText  = isPlaying ? 'In riproduzione' : 'Ultimo brano';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');
* { margin:0; padding:0; box-sizing:border-box; }
body { width:800px; height:400px; overflow:hidden; font-family:'DM Sans',sans-serif; background:#0d0d0d; }
.card { position:relative; width:800px; height:400px; display:flex; overflow:hidden; background:#111; }
.bg-blur {
  position:absolute; inset:0;
  background-image:url('${albumArt}');
  background-size:cover; background-position:center;
  filter:blur(40px) brightness(0.3) saturate(1.5);
  transform:scale(1.1); z-index:0;
}
.cover {
  flex-shrink:0; width:340px; height:340px; margin:30px;
  border-radius:12px; object-fit:cover; position:relative; z-index:1;
  box-shadow:0 20px 60px rgba(0,0,0,0.7);
}
.info {
  position:relative; z-index:1; display:flex; flex-direction:column;
  justify-content:center; padding:30px 30px 30px 0; flex:1; overflow:hidden;
}
.status {
  display:inline-flex; align-items:center; gap:6px;
  padding:4px 12px; border-radius:999px; font-size:12px; font-weight:500;
  letter-spacing:.05em; text-transform:uppercase; margin-bottom:14px;
  width:fit-content;
  background:${isPlaying ? 'rgba(29,185,84,0.2)' : 'rgba(255,255,255,0.08)'};
  color:${statusColor};
  border:1px solid ${isPlaying ? 'rgba(29,185,84,0.4)' : 'rgba(255,255,255,0.1)'};
}
.dot {
  width:7px; height:7px; border-radius:50%;
  background:${statusColor};
}
.song-title {
  font-family:'Syne',sans-serif; font-weight:800; color:#fff;
  line-height:1.1; margin-bottom:10px;
  font-size:${titleSize}px;
  overflow:hidden; display:-webkit-box; -webkit-box-orient:vertical;
  -webkit-line-clamp:2; word-break:break-word;
}
.artist {
  font-size:${artistSize}px; font-weight:500; color:#ccc; margin-bottom:6px;
  overflow:hidden; white-space:nowrap; text-overflow:ellipsis;
}
.album {
  font-size:${albumSize}px; color:#666; margin-bottom:24px;
  overflow:hidden; white-space:nowrap; text-overflow:ellipsis;
}
.divider { width:40px; height:2px; background:${statusColor}; border-radius:2px; margin-bottom:24px; }
.user-tag { display:flex; align-items:center; gap:8px; color:#555; font-size:13px; margin-top:auto; }
.user-tag span { color:#777; font-weight:500; }
.lastfm-logo {
  font-family:'Syne',sans-serif; font-size:11px; font-weight:700;
  letter-spacing:.1em; color:#e00; text-transform:uppercase;
  position:absolute; bottom:16px; right:20px; z-index:2; opacity:.7;
}
</style>
</head>
<body>
<div class="card">
  <div class="bg-blur"></div>
  <img class="cover" src="${albumArt}" onerror="this.style.background='#222';this.removeAttribute('src')" />
  <div class="info">
    <div class="status"><div class="dot"></div>${statusText}</div>
    <div class="song-title">${songName}</div>
    <div class="artist">${artistName}</div>
    <div class="album">${albumName}</div>
    <div class="divider"></div>
    <div class="user-tag">🎧 <span>${username}</span></div>
  </div>
  <div class="lastfm-logo">Last.fm</div>
</div>
</body>
</html>`;
}



async function renderWithPuppeteer(html) {
  const puppeteer = await import('puppeteer').then(m => m.default || m);
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    headless: 'new'
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 800, height: 400, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 15000 });
    await page.evaluate(() => Promise.all(
      [...document.images].map(img =>
        img.complete ? Promise.resolve()
          : new Promise(r => { img.onload = r; img.onerror = r; })
      )
    ));
    return await page.screenshot({ type: 'png' });
  } finally {
    await browser.close();
  }
}



function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

async function renderWithCanvas(track, username) {
  const { createCanvas, loadImage } = await import('canvas').then(m => m.default || m);

  const canvas = createCanvas(800, 400);
  const ctx    = canvas.getContext('2d');

  const albumArt =
    track.image?.find(i => i.size === 'extralarge')?.[`#text`] ||
    track.image?.find(i => i.size === 'large')?.[`#text`] ||
    'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png';

  const isPlaying  = track['@attr']?.nowplaying === 'true';
  const songName   = track.name            || 'Sconosciuto';
  const artistName = track.artist['#text'] || 'Sconosciuto';
  const albumName  = track.album?.['#text'] || 'Album sconosciuto';

  ctx.fillStyle = '#111111';
  ctx.fillRect(0, 0, 800, 400);

  try {
    const cover = await loadImage(albumArt);
    ctx.save();
    roundRect(ctx, 30, 30, 340, 340, 12);
    ctx.clip();
    ctx.drawImage(cover, 30, 30, 340, 340);
    ctx.restore();
  } catch {
    ctx.fillStyle = '#333';
    ctx.fillRect(30, 30, 340, 340);
  }

  const x = 400;
  const titleSize  = Math.max(16, 34 - Math.max(0, songName.length   - 20) * 0.5);
  const artistSize = Math.max(13, 22 - Math.max(0, artistName.length - 25) * 0.3);

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${titleSize}px Arial`;
  ctx.fillText(songName.length > 28 ? songName.slice(0, 28) + '…' : songName, x, 130);

  ctx.fillStyle = '#cccccc';
  ctx.font = `${artistSize}px Arial`;
  ctx.fillText(artistName.length > 35 ? artistName.slice(0, 35) + '…' : artistName, x, 165);

  ctx.fillStyle = '#666666';
  ctx.font = '15px Arial';
  ctx.fillText(albumName.length > 40 ? albumName.slice(0, 40) + '…' : albumName, x, 195);

  ctx.fillStyle = isPlaying ? '#1DB954' : '#333';
  ctx.fillRect(x, 215, 40, 2);

  ctx.fillStyle = '#777777';
  ctx.font = '14px Arial';
  ctx.fillText(`🎧 ${username}`, x, 350);

  return canvas.toBuffer('image/png');
}



/**
 * Genera la card come Buffer PNG.
 * Prova puppeteer poi canvas.
 */
export async function makeCard(track, username) {
  try {
    const html = buildHTML(track, username);
    const buf  = await renderWithPuppeteer(html);
    if (buf && buf.length > 0) return buf;
  } catch (e) {
    console.warn('[lastfm-card] puppeteer fallito, provo canvas:', e.message);
  }

  try {
    const buf = await renderWithCanvas(track, username);
    if (buf && buf.length > 0) return buf;
  } catch (e) {
    console.warn('[lastfm-card] canvas fallito:', e.message);
  }

  throw new Error('[lastfm-card] Nessun renderer disponibile (installa puppeteer o canvas)');
}

/**
 * Invia un'immagine Buffer su WhatsApp con @realvare/based.
 * Salva su file temp e passa url: filepath — unico formato accettato dalla lib.
 */
export async function sendImage(conn, m, buffer, caption = '', buttons = []) {
  if (!buffer || buffer.length === 0) throw new Error('Buffer immagine vuoto');

  const base = {
    caption,
    footer: '333 BOT - Last.fm',
    contextInfo: {
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363341274693350@newsletter',
        serverMessageId: -1,
        newsletterName: '333 BOT'
      }
    }
  };

  if (buttons.length > 0) {
    base.buttons = buttons;
  }



  const tmp = `/tmp/lastfm_${Date.now()}.png`;
  fs.writeFileSync(tmp, buffer);

  try {
    await conn.sendMessage(m.chat, { image: { url: tmp }, ...base }, { quoted: m });
  } finally {
    try { fs.unlinkSync(tmp); } catch {}
  }
}
