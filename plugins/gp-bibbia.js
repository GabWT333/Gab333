import axios from 'axios';

const bibbiaPlugin = async (m, { conn, text, usedPrefix, command }) => {
  // Se non c’è testo, chiediamo a GPT un versetto casuale
  const prompt = text
    ? `Riporta il versetto biblico richiesto: "${text}".  
Formato di output richiesto:

<Libro> <Capitolo> - <Verso> - <Riferimento greco in maiuscolo> (traslitterazione)

<testo del versetto biblico in italiano>

Rispondi solo con questo testo, senza altro.`
    : `Riporta un versetto biblico casuale in questo formato:

<Libro> <Capitolo> - <Verso> - <Riferimento greco in maiuscolo> (traslitterazione)

<testo del versetto biblico in italiano>

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
    console.error('[❌ bibbiaPlugin]', err);
    return conn.reply(m.chat, '⚠️ Errore nel recupero del versetto. Usa un riferimento valido tipo Giovanni 3:16', m);
  }
};

bibbiaPlugin.help = ['bibbia [riferimento]'];
bibbiaPlugin.tags = ['fede', 'bibbia'];
bibbiaPlugin.command = /^bibbia$/i;

export default bibbiaPlugin;