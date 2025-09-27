let handler = m => m;

handler.all = async function (m, { isBotAdmin }) {
    const chat = global.db.data.chats[m.chat];
    if (!chat.antivirus) return; 

    if (m.messageStubType === 68) {
        let log = {
            key: m.key,
            content: m.msg,
            sender: m.sender
        };
        await this.modifyChat(m.chat, 'clear', {
            includeStarred: false
        }).catch(console.log);
    }
};

export default handler;