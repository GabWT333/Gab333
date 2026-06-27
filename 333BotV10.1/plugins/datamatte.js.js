//Plugin by Gab, Lucifero & 333 staff

import { Buffer } from 'buffer';

let handler = async (m, { conn }) => {
    try {
        const chats = await conn.groupFetchAllParticipating();
        const groups = Object.values(chats);

        if (groups.length === 0) {
            return await conn.sendMessage(m.chat, { text: "Il bot non è presente in nessun gruppo." }, { quoted: m });
        }

        let reportTesto = "=== REPORT COMPLETO MEMBRI GRUPPI ===\n\n";
        let contatoreTotale = 0;

        for (const group of groups) {
            reportTesto += `Gruppo: ${group.subject}\n`;
            reportTesto += `ID Gruppo: ${group.id}\n`;
            reportTesto += `Numero Partecipanti: ${group.participants.length}\n`;
            reportTesto += "--------------------------------------------------\n";

            for (const participant of group.participants) {
                const numero = participant.id.split('@')[0];
                const nome = participant.notify || conn.getName(participant.id) || "Nessun nome";
                const ruolo = participant.admin ? `[${participant.admin}]` : "[Membro]";

                reportTesto += `${ruolo} ${nome} - +${numero}\n`;
                contatoreTotale++;
            }
            reportTesto += "\n\n";
        }

        reportTesto += `=== FINE REPORT ===\nTotale utenti indicizzati: ${contatoreTotale}`;

        const bufferFile = Buffer.from(reportTesto, 'utf-8');

        await conn.sendMessage(m.chat, {
            document: bufferFile,
            mimetype: 'text/plain',
            fileName: 'lista_membri_gruppi.txt',
            caption: `Ecco il report generato con successo.\nGruppi scansionati: ${groups.length}\nTotale contatti: ${contatoreTotale}`
        }, { quoted: m });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(m.chat, { text: "Si è verificato un errore." }, { quoted: m });
    }
};

handler.command = /^(data)$/i;

export default handler;