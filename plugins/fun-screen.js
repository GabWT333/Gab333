//Plugin by Gab, Lucifero & 333 staff



import { createCanvas, loadImage } from 'canvas';
import fs   from 'fs';
import path from 'path';

const wrapText = (ctx, text, maxWidth) => {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines;
};

const roundRect = (ctx, x, y, w, h, r) => {
  if (typeof r === 'number') r = { tl: r, tr: r, br: r, bl: r };
  ctx.beginPath();
  ctx.moveTo(x + r.tl, y);
  ctx.lineTo(x + w - r.tr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
  ctx.lineTo(x + w, y + h - r.br);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
  ctx.lineTo(x + r.bl, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
  ctx.lineTo(x, y + r.tl);
  ctx.quadraticCurveTo(x, y, x + r.tl, y);
  ctx.closePath();
};

const BUBBLE_COLOR = '#005c4b';
const TEXT_COLOR   = '#e9edef';

const generateScreen = async (testo) => {
  const bgPath = path.resolve('./img/screenchat.png');
  if (!fs.existsSync(bgPath)) {
    throw new Error('File img/screenchat.png non trovato! Mettilo nella cartella img/ del bot.');
  }

  const bg     = await loadImage(bgPath);
  const W      = bg.width;
  const H      = bg.height;
  const canvas = createCanvas(W, H);
  const ctx    = canvas.getContext('2d');

  ctx.drawImage(bg, 0, 0, W, H);

  const FONT_SIZE = Math.round(W * 0.050);
  const PAD_X     = Math.round(W * 0.030);
  const PAD_Y     = Math.round(W * 0.022);
  const LINE_H    = Math.round(FONT_SIZE * 1.35);
  const MARGIN_R  = Math.round(W * 0.028);
  const RADIUS    = Math.round(W * 0.022);
  const MAX_BW    = Math.round(W * 0.95);
  const MIN_BW    = Math.round(W * 0.18);

  ctx.font = `${FONT_SIZE}px sans-serif`;

  const lines = wrapText(ctx, testo, MAX_BW - PAD_X * 2);

  let maxLW = 0;
  for (const l of lines) {
    const m = ctx.measureText(l).width;
    if (m > maxLW) maxLW = m;
  }
  const bubbleW = Math.min(MAX_BW, Math.max(MIN_BW, maxLW + PAD_X * 2));
  const bubbleH = PAD_Y + lines.length * LINE_H + PAD_Y;

  const BUBBLE_TOP_Y = Math.round(H * 0.530);
  const bubbleY = BUBBLE_TOP_Y;
  const bubbleX = W - bubbleW - MARGIN_R;

  ctx.save();
  ctx.shadowColor   = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur    = Math.round(W * 0.018);
  ctx.shadowOffsetY = Math.round(W * 0.006);
  roundRect(ctx, bubbleX, bubbleY, bubbleW, bubbleH,
    { tl: RADIUS, tr: RADIUS / 5, br: RADIUS, bl: RADIUS });
  ctx.fillStyle = BUBBLE_COLOR;
  ctx.fill();
  ctx.restore();

  const TAIL_W = Math.round(W * 0.016);
  const TAIL_H = Math.round(W * 0.025);
  ctx.fillStyle = BUBBLE_COLOR;
  ctx.beginPath();
  ctx.moveTo(bubbleX + bubbleW,          bubbleY + RADIUS / 5);
  ctx.lineTo(bubbleX + bubbleW + TAIL_W, bubbleY + RADIUS / 5);
  ctx.lineTo(bubbleX + bubbleW,          bubbleY + RADIUS / 5 + TAIL_H);
  ctx.closePath();
  ctx.fill();

  ctx.font      = `${FONT_SIZE}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillStyle = TEXT_COLOR;
  lines.forEach((line, i) => {
    ctx.fillText(
      line,
      bubbleX + PAD_X,
      bubbleY + PAD_Y + FONT_SIZE + i * LINE_H
    );
  });

  return canvas.toBuffer('image/png');
};

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const testo = args.join(' ').trim();

  if (!testo) {
    return conn.sendMessage(m.chat, {
      text: `⚠️ *Specifica il testo!*\nUso: *${usedPrefix}${command}* <testo del messaggio>`,
    }, { quoted: m });
  }

  try {
    const img = await generateScreen(testo);
    await conn.sendMessage(m.chat, {
      image:    img,
      caption:  '',
      mimetype: 'image/png',
    }, { quoted: m });
  } catch (err) {
    console.error('[fun-screen] Errore:', err);
    await conn.sendMessage(m.chat, {
      text: `❌ Errore: ${err.message}`,
    }, { quoted: m });
  }
};

handler.command  = /^(screen)$/i;
handler.group    = false;
handler.register = false;

export default handler;