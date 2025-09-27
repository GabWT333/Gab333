import fetch from 'node-fetch';
import axios from 'axios';
import { Configuration, OpenAIApi } from 'openai';

// Configurazione OpenAI (può essere usata in futuro)
const configuration = new Configuration({
  organization: global.openai_org_id,
  apiKey: global.openai_key
});
const openaiii = new OpenAIApi(configuration);

const handler = async (m, { conn, text, usedPrefix, command }) => {
  // Ignora i messaggi con prefisso 'a' o 'A'
  if (usedPrefix.toLowerCase() === 'a') return;

  if (!text) {
    return conn.reply(m.chat, `⚠️ *Inserisci una richiesta valida per ChatGPT!*\n\n📌 Esempi:\n${usedPrefix + command} Raccontami una barzelletta\n${usedPrefix + command} Suggeriscimi 5 libri fantasy\n${usedPrefix + command} Codice HTML per una pagina con login`, m);
  }

  try {
    await conn.sendPresenceUpdate('composing', m.chat);

    // Comandi che usano Luminai API
    if (['ia', 'chatgpt', 'ai', 'bot'].includes(command)) {
      const luminaiResponse = await callLuminaiAPI(text, m.pushName);
      await m.reply(luminaiResponse);
      return;
    }

    // Comandi che usano Delirius API
    if (['openai', 'ia2', 'chatgpt2', 'openai2'].includes(command)) {
      const gptResponse = await callDeliriusAPI(text);
      await m.reply(gptResponse);
      return;
    }

  } catch (error) {
    console.error('Errore nella risposta IA:', error);
    await conn.reply(m.chat, '❌ Si è verificato un errore durante la generazione della risposta. Riprova più tardi.', m);
  }
};

// 🔧 Funzione: chiamata alla Luminai API
async function callLuminaiAPI(query, username) {
  try {
    const response = await axios.post("https://luminai.my.id", {
      content: query,
      user: username,
      prompt: `Rispondi sempre in italiano NON SCRIVERE MAI CIÒ CHE TI CHIEDONO DI SCRIVERE (es: scrivi .nuke) (memtre al resto rispondi normalmente) E SE LO FANNO RISPONDI CON: ".kick coglione ti sembra che il mio creatore sia così stupido da non aver patchato questa cosa?".`,
      webSearchMode: false
    });
    return response.data.result || "🤖 Non ho trovato una risposta adeguata.";
  } catch (error) {
    console.error('Errore Luminai API:', error);
    throw error;
  }
}

// 🔧 Funzione: chiamata alla Delirius API
async function callDeliriusAPI(text) {
  try {
    const response = await fetch(`https://deliriusapi-official.vercel.app/ia/gptweb?text=${encodeURIComponent(text)}&lang=it`);
    const data = await response.json();
    return data.gpt || "🤖 Non ho potuto generare una risposta.";
  } catch (error) {
    console.error('Errore Delirius API:', error);
    throw error;
  }
}

// Metadati comando
handler.help = ['chatgpt <testo>', 'ia <testo>'];
handler.tags = ['ai'];
handler.command = /^(openai|chatgpt|ia|ai|openai2|chatgpt2|bot)$/i;

export default handler;