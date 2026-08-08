import fetch from 'node-fetch'
import { createCanvas, loadImage } from 'canvas'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const USERS_FILE = path.join(__dirname, '..', 'lastfm_users.json')
const LIKES_FILE = path.join(__dirname, '..', 'song_likes.json')

if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '{}', 'utf8')
if (!fs.existsSync(LIKES_FILE)) fs.writeFileSync(LIKES_FILE, '{}', 'utf8')

const LASTFM_API_KEY = '36f859a1fc4121e7f0e931806507d5f9'
const DEFAULT_COVER = 'https://i.ibb.co/BKHtdBNp/default-avatar-profile-icon-1280x1280.jpg'

const COLORS = {
  bg: '#0a0d14',
  panel: '#111827',
  accent: '#3b82f6',
  text: '#ffffff',
  secondary: '#9ca3af'
}

function convertToBold(text) {
    const normal = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    const bold = ["𝐀","𝐁","𝐂","𝐃","𝐄","𝐅","𝐆","𝐇","𝐈","𝐉","𝐊","𝐋","𝐌","𝐍","𝐎","𝐏","𝐐","𝐑","𝐒","𝐓","𝐔","𝐕","𝐖","𝐗","𝐘","𝐙","𝐚","𝐛","𝐜","𝐝","𝐞","𝐟","𝐠","𝐡","𝐢","𝐣","𝐤","𝐥","𝐦","𝐧","𝐨","𝐩","𝐪","𝐫","𝐬","𝐭","𝐮","𝐯","𝐰","𝐱","𝐲","𝐳","𝟎","𝟏","𝟐","𝟑","𝟒","𝟓","𝟔","𝟕","𝟖","𝟗"]
    return text.split('').map(char => { const index = normal.indexOf(char); return index !== -1 ? bold[index] : char }).join('')
}

function loadUsers() { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')) }
function saveUsers(users) { fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8') }
function loadLikes() { return JSON.parse(fs.readFileSync(LIKES_FILE, 'utf8')) }
function saveLikes(likes) { fs.writeFileSync(LIKES_FILE, JSON.stringify(likes, null, 2), 'utf8') }

function getSongLikes(songId) { const likes = loadLikes(); return likes[songId]?.likes || 0 }
function generateSongId(username, artist, track) { return `${username}_${artist}_${track}`.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_').toLowerCase() }

async function apiRequest(method, params = {}) {
  const query = new URLSearchParams({ method, api_key: LASTFM_API_KEY, format: 'json', ...params }).toString()
  try { const res = await fetch(`https://ws.audioscrobbler.com/2.0/?${query}`); return await res.json() } catch { return null }
}

async function drawSpotifyCard(data) {
  const canvas = createCanvas(1500, 1000)
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = COLORS.bg
  ctx.fillRect(0, 0, 1500, 1000)

  const coverUrl = data.coverUrl || DEFAULT_COVER
  const imgCover = await loadImage(coverUrl).catch(() => loadImage(DEFAULT_COVER))
  if (imgCover) {
    ctx.save()
    ctx.beginPath()
    ctx.roundRect ? ctx.roundRect(40, 40, 320, 320, 20) : ctx.rect(40, 40, 320, 320)
    ctx.clip()
    ctx.drawImage(imgCover, 40, 40, 320, 320)
    ctx.restore()
  }

  ctx.fillStyle = COLORS.accent
  ctx.font = 'bold 20px sans-serif'
  ctx.fillText('⚡ IN RIPRODUZIONE ORA', 390, 80)

  ctx.fillStyle = COLORS.text
  ctx.font = 'bold 45px sans-serif'
  ctx.fillText(data.title.substring(0, 30), 390, 140)

  ctx.fillStyle = COLORS.accent
  ctx.font = 'bold 36px sans-serif'
  ctx.fillText(data.artist, 390, 200)
  ctx.fillStyle = COLORS.secondary
  ctx.font = '24px sans-serif'
  ctx.fillText(`da ${data.album || 'Singolo'}`, 390, 240)

  // Pannello Utente (Spostato a 1120 per evitare sovrapposizioni)
  ctx.fillStyle = COLORS.panel
  ctx.beginPath()
  ctx.roundRect ? ctx.roundRect(1120, 40, 340, 180, 24) : ctx.rect(1120, 40, 340, 180)
  ctx.fill()
  ctx.fillStyle = COLORS.accent
  ctx.font = 'bold 22px sans-serif'
  ctx.fillText('Last.fm Player Pro', 1150, 80)
  ctx.fillStyle = COLORS.text
  ctx.font = 'bold 30px sans-serif'
  ctx.fillText(data.user, 1150, 150)
  ctx.fillStyle = COLORS.secondary
  ctx.font = '18px sans-serif'
  ctx.fillText('Paese: Italy 🇮🇹', 1150, 190)

  // Statistiche
  const stats = [
    { label: 'ASCOLTI', val: data.personalPlay, icon: '🎧' },
    { label: 'SCROBBLE', val: data.totalScrobbles, icon: '📊' },
    { label: 'GLOBAL', val: data.globalPlay, icon: '🌍' },
    { label: 'LIKES', val: data.likes, icon: '♥️' }
  ]
  stats.forEach((s, i) => {
    const x = 40 + (i * 365)
    ctx.fillStyle = COLORS.panel
    ctx.beginPath()
    ctx.roundRect ? ctx.roundRect(x, 390, 345, 110, 20) : ctx.rect(x, 390, 345, 110)
    ctx.fill()
    ctx.fillStyle = COLORS.accent; ctx.font = '28px sans-serif'; ctx.fillText(s.icon, x + 25, 455)
    ctx.fillStyle = COLORS.secondary; ctx.font = 'bold 15px sans-serif'; ctx.fillText(s.label, x + 70, 440)
    ctx.fillStyle = COLORS.text; ctx.font = 'bold 32px sans-serif'; ctx.fillText(new Intl.NumberFormat('it-IT').format(s.val), x + 70, 480)
  })

  // Griglia Inferiore (Blocchi larghi 330, distanziati correttamente)
  const drawBlock = (x, title, dataList, isRecent = false) => {
    ctx.fillStyle = COLORS.panel
    ctx.beginPath()
    ctx.roundRect ? ctx.roundRect(x, 530, 330, 330, 24) : ctx.rect(x, 530, 330, 330)
    ctx.fill()
    ctx.fillStyle = COLORS.accent; ctx.font = 'bold 18px sans-serif'; ctx.fillText(title, x + 20, 570)
    dataList.slice(0, 5).forEach((item, i) => {
      ctx.fillStyle = COLORS.text; ctx.font = 'bold 16px sans-serif'
      ctx.fillText(`0${i+1}  ${(item.name || '').substring(0, 18)}`, x + 20, 615 + (i * 48))
      ctx.fillStyle = COLORS.secondary; ctx.font = '14px sans-serif'
      ctx.fillText(isRecent ? (item.artist?.['#text'] || '') : `${new Intl.NumberFormat('it-IT').format(item.playcount)} ascolti`, x + 20, 635 + (i * 48))
    })
  }

  drawBlock(40, 'TOP 5 ARTISTI', data.topArtists)
  drawBlock(395, 'TOP 5 TRACCE', data.topTracks)
  drawBlock(750, 'CRONOLOGIA RECENTE', data.recentTracks, true)
  
  // Focus Artista
  ctx.fillStyle = COLORS.panel; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(1105, 530, 355, 330, 24) : ctx.rect(1105, 530, 355, 330); ctx.fill()
  ctx.fillStyle = COLORS.accent; ctx.font = 'bold 18px sans-serif'; ctx.fillText('FOCUS ARTISTA', 1135, 570)
  ctx.fillStyle = COLORS.text; ctx.font = 'bold 24px sans-serif'; ctx.fillText(data.artist, 1135, 630)
  ctx.fillStyle = COLORS.secondary; ctx.font = '16px sans-serif'; ctx.fillText('Scrobble Globali:', 1135, 670)
  ctx.fillStyle = COLORS.text; ctx.font = 'bold 18px sans-serif'; ctx.fillText(new Intl.NumberFormat('it-IT').format(data.globalPlay), 1135, 700)

  // Footer
  ctx.fillStyle = COLORS.accent
  ctx.fillRect(40, 890, 1420, 75)
  ctx.fillStyle = '#000000'; ctx.font = 'bold 30px sans-serif'; ctx.fillText('Spotify | WRAPPED', 70, 938)

  return canvas.toBuffer('image/png')
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const user = getLastfmUsername(m.sender)
  if (!user && command !== 'setuser') return conn.sendMessage(m.chat, { text: convertToBold(`Registrati con .setuser [username]`) })

  if (command === 'setuser') {
    if (!text) return conn.sendMessage(m.chat, { text: convertToBold(`Usa: .setuser [username]`) })
    setLastfmUsername(m.sender, text.trim())
    return conn.sendMessage(m.chat, { text: convertToBold(`Username ${text.trim()} salvato.`) })
  }

  if (command === 'cur') {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
    try {
        const [data, topArt, topTrk] = await Promise.all([
          apiRequest('user.getrecenttracks', { user, limit: 10 }),
          apiRequest('user.gettopartists', { user, limit: 5 }),
          apiRequest('user.gettoptracks', { user, limit: 5 })
        ])
        const cur = data?.recenttracks?.track?.[0]
        if (!cur) throw new Error()
        
        const [info, userI] = await Promise.all([
          apiRequest('track.getinfo', { username: user, artist: cur.artist['#text'], track: cur.name }),
          apiRequest('user.getinfo', { user })
        ])

        const buffer = await drawSpotifyCard({
          title: cur.name, artist: cur.artist['#text'], album: cur.album?.['#text'], user,
          personalPlay: info?.track?.userplaycount || 0, globalPlay: info?.track?.playcount || 0,
          totalScrobbles: userI?.user?.playcount || 0, likes: getSongLikes(generateSongId(user, cur.artist['#text'], cur.name)),
          coverUrl: cur.image?.slice(-1)[0]?.['#text'], topArtists: topArt?.topartists?.artist || [],
          topTracks: topTrk?.toptracks?.track || [], recentTracks: data?.recenttracks?.track || []
        })
        await conn.sendMessage(m.chat, { image: buffer }, { quoted: m })
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    } catch(e) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    }
  }
}

function getLastfmUsername(userId) { return loadUsers()[userId] || null }
function setLastfmUsername(userId, username) { const users = loadUsers(); users[userId] = username; saveUsers(users) }

handler.command = /^(cur|setuser|like)$/i
export default handler