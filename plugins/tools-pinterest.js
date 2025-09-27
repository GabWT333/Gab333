import { pinterest } from '@bochilteam/scraper';
import axios from 'axios';

// Configurazione messaggi
const lenguajeGB = {
  smsAvisoMG: () => "❗ Per favore, inserisci un testo valido.",
  smsAvisoEG: () => "📌 Risultati:",
  smsMensError2: () => "❗ Errore durante l'elaborazione della richiesta.",
};

const mid = {
  smsMalused7: "Utilizzo errato del comando. Esempio:",
  buscador: "Risultati della ricerca",
};

const apis = "https://api.siputzx.my.id/api/s/pinterest?query=";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    throw `${lenguajeGB.smsAvisoMG()} ${mid.smsMalused7}\n*${usedPrefix + command} gatta | gatto*`;
  }

  await m.react("🔎");

  // Fallback chain
  const searchFallbacks = [
    async () => {
      const res = await axios.get(`https://api.dorratz.com/v2/pinterest?q=${text}`);
      return res.data?.slice(0, 9).map(r => ({
        image: r.image,
        title: r.fullname || text,
        author: r.upload_by,
        followers: r.followers,
      }));
    },
    async () => {
      const res = await axios.get(`${apis}${encodeURIComponent(text)}`);
      if (!res.data?.status) throw new Error('No results');
      return res.data.data?.slice(0, 6).map(r => ({
        image: r.images_url,
        title: r.grid_title || text,
      }));
    },
    async () => {
      const { data: res } = await axios.get(`${apis}/search/pinterestv2?text=${encodeURIComponent(text)}`);
      if (!res?.status || !res.data?.length) throw new Error('No results');
      return res.data.slice(0, 6).map(r => ({
        image: r.image,
        title: r.description || text,
        author: r.name,
        username: r.username,
      }));
    },
    async () => {
      const results = await pinterest(text);
      return results?.slice(0, 6).map(img => ({
        image: img.url,
        title: text,
      }));
    }
  ];

  let finalResults = [];

  for (const attempt of searchFallbacks) {
    try {
      finalResults = await attempt();
      if (finalResults.length) break;
    } catch (e) {
      continue;
    }
  }

  if (!finalResults.length) {
    return await m.reply(`❌ Nessun risultato trovato per "${text}".`);
  }

  // Se è WhatsApp Business, invia album
  if (m.isWABusiness) {
    const mediaAlbum = finalResults.map(r => ({
      image: { url: r.image },
      caption: r.title,
    }));
    await conn.sendAlbumMessage(m.chat, mediaAlbum, {
      quoted: m,
      delay: 2000,
      caption: `${lenguajeGB.smsAvisoEG()} 💞 ${mid.buscador}: ${text}`,
    });
  } else {
    let msg = `${lenguajeGB.smsAvisoEG()} 💞 ${mid.buscador}: ${text}\n\n`;
    finalResults.forEach(r => {
      msg += `*${r.title}*`;
      if (r.author) msg += `\n👤 Autore: ${r.author}`;
      if (r.username) msg += ` (@${r.username})`;
      if (r.followers) msg += `\n👥 Followers: ${r.followers}`;
      msg += `\n🔗 ${r.image}\n\n`;
    });
    await m.reply(msg.trim());
  }

  await m.react("✅");
};

handler.help = ['pinterest <keyword>'];
handler.tags = ['internet'];
handler.command = /^(pinterest|dlpinterest|pinterestdl)$/i;

export default handler;