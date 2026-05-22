//Plugin by Gab, Lucifero & 333 staff

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let handler = async (m, { conn }) => {
    let destinatario;

    if (m.quoted && m.quoted.sender) {
        destinatario = m.quoted.sender;
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        destinatario = m.mentionedJid[0];
    } else {
        return m.reply("𝐓𝐚𝐠𝐠𝐚 𝐥𝐚 𝐩𝐞𝐫𝐬𝐨𝐧𝐚 𝐚 𝐜𝐮𝐢 𝐯𝐮𝐨𝐢 𝐟𝐚𝐫𝐞 𝐮𝐧𝐚 𝐬𝐞𝐠𝐚!");
    }

    let nomeDestinatario = `@${destinatario.split('@')[0]}`;

    let sequenza = [
        "𝐄̀ 𝐢𝐥 𝐦𝐨𝐦𝐞𝐧𝐭𝐨 𝐝𝐢 𝐟𝐚𝐫𝐞 𝐬𝐮 𝐞 𝐠𝐢𝐮̀😏",
        "𝐌𝐡𝐡 𝐚𝐯𝐯𝐢𝐜𝐢𝐧𝐚 𝐥𝐚 𝐛𝐨𝐜𝐜𝐚",
        "𝐎𝐡 𝐬𝐢𝐢𝐢 𝐬𝐭𝐨 𝐯𝐞𝐧𝐞𝐧𝐝𝐨𝐨𝐨"
    ];

    for (let msg of sequenza) {
        await conn.sendMessage(m.chat, {
            text: msg,
            mentions: [destinatario]
        }, { quoted: m });

        await sleep(1500); 
    }

    await sleep(1200);

    let resultMessage = `*${nomeDestinatario}* 𝐡𝐚 𝐫𝐢𝐞𝐦𝐩𝐢𝐭𝐨 𝐢𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 𝐝𝐢 𝐛𝐢𝐦𝐛𝐢! 𝐓𝐢 𝐞̀ 𝐩𝐢𝐚𝐜𝐢𝐮𝐭𝐚 𝐝𝐢̀ 𝐥𝐚 𝐯𝐞𝐫𝐢𝐭𝐚̀ 🤤💦`;

    await conn.sendMessage(m.chat, {
        text: resultMessage,
        mentions: [destinatario]
    }, { quoted: m });
};

handler.command = ["sega"];
handler.help = ['sega @tag'];
handler.tags = ["fun"];

export default handler;