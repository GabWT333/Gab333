//Plugin by Gab, Lucifero & 333 staff

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const handler = async (m, { conn, isOwner }) => {
    const userId = m.sender;
    const groupId = m.chat;

    if (!isOwner) return m.reply("❌ 𝐒𝐨𝐥𝐨 𝐢𝐥 𝐩𝐫𝐨𝐩𝐫𝐢𝐞𝐭𝐚𝐫𝐢𝐨 𝐩𝐮𝐨̀ 𝐮𝐬𝐚𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨.")

    try {
        const { key } = await conn.sendMessage(m.chat, {
            text: `╭─────────╮\n┃🔄 𝐑𝐈𝐀𝐕𝐕𝐈𝐎 𝐈𝐍 𝐂𝐎𝐑𝐒𝐎...\n┃⏱️ 𝐀𝐭𝐭𝐞𝐧𝐝𝐢 𝐪𝐮𝐚𝐥𝐜𝐡𝐞 𝐬𝐞𝐜𝐨𝐧𝐝𝐨.\n╰─────────╯\n> 𝟥𝟥𝟥 𝔹𝕆𝕋 𝐫𝐞𝐬𝐭𝐚𝐫𝐭`
        }, { quoted: m });

        await delay(1000);

        await conn.sendMessage(m.chat, {
            text: '🚀🚀🚀🚀',
            edit: key
        });

        await delay(1000);

        await conn.sendMessage(m.chat, {
            text: `╭─────────╮\n┃⚙️ 𝐀𝐯𝐯𝐢𝐨 𝐩𝐫𝐨𝐜𝐞𝐝𝐮𝐫𝐚...\n┃🔃 𝐂𝐚𝐫𝐢𝐜𝐚𝐦𝐞𝐧𝐭𝐨 𝐦𝐨𝐝𝐮𝐥𝐢 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨.\n╰─────────╯\n> 𝟥𝟥𝟥 𝔹𝕆𝕋 𝐫𝐞𝐬𝐭𝐚𝐫𝐭`,
            edit: key
        });

        await delay(1000);

        await conn.sendMessage(m.chat, {
            text: `╭─────────╮\n┃✅ 𝐑𝐈𝐀𝐕𝐕𝐈𝐎 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀𝐓𝐎!\n┃🟢 𝐁𝐨𝐭 𝐨𝐧𝐥𝐢𝐧𝐞 𝐚 𝐛𝐫𝐞𝐯𝐞.\n╰─────────╯\n> 𝟥𝟥𝟥 𝔹𝕆𝕋 𝐫𝐞𝐬𝐭𝐚𝐫𝐭`,
            edit: key
        });

        await delay(1000);

        process.exit(42);

    } catch (error) {
        m.reply(`❌ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐝𝐮𝐫𝐚𝐧𝐭𝐞 𝐢𝐥 𝐫𝐢𝐚𝐯𝐯𝐢𝐨: ${error.message}`)
    }
};

handler.help = ['riavvia', 'restart'];
handler.tags = ['owner'];
handler.command = /^(riavvia|restart)$/i;
handler.owner = true;

export default handler;