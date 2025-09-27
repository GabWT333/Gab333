let handler = async (m, { conn, groupMetadata, participants, isBotAdmin }) => {
    // Verifica se il comando viene eseguito dall'owner o da Youns
    const allowedUsers = ['3934927377007@s.whatsapp.net', 'Youns-jid@s.whatsapp.net']; // Sostituisci con i JID reali
    const sender = m.sender;
    
    if (!allowedUsers.includes(sender)) {
        await conn.sendMessage(m.chat, { text: "❌ Comando riservato esclusivamente agli owner del bot!" });
        return;
    }

    if (!isBotAdmin) {
        await conn.sendMessage(m.chat, { text: "❌ Il bot deve essere amministratore per eseguire questo comando!" });
        return;
    }

    const ownerGroup = groupMetadata.owner || null; 
    const admins = participants.filter(p => p.admin).map(a => a.id);

    // Filtra per rimuovere solo gli admin non autorizzati
    const adminsToRemove = admins.filter(admin => 
        admin !== conn.user.jid && 
        admin !== ownerGroup && 
        !allowedUsers.includes(admin)
    );

    if (adminsToRemove.length === 0) {
        await conn.sendMessage(m.chat, { text: "⚠ Tutti gli amministratori attuali sono autorizzati (bot, owner e founder)." });
        return;
    }

    // Imposta la chat in modalità solo admin
    try {
        await conn.groupSettingUpdate(m.chat, 'announcement');
        await conn.sendMessage(m.chat, { text: "🔒 Chat bloccata: ora solo gli admin possono inviare messaggi." });
    } catch (e) {
        console.error("Errore nell'impostare la chat in modalità admin-only:", e);
    }

    // Rimozione admin
    await conn.sendMessage(m.chat, { text: "⚠ Avvio procedura di quarantena..." });

    for (let admin of adminsToRemove) {
        try {
            await conn.groupParticipantsUpdate(m.chat, [admin], 'demote');
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (err) {
            console.error(`Errore nella rimozione di ${admin}:`, err);
        }
    }

    // Messaggio finale
    const remainingAdmins = participants.filter(p => p.admin).map(a => a.id);
    await conn.sendMessage(m.chat, { 
        text: `✅ Quarantena completata!\n\n` +
              `👑 Founder: @${ownerGroup.split('@')[0]}\n` +
              `🤖 Bot: @${conn.user.jid.split('@')[0]}\n` +
              `🛡️ Admin autorizzati: ${remainingAdmins.length - 2}`,
        mentions: [ownerGroup, conn.user.jid]
    });
};

handler.help = ['quarantena'];
handler.tags = ['group'];
handler.command = /^(quarantena|lockgc)$/i; 
handler.group = true; 
handler.admin = true;
handler.botAdmin = true;

export default handler;