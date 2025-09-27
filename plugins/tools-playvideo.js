// Codice di tools-playvideo.js

import fetch from 'node-fetch';
import yts from 'yt-search';
import axios from 'axios';
import { Worker } from 'worker_threads';

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, come Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, come Gecko) Version/14.0.1 Safari/605.1.15',
  'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, come Gecko) Chrome/91.0.4472.124 Mobile Safari/537.36'
];

const ddownr = {
  download: async (url, format) => {
    const config = {
      method: 'GET',
      url: `https://p.oceansaver.in/ajax/download.php?format=${format}&url=${encodeURIComponent(url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`,
      headers: {
        'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)]
      }
    };

    try {
      const response = await axios.request(config);
      if (response.data && response.data.success) {
        const { id, title, info } = response.data;
        const { image } = info;
        const downloadUrl = await ddownr.cekProgress(id);
        return { id, image, title, downloadUrl };
      } else {
        throw new Error('𝐄𝐑𝐑𝐎𝐑𝐄 𝐃𝐔𝐑𝐀𝐍𝐓𝐄 𝐈𝐋 𝐑𝐄𝐂𝐔𝐏𝐄𝐑𝐎 𝐃𝐄𝐋𝐋𝐄 𝐈𝐍𝐅𝐎 𝐃𝐄𝐋 𝐕𝐈𝐃𝐄𝐎.');
      }
    } catch (error) {
      console.error('𝐄𝐑𝐑𝐎𝐑𝐄:', error);
      throw error;
    }
  },
  cekProgress: async (id) => {
    const config = {
      method: 'GET',
      url: `https://p.oceansaver.in/ajax/progress.php?id=${id}`,
      headers: {
        'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)]
      }
    };

    try {
      while (true) {
        const response = await axios.request(config);
        if (response.data && response.data.success && response.data.progress === 1000) {
          return response.data.download_url;
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (error) {
      console.error('𝐄𝐑𝐑𝐎𝐑𝐄:', error);
      throw error;
    }
  }
};

export async function downloadFromSource(source, url, title, thumb, m, conn) {
  try {
    const res = await fetch(source);
    let json;
    try {
      json = await res.json();
    } catch (e) {
      console.warn(`Risposta non JSON valida da ${source}`);
      return false;
    }
    const { data, result, downloads } = json;
    let downloadUrl = data?.dl || data?.download_url || data?.url || data?.download?.url || result?.download?.url || downloads?.url || data?.downloadUrl || data?.result?.url || data?.result?.download_url;
    if (downloadUrl) {
      await conn.sendMessage(m.chat, {
        video: { url: downloadUrl },
        fileName: `${title}.mp4`,
        mimetype: 'video/mp4',
        caption: "  ",
        thumbnail: thumb
      }, { quoted: m });
      return true;
    }
  } catch (e) {
    console.error(`𝐄𝐑𝐑𝐎𝐑𝐄 𝐀𝐏𝐈 ${source}:`, e.message);
  }
  return false;
};

const handler = async (m, { conn, text }) => {
  try {
    if (!text.trim()) {
      return conn.reply(m.chat, `𝐌𝐚𝐧𝐜𝐚 𝐢𝐥 𝐧𝐨𝐦𝐞 𝐝𝐞𝐥 𝐯𝐢𝐝𝐞𝐨.`, m);
    }

    const search = await yts(text);
    if (!search.all || search.all.length === 0) {
      return m.reply('❌ 𝐍𝐞𝐬𝐬𝐮𝐧 𝐯𝐢𝐝𝐞𝐨 𝐭𝐫𝐨𝐯𝐚𝐭𝐨.');
    }

    const videoInfo = search.all[0];
    const { title, thumbnail, timestamp, views, ago, url } = videoInfo;
    const infoMessage = `\n*𝑻𝑰𝑻𝑶𝑳𝑶:* ${title}\n*𝑫𝑼𝑹𝑨𝑻𝑨:* ${timestamp}\n*𝑽𝑰𝑬𝑾𝑺:* ${views.toLocaleString()}\n*𝑼𝑺𝑪𝑰𝑻𝑨:* ${ago}\n*𝑳𝑰𝑵𝑲:* ${url} \n> ⏳ 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐝𝐞𝐥 𝐯𝐢𝐝𝐞𝐨 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨...`;
    const thumb = (await conn.getFile(thumbnail))?.data;
    conn.sendMessage(m.chat, {
      text: infoMessage,
      contextInfo: {
        externalAdReply: {
          title: title,
          body: "YouTube Downloader",
          mediaType: 1,
          previewType: 0,
          mediaUrl: url,
          sourceUrl: url,
          thumbnail: thumb,
        }
      }
    });

    let sources = [
      `https://api.siputzx.my.id/api/d/ytmp4?url=${url}`,
      `https://api.zenkey.my.id/api/download/ytmp4?apikey=zenkey&url=${url}`,
      `https://axeel.my.id/api/download/video?url=${encodeURIComponent(url)}`,
      `https://delirius-apiofc.vercel.app/download/ytmp4?url=${url}`,
      `https://api.neoxr.eu/api/youtube?url=${url}&type=video&quality=720p&apikey=GataDios`,
      `https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(url)}`,
      `https://exonity.tech/api/ytdlp2-faster?apikey=adminsepuh&url=${url}`
    ];

    const downloadPromises = sources.map(source => downloadFromSource(source, url, title, thumb, m, conn));
    const results = await Promise.all(downloadPromises);

    if (!results.includes(true)) {
      return m.reply(`⚠︎ *𝐄𝐑𝐑𝐎𝐑𝐄:* 𝐍𝐎𝐍 𝐒𝐎𝐍𝐎 𝐑𝐈𝐘𝐒𝐂𝐈𝐓𝐎 𝐀 𝐓𝐑𝐎𝐕𝐀𝐑𝐄 𝐀𝐋𝐂𝐔𝐍 𝐋𝐈𝐍𝐊 𝐕𝐀𝐋𝐈𝐃𝐎 𝐏𝐄𝐑 𝐈𝐋 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃.`);
    }
  } catch (error) {
    return m.reply(`⚠︎ *𝐄𝐑𝐑𝐎𝐑𝐄:* ${error.message}`);
  }
};

handler.command = ['video'];
handler.tags = ['downloader'];
handler.help = ['playvideo'];

export default handler;
