//edited by filo222
const friendRequests = {};

let handler = async (m, { conn, participants, command, text, args, usedPrefix }) => {
    let users = global.db.data.users;
    let user = users[m.sender];

    switch (command) {
        case 'amicizia':
            await handleFriendRequest(m, user, users, text, usedPrefix, conn);
            break;
        case 'rimuoviamico':
            handleRemoveFriend(m, user, users);
            break;
    }
};

const handleFriendRequest = async (m, user, users, text, usedPrefix, conn) => {
    let mention = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null;
    if (!mention) throw `⚠️ 𝐓𝐚𝐠𝐠𝐚 𝐥𝐚 𝐩𝐞𝐫𝐬𝐨𝐧𝐚 𝐚 𝐜𝐮𝐢 𝐯𝐮𝐨𝐢 𝐢𝐧𝐯𝐢𝐚𝐫𝐞 𝐮𝐧𝐚 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐚 𝐝𝐢 𝐚𝐦𝐢𝐜𝐢𝐳𝐢𝐚!\n𝐄𝐬𝐞𝐦𝐩𝐢𝐨: ${usedPrefix}amicizia @tag`;

    if (mention === m.sender) throw '❌ 𝐇𝐨 𝐜𝐚𝐩𝐢𝐭𝐨 𝐜𝐡𝐞 𝐭𝐢 𝐯𝐮𝐨𝐢 𝐛𝐞𝐧𝐞 𝐦𝐚 𝐧𝐨𝐧 𝐩𝐮𝐨𝐢 𝐚𝐠𝐠𝐢𝐮𝐧𝐠𝐞𝐫𝐞 𝐭𝐞 𝐬𝐭𝐞𝐬𝐬𝐨 𝐚𝐠𝐥𝐢 𝐚𝐦𝐢𝐜𝐢!';

    let destinatario = users[mention];
    if (!destinatario) throw '🚫 𝐏𝐞𝐫𝐬𝐨𝐧𝐚 𝐧𝐨𝐧 𝐩𝐫𝐞𝐬𝐞𝐧𝐭𝐞 𝐧𝐞𝐥 𝐬𝐢𝐬𝐭𝐞𝐦𝐚';

    if (user.amici && user.amici.includes(mention)) {
        let testo = `✅ @${mention.split('@')[0]} 𝐞̀ 𝐠𝐢𝐚' 𝐭𝐫𝐚 𝐢 𝐭𝐮𝐨𝐢 𝐚𝐦𝐢𝐜𝐢.`;
        m.reply(testo, null, { mentions: [mention] });
        return;
    }

    if (friendRequests[m.sender] || friendRequests[mention]) throw `⚠️ 𝐔𝐧𝐚 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐚 𝐝𝐢 𝐚𝐦𝐢𝐜𝐢𝐳𝐢𝐚 𝐞̀ 𝐠𝐢𝐚̀ 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨. 𝐀𝐬𝐩𝐞𝐭𝐭𝐚 𝐥𝐚 𝐫𝐢𝐬𝐩𝐨𝐬𝐭𝐚 𝐨 𝐥'𝐚𝐧𝐧𝐮𝐥𝐥𝐚𝐦𝐞𝐧𝐭𝐨.`;

    friendRequests[mention] = { from: m.sender, timeout: null };
    friendRequests[m.sender] = { to: mention, timeout: null };
    
 let testo = `👥 𝐑𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐚 𝐝𝐢 𝐚𝐦𝐢𝐜𝐢𝐳𝐢𝐚 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨...\n\n@${mention.split('@')[0]}, 𝐯𝐮𝐨𝐢 𝐚𝐜𝐜𝐞𝐭𝐭𝐚𝐫𝐞 𝐥'𝐚𝐦𝐢𝐜𝐢𝐳𝐢𝐚 𝐝𝐢 @${m.sender.split('@')[0]}?\n\n> ⏳ 𝐇𝐚𝐢 60 𝐬𝐞𝐜𝐨𝐧𝐝𝐢 𝐩𝐞𝐫 𝐬𝐜𝐞𝐠𝐥𝐢𝐞𝐫𝐞.`;

const buttons = [
  { buttonId: 'accetta', buttonText: { displayText: '✅ 𝐀𝐜𝐜𝐞𝐭𝐭𝐚' }, type: 1 },
  { buttonId: 'rifiuta', buttonText: { displayText: '❌ 𝐑𝐢𝐟𝐢𝐮𝐭𝐚' }, type: 1 },
  { buttonId: 'rimuoviamico', buttonText: { displayText: '🚫 𝐑𝐢𝐦𝐮𝐨𝐯𝐢 𝐚𝐦𝐢𝐜𝐨' }, type: 1 }
];

await conn.sendMessage(m.chat, {
  text: testo,
  buttons,
  mentions: [mention, m.sender],
  headerType: 1
}, { quoted: m });

    let timeoutCallback = () => {
        if (friendRequests[mention]) {
            let annullamento = `⏳ 𝐑𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐚 𝐝𝐢 𝐚𝐦𝐢𝐜𝐢𝐳𝐢𝐚 𝐚𝐧𝐧𝐮𝐥𝐥𝐚𝐭𝐚\n> @${m.sender.split('@')[0]} 𝐞 @${mention.split('@')[0]} 𝐧𝐨𝐧 𝐡𝐚𝐧𝐧𝐨 𝐫𝐢𝐬𝐩𝐨𝐬𝐭𝐨 𝐞𝐧𝐭𝐫𝐨 𝐢𝐥 𝐭𝐞𝐦𝐩𝐨 𝐥𝐢𝐦𝐢𝐭𝐞.`;
            conn.sendMessage(m.chat, { text: annullamento, mentions: [m.sender, mention] });
            delete friendRequests[mention];
            delete friendRequests[m.sender];
        }
    };

    friendRequests[mention].timeout = setTimeout(timeoutCallback, 60000); 
    friendRequests[m.sender].timeout = friendRequests[mention].timeout;
};

handler.before = async (m, { conn, participants, command, text, args, usedPrefix }) => {
    if (!(m.sender in friendRequests)) return null;

if (!m.message || !m.message.buttonsResponseMessage) return;
let response = m.message.buttonsResponseMessage.selectedButtonId;
let sender = m.sender;

    let user = friendRequests[m.sender];
    if (!user) return;

    clearTimeout(user.timeout);

    if (response === 'rifiuta') {
        let fromUser = friendRequests[m.sender].from || m.sender;
        delete friendRequests[fromUser];
        delete friendRequests[m.sender];
        return m.reply(`❌ 𝐑𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐚 𝐝𝐢 𝐚𝐦𝐢𝐜𝐢𝐳𝐢𝐚 𝐫𝐢𝐟𝐢𝐮𝐭𝐚𝐭𝐚.`, null, { mentions: [fromUser] });
    }

    if (response === 'accetta') {
        let fromUser = friendRequests[m.sender].from;
        let toUser = m.sender;

        let senderUser = global.db.data.users[fromUser];
        let receiverUser = global.db.data.users[toUser];

        if (!Array.isArray(senderUser.amici)) senderUser.amici = [];
        if (!Array.isArray(receiverUser.amici)) receiverUser.amici = [];

        senderUser.amici.push(toUser);
        receiverUser.amici.push(fromUser);
        
         let testo = `👥 𝐎𝐫𝐚 𝐭𝐮 𝐞 @${fromUser.split('@')[0]} 𝐬𝐢𝐞𝐭𝐞 𝐚𝐦𝐢𝐜𝐢!`;
        m.reply(testo, null, { mentions: [fromUser] });

        delete friendRequests[fromUser];
        delete friendRequests[toUser];
    }
};

const handleRemoveFriend = (m, user, users) => {
    let mention = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null;
    if (!mention) throw '⚠️ 𝐓𝐚𝐠𝐠𝐚 𝐥𝐚 𝐩𝐞𝐫𝐬𝐨𝐧𝐚 𝐜𝐡𝐞 𝐯𝐮𝐨𝐢 𝐫𝐢𝐦𝐨𝐯𝐞𝐫𝐞 𝐝𝐚𝐠𝐥𝐢 𝐚𝐦𝐢𝐜𝐢.';

    if (!user.amici || !user.amici.includes(mention)) throw `🚫 @${mention.split('@')[0]} 𝐧𝐨𝐧 𝐞̀ 𝐭𝐫𝐚 𝐢 𝐭𝐮𝐨𝐢 𝐚𝐦𝐢𝐜𝐢.`;

    user.amici = user.amici.filter(friend => friend !== mention);
    let friend = users[mention];
    if (friend) {
        friend.amici = friend.amici.filter(friend => friend !== m.sender);
    }

    let testo = `🚫 𝐓𝐮 𝐞 @${mention.split('@')[0]} 𝐧𝐨𝐧 𝐬𝐢𝐞𝐭𝐞 𝐩𝐢𝐮̀ 𝐚𝐦𝐢𝐜𝐢.`;
    m.reply(testo, null, { mentions: [mention] });
};

handler.command = ['amicizia', 'rimuoviamico'];

export default handler;