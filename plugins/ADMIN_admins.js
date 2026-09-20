//Plugin by Gab, Lucifero & 333 staff






const handler = async (m, { conn, participants, groupMetadata, args }) => {
    const groupAdmins = participants.filter(p => p.admin);
    const mentionList = groupAdmins.map(p => p.id);
    const owner = groupMetadata.owner || 
        groupAdmins.find(p => p.admin === 'superadmin')?.id || 
        `${m.chat.split('-')[0]}@s.whatsapp.net`;

    let pesan = args.join(' ');
    let message = pesan ? pesan : '❌ Nessun messaggio fornito';

    const listAdmin = groupAdmins
        .map((v, i) => `✧👑 ${i + 1}. @${v.id.split('@')[0]}`)
        .join('\n');

    let text = `
╭─────────╮
│ 🔔 𝐒𝐕𝐄𝐆𝐋𝐈𝐀 𝐀𝐃𝐌𝐈𝐍!
━━━━━━━━━━━━━━
✎ 𝐌𝐄𝐒𝐒𝐀𝐆𝐆𝐈𝐎:
➥ ${message}

♔ *𝐋𝐈𝐒𝐓𝐀 𝐀𝐃𝐌𝐈𝐍:*\n${listAdmin}

━━━━━━━━━━━━━━
> 𝟥𝟥𝟥 𝔹𝕆𝕋 
╰─────────╯
`.trim();

    const groupProfilePicture = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null) ||
        'https://telegra.ph/file/0f336691459a936a75f1b.jpg';

    await conn.sendMessage(m.chat, {
        image: { url: groupProfilePicture },
        caption: text,
        mentions: [...mentionList, owner]
    }, { quoted: m });
};

handler.command = ['admins', '@admins', 'dmins'];
handler.tags = ['admin'];
handler.help = ['admins <messaggio>'];
handler.group = true;
handler.mods = true;

export default handler;