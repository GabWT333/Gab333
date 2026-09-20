//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn }) => {

  const text =
`💖 Donazione

Se vuoi supportare lo sviluppo del bot e del progetto puoi fare una piccola donazione qui:

👉 https://www.paypal.me/GabWTcomm

Grazie per il supporto da parte dello staff di 333 🙏`;

  await conn.sendMessage(m.chat, { text });
};

handler.command = /^donazione$/i;

export default handler;