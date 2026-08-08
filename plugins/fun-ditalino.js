//Plugin by Gab, Lucifero & 333 staff

import { performance } from "perf_hooks";

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
        return m.reply("𝐃𝐞𝐯𝐢 𝐭𝐚𝐠𝐠𝐚𝐫𝐞 𝐪𝐮𝐚𝐥𝐜𝐮𝐧𝐨 𝐩𝐞𝐫 𝐢𝐧𝐢𝐳𝐢𝐚𝐫𝐞 𝐮𝐧 𝐝𝐢𝐭𝐚𝐥𝐢𝐧𝐨!");
    }

    let nomeDestinatario = `@${destinatario.split('@')[0]}`;

    let sequenza = [
        "𝐈𝐧𝐢𝐳𝐢𝐚𝐦𝐨 𝐚 𝐦𝐮𝐨𝐯𝐞𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐞 𝐛𝐞𝐥𝐥𝐞 𝐝𝐢𝐭𝐚😏",
        "𝐌𝐡𝐡𝐡 𝐚𝐧𝐜𝐨𝐫𝐚",
        "𝐎𝐡 𝐬𝐢𝐢𝐢 𝐬𝐭𝐨 𝐯𝐞𝐧𝐞𝐧𝐝𝐨𝐨𝐨"
    ];

    for (let msg of sequenza) {
        await conn.sendMessage(m.chat, {
            text: msg,
            mentions: [destinatario]
        }, { quoted: m });

        await sleep(1500); 
    }

    let resultMessage = `𝐒𝐭𝐚 𝐭𝐫𝐨𝐢𝐨𝐧𝐚 *${nomeDestinatario}* 𝐞̀ 𝐯𝐞𝐧𝐮𝐭𝐚, 𝐡𝐚 𝐬𝐜𝐡𝐢𝐳𝐳𝐚𝐭𝐨 𝐨𝐯𝐮𝐧𝐪𝐮𝐞 💦`;

    await sleep(1200);

    conn.sendMessage(m.chat, {
        text: resultMessage,
        mentions: [destinatario]
    }, { quoted: m });
};

handler.command = ["ditalino"];
handler.help = ['ditalino @tag'];
handler.tags = ["fun"];

export default handler;