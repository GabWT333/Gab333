//Plugin by Gab, Lucifero & 333 staff


const playAgainButtons = () => [{
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({ display_text: '🏳️ Nuova Partita', id: `.bandiera` })
}];

let handler = async (m, { conn, args, participants, isAdmin, isBotAdmin, usedPrefix, command }) => {
    let frasi = [
        `𝐈𝐍𝐃𝐎𝐕𝐈𝐍𝐀 𝐋𝐀 𝐁𝐀𝐍𝐃𝐈𝐄𝐑𝐀!`,
        `𝐈𝐍𝐃𝐎𝐕𝐈𝐍𝐀 𝐋𝐀 𝐍𝐀𝐙𝐈𝐎𝐍𝐄 𝐑𝐀𝐏𝐏𝐑𝐄𝐒𝐄𝐍𝐓𝐀𝐓𝐀 𝐃𝐀 𝐐𝐔𝐄𝐒𝐓𝐀 𝐁𝐀𝐍𝐃𝐈𝐄𝐑𝐀!`,
        `𝐕𝐄𝐃𝐈𝐀𝐌𝐎 𝐐𝐔𝐀𝐍𝐓𝐎 𝐒𝐄𝐈 𝐁𝐑𝐀𝐕𝐎/𝐀 𝐈𝐍 𝐆𝐄𝐎𝐆𝐑𝐀𝐅𝐈𝐀!`,
        `𝐒𝐈𝐈 𝐈𝐋 𝐏𝐑𝐈𝐌𝐎/𝐀 𝐀𝐃 𝐈𝐍𝐃𝐎𝐕𝐈𝐍𝐀𝐑𝐄 𝐋𝐀 𝐁𝐀𝐍𝐃𝐈𝐄𝐑𝐀!`,
        `𝐐𝐔𝐈𝐙 𝐒𝐔𝐋𝐋𝐄 𝐁𝐀𝐍𝐃𝐈𝐄𝐑𝐄, 𝐒𝐀𝐈 𝐃𝐈𝐑𝐌𝐈 𝐂𝐇𝐄 𝐏𝐀𝐄𝐒𝐄 𝐑𝐀𝐏𝐏𝐑𝐄𝐒𝐄𝐍𝐓𝐀?`,
        `𝐒𝐂𝐎𝐏𝐑𝐈𝐀𝐌𝐎 𝐂𝐇𝐄 𝐕𝐎𝐓𝐎 𝐀𝐕𝐄𝐕𝐈 𝐈𝐍 𝐆𝐄𝐎𝐆𝐑𝐀𝐅𝐈𝐀, 𝐈𝐍𝐃𝐎𝐕𝐈𝐍𝐀 𝐋𝐀 𝐁𝐀𝐍𝐃𝐈𝐄𝐑𝐀!`,
        `𝐏𝐄𝐍𝐒𝐀 𝐀𝐓𝐓𝐄𝐍𝐓𝐀𝐌𝐄𝐍𝐓𝐄 𝐄 𝐈𝐍𝐃𝐎𝐕𝐈𝐍𝐀 𝐋𝐀 𝐁𝐀𝐍𝐃𝐈𝐄𝐑𝐀!`,
    ];

    if (m.text?.toLowerCase() === '.skipbandiera') {
        if (!m.isGroup) return m.reply('𝐪𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐞̀ 𝐮𝐭𝐢𝐥𝐢𝐳𝐳𝐚𝐛𝐢𝐥𝐞 𝐬𝐨𝐥𝐨 𝐧𝐞𝐢 𝐠𝐫𝐮𝐩𝐩𝐢.⚠️');
        if (!global.bandieraGame?.[m.chat]) return m.reply('𝐧𝐞𝐬𝐬𝐮𝐧𝐚 𝐩𝐚𝐫𝐭𝐢𝐭𝐚 𝐚𝐭𝐭𝐢𝐯𝐚 𝐚𝐥 𝐦𝐨𝐦𝐞𝐧𝐭𝐨.');

        if (!isAdmin && !m.fromMe) {
            return m.reply('𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞 𝐬𝐨𝐥𝐨 𝐩𝐞𝐫 𝐚𝐝𝐦𝐢𝐧!');
        }

        clearTimeout(global.bandieraGame[m.chat].timeout);
        
        let skipText = `𝐏𝐀𝐑𝐓𝐈𝐓𝐀 𝐈𝐍𝐓𝐄𝐑𝐑𝐎𝐓𝐓𝐀 𝐃𝐀 𝐔𝐍 𝐀𝐃𝐌𝐈𝐍!\n\n`;
        skipText += `╭─────────╮\n`
        skipText += `│ 🏳️ 𝐥𝐚 𝐛𝐚𝐧𝐝𝐢𝐞𝐫𝐚 𝐞𝐫𝐚: \n│ ‼️  *\`${global.bandieraGame[m.chat].rispostaOriginale}\`*\n`;
        skipText += `╰─────────╯`;

        await conn.sendMessage(m.chat, {
            text: skipText,
            footer: '𝟥𝟥𝟥 𝔹𝕆𝕋',
            interactiveButtons: playAgainButtons()
        }, { quoted: m });
        delete global.bandieraGame[m.chat];
        return;
    }
    
    if (global.bandieraGame?.[m.chat]) {
        return m.reply('𝐜’𝐞̀ 𝐠𝐢𝐚̀ 𝐮𝐧𝐚 𝐩𝐚𝐫𝐭𝐢𝐭𝐚 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨, 𝐬𝐛𝐫𝐢𝐠𝐚𝐭𝐢 𝐩𝐫𝐢𝐦𝐚 𝐜𝐡𝐞 𝐬𝐜𝐚𝐝𝐚 𝐢𝐥 𝐭𝐞𝐦𝐩𝐨!');
    }

    const cooldownKey = `bandiera_${m.chat}`;
    const lastGame = global.cooldowns?.[cooldownKey] || 0;
    const now = Date.now();
    const cooldownTime = 5000;

    if (now - lastGame < cooldownTime) {
        const remainingTime = Math.ceil((cooldownTime - (now - lastGame)) / 1000);
        return m.reply(`𝐝𝐞𝐯𝐢 𝐚𝐬𝐩𝐞𝐭𝐭𝐚𝐫𝐞 𝐚𝐧𝐜𝐨𝐫𝐚 ${remainingTime} 𝐬𝐞𝐜𝐨𝐧𝐝𝐢 𝐩𝐫𝐢𝐦𝐚 𝐝𝐢 𝐢𝐧𝐢𝐳𝐢𝐚𝐫𝐞 𝐮𝐧𝐚 𝐧𝐮𝐨𝐯𝐚 𝐩𝐚𝐫𝐭𝐢𝐭𝐚. ⏳`);
    }

    global.cooldowns = global.cooldowns || {};
    global.cooldowns[cooldownKey] = now;

    let bandiere = [
        { url: 'https://flagcdn.com/w320/it.png', nome: 'Italia' },
        { url: 'https://flagcdn.com/w320/fr.png', nome: 'Francia' },
        { url: 'https://flagcdn.com/w320/de.png', nome: 'Germania' },
        { url: 'https://flagcdn.com/w320/gb.png', nome: 'Regno Unito' },
        { url: 'https://flagcdn.com/w320/es.png', nome: 'Spagna' },
        { url: 'https://flagcdn.com/w320/se.png', nome: 'Svezia' },
        { url: 'https://flagcdn.com/w320/no.png', nome: 'Norvegia' },
        { url: 'https://flagcdn.com/w320/fi.png', nome: 'Finlandia' },
        { url: 'https://flagcdn.com/w320/dk.png', nome: 'Danimarca' },
        { url: 'https://flagcdn.com/w320/pl.png', nome: 'Polonia' },
        { url: 'https://flagcdn.com/w320/pt.png', nome: 'Portogallo' },
        { url: 'https://flagcdn.com/w320/gr.png', nome: 'Grecia' },
        { url: 'https://flagcdn.com/w320/ch.png', nome: 'Svizzera' },
        { url: 'https://flagcdn.com/w320/at.png', nome: 'Austria' },
        { url: 'https://flagcdn.com/w320/be.png', nome: 'Belgio' },
        { url: 'https://flagcdn.com/w320/nl.png', nome: 'Paesi Bassi' },
        { url: 'https://flagcdn.com/w320/ua.png', nome: 'Ucraina' },
        { url: 'https://flagcdn.com/w320/ro.png', nome: 'Romania' },
        { url: 'https://flagcdn.com/w320/hu.png', nome: 'Ungheria' },
        { url: 'https://flagcdn.com/w320/cz.png', nome: 'Repubblica Ceca' },
        { url: 'https://flagcdn.com/w320/ie.png', nome: 'Irlanda' },
        { url: 'https://flagcdn.com/w320/bg.png', nome: 'Bulgaria' },
        { url: 'https://flagcdn.com/w320/md.png', nome: 'Moldavia' },
        { url: 'https://flagcdn.com/w320/us.png', nome: 'Stati Uniti' },
        { url: 'https://flagcdn.com/w320/ca.png', nome: 'Canada' },
        { url: 'https://flagcdn.com/w320/mx.png', nome: 'Messico' },
        { url: 'https://flagcdn.com/w320/br.png', nome: 'Brasile' },
        { url: 'https://flagcdn.com/w320/ar.png', nome: 'Argentina' },
        { url: 'https://flagcdn.com/w320/cl.png', nome: 'Cile' },
        { url: 'https://flagcdn.com/w320/co.png', nome: 'Colombia' },
        { url: 'https://flagcdn.com/w320/pe.png', nome: 'Perù' },
        { url: 'https://flagcdn.com/w320/ve.png', nome: 'Venezuela' },
        { url: 'https://flagcdn.com/w320/cu.png', nome: 'Cuba' },
        { url: 'https://flagcdn.com/w320/au.png', nome: 'Australia' },
        { url: 'https://flagcdn.com/w320/nz.png', nome: 'Nuova Zelanda' },
        { url: 'https://flagcdn.com/w320/cn.png', nome: 'Cina' },
        { url: 'https://flagcdn.com/w320/jp.png', nome: 'Giappone' },
        { url: 'https://flagcdn.com/w320/in.png', nome: 'India' },
        { url: 'https://flagcdn.com/w320/kr.png', nome: 'Corea del Sud' },
        { url: 'https://flagcdn.com/w320/th.png', nome: 'Thailandia' },
        { url: 'https://flagcdn.com/w320/vn.png', nome: 'Vietnam' },
        { url: 'https://flagcdn.com/w320/id.png', nome: 'Indonesia' },
        { url: 'https://flagcdn.com/w320/ph.png', nome: 'Filippine' },
        { url: 'https://flagcdn.com/w320/my.png', nome: 'Malesia' },
        { url: 'https://flagcdn.com/w320/sg.png', nome: 'Singapore' },
        { url: 'https://flagcdn.com/w320/pk.png', nome: 'Pakistan' },
        { url: 'https://flagcdn.com/w320/af.png', nome: 'Afghanistan' },
        { url: 'https://flagcdn.com/w320/ir.png', nome: 'Iran' },
        { url: 'https://flagcdn.com/w320/iq.png', nome: 'Iraq' },
        { url: 'https://flagcdn.com/w320/tr.png', nome: 'Turchia' },
        { url: 'https://flagcdn.com/w320/il.png', nome: 'Israele' },
        { url: 'https://flagcdn.com/w320/sa.png', nome: 'Arabia Saudita' },
        { url: 'https://flagcdn.com/w320/ae.png', nome: 'Emirati Arabi Uniti' },
        { url: 'https://flagcdn.com/w320/qa.png', nome: 'Qatar' },
        { url: 'https://flagcdn.com/w320/eg.png', nome: 'Egitto' },
        { url: 'https://flagcdn.com/w320/ng.png', nome: 'Nigeria' },
        { url: 'https://flagcdn.com/w320/ma.png', nome: 'Marocco' },
        { url: 'https://flagcdn.com/w320/tn.png', nome: 'Tunisia' },
        { url: 'https://flagcdn.com/w320/ke.png', nome: 'Kenya' },
        { url: 'https://flagcdn.com/w320/et.png', nome: 'Etiopia' },
        { url: 'https://flagcdn.com/w320/gh.png', nome: 'Ghana' },
        { url: 'https://flagcdn.com/w320/cm.png', nome: 'Camerun' },
        { url: 'https://flagcdn.com/w320/ci.png', nome: "Costa d'Avorio" },
        { url: 'https://flagcdn.com/w320/sn.png', nome: 'Senegal' },
        { url: 'https://flagcdn.com/w320/za.png', nome: 'Sudafrica' },
        { url: 'https://flagcdn.com/w320/dz.png', nome: 'Algeria' },
        { url: 'https://flagcdn.com/w320/sd.png', nome: 'Sudan' },
        { url: 'https://flagcdn.com/w320/cd.png', nome: 'Repubblica Democratica del Congo' },
        { url: 'https://flagcdn.com/w320/ao.png', nome: 'Angola' },
        { url: 'https://flagcdn.com/w320/mg.png', nome: 'Madagascar' },
        { url: 'https://flagcdn.com/w320/tz.png', nome: 'Tanzania' },
        { url: 'https://flagcdn.com/w320/ug.png', nome: 'Uganda' },
    ];
    
    let scelta = bandiere[Math.floor(Math.random() * bandiere.length)];
    let frase = frasi[Math.floor(Math.random() * frasi.length)];

    try {
        let startCaption =`\`${frase}\`\n\n`;
        startCaption += `🏳️ 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐜𝐨𝐧 𝐢𝐥 𝐧𝐨𝐦𝐞 𝐝𝐞𝐥𝐥𝐚 𝐧𝐚𝐳𝐢𝐨𝐧𝐞!\n`;
        startCaption += `⏱️ 𝐭𝐞𝐦𝐩𝐨 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞: 𝟑𝟎 𝐬𝐞𝐜𝐨𝐧𝐝𝐢\n\n`;
        startCaption += `> 𝐚𝐭𝐭𝐞𝐧𝐳𝐢𝐨𝐧𝐞! 𝐩𝐞𝐫 𝐟𝐚𝐫 𝐥𝐞𝐠𝐠𝐞𝐫𝐞 𝐥𝐚 𝐫𝐢𝐬𝐩𝐨𝐬𝐭𝐚 𝐚𝐥 𝐛𝐨𝐭 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐪𝐮𝐞𝐬𝐭𝐨 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨, 𝐚𝐥𝐭𝐫𝐢𝐦𝐞𝐧𝐭𝐢 𝐧𝐨𝐧 𝐥𝐚 𝐥𝐞𝐠𝐠𝐞𝐫𝐚̀!`;

        let msg = await conn.sendMessage(m.chat, {
            image: { url: scelta.url },
            caption: startCaption,
            footer: '𝟥𝟥𝟥 𝔹𝕆𝕋'
        }, { quoted: m });
        
        global.bandieraGame = global.bandieraGame || {};
        global.bandieraGame[m.chat] = {
            id: msg.key.id,
            risposta: scelta.nome.toLowerCase(),
            rispostaOriginale: scelta.nome,
            tentativi: {},
            suggerito: false,
            startTime: Date.now(),
            timeout: setTimeout(async () => {
                if (global.bandieraGame?.[m.chat]) {
                    let timeoutText = `                 𝐓𝐄𝐌𝐏𝐎 𝐒𝐂𝐀𝐃𝐔𝐓𝐎!\n`;
                    timeoutText += `╭─────────╮\n`
                    timeoutText += `│ ✅ 𝐫𝐢𝐬𝐩𝐨𝐬𝐭𝐚 𝐞𝐬𝐚𝐭𝐭𝐚:\n│ ‼️  *\`${scelta.nome}\`*\n`;
                    timeoutText += `│ 💡 𝐧𝐨𝐧 𝐚𝐛𝐛𝐚𝐭𝐭𝐞𝐫𝐭𝐢, 𝐫𝐢𝐭𝐞𝐧𝐭𝐚!\n`;
                    timeoutText += `╰─────────╯`;
                    
                    await conn.sendMessage(m.chat, {
                        text: timeoutText,
                        footer: '𝟥𝟥𝟥 𝔹𝕆𝕋',
                        interactiveButtons: playAgainButtons()
                    }, { quoted: msg });
                    delete global.bandieraGame[m.chat];
                }
            }, 30000)
        };
    } catch (error) {
        console.error('Errore nel gioco bandiere:', error);
        m.reply('❌ 𝐞𝐫𝐫𝐨𝐫𝐞 𝐢𝐧𝐚𝐭𝐭𝐞𝐬𝐨 𝐝𝐮𝐫𝐚𝐧𝐭𝐞 𝐥’𝐚𝐯𝐯𝐢𝐨 𝐝𝐞𝐥𝐥𝐚 𝐩𝐚𝐫𝐭𝐢𝐭𝐚, 𝐫𝐢𝐩𝐫𝐨𝐯𝐚 𝐭𝐫𝐚 𝐩𝐨𝐜𝐨.');
    }
};

function normalizeString(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .trim();
}

function calculateSimilarity(str1, str2) {
    const words1 = str1.split(' ').filter(word => word.length > 1);
    const words2 = str2.split(' ').filter(word => word.length > 1);

    if (words1.length === 0 || words2.length === 0) return 0;

    const matches = words1.filter(word =>
        words2.some(w2 => w2.includes(word) || word.includes(w2))
    );

    return matches.length / Math.max(words1.length, words2.length);
}

function isAnswerCorrect(userAnswer, correctAnswer) {
    if (userAnswer.length < 2) return false;

    const similarityScore = calculateSimilarity(userAnswer, correctAnswer);

    return (
        userAnswer === correctAnswer ||
        (correctAnswer.includes(userAnswer) && userAnswer.length > correctAnswer.length * 0.5) ||
        (userAnswer.includes(correctAnswer) && userAnswer.length < correctAnswer.length * 1.5) ||
        similarityScore >= 0.8
    );
}

handler.before = async (m, { conn, usedPrefix, command }) => {
    const chat = m.chat;
    const game = global.bandieraGame?.[chat];
    

    if (m.message && m.message.interactiveResponseMessage) {
        const response = m.message.interactiveResponseMessage;
        
        if (response.nativeFlowResponseMessage?.paramsJson) {
            try {
                const params = JSON.parse(response.nativeFlowResponseMessage.paramsJson);
                if (params.id === '.bandiera') {
                    if (!global.bandieraGame?.[chat]) {
                        const fakeMessage = {
                            ...m,
                            text: usedPrefix + 'bandiera',
                            body: usedPrefix + 'bandiera'
                        };
                        try {
                            await handler(fakeMessage, { conn, usedPrefix, command: 'bandiera' });
                        } catch (error) {
                            console.error('Errore nel riavvio del gioco dai bottoni:', error);
                            conn.reply(chat, '𝐢𝐦𝐩𝐨𝐬𝐬𝐢𝐛𝐢𝐥𝐞 𝐮𝐬𝐚𝐫𝐞 𝐢𝐥 𝐛𝐨𝐭𝐭𝐨𝐧𝐞, 𝐝𝐢𝐠𝐢𝐭𝐚 ’’.𝐛𝐚𝐧𝐝𝐢𝐞𝐫𝐚’’ 𝐩𝐞𝐫 𝐢𝐧𝐢𝐳𝐢𝐚𝐫𝐞 𝐚 𝐠𝐢𝐨𝐜𝐚𝐫𝐞.', m);
                        }
                    }
                }
            } catch (error) {
                console.error('Errore nel parsing dei parametri del bottone:', error);
            }
        }
        return;
    }
    
    if (!game || !m.quoted || m.quoted.id !== game.id || m.key.fromMe) return;

    const userAnswer = normalizeString(m.text || '');
    const correctAnswer = normalizeString(game.risposta);

    if (!userAnswer || userAnswer.length < 2) return;

    const similarityScore = calculateSimilarity(userAnswer, correctAnswer);

    if (isAnswerCorrect(userAnswer, correctAnswer)) {
        clearTimeout(game.timeout);

        const timeTaken = Math.round((Date.now() - game.startTime) / 1000);
        let reward = Math.floor(Math.random() * 31) + 20;
        let exp = 150;

        const timeBonus = timeTaken <= 10 ? 20 : timeTaken <= 20 ? 10 : 0;
        reward += timeBonus;

        if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {};

        let congratsMessage =    `𝐂𝐎𝐌𝐏𝐋𝐈𝐌𝐄𝐍𝐓𝐈, 𝐑𝐈𝐒𝐏𝐎𝐒𝐓𝐀 𝐄𝐒𝐀𝐓𝐓𝐀!\n\n`;
        congratsMessage += `╭─────────╮\n`
        congratsMessage += `│ ✅  𝐧𝐚𝐳𝐢𝐨𝐧𝐞: *\`${game.rispostaOriginale}\`*\n`;
        congratsMessage += `│ ⏳  𝐭𝐞𝐦𝐩𝐨 𝐢𝐦𝐩𝐢𝐞𝐠𝐚𝐭𝐨: *${timeTaken}s*\n`;
        congratsMessage += `╰─────────╯`;
        
        await conn.sendMessage(chat, {
            text: congratsMessage,
            footer: '𝟥𝟥𝟥 𝔹𝕆𝕋',
            interactiveButtons: playAgainButtons()
        }, { quoted: m });
        delete global.bandieraGame[chat];
        
    } else if (similarityScore >= 0.6 && !game.suggerito) {
        game.suggerito = true;
        await conn.reply(chat, '👀 *Ci sei quasi!*', m);
        
    } else if (game.tentativi[m.sender] >= 3) {
        let failText = `      𝐇𝐀𝐈 𝐄𝐒𝐀𝐔𝐑𝐈𝐓𝐎 𝐈 𝐓𝐄𝐍𝐓𝐀𝐓𝐈𝐕𝐈!\n\n`;
        failText += `╭─────────╮\n`
        failText += `│ ❌  𝐇𝐚𝐢 𝐝𝐚𝐭𝐨 𝟑 𝐫𝐢𝐬𝐩𝐨𝐬𝐭𝐞 𝐞𝐫𝐫𝐚𝐭𝐞\n`;
        failText += `│  ⏳ 𝐀𝐭𝐭𝐞𝐧𝐝𝐢 𝐥𝐚 𝐟𝐢𝐧𝐞 𝐝𝐞𝐥 𝐫𝐨𝐮𝐧𝐝!\n`;
        failText += `╰─────────╯`;
        
        await conn.sendMessage(chat, {
            text: failText,
            footer: '𝟥𝟥𝟥 𝔹𝕆𝕋',
            interactiveButtons: playAgainButtons()
        }, { quoted: m });
        delete global.bandieraGame[chat];
        
    } else {
        game.tentativi[m.sender] = (game.tentativi[m.sender] || 0) + 1;
        const tentativiRimasti = 3 - game.tentativi[m.sender];

        if (tentativiRimasti === 1) {
            const primaLettera = game.rispostaOriginale[0].toUpperCase();
            const numeroLettere = game.rispostaOriginale.length;
            await conn.reply(chat, `❌ 𝐑𝐢𝐬𝐩𝐨𝐬𝐭𝐚 𝐬𝐛𝐚𝐠𝐥𝐢𝐚𝐭𝐚!

💡 𝐏𝐢𝐜𝐜𝐨𝐥𝐨 𝐬𝐮𝐠𝐠𝐞𝐫𝐢𝐦𝐞𝐧𝐭𝐨:
  • 𝐈𝐧𝐢𝐳𝐢𝐚 𝐜𝐨𝐧 𝐥𝐚 𝐥𝐞𝐭𝐭𝐞𝐫𝐚 *"${primaLettera}"*
  • 𝐄𝐝 𝐞̀ 𝐜𝐨𝐦𝐩𝐨𝐬𝐭𝐚 𝐝𝐚 *${numeroLettere}* 𝐋𝐞𝐭𝐭𝐞𝐫𝐞`, m);
        } else if (tentativiRimasti === 2) {
            await conn.reply(chat, `❌ 𝐑𝐢𝐬𝐩𝐨𝐬𝐭𝐚 𝐬𝐛𝐚𝐠𝐥𝐢𝐚𝐭𝐚!

📝 𝐇𝐚𝐢 𝐚𝐧𝐜𝐨𝐫𝐚 ${tentativiRimasti} 𝐓𝐞𝐧𝐭𝐚𝐭𝐢𝐯𝐢
🤔 𝐍𝐨𝐧 𝐝𝐞𝐦𝐨𝐫𝐚𝐥𝐢𝐳𝐳𝐚𝐫𝐭𝐢, 𝐩𝐞𝐧𝐬𝐚 𝐛𝐞𝐧𝐞!`, m);
        } else {
            await conn.reply(chat, `❌ 𝐑𝐢𝐬𝐩𝐨𝐬𝐭𝐚 𝐬𝐛𝐚𝐠𝐥𝐢𝐚𝐭𝐚!

📝 𝐓𝐢 𝐫𝐢𝐦𝐚𝐧𝐞 𝐮𝐧 𝐮  𝐭𝐢𝐦𝐨 𝐭𝐞𝐧𝐭𝐚𝐭𝐢𝐯𝐨, 𝐬𝐟𝐫𝐮𝐭𝐭𝐚𝐥𝐨 𝐚𝐥 𝐦𝐞𝐠𝐥𝐢𝐨!`, m);
        }
    }
};

handler.help = ['𝐛𝐚𝐧𝐝𝐢𝐞𝐫𝐚'];
handler.tags = ['fun'];
handler.command = /^(bandiera|skipbandiera)$/i;
handler.group = true;

export default handler;