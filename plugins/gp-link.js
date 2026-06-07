//Plugin by Gab, Lucifero & 333 staff



let handler = async (m, { conn, usedPrefix, command }) => {
    if (!m.isGroup) return;

    try {
        const metadata = await conn.groupMetadata(m.chat);
        const groupName = metadata.subject;
        const inviteCode = await conn.groupInviteCode(m.chat);
        const inviteLink = 'https://chat.whatsapp.com/' + inviteCode;

        const interactiveButtons = [
            {
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                    display_text: "🔗 𝐂𝐎𝐏𝐈𝐀 𝐋𝐈𝐍𝐊",
                    id: inviteLink,
                    copy_code: inviteLink
                })
            }
        ];

        const msg = {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        header: {
                            title: "⚡️ 𝟑𝟑𝟑𝐁𝐎𝐓 • 𝐋𝐈𝐍𝐊",
                            hasMediaAttachment: false
                        },
                        body: {
                            text: `╭─────────╮  
┃ 📢 𝐋𝐈𝐍𝐊 𝐔𝐅𝐅𝐈𝐂𝐈𝐀𝐋𝐄
┃ ꙰  𝟥𝟥𝟥 𝔹𝕆𝕋  ꙰
┃━━━━━━━━━━━━━━
┃⮕ 𝐆𝐫𝐮𝐩𝐩𝐨: ${groupName}
┃
┃ 💡 𝐔𝐬𝐚 𝐢𝐥 𝐭𝐚𝐬𝐭𝐨 𝐪𝐮𝐢 𝐬𝐨𝐭𝐭𝐨
┃ 𝐩𝐞𝐫 𝐜𝐨𝐩𝐢𝐚𝐫𝐞 𝐢𝐥 𝐥𝐢𝐧𝐤 
┃ 𝐧𝐞𝐠𝐥𝐢 𝐚𝐩𝐩𝐮𝐧𝐭𝐢.
╰─────────╯`
                        },
                        footer: {
                            text: "💡 𝟑𝟑𝟑𝐁𝐎𝐓"
                        },
                        nativeFlowMessage: {
                            buttons: interactiveButtons
                        }
                    }
                }
            }
        };

        await conn.relayMessage(m.chat, msg, {});

    } catch (e) {
        console.error(e);
        m.reply("⚠️ 𝐄𝐑𝐑𝐎𝐑𝐄: Impossibile generare il link. Assicurati che il bot sia Amministratore.");
    }
};

handler.help = ['link'];
handler.tags = ['gruppo'];
handler.command = /^(link|invito)$/i;
handler.group = true;
handler.mods = true
handler.botAdmin = true;

export default handler;