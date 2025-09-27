import axios from 'axios';

const coranoPlugin = async (m, { conn, text, usedPrefix, command }) => {
  const prompt = text
    ? `Riporta il versetto del Corano richiesto: "${text}".  
Formato di output richiesto:

Sura <capitolo>:<verso> - <arabo originale> (<traslitterazione>)

<testo del versetto in italiano>

Rispondi solo con questo testo, senza altro.`
    : `Riporta un versetto casuale del Corano nel seguente formato:

Sura <capitolo>:<verso> - <arabo originale> (<traslitterazione>)

<testo del versetto in italiano>

Rispondi solo con questo testo, senza altro.`;

  try {
    await conn.sendPresenceUpdate('composing', m.chat);

    const res = await axios.post('https://luminai.my.id', {
      content: prompt,
      user: m.pushName || "utente",
      prompt: 'Rispondi sempre in italiano.',
      webSearchMode: false
    });

    const verso = res.data.result;
    if (!verso) throw new Error("Nessuna risposta ricevuta.");

    return await conn.reply(m.chat, verso, m);
  } catch (err) {
    console.error('[❌ coranoPlugin]', err);
    return conn.reply(m.chat, '⚠️ Errore nel recupero del versetto. Usa un riferimento valido tipo 2:255', m);
  }
};

coranoPlugin.help = ['corano [riferimento]'];
coranoPlugin.tags = ['religione', 'corano'];
coranoPlugin.command = /^corano$/i;

export default coranoPlugin;