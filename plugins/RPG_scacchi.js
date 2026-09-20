//Plugin by Gab, Lucifero & 333 staff




import { createCanvas } from '@napi-rs/canvas'

const INITIAL_BOARD = [
  ['r','n','b','q','k','b','n','r'],
  ['p','p','p','p','p','p','p','p'],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['P','P','P','P','P','P','P','P'],
  ['R','N','B','Q','K','B','N','R']
]

const PIECE_UNICODE = {
  K:'♔', Q:'♕', R:'♖', B:'♗', N:'♘', P:'♙',
  k:'♚', q:'♛', r:'♜', b:'♝', n:'♞', p:'♟'
}

const PIECE_VALUE = { p:1, n:3, b:3, r:5, q:9, k:100 }

const cloneBoard  = b => b.map(r => [...r])
const isWhitePiece = p => !!(p && /[A-Z]/.test(p))
const isBlackPiece = p => !!(p && /[a-z]/.test(p))
const inBounds    = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8
const isFriend    = (p, wTurn) => wTurn ? isWhitePiece(p) : isBlackPiece(p)
const isEnemy     = (p, wTurn) => wTurn ? isBlackPiece(p) : isWhitePiece(p)

function findKing(board, wSide) {
  const k = wSide ? 'K' : 'k'
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c] === k) return [r, c]
  return null
}

function getPseudoMoves(board, r, c, wTurn) {
  const piece = board[r][c]
  if (!piece) return []
  const p = piece.toUpperCase()
  const moves = []

  const slide = (dr, dc) => {
    let tr = r + dr, tc = c + dc
    while (inBounds(tr, tc)) {
      if (isFriend(board[tr][tc], wTurn)) break
      moves.push([tr, tc])
      if (board[tr][tc] !== '') break
      tr += dr; tc += dc
    }
  }

  if (p === 'P') {
    const dir = wTurn ? -1 : 1
    const startRow = wTurn ? 6 : 1
    if (inBounds(r+dir, c) && board[r+dir][c] === '') {
      moves.push([r+dir, c])
      if (r === startRow && board[r+2*dir][c] === '') moves.push([r+2*dir, c])
    }
    for (const dc of [-1, 1])
      if (inBounds(r+dir, c+dc) && isEnemy(board[r+dir][c+dc], wTurn))
        moves.push([r+dir, c+dc])
  } else if (p === 'N') {
    for (const [dr,dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]])
      if (inBounds(r+dr, c+dc) && !isFriend(board[r+dr][c+dc], wTurn))
        moves.push([r+dr, c+dc])
  } else if (p === 'B') {
    for (const [dr,dc] of [[-1,-1],[-1,1],[1,-1],[1,1]]) slide(dr, dc)
  } else if (p === 'R') {
    for (const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]) slide(dr, dc)
  } else if (p === 'Q') {
    for (const [dr,dc] of [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]) slide(dr, dc)
  } else if (p === 'K') {
    for (const [dr,dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]])
      if (inBounds(r+dr, c+dc) && !isFriend(board[r+dr][c+dc], wTurn))
        moves.push([r+dr, c+dc])
  }
  return moves
}

function isInCheck(board, wTurn) {
  const kPos = findKing(board, wTurn)
  if (!kPos) return true
  const [kr, kc] = kPos
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = board[r][c]
      if (!p || isFriend(p, wTurn)) continue
      const moves = getPseudoMoves(board, r, c, !wTurn)
      if (moves.some(([mr,mc]) => mr === kr && mc === kc)) return true
    }
  return false
}

function getLegalMoves(board, r, c, wTurn) {
  const piece = board[r][c]
  if (!piece) return []
  if (wTurn && !isWhitePiece(piece)) return []
  if (!wTurn && !isBlackPiece(piece)) return []
  return getPseudoMoves(board, r, c, wTurn).filter(([tr, tc]) => {
    const nb = cloneBoard(board)
    nb[tr][tc] = piece
    nb[r][c] = ''
    if (piece === 'P' && tr === 0) nb[tr][tc] = 'Q'
    if (piece === 'p' && tr === 7) nb[tr][tc] = 'q'
    return !isInCheck(nb, wTurn)
  })
}

function getAllLegalMoves(board, wTurn) {
  const all = []
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = board[r][c]
      if (!p) continue
      if (wTurn && !isWhitePiece(p)) continue
      if (!wTurn && !isBlackPiece(p)) continue
      for (const [tr,tc] of getLegalMoves(board, r, c, wTurn))
        all.push({ from:[r,c], to:[tr,tc] })
    }
  return all
}

function applyMove(board, from, to) {
  const nb = cloneBoard(board)
  const piece = nb[from[0]][from[1]]
  nb[to[0]][to[1]] = piece
  nb[from[0]][from[1]] = ''
  if (piece === 'P' && to[0] === 0) nb[to[0]][to[1]] = 'Q'
  if (piece === 'p' && to[0] === 7) nb[to[0]][to[1]] = 'q'
  return nb
}

function evaluate(board) {
  let score = 0
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = board[r][c]
      if (!p) continue
      const v = PIECE_VALUE[p.toLowerCase()] || 0
      score += isWhitePiece(p) ? v : -v
    }
  return score
}

function minimax(board, depth, alpha, beta, maximizing) {
  const moves = getAllLegalMoves(board, maximizing)
  if (!moves.length)
    return isInCheck(board, maximizing) ? (maximizing ? -9999 : 9999) : 0
  if (depth === 0) return evaluate(board)

  if (maximizing) {
    let best = -Infinity
    for (const { from, to } of moves) {
      best = Math.max(best, minimax(applyMove(board, from, to), depth-1, alpha, beta, false))
      alpha = Math.max(alpha, best)
      if (beta <= alpha) break
    }
    return best
  } else {
    let best = Infinity
    for (const { from, to } of moves) {
      best = Math.min(best, minimax(applyMove(board, from, to), depth-1, alpha, beta, true))
      beta = Math.min(beta, best)
      if (beta <= alpha) break
    }
    return best
  }
}

function getBotMove(board, difficulty) {
  const moves = getAllLegalMoves(board, false)
  if (!moves.length) return null
  if (difficulty === 'base') return moves[Math.floor(Math.random() * moves.length)]
  let best = null, bestScore = Infinity
  for (const move of moves) {
    const score = minimax(applyMove(board, move.from, move.to), 3, -Infinity, Infinity, true)
    if (score < bestScore) { bestScore = score; best = move }
  }
  return best
}

async function renderBoard(board, lastFrom, lastTo) {
  const CELL = 75
  const MARGIN = 35
  const SIZE = CELL * 8 + MARGIN * 2
  const canvas = createCanvas(SIZE, SIZE)
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, 0, SIZE, SIZE)

  ctx.strokeStyle = '#e0c97a'
  ctx.lineWidth = 3
  ctx.strokeRect(MARGIN - 2, MARGIN - 2, CELL * 8 + 4, CELL * 8 + 4)

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const x = MARGIN + c * CELL
      const y = MARGIN + r * CELL
      const light = (r + c) % 2 === 0
      const isLast = (lastFrom && lastFrom[0]===r && lastFrom[1]===c) ||
                     (lastTo   && lastTo[0]===r   && lastTo[1]===c)

      ctx.fillStyle = isLast
        ? (light ? '#cdd26a' : '#aaa23a')
        : (light ? '#f0d9b5' : '#b58863')
      ctx.fillRect(x, y, CELL, CELL)

      const piece = board[r][c]
      if (piece) {
        const sym = PIECE_UNICODE[piece]
        ctx.font = `${Math.floor(CELL * 0.72)}px serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.globalAlpha = 0.35
        ctx.fillStyle = '#000'
        ctx.fillText(sym, x + CELL/2 + 2, y + CELL/2 + 3)
        ctx.globalAlpha = 1
        ctx.fillStyle = isWhitePiece(piece) ? '#ffffff' : '#1c1c1c'
        ctx.fillText(sym, x + CELL/2, y + CELL/2)
      }
    }
  }

  ctx.font = 'bold 13px Arial'
  ctx.fillStyle = '#e0c97a'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const files = ['a','b','c','d','e','f','g','h']
  for (let c = 0; c < 8; c++) {
    ctx.fillText(files[c], MARGIN + c * CELL + CELL/2, MARGIN / 2)
    ctx.fillText(files[c], MARGIN + c * CELL + CELL/2, SIZE - MARGIN / 2)
  }
  for (let r = 0; r < 8; r++) {
    ctx.fillText(8 - r, MARGIN / 2, MARGIN + r * CELL + CELL/2)
    ctx.fillText(8 - r, SIZE - MARGIN / 2, MARGIN + r * CELL + CELL/2)
  }

  return canvas.toBuffer('image/png')
}

function parseMove(str) {
  if (!str) return null
  const s = str.replace(/\s+/g, '').toLowerCase()
  if (!/^[a-h][1-8][a-h][1-8]$/.test(s)) return null
  return {
    from: [8 - parseInt(s[1]), s.charCodeAt(0) - 97],
    to:   [8 - parseInt(s[3]), s.charCodeAt(2) - 97]
  }
}

function moveToStr(from, to) {
  return `${String.fromCharCode(97 + from[1])}${8 - from[0]}` +
         `${String.fromCharCode(97 + to[1])}${8 - to[0]}`
}

const BTN_INGAME = [
  { buttonId: '.arrendi',        buttonText: { displayText: '🏳️ Arrendi'        }, type: 1 },
  { buttonId: '.annullapartita', buttonText: { displayText: '❌ Annulla Partita' }, type: 1 }
]

let handler = async (m, { conn, text, command }) => {
  if (!global.db.data.scacchi) global.db.data.scacchi = {}
  const games = global.db.data.scacchi
  const game  = games[m.sender]
  const cmd   = command?.toLowerCase()


  if (cmd === 'annullapartita') {
    if (!game || game.status !== 'active') return m.reply('❌ Nessuna partita in corso.')
    delete games[m.sender]
    return m.reply('🗑️ Partita annullata.')
  }


  if (cmd === 'arrendi') {
    if (!game || game.status !== 'active') return m.reply('❌ Nessuna partita in corso.')
    delete games[m.sender]
    return await conn.sendMessage(m.chat, {
      text:
`╔═ ♟️ 𝐒𝐂𝐀𝐂𝐂𝐇𝐈 𝟑𝟑𝟑 ═╗
┃
┃ 🏳️ *Hai reso i pezzi...*
┃ 🤖 Il bot vince!
┃ 🔢 Mosse giocate: *${game.moveCount}*
┃
╚══════════════╝`,
      buttons: [{ buttonId: '.scacchi', buttonText: { displayText: '🔄 Nuova Partita' }, type: 1 }],
      headerType: 1
    }, { quoted: m })
  }


  if (cmd === 'mossa') {
    if (!game || game.status !== 'active')
      return m.reply('❌ Nessuna partita in corso.\nUsa *.scacchi* per iniziare.')

    const parsed = parseMove(text?.trim())
    if (!parsed) return m.reply('❌ Formato non valido. Esempio: *.mossa e2e4*')

    const { from, to } = parsed
    const piece = game.board[from[0]][from[1]]

    if (!piece) return m.reply('❌ Nessun pezzo in quella casella.')
    if (!isWhitePiece(piece)) return m.reply('❌ Quella non è una tua pedina! Sei i Bianchi ⚪')

    const legal = getLegalMoves(game.board, from[0], from[1], true)
    if (!legal.some(([tr,tc]) => tr === to[0] && tc === to[1]))
      return m.reply('❌ Mossa non valida o illegale.')

    game.board = applyMove(game.board, from, to)
    game.moveCount++


    const botMoves = getAllLegalMoves(game.board, false)
    if (!botMoves.length) {
      const check = isInCheck(game.board, false)
      const img = await renderBoard(game.board, from, to)
      delete games[m.sender]
      return await conn.sendMessage(m.chat, {
        image: img,
        caption: check
          ? `♟️ *SCACCO MATTO!* 🏆\n⚪ Hai vinto in *${game.moveCount}* mosse!`
          : `♟️ *STALLO!* 🤝\nPareggio — nessuna mossa per il bot.`,
        buttons: [{ buttonId: '.scacchi', buttonText: { displayText: '🔄 Rivincita' }, type: 1 }],
        headerType: 1
      }, { quoted: m })
    }


    const botMove = getBotMove(game.board, game.difficulty)
    if (!botMove) { delete games[m.sender]; return m.reply('🤖 Il bot non ha mosse. Hai vinto!') }

    game.board = applyMove(game.board, botMove.from, botMove.to)
    game.lastFrom = botMove.from
    game.lastTo   = botMove.to


    const playerMoves = getAllLegalMoves(game.board, true)
    if (!playerMoves.length) {
      const check = isInCheck(game.board, true)
      const img = await renderBoard(game.board, botMove.from, botMove.to)
      delete games[m.sender]
      return await conn.sendMessage(m.chat, {
        image: img,
        caption: check
          ? `♟️ *SCACCO MATTO!* 💀\nIl bot ti ha sconfitto in *${game.moveCount}* mosse!`
          : `♟️ *STALLO!* 🤝\nPareggio — nessuna mossa per te.`,
        buttons: [{ buttonId: '.scacchi', buttonText: { displayText: '🔄 Rivincita' }, type: 1 }],
        headerType: 1
      }, { quoted: m })
    }

    const inCheck = isInCheck(game.board, true)
    const img = await renderBoard(game.board, botMove.from, botMove.to)

    return await conn.sendMessage(m.chat, {
      image: img,
      caption:
`♟️ *Scacchi 333* — Mossa ${game.moveCount}
🎯 Difficoltà: ${game.difficulty === 'base' ? '🟢 Base' : '🔴 Difficile'}

⚪ La tua mossa: *${moveToStr(from, to)}*
⚫ Mossa bot:    *${moveToStr(botMove.from, botMove.to)}*
${inCheck ? '\n⚠️ *SEI SOTTO SCACCO!*' : ''}
📝 Tocca a te — *.mossa e2e4*`,
      buttons: BTN_INGAME,
      headerType: 1
    }, { quoted: m })
  }


  const arg = text?.trim().toLowerCase()

  if (!arg) {
    if (game?.status === 'active') {
      const img = await renderBoard(game.board, game.lastFrom, game.lastTo)
      return await conn.sendMessage(m.chat, {
        image: img,
        caption:
`♟️ *Partita in corso!*
🎯 Difficoltà: ${game.difficulty === 'base' ? '🟢 Base' : '🔴 Difficile'}
🔢 Mosse: *${game.moveCount}*
📝 Usa *.mossa e2e4* per muovere`,
        buttons: BTN_INGAME,
        headerType: 1
      }, { quoted: m })
    }

    return await conn.sendMessage(m.chat, {
      text:
`╔═ ♟️ 𝐒𝐂𝐀𝐂𝐂𝐇𝐈 𝟑𝟑𝟑 ═╗
┃
┃ 🤖 *Gioca contro il Bot*
┃
┃ ⚪ Tu → Bianchi (muovi per primo)
┃ ⚫ Bot → Neri
┃
┃ 📝 Mosse con notazione algebrica
┃ Esempio: *.mossa e2e4*
┃
┃ 🎯 Scegli la difficoltà:
┃
╚══════════════╝`,
      footer: '𝟑𝟑𝟑 𝐂𝐀𝐒𝐈𝐍𝐎',
      buttons: [
        { buttonId: '.scacchi base',      buttonText: { displayText: '🟢 Base'      }, type: 1 },
        { buttonId: '.scacchi difficile', buttonText: { displayText: '🔴 Difficile' }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }

  if (arg === 'base' || arg === 'difficile') {
    if (game?.status === 'active')
      return m.reply('⚠️ Partita già in corso! Usa *.annullapartita* per uscire prima.')

    games[m.sender] = {
      board: INITIAL_BOARD.map(r => [...r]),
      difficulty: arg,
      status: 'active',
      lastFrom: null,
      lastTo: null,
      moveCount: 0
    }

    const img = await renderBoard(games[m.sender].board, null, null)
    return await conn.sendMessage(m.chat, {
      image: img,
      caption:
`♟️ *Partita iniziata!*
🎯 Difficoltà: *${arg === 'base' ? '🟢 Base' : '🔴 Difficile'}*

⚪ Sei i *Bianchi* — tocca a te!
📝 Esempio: *.mossa e2e4*`,
      buttons: BTN_INGAME,
      headerType: 1
    }, { quoted: m })
  }
}

handler.command = /^(scacchi|mossa|arrendi|annullapartita)$/i
export default handler