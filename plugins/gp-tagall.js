//Plugin by Gab, Lucifero & 333 staff






let handler = async (m, { isOwner, isAdmin, conn, text, participants, args, usedPrefix, command, groupMetadata }) => {
    if (command === 'tagall' || command === 'marcar') {
        if (!(isAdmin || isOwner)) {
            global.dfail('admin', m, conn);
            throw false;
        }

        let pesan = args.join` ` || ' 🚨 *𝐀𝐋𝐋𝐄𝐑𝐓𝐀!*';
        let oi = `📢  ${pesan}`;

        let prova = {
            key: {
                participants: "0@s.whatsapp.net",
                fromMe: false,
                id: "Halo"
            },
            message: {
                locationMessage: {
                    name: '𝐍𝐎𝐍 𝐒𝐈 𝐃𝐎𝐑𝐌𝐄!!! ',
                    jpegThumbnail: await (await fetch('https://telegra.ph/file/92576d96e97bb7e3939e2.png')).buffer(),
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
                }
            },
            participant: "0@s.whatsapp.net"
        };

        let teks = `
╭─────────╮\n║ *𝐓𝐀𝐆𝐀𝐋𝐋:* 
║ 🏠 *𝐆𝐫𝐮𝐩𝐩𝐨:*  ${groupMetadata.subject || 'Non sei in un gruppo'}
║ 👥 *𝐌𝐞𝐦𝐛𝐫𝐢:*  ${participants.length}
║ 💬 *𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨:*  ${oi}
━━━━━━━━━━━━━━

 *𝐌𝐄𝐍𝐙𝐈𝐎𝐍𝐈:* \n
`.trim(); 

        const validParticipants = participants.filter(mem => mem && typeof mem.id === 'string' && mem.id.includes('@'))
        const mentionList = validParticipants.map(mem => mem.id)

        const getSafeName = async (jid) => {
            const fallback = jid.split('@')[0]
            if (!conn.getName) return fallback
            try {
                const name = await Promise.resolve(conn.getName(jid))
                return typeof name === 'string' && name ? name : fallback
            } catch {
                return fallback
            }
        }

        for (let mem of validParticipants) {
            const name = await getSafeName(mem.id)
            teks += `\n➤ @${name}`
        }

        teks += `\n𝐁𝐘  ꙰  𝟥𝟥𝟥 𝔹𝕆𝕋  ꙰`;

        await conn.sendMessage(m.chat, {
            text: teks,
            contextInfo: { mentionedJid: mentionList }
        }, { quoted: prova });
    }
};

handler.help = ['𝐭𝐚𝐠𝐚𝐥𝐥'];
handler.tags = ['admin'];
handler.admin = true
handler.mods = true;
handler.command = /^(tagall|marcar)$/i;
handler.group = true;

export default handler;