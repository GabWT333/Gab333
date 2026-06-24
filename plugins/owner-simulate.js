//Plugin by Gab, Lucifero & 333 staff

import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, command, args: [evento], text }) => {
    if (!evento) return await m.reply(
`ⓘ 𝐔𝐬𝐨 𝐝𝐞𝐥 𝐜𝐨𝐦𝐚𝐧𝐝𝐨:

> ${usedPrefix + command} benvenuto @user
> ${usedPrefix + command} addio @user
> ${usedPrefix + command} promozione/p @user
> ${usedPrefix + command} retrocessione/r @user`) 
    
    let mentions = text.replace(evento, '').trimStart()
    let who = mentions ? conn.parseMention(mentions) : []
    let part = who.length ? who : [m.sender]
    let act = false
    let testoEvento = ''
    
    switch (evento.toLowerCase()) {
        case 'add':
        case 'invite':
        case 'welcome':
        case 'bienvenida':
        case 'benvenuto':       
            act = 'add'
            testoEvento = "𝐛𝐞𝐧𝐯𝐞𝐧𝐮𝐭𝐨"
            
            let groupMetadata = await conn.groupMetadata(m.chat);
            let chat = global.db.data.chats[m.chat];
            
            for (let user of part) {
                let profilePic;
                try {
                    profilePic = await conn.profilePictureUrl(user, 'image');
                } catch (e) {
                    profilePic = 'https://telegra.ph/file/8ca14ef9fa43e99d1d196.jpg';
                }
                
                let ppBuffer;
                try {
                    ppBuffer = await (await fetch(profilePic)).buffer();
                } catch (e) {
                    ppBuffer = await (await fetch('https://telegra.ph/file/8ca14ef9fa43e99d1d196.jpg')).buffer();
                }
                
                let welcomeText = chat.sWelcome || `╭─────────────────
│ 👋 𝐁𝐞𝐧𝐯𝐞𝐧𝐮𝐭𝐨/𝐚!
│
│ @user
│
│ 📱 𝐆𝐫𝐮𝐩𝐩𝐨: @group
│ 👥 𝐌𝐞𝐦𝐛𝐫𝐢: @count
│
│ 📜 𝐋𝐞𝐠𝐠𝐢 𝐥𝐚 𝐝𝐞𝐬𝐜𝐫𝐢𝐳𝐢𝐨𝐧𝐞:
│ @desc
╰─────────────────`;
                
                let welcome = welcomeText
                    .replace('@user', `@${user.split('@')[0]}`)
                    .replace('@group', groupMetadata.subject)
                    .replace('@count', groupMetadata.participants.length)
                    .replace('@desc', groupMetadata.desc?.toString() || 'Nessuna descrizione');
                
                await conn.sendMessage(m.chat, {
                    text: welcome,
                    contextInfo: {
                        mentionedJid: [user],
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363341274693350@newsletter',
                            serverMessageId: '',
                            newsletterName: global.db.data.nomedelbot || '333 BOT'
                        },
                        externalAdReply: {
                            title: '👋 𝐍𝐮𝐨𝐯𝐨 𝐌𝐞𝐦𝐛𝐫𝐨',
                            body: `Benvenuto/a nel gruppo!`,
                            mediaType: 1,
                            renderLargerThumbnail: true,
                            thumbnail: ppBuffer,
                            sourceUrl: 'https://whatsapp.com/channel/0029VaeW5Tw4yltWm1NBJV3g'
                        }
                    }
                });
            }
            return;
            
        case 'bye':
        case 'kick':
        case 'leave':
        case 'remove':
        case 'sacar':
        case 'addio':
            act = 'remove'
            testoEvento = "𝐚𝐝𝐝𝐢𝐨"
            
            let groupMeta = await conn.groupMetadata(m.chat);
            let chatData = global.db.data.chats[m.chat];
            
            for (let user of part) {
                let profilePic;
                try {
                    profilePic = await conn.profilePictureUrl(user, 'image');
                } catch (e) {
                    profilePic = 'https://telegra.ph/file/8ca14ef9fa43e99d1d196.jpg';
                }
                
                let ppBuffer;
                try {
                    ppBuffer = await (await fetch(profilePic)).buffer();
                } catch (e) {
                    ppBuffer = await (await fetch('https://telegra.ph/file/8ca14ef9fa43e99d1d196.jpg')).buffer();
                }
                
                let byeText = chatData.sBye || `╭─────────────────
│ 👋 𝐀𝐝𝐝𝐢𝐨!
│
│ @user
│
│ 📱 𝐆𝐫𝐮𝐩𝐩𝐨: @group
│ 👥 𝐌𝐞𝐦𝐛𝐫𝐢: @count
│
│ 💭 𝐂𝐢 𝐦𝐚𝐧𝐜𝐡𝐞𝐫𝐚𝐢...
╰─────────────────`;
                
                let bye = byeText
                    .replace('@user', `@${user.split('@')[0]}`)
                    .replace('@group', groupMeta.subject)
                    .replace('@count', groupMeta.participants.length);
                
                await conn.sendMessage(m.chat, {
                    text: bye,
                    contextInfo: {
                        mentionedJid: [user],
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363341274693350@newsletter',
                            serverMessageId: '',
                            newsletterName: global.db.data.nomedelbot || '333 BOT'
                        },
                        externalAdReply: {
                            title: '👋 𝐀𝐝𝐝𝐢𝐨',
                            body: `Un membro ha lasciato il gruppo`,
                            mediaType: 1,
                            renderLargerThumbnail: true,
                            thumbnail: ppBuffer,
                            sourceUrl: 'https://whatsapp.com/channel/0029VaeW5Tw4yltWm1NBJV3g'
                        }
                    }
                });
            }
            return;
            
        case 'promote':
        case 'daradmin':
        case 'darpoder':
        case 'promozione':
        case 'p':       
            act = 'promote'
            testoEvento = "𝐩𝐫𝐨𝐦𝐨𝐳𝐢𝐨𝐧𝐞"
            break
            
        case 'demote':
        case 'quitaradmin':
        case 'quitarpoder':
        case 'retrocessione':
        case 'r':       
            act = 'demote'
            testoEvento = "𝐫𝐞𝐭𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐨𝐧𝐞"
            break
            
        default:
            throw `ⓘ 𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐮𝐧𝐚 𝐨𝐩𝐳𝐢𝐨𝐧𝐞 𝐯𝐚𝐥𝐢𝐝𝐚:

> ${usedPrefix + command} benvenuto @user
> ${usedPrefix + command} addio @user
> ${usedPrefix + command} promozione/p @user
> ${usedPrefix + command} retrocessione/r @user`
    }
    
    m.reply(`> ⚠️ 𝐒𝐢𝐦𝐮𝐥𝐚𝐳𝐢𝐨𝐧𝐞 ${testoEvento}...
> ⓘ 𝐈𝐥 𝐛𝐨𝐭 𝐬𝐭𝐚 𝐬𝐢𝐦𝐮𝐥𝐚𝐧𝐝𝐨 𝐮𝐧 𝐞𝐯𝐞𝐧𝐭𝐨, 𝐬𝐞𝐧𝐳𝐚 𝐞𝐟𝐟𝐞𝐭𝐭𝐢 𝐜𝐨𝐧𝐜𝐫𝐞𝐭𝐢 𝐧𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨.`)
    
    if (act) return conn.participantsUpdate({
        id: m.chat,
        participants: part,
        action: act
    })
}

handler.help = ['𝐬𝐢𝐦𝐮𝐥𝐚'] 
handler.tags = ['owner']
handler.command = /^sim|simula$/i
handler.group = true

export default handler;
