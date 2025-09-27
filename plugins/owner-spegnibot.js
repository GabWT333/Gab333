import { spawn } from 'child_process';

let handler = async (m, { conn, isROwner, text }) => {
    if (!process.send) return m.react('✖️');
    if (conn.user.jid == conn.user.jid) {
        // Bannare tutte le chat
        Object.keys(global.db.data.chats).forEach(chatId => {
            global.db.data.chats[chatId].isBanned = true;
        });
        await m.reply('🚩  Mi sto spegnendo...');
        process.send('reset');
    } else {
        return m.react('✖️');
    }
};

handler.help = ['spegnibot'];
handler.tags = ['owner'];
handler.command = ['spegnibot'];

handler.rowner = true;

export default handler;