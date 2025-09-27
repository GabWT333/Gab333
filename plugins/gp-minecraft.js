let handler = async (m, { conn }) => {
    try {
        // Messaggio principale senza pulsanti
        await conn.sendMessage(m.chat, {
            text: `🎮 *GIOCO MINECRAFT GRATIS E SICURO!* 🎮\n\n` +
                  `Scopri *Eaglercraft*, la versione browser di Minecraft che puoi giocare OVUNQUE!\n\n` +
                  `🔗 *Link diretto:* https://eaglercraft.com/\n` +
                  `✅ Gratuito al 100%\n` +
                  `🔒 Sicuro e senza download\n` +
                  `🌐 Gioca direttamente dal browser\n\n` +
                  `Apri il link sopra per giocare!`,
            footer: '© BixByBot - Divertiti!',
            mentions: [m.sender]
        }, { quoted: m });

        // Invia un messaggio con immagine dopo 1 secondo
        setTimeout(async () => {
            await conn.sendMessage(m.chat, {
                image: { 
                    url: 'https://i.imgur.com/JlxJmZQ.png'
                },
                caption: 'Ecco come appare Eaglercraft! 👆',
                mentions: [m.sender]
            }, { quoted: m });
        }, 1000);

    } catch (error) {
        console.error('Errore:', error);
        await conn.sendMessage(m.chat, { 
            text: '❌ Errore nel mostrare il link. Riprova più tardi.'
        }, { quoted: m });
    }
}

handler.help = ['minecraft'];
handler.tags = ['games'];
handler.command = ['minecraft', 'mc', 'eglercraft'];
handler.premium = false;

export default handler;