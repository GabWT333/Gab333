import pkg from 'canvas';
const { createCanvas } = pkg;

const games = {};

function generateBoardImage(game) {
  const cellSize = 60;
  const spacing = 5;
  const padding = 20;
  const size = game.size;
  const canvasWidth = size * cellSize + (size - 1) * spacing + padding * 2;
  const canvasHeight = canvasWidth;
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const px = padding + x * (cellSize + spacing);
      const py = padding + y * (cellSize + spacing);
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(px, py, cellSize, cellSize);
      const status = game.board[y][x];
      if (status === 'miss') {
        ctx.fillStyle = 'white';
        ctx.fillText('•', px + cellSize / 2, py + cellSize / 2);
      }
      if (status === 'hit') {
        ctx.fillStyle = 'red';
        ctx.fillText('X', px + cellSize / 2, py + cellSize / 2);
      }
    }
  }

  return canvas.toBuffer();
}

function createGame(chat) {
  const size = 5;
  const ships = 3;
  const board = Array(size).fill(null).map(() => Array(size).fill(''));
  let placed = 0;
  while (placed < ships) {
    const x = Math.floor(Math.random() * size);
    const y = Math.floor(Math.random() * size);
    if (!board[y][x]) {
      board[y][x] = 'ship';
      placed++;
    }
  }
  games[chat] = { size, shipsLeft: ships, board };
}

async function handler(m, { conn, command, text }) {
  const chat = m.chat;

  if (command === 'battaglianavale') {
    createGame(chat);
    const img = generateBoardImage(games[chat]);
    await conn.sendMessage(chat, { image: img, caption: 'Battaglia Navale iniziata! Rispondi con coordinate tipo A1.' });
    return;
  }

  if (!games[chat]) return;
  const input = text.trim().toUpperCase();
  if (!/^[A-E][1-5]$/.test(input)) return;
  const x = input.charCodeAt(0) - 65;
  const y = parseInt(input[1]) - 1;
  const game = games[chat];
  if (game.board[y][x] === 'hit' || game.board[y][x] === 'miss') {
    await conn.sendMessage(chat, { text: 'Hai già sparato qui.' });
    return;
  }
  if (game.board[y][x] === 'ship') {
    game.board[y][x] = 'hit';
    game.shipsLeft--;
  } else {
    game.board[y][x] = 'miss';
  }
  const img = generateBoardImage(game);
  let caption = `Navi rimaste: ${game.shipsLeft}`;
  if (game.shipsLeft === 0) {
    caption = 'Hai vinto!';
    delete games[chat];
  }
  await conn.sendMessage(chat, { image: img, caption });
}

handler.command = ['battaglia'];
export default handler;