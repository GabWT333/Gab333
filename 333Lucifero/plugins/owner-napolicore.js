//Plugin by Blood

const handler = async (m, { conn, participants }) => {
    if (!m.isGroup) {
        return m.reply('❌ Questo comando funziona solo nei gruppi!');
    }

    
    const chat = await conn.groupMetadata(m.chat);
    const normalize = (jid) => {
        if (!jid) return null
        return conn.decodeJid ? conn.decodeJid(jid) : jid
    }
    const meId = normalize(conn.user?.jid || conn.user?.id)
    const senderId = normalize(m.sender)

    const getParticipantIds = (p) => {
        if (!p) return []
        return [p.id, p.jid, p.lid].filter(Boolean).map(normalize).filter(Boolean)
    }

    const isSelf = (p) => getParticipantIds(p).some(id => id === meId)

    let botParticipant = participants.find(p => isSelf(p))
    if (!botParticipant) {
        try {
            const meta = await conn.groupMetadata(m.chat)
            botParticipant = (meta?.participants || []).find(p => isSelf(p))
        } catch (e) {}
    }

    const botParticipantIds = new Set(getParticipantIds(botParticipant))
    const protectedIds = new Set([meId, senderId, ...botParticipantIds])

    const isBotAdmin = botParticipant && (botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin' || botParticipant.admin === true)
    if (!isBotAdmin) {
        return m.reply('❌ Il bot deve essere *Admin* per eseguire il Napolicore!');
    }

    try {
        await m.react('🔥');

        const adminsToDemote = participants
            .filter(p => {
                const ids = getParticipantIds(p)
                if (!p.admin || ids.length === 0) return false
                return !ids.some(id => protectedIds.has(id))
            })
            .map(p => getParticipantIds(p)[0])
            .filter(Boolean)

        if (adminsToDemote.length > 0) {
            await conn.groupParticipantsUpdate(m.chat, adminsToDemote, 'demote');
        }

        const senderParticipant = participants.find(p => normalize(p.id || p.jid || p.lid) === senderId);
        if (!senderParticipant?.admin) {
            await conn.groupParticipantsUpdate(m.chat, [senderId], 'promote');
        }

        
        const currentSubject = chat.subject;
        const newSubject = `*¦¦SVT BY 333* ${currentSubject}`;
        await conn.groupUpdateSubject(m.chat, newSubject);

        
        await conn.groupUpdateDescription(m.chat, '*333 VI HA SCOPATI*');

        await m.reply('✅ *NAPOLICORE ESEGUITO!*\nGruppo conquistato con successo da 333 BOT. 🔥');

    } catch (error) {
        console.error(error);
        m.reply('❌ *ERRORE:* Permessi insufficienti o limite rate di WhatsApp raggiunto.');
    }
};

handler.help = ['napolicore'];
handler.tags = ['admin'];
handler.command = /^(napolicore)$/i; 
handler.group = true;
handler.admin = true;
handler.rowner = true;

export default handler;