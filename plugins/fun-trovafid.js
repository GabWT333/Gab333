//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn, command, groupMetadata }) => {
    if (command === 'trovafid') {

        let toM = a => '@' + a.split('@')[0];
        

        let ps = groupMetadata.participants.map(v => v.id);


        if (ps.length < 2) {
            return m.reply('Non ci sono abbastanza partecipanti nel gruppo per trovare una coppia.');
        }


        let a = ps[Math.floor(Math.random() * ps.length)];
        

        let b;
        do {
            b = ps[Math.floor(Math.random() * ps.length)];
        } while (b === a);
        

        m.reply(`══════ •⊰✦⊱• ══════\n𝐓𝐮 𝐞 ${toM(b)} 𝐨𝐫𝐚 𝐬𝐢𝐞𝐭𝐞 𝐟𝐢𝐝𝐚𝐧𝐳𝐚𝐭𝐢\n══════ •⊰✦⊱• ══════`, null, {
            mentions: [a, b],
            contextInfo: {
                mentionedJid: [a, b]
            }
        });
    }
};

handler.help = ['𝐭𝐫𝐨𝐯𝐚𝐟𝐢𝐝']
handler.tags = ['fun']
handler.command = /^(trovafid)$/i
handler.group = true
handler.admin = false
export default handler;