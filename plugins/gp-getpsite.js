import fetch from 'node-fetch';

function toMathBold(str) {
  if (!str) return '';
  return str.replace(/[A-Za-z0-9]/g, (char) => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(code + 119743);
    if (code >= 97 && code <= 122) return String.fromCodePoint(code + 119737);
    if (code >= 48 && code <= 57) return String.fromCodePoint(code + 120734);
    return char;
  });
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        return m.reply(`🤖 *𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 𝟑𝟑𝟑*\n\nUso: \`${usedPrefix + command} <nome-plugin>\`\nEsempio: \`${usedPrefix + command} antilink\``);
    }

    let pluginName = args[0].trim().toLowerCase().replace(/\.js$/, '');
    await m.reply(`⏳ *Ricerca di ${pluginName}.js sul sito in corso...*`);

    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7'
    };

    try {
        const response = await fetch('https://333wt.it/index2.html', { headers });
        let html = '';
        if (response.ok) {
            html = await response.text();
        }

        const linkRegex = new RegExp(`href=["']([^"']*(?:${pluginName})[^"']*\\.js)["']`, 'i');
        const match = html.match(linkRegex);

        let downloadUrl = '';
        let fileFound = false;

        if (match && match[1]) {
            downloadUrl = match[1];
            if (downloadUrl.startsWith('/')) {
                downloadUrl = `https://333wt.it${downloadUrl}`;
            } else if (!downloadUrl.startsWith('http')) {
                downloadUrl = `https://333wt.it/${downloadUrl}`;
            }
            fileFound = true;
        }

        const fallbacks = [
            `https://333wt.it/plugins/${pluginName}.js`,
            `https://333wt.it/download/${pluginName}.js`,
            `https://333wt.it/files/${pluginName}.js`,
            `https://333wt.it/${pluginName}.js`
        ];

        let fileBuffer = null;

        if (fileFound) {
            const fileRes = await fetch(downloadUrl, { headers });
            if (fileRes.ok) {
                fileBuffer = await fileRes.buffer();
            }
        }

        if (!fileBuffer) {
            for (let url of fallbacks) {
                try {
                    const res = await fetch(url, { headers });
                    if (res.ok) {
                        fileBuffer = await res.buffer();
                        downloadUrl = url;
                        break;
                    }
                } catch (err) {}
            }
        }

        if (!fileBuffer) {
            return m.reply(`❌ *PLUGIN NON TROVATO*\n\nNessun plugin corrispondente a *${pluginName}.js* trovato sul sito 333wt.it.\n_Verifica il nome esatto della risorsa._`);
        }

        const captionText = `╭─────────╮  
┃ 📥 𝐏𝐋𝐔𝐆𝐈𝐍 𝐒𝐂𝐀𝐑𝐈𝐂𝐀𝐓𝐎!
┃ ꙰  𝟥𝟥𝟥 𝔹𝕆𝕋  ꙰
┃━━━━━━━━━━━━━━
┃⮕ 𝐍𝐨𝐦𝐞: *${pluginName}.js*
┃⮕ 𝐒𝐨𝐫𝐠𝐞𝐧𝐭𝐞: 333wt.it
┃
┃ _Sposta questo file dentro_
┃ _la cartella plugins del tuo_
┃ _bot per installarlo ed avviarlo!_
╰─────────╯`;

        await conn.sendMessage(m.chat, {
            document: fileBuffer,
            mimetype: 'application/javascript',
            fileName: `${pluginName}.js`,
            caption: captionText,
            contextInfo: {
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363341274693350@newsletter',
                    serverMessageId: -1,
                    newsletterName: global.nomebot || '333'
                }
            }
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        m.reply(`⚠️ *𝐄𝐑𝐑𝐎𝐑𝐄 𝐃𝐈 𝐑𝐄𝐓𝐄*\n\nImpossibile connettersi al sito 333wt.it o scaricare la risorsa.\nDettaglio: _${e.message}_`);
    }
};

handler.help = ['getpsite'];
handler.tags = ['owner'];
handler.command = /^(getpsite|getplugin|scarica|plugin)$/i;
handler.owner = true;

export default handler;