//Plugin by Gab, Lucifero & 333 staff

import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, command, text }) => {
    let page = parseInt(text) || 0;
    const apis = [
        'https://api.proxyscrape.com/v2/?request=displayproxies&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all',
        'https://www.proxy-list.download/api/v1/get?type=http',
        'https://www.proxy-list.download/api/v1/get?type=https',
        'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/http.txt',
        'https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/http.txt',
        'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt',
        'https://raw.githubusercontent.com/hookzof/socks5_list/master/proxy.txt',
        'https://raw.githubusercontent.com/clarketm/proxy-list/master/proxy-list-raw.txt',
        'https://raw.githubusercontent.com/sunny9577/proxy-scraper/master/proxies.txt',
        'https://raw.githubusercontent.com/rooster1270/github-proxy-list/main/proxies/http.txt'
    ];

    try {
        let allProxies = [];
        for (let api of apis) {
            try {
                const res = await fetch(api);
                const data = await res.text();
                const list = data.trim().split('\n').map(p => p.trim()).filter(p => p.length > 0);
                allProxies = [...new Set([...allProxies, ...list])];
            } catch (e) {
                continue;
            }
        }

        if (allProxies.length === 0) return m.reply('ERRORE: DATABASE VUOTO');

        let start = page * 100;
        let end = start + 100;
        let currentBatch = allProxies.slice(start, end);

        if (currentBatch.length === 0) return m.reply('FINE LISTA');

        let msg = `PROXY LIST PAGE ${page + 1}\nTOTAL: ${allProxies.length}\n\n`;
        msg += currentBatch.join('\n');

        const buttons = [
            { 
                buttonId: `${usedPrefix}${command} ${page + 1}`, 
                buttonText: { displayText: "NEXT 100" }, 
                type: 1 
            }
        ];

        await conn.sendMessage(m.chat, {
            text: msg,
            footer: `PAGE ${page + 1}`,
            buttons: buttons,
            headerType: 1
        }, { quoted: m });

    } catch (err) {
        m.reply('ERRORE SISTEMA');
    }
};

handler.help = ['proxy'];
handler.tags = ['tools'];
handler.rowner = true
handler.command = /^(proxy)$/i;

export default handler;