//Plugin by Gab, Lucifero & 333 staff

import fetch from 'node-fetch';
import { sticker } from '../lib/sticker.js';

const fetchJson = async (url, options) => {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Errore HTTP: ${response.status}`);
    return response.json();
};

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`𝐒𝐜𝐞𝐠𝐥𝐢 𝐪𝐮𝐚𝐥𝐢 𝐞𝐦𝐨𝐣𝐢 𝐦𝐢𝐱𝐚𝐫𝐞!\n𝐄𝐬𝐞𝐦𝐩𝐢𝐨: .𝐞𝐦𝐨𝐣𝐢𝐦𝐢𝐱 😋 + 🤤`);
    }
    const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)/gu;
    let matches = [...text.matchAll(emojiRegex)].map(match => match[0]);

    let emoji1 = matches[0];
    let emoji2 = matches[1];

    if (!emoji1 || !emoji2 || matches.length !== 2) {
        return m.reply(`𝐔𝐬𝐚 𝐬𝐨𝐥𝐨 𝟐 𝐞𝐦𝐨𝐣𝐢 𝐬𝐞𝐩𝐚𝐫𝐚𝐭𝐞 𝐝𝐚𝐥 ’’+’’ !`);
    }
    
    try {
        const url = `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`;
        
        const anu = await fetchJson(url);

        if (!anu.results || anu.results.length === 0) {
            return m.reply(`𝐍𝐨𝐧 𝐬𝐨𝐧𝐨 𝐫𝐢𝐮𝐬𝐜𝐢𝐭𝐨 𝐚 𝐦𝐢𝐱𝐚𝐫𝐞 𝐥𝐞 𝐭𝐮𝐞 𝐞𝐦𝐨𝐣𝐢, 𝐫𝐢𝐩𝐫𝐨𝐯𝐚.`);
        }
        
        for (const res of anu.results) {
            const stiker = await sticker(false, res.url, global.autore, global.nomepack);
            await conn.sendFile(m.chat, stiker, null, { asSticker: true }, m);
        }

    } catch (e) {
        console.error(e);
        if (e.message.includes('403')) {
            m.reply(`${global.errore} `);
        } else {
            m.reply(`${global.errore}`);
        }
    }
};

handler.help = ['𝐞𝐦𝐨𝐣𝐢𝐦𝐢𝐱'];
handler.tags = ['fun'];
handler.command = ['emojimix'];

export default handler;