import axios from 'axios';

const kcalPlugin = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `﹒⋆❛ ${usedPrefix + command} <alimento>\n❥ Per favore indica un alimento da analizzare!\nEsempio: *${usedPrefix + command} fragola*`, m);
  }

  const alimento = text.trim();

  const prompt = `
Genera una scheda nutrizionale decorata, leggibile ma stilosa, per il seguente alimento: *${alimento}*.

Il formato deve essere esattamente questo (non cambiare lo stile, solo i valori):

★·.·´¯\`·.·★ ⟡ ˚｡⋆『 ˗ˏˋ  ${alimento.toUpperCase()}  ˎˊ˗ 』⋆｡˚⟡ ★·.·´¯\`·.·★

📌 *Porzione analizzata:* *100g*
🧭 *Valutazione nutrizionale:* *(Alta, Moderata, Bassa)*
🔍 *Fonte dati:* *AI Nutrizionale*

╭─❍ 『 🔥 』 *ENERGIA*
│• *XXX kcal* (X% VG)
│🔹 Densità calorica: *(alta / moderata / bassa)*
╰───────────────

╭─❍ 『 🥩 』 *MACRONUTRIENTI*
│• *Proteine:* Xg (X% VG)
│• *Grassi:* Xg (X% VG)
│  ↳ _Saturi:_ Xg (X% VG)
│• *Carboidrati:* Xg (X% VG)
│  ↳ _Zuccheri:_ Xg
│• *Fibre:* Xg (X% VG)
╰───────────────

╭─❍ 『 🧪 』 *MICRONUTRIENTI*
│• *Sodio:* Xmg
│• *Potassio:* Xmg
│• *Calcio:* Xmg
│• *Ferro:* Xmg
│• *Colesterolo:* Xmg
╰───────────────

╭─❍ 『 ℹ️ 』 *INFO GENERALI*
│• Categoria: *(es. Frutta, Verdura, Legumi)*
│• Porzione consigliata: XXg
│• Densità calorica: XXX kcal/100g
╰───────────────

╭─❍ 『 💡 』 *CONSIGLIO NUTRIZIONALE*
│✓ *(es. Ottimo per spuntini / Da bilanciare con proteine, ecc.)*
╰───────────────

╭─❍ 『 📝 』 *NOTA PROFESSIONALE*
│Scrivi una breve nota (max 4 righe) con tono medico-nutrizionale.
╰───────────────

⋆ ˚｡✦ *VG = Valori Giornalieri di riferimento (dieta 2000 kcal)*
⋆ ˚｡✦ *Consulta un nutrizionista per piani personalizzati*
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

    return await conn.reply(m.chat, risposta, m);

  } catch (err) {
    console.error('[❌ kcal plugin errore]', err);
    return await conn.reply(m.chat, '⚠️ Errore durante l’elaborazione. Riprova più tardi.', m);
  }
};

kcalPlugin.help = ['kcal <cibo>'];
kcalPlugin.tags = ['nutrizione', 'ai'];
kcalPlugin.command = /^kcal$/i;

export default kcalPlugin;