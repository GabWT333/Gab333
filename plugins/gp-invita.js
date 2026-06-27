//Plugin by Gab, Lucifero & 333 staff



let handler = async (m, { conn, args, text, usedPrefix, command, participants }) => {
    if (!text) throw `𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐢𝐥 𝐧𝐮𝐦𝐞𝐫𝐨 𝐚 𝐜𝐮𝐢 𝐢𝐧𝐯𝐢𝐚𝐫𝐞 𝐥’𝐢𝐧𝐯𝐢𝐭𝐨 𝐚𝐥 𝐠𝐫𝐮𝐩𝐩𝐨\n𝐄𝐬𝐞𝐦𝐩𝐢𝐨: *${usedPrefix + command}* 393508337404`;

    let numeroPulito = text.replace(/[^0-9]/g, '');
    if (!numeroPulito) throw '𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐧𝐮𝐦𝐞𝐫𝐢 𝐜𝐨𝐧 𝐩𝐫𝐞𝐟𝐢𝐬𝐬𝐨 𝐢𝐧𝐭𝐞𝐫𝐧𝐚𝐳𝐢𝐨𝐧𝐚𝐥𝐞';
    participants = participants || [];
    let jid = numeroPulito + '@s.whatsapp.net';
    if (participants.some(p => p.id === jid)) {
        throw '𝐈𝐥 𝐧𝐮𝐦𝐞𝐫𝐨 𝐬𝐞𝐥𝐞𝐳𝐢𝐨𝐧𝐚𝐭𝐨 𝐟𝐚 𝐠𝐢𝐚̀ 𝐩𝐚𝐫𝐭𝐞 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨!';
    }

    let group = m.chat;
    let link = 'https://chat.whatsapp.com/' + await conn.groupInviteCode(group);
    await conn.reply(jid, `𝐍𝐔𝐎𝐕𝐎 𝐈𝐍𝐕𝐈𝐓𝐎\n\n𝐔𝐧 𝐮𝐭𝐞𝐧𝐭𝐞 𝐭𝐢 𝐡𝐚 𝐢𝐧𝐯𝐢𝐭𝐚𝐭𝐨 𝐚𝐝 𝐮𝐧𝐢𝐫𝐭𝐢 𝐚 𝐪𝐮𝐞𝐬𝐭𝐨 𝐠𝐫𝐮𝐩𝐩𝐨:\n${link}`, m, { mentions: [m.sender] });
    m.reply(`𝐋𝐢𝐧𝐤 𝐝’𝐢𝐧𝐯𝐢𝐭𝐨 𝐦𝐚𝐧𝐝𝐚𝐭𝐨 𝐜𝐨𝐧 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐨`);
};

handler.help = ['𝐢𝐧𝐯𝐢𝐭𝐚 <𝐧𝐮𝐦𝐞𝐫𝐨>'];
handler.tags = ['admin'];
handler.command = ['invite', 'invita'];
handler.group = true;
handler.mods = true;
handler.botAdmin = true;

export default handler;