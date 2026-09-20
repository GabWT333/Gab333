//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn, args, command }) => {
    const groupToExclude = '120363368641021092@g.us'; // Inserisci l'ID del gruppo da non lasciare
    let groups = await conn.groupFetchAllParticipating();
    let leftGroups = [];

    for (let id in groups) {
        if (id !== groupToExclude) {
            await conn.reply(id, 'Me so cagato il cazzo di fare il bot di turno qua dentro! 💩');
            await conn.groupLeave(id);
            leftGroups.push(groups[id].subject);
        }
    }

    let message = `🛑 Report:\nSono uscito da ${leftGroups.length} gruppi.\n\n📋 Elenco dei gruppi:\n- ${leftGroups.join('\n- ') || 'Nessun gruppo lasciato'}`;
    let ownerId = '393509414533@s.whatsapp.net'; // Inserisci l'ID del proprietario del bot
    await conn.reply(ownerId + '@s.whatsapp.net', message); // Invia il report in privato all'owner
}
handler.help = ['𝐨𝐮𝐭𝐚𝐥𝐥'];
handler.tags = ['owner'];
handler.command = /^(outall)$/i;
handler.group = true;
handler.rowner = true;

export default handler;