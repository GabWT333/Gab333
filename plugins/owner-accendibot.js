let handler = async (m, { conn, isROwner }) => {
    if (!isROwner) throw 'Questo comando è riservato al proprietario del bot.';
    
    // Sbanna tutte le chat
    Object.keys(global.db.data.chats).forEach(chatId => {
        global.db.data.chats[chatId].isBanned = false;
    });

    await m.reply('🚩 Sono sveglio cazzo non potevate lasciarmi dormire?');
};

handler.help = ['accendibot'];
handler.tags = ['owner'];
handler.command = ['accendibot'];

handler.rowner = true;

export default handler;
