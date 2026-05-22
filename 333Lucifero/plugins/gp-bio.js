//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn, args, text }) => {

    if (!args || args.length === 0) {
        return conn.sendMessage(m.chat, { text: '𝐃𝐞𝐬𝐜𝐫𝐢𝐳𝐢𝐨𝐧𝐞 𝐢𝐫𝐫𝐢𝐥𝐞𝐯𝐚𝐛𝐢𝐥𝐞.' });
    }

    try {

        let groupDescription = args.join(' ');


        await conn.groupUpdateDescription(m.chat, groupDescription);
        await conn.sendMessage(m.chat, { text: `𝐃𝐞𝐬𝐜𝐫𝐢𝐳𝐢𝐨𝐧𝐞 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 𝐜𝐚𝐦𝐛𝐢𝐚𝐭𝐚 ✔︎` });
    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { text: ' > ⚠️ 𝐄𝐫𝐫𝐨𝐫𝐞.' });
    }
};

handler.help = ['𝐛𝐢𝐨 <𝐝𝐞𝐬𝐜𝐫𝐢𝐳𝐢𝐨𝐧𝐞>']; 
handler.tags = ['admin'];
handler.command = /^(bio)$/i; //comando
handler.group = true; // Solo nei gruppi
handler.admin = true; // Solo per gli amministratori

export default handler;