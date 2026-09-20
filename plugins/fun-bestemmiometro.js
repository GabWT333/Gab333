let handler = m => m;

const spamTracker = new Map();
const SPAM_WINDOW = 20 * 1000;
const MUTE_DURATION = 60 * 1000;
const REMOVAL_WINDOW = 3 * 60 * 1000;

function getSpamState(chatId, userId, now) {
    const key = `${chatId}:${userId}`;
    let state = spamTracker.get(key);

    if (!state || (state.warnedAt && now - state.warnedAt >= REMOVAL_WINDOW)) {
        state = { events: [], warnedAt: 0, mutedUntil: 0 };
        spamTracker.set(key, state);
    }

    state.events = state.events.filter(timestamp => now - timestamp < SPAM_WINDOW);
    return state;
}

handler.all = async function (m, context = {}) {
    if (!m.isGroup) return null;

    const conn = context.conn || global.conn;

    let chatConfig = global.db.data.chats[m.chat];

    if (chatConfig.bestemmiometro && /(?:porco dio|porcodio|dio bastardo|dio cane|porcamadonna|madonnaporca|porca madonna|madonna porca|dio cristo|diocristo|dio maiale|diomaiale|jesucristo|jesu cristo|cristo madonna|madonna impanata|dio cristo|cristo dio|dio frocio|dio gay|dio madonna|dio infuocato|dio crocifissato|madonna puttana|madonna vacca|madonna inculata|maremma maiala|padre pio|jesu impanato|jesu porco|porca madonna|diocane|madonna porca|dio capra|capra dio|padre pio ti spio)/i.test(m.text)) {
        const now = Date.now();
        const state = getSpamState(m.chat, m.sender, now);
        state.events.push(now);

        if (state.warnedAt && now - state.warnedAt < REMOVAL_WINDOW && state.events.length >= 4) {
            const numeroUtente = '@' + m.sender.split('@')[0];
            await conn.sendMessage(m.chat, {
                text: `${numeroUtente} 𝐞̀ 𝐬𝐭𝐚𝐭𝐨 𝐫𝐢𝐦𝐨𝐬𝐬𝐨 𝐩𝐞𝐫 𝐚𝐯𝐞𝐫 𝐜𝐨𝐧𝐭𝐢𝐧𝐮𝐚𝐭𝐨 𝐚 𝐬𝐩𝐚𝐦𝐦𝐚𝐫𝐞 𝐛𝐞𝐬𝐭𝐞𝐦𝐦𝐢𝐞.`,
                mentions: [m.sender]
            });

            try {
                await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
            } catch (error) {
                console.error('[bestemmiometro] impossibile rimuovere l\'utente:', error);
            }

            spamTracker.delete(`${m.chat}:${m.sender}`);
            return null;
        }

        if (now < state.mutedUntil) return null;

        if (state.events.length >= 4) {
            state.warnedAt = now;
            state.mutedUntil = now + MUTE_DURATION;
            state.events = [];

            const numeroUtente = '@' + m.sender.split('@')[0];
            await conn.sendMessage(m.chat, {
                text: `${numeroUtente} 𝐡𝐚𝐢 𝐬𝐩𝐚𝐦𝐦𝐚𝐭𝐨 𝟒 𝐛𝐞𝐬𝐭𝐞𝐦𝐦𝐢𝐞 𝐢𝐧 𝟐𝟎 𝐬𝐞𝐜𝐨𝐧𝐝𝐢.\n\n🚫 Non conterò più le tue bestemmie per 1 minuto. Se continui a spammare entro 3 minuti, verrai rimosso dal gruppo.`,
                mentions: [m.sender]
            });
            return null;
        }

        const userStats = global.db.data.users[m.sender];
        
        userStats.blasphemy = (userStats.blasphemy || 0) + 1;

        let grado = '*Incontro faccia a faccia con dio*';
        if (userStats.blasphemy >= 500) {
            grado = '*Guardato male da dio*';
        } else if (userStats.blasphemy >= 250) {
            grado = '*Bestemmiatore professionista*';
        } else if (userStats.blasphemy >= 100) {
            grado = '*Nemico di dio*';
        } else if (userStats.blasphemy >= 50) {
            grado = '*Bestemmiatore scarso*';
        } else if (userStats.blasphemy >= 30) {
            grado = '*Principiante*';
        } else if (userStats.blasphemy >= 5) {
            grado = '*Finto santo*';
        } else if (userStats.blasphemy >= 0) {
            grado = '*Merdina*';
        }

        let vcardFakeMessage = {
            'key': {
                'participants': '0@s.whatsapp.net',
                'fromMe': false,
                'id': 'Halo'
            },
            'message': {
                'locationMessage': {
                    'name': '𝐁𝐞𝐬𝐭𝐞𝐦𝐦𝐢𝐨𝐦𝐞𝐭𝐫𝐨',
                    'jpegThumbnail': await (await fetch('https://telegra.ph')).buffer(),
                    'vcard': 'BEGIN:VCARD\nVERSION:3.0\nN:;Unlimited;;;\nFN:Unlimited\nORG:Unlimited\nTITLE:\nitem1.TEL;waid=19709001746:+1 (970) 900-1746\nitem1.X-ABLabel:Unlimited\nX-WA-BIZ-DESCRIPTION:ofc\nX-WA-BIZ-NAME:Unlimited\nEND:VCARD'
                }
            },
            'participant': '0@s.whatsapp.net'
        };

        if (userStats.blasphemy == 1) {
            const numeroUtente = '@' + m.sender.split('@')[0];
            const testoNotifica = `${numeroUtente} 𝐡𝐚 𝐭𝐢𝐫𝐚𝐭𝐨 𝐥𝐚 𝐬𝐮𝐚 𝐩𝐫𝐢𝐦𝐚 𝐛𝐞𝐬𝐭𝐞𝐦𝐦𝐢𝐚\n\n> 🏅 𝐆𝐫𝐚𝐝𝐨: ${grado}`;

            conn.sendMessage(m.chat, {
                'text': testoNotifica,
                'mentions': [m.sender]
            }, {
                'quoted': vcardFakeMessage
            });
        }

        if (userStats.blasphemy > 1) {
            const numeroUtente = '@' + m.sender.split('@')[0];
            const testoNotifica = `${numeroUtente} 𝐡𝐚 𝐭𝐢𝐫𝐚𝐭𝐨 ${userStats.blasphemy} 𝐛𝐞𝐬𝐭𝐞𝐦𝐦𝐢𝐞\n\n> 🏅 𝐆𝐫𝐚𝐝𝐨: ${grado}`;

            conn.sendMessage(m.chat, {
                'text': testoNotifica,
                'mentions': [m.sender]
            }, {
                'quoted': vcardFakeMessage
            });
        }
    }
};

export default handler;

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}