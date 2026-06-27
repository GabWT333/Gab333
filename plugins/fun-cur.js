//Plugin by Gab, Lucifero & 333 staff



import fetch from 'node-fetch';
import fs from 'fs';
import { makeCard, sendImage } from './lastfm-card.js';

const DB_PATH = './db.json';
let db = fs.existsSync(DB_PATH) ? JSON.parse(fs.readFileSync(DB_PATH)) : {};


if (!db.likes) {
  db.likes = {};
}

function saveDB() {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}


const invalidateRecentCache = (username) => {}; 
const generateSongId = (username, artist, song) => `${username}_${artist}_${song}`.toLowerCase().replace(/\s+/g, '');
const addSongLike = (songId, sender) => {
  if (!db.likes[songId]) db.likes[songId] = [];
  if (db.likes[songId].includes(sender)) return { alreadyLiked: true };
  db.likes[songId].push(sender);
  saveDB();
  return { alreadyLiked: false };
};
const getUsernameFromId = (id) => Object.keys(db).find(key => key === id) || id;


const LASTFM_API_KEY = '36f859a1fc4121e7f0e931806507d5f9';

async function getRecentTrack(username) {
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${LASTFM_API_KEY}&format=json&limit=1`;
  const res  = await fetch(url);
  const json = await res.json();
  return json?.recenttracks?.track?.[0];
}

async function getTopArtists(username) {
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${username}&api_key=${LASTFM_API_KEY}&format=json&period=7day&limit=3`;
  const res  = await fetch(url);
  const json = await res.json();
  return json?.topartists?.artist;
}

const handler = async (m, { conn, args, usedPrefix, text, command, groupMetadata }) => {


  if (command === 'setuser') {
    const username = text.trim();
    if (!username) {
      await conn.sendMessage(m.chat, { text: '❌ Usa il comando così: /setuser <username>' });
      return;
    }
    db[m.sender] = username;
    saveDB();
    await conn.sendMessage(m.chat, { text: `✅ Username Last.fm impostato su *${username}*` });
    return;
  }

  const user = db[m.sender];
  if (!user) {
    await conn.sendMessage(m.chat, {
      text: '⚠️ Usa prima `/setuser <username>` per collegare il tuo account Last.fm.'
    });
    return;
  }

  
  if (command === 'profilo' || command === 'cur') {
    const track = await getRecentTrack(user);
    if (!track) {
      return conn.sendMessage(m.chat, { text: '❌ Nessun brano trovato.' });
    }

    let imageBuffer;
    try {
      imageBuffer = await makeCard(track, user);
    } catch (e) {
      console.error('[cur] makeCard error:', e.message);
      return conn.sendMessage(m.chat, { text: '❌ Errore nella generazione della card.' });
    }

    const songTitle  = track.name;
    const artistName = track.artist['#text'];
    const searchQuery = `${songTitle} ${artistName}`;


    const buttons = [
      {
        buttonId: `.play ${searchQuery}`,
        buttonText: { displayText: `🎵 ${songTitle.substring(0, 18)}${songTitle.length > 18 ? '…' : ''}` },
        type: 1
      },
      {
        buttonId: `.salva ${searchQuery}`,
        buttonText: { displayText: '💾 𝐒𝐚𝐥𝐯𝐚' },
        type: 1
      },
      {
        buttonId: `.fuoco ${m.sender}`, // Passiamo l'ID di chi genera la card nel bottone
        buttonText: { displayText: '🔥 𝐌𝐞𝐭𝐭𝐢 𝐚 𝐟𝐮𝐨𝐜𝐨' },
        type: 1
      }
    ];

    const caption =
      `🎵 *se vuoi farlo pure tu, registrati su Last.fm, collega Spotify e poi /setuser*\n\n` +
      `🎵 Ascolta: *${songTitle}*\n` +
      `👤 Artista: *${artistName}*\n\n` +
      `Clicca i pulsanti qui sotto:`;

    await sendImage(conn, m, imageBuffer, caption, buttons);
    return;
  }

 
  if (command === 'top') {
    const artists = await getTopArtists(user);
    if (!artists?.length) {
      return conn.sendMessage(m.chat, { text: '❌ Nessun dato trovato.' });
    }

    const medals  = ['🥇', '🥈', '🥉'];
    const topList = artists
      .map((a, i) => `${medals[i]} *${a.name}*\n   📊 ${a.playcount} scrobble${a.playcount > 1 ? 's' : ''}`)
      .join('\n\n');

    await conn.sendMessage(m.chat, {
      text: `🏆 *Top artisti di ${user}* (ultimi 7 giorni)\n\n${topList}`
    });
    return;
  }


  if (command === 'fuoco' || command === 'like') {
    

    let targetUserId = m.quoted && !m.quoted.fromMe ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null);
    

    if (!targetUserId && args[0] && args[0].endsWith('@s.whatsapp.net')) {
        targetUserId = args[0];
    }
    
    if (!targetUserId) {
      return conn.sendMessage(m.chat, { text: 'Devi premere il bottone, rispondere a un messaggio o menzionare qualcuno per mettergli fuoco🔥!' });
    }

    const targetUsername = db[targetUserId];
    if (!targetUsername) {
      return conn.sendMessage(m.chat, { text: 'Questo utente non ha registrato un account Last.fm.' });
    }


    if (m.sender === targetUserId) {
      return conn.sendMessage(m.chat, { text: 'Non puoi mettere a fuoco te stesso🔥!' }, { quoted: m })
    }

    invalidateRecentCache(targetUsername)
    const track = await getRecentTrack(targetUsername)
    if (!track) return conn.sendMessage(m.chat, { text: '❌ Nessuna traccia trovata.' })

    const artist = track.artist?.['#text'] || 'unknown'
    const songName = track.name || 'unknown'

    const songId = generateSongId(targetUsername, artist, songName)
    const result = addSongLike(songId, m.sender)

    if (result.alreadyLiked) {
      return conn.sendMessage(m.chat, { text: `❌ Hai già messo fuoco a "${songName}" di ${targetUsername}!` })
    }

    const targetName = getUsernameFromId(targetUserId) || targetUsername
    return conn.sendMessage(m.chat, { text: `🔥 Hai messo fuoco a *${songName}* di ${targetName}!` })
  }
};

handler.command = ['setuser', 'profilo', 'cur', 'stats', 'fuoco', 'like'];
handler.help    = ['𝐜𝐮𝐫/𝐭𝐨𝐩', '𝐟𝐮𝐨𝐜𝐨/𝐥𝐢𝐤𝐞'];
handler.tags    = ['fun'];
handler.group   = true;

export default handler;