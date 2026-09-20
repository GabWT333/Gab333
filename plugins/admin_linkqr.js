//Plugin by Gab, Lucifero & 333 staff


import QRCode from 'qrcode';

const handler = async (m, { conn }) => {
    try {
        const inviteLink = 'https://chat.whatsapp.com/' + await conn.groupInviteCode(m.chat);
        const qrImageBuffer = await QRCode.toBuffer(inviteLink);
        await conn.sendMessage(m.chat, { image: qrImageBuffer, caption: 'Ecco il QR Code per il link del gruppo!' });
    } catch (error) {
        m.reply('Errore durante la generazione del QR Code: ' + error.message);
    }
};

handler.help = ['linkgroup'];
handler.tags = ['group'];
handler.command = /^linkqr(gro?up)?$/i;
handler.group = true;
handler.botAdmin = true;

export default handler;