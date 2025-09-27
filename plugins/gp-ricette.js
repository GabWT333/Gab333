import axios from 'axios';

const ricettaPlugin = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `🍽️ Usa così:\n${usedPrefix + command} <ingrediente/i>\nEsempio: *${usedPrefix + command} zucchine, patate*`, m);
  }

  const ingredienti = text.trim();

  const prompt = `
Agisci come un assistente di cucina italiano.
Suggerisci una ricetta **facile ma gustosa** usando questi ingredienti: ${ingredienti}

✦ Il formato deve essere chiaro e ordinato:
1. Nome della ricetta (creativo ma realistico)
2. Ingredienti (con quantità indicative)
3. Procedimento (max 5-6 passi, in stile conversazionale)
4. Dosi: per quante persone?
5. Tempo di preparazione

✦ Il tono deve essere amichevole e semplice.
✦ Rispondi **solo in italiano**, e usa emoji da cucina dove utile.

Esempio stile:
🍝 *Pasta cremosa alle zucchine*  
🧂 Ingredienti: ...  
👨‍🍳 Procedimento: ...
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

    return conn.reply(m.chat, risposta, m);

  } catch (err) {
    console.error('[❌ ricetta plugin errore]', err);
    return conn.reply(m.chat, '⚠️ Errore nel generare la ricetta. Riprova tra poco!', m);
  }
};

ricettaPlugin.help = ['ricetta <ingredienti>'];
ricettaPlugin.tags = ['cucina', 'ai', 'utilità'];
ricettaPlugin.command = /^ricetta$/i;

export default ricettaPlugin;