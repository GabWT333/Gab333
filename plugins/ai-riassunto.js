import axios from 'axios';

const riassuntoPlugin = async (m, { conn, text, usedPrefix, command }) => {
  let input = text;
  if (!input && m.quoted) {
    input = m.quoted.text || m.quoted.body || '';
  }

  if (!input || input.length < 20) {
    return conn.reply(m.chat,
      `❗ Usa il comando così:\n` +
      `${usedPrefix + command} <testo lungo>\n` +
      `Oppure rispondi a un messaggio lungo con il comando ${usedPrefix + command}`, m);
  }

  if (input.length > 2500) {
    return conn.reply(m.chat, '❌ Il testo è troppo lungo. Limite massimo: 2500 caratteri.', m);
  }

  const prompt = `
Riassumi sinteticamente e chiaramente questo testo:

${input}

Rispondi in italiano, in modo semplice e comprensibile. Usa un formato chiaro e pulito.
`;

  try {
    await conn.sendPresenceUpdate('composing', m.chat);

    const res = await axios.post("https://luminai.my.id", {
      content: prompt,
      user: m.pushName || "utente",
      prompt: `Rispondi sempre in italiano.`,
      webSearchMode: false
    });

    const risposta = res.data.result;
    if (!risposta) throw new Error("Risposta vuota dall'API.");

    return conn.reply(m.chat, `📚 *Riassunto:*\n\n${risposta}`, m);

  } catch (err) {
    console.error('[❌ riassunto plugin errore]', err);
    return conn.reply(m.chat, '⚠️ Errore durante la generazione del riassunto. Riprova più tardi.', m);
  }
};

riassuntoPlugin.help = ['riassunto <testo o risposta a messaggio>'];
riassuntoPlugin.tags = ['ai', 'utilità'];
riassuntoPlugin.command = /^riassunto$/i;

export default riassuntoPlugin;