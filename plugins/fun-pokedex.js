import fetch from 'node-fetch';

const config = {
  emoji: {
    attesa: '⏳',
    completato: '✅',
    errore: '❌'
  },
  meta: {
    sviluppatore: 'ChatUnity',
    icona: 'https://i.imgur.com/example.png', // URL immagine valida
    canale: 'https://example.com'
  }
};

let handler = async (m, { conn, text }) => {
  if (!text) return conn.reply(m.chat, '🚩 Inserisci il nome di un Pokémon', m);

  try {
    // Feedback ricerca
    await m.react(config.emoji.attesa);
    
    // Modificato per evitare externalAdReply problematico
    await conn.sendMessage(m.chat, { 
      text: `🔍 Cerco ${text}...`,
      contextInfo: {
        mentionedJid: [m.sender]
      }
    });

    // Richiesta API
    const url = `https://some-random-api.com/pokemon/pokedex?pokemon=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error('API non raggiungibile');

    const pokemon = await response.json();
    if (!pokemon?.name) throw new Error('Pokémon non trovato');

    // Formattazione risposta
    const infoPokemon = `
🎌 *Pokédex - ${pokemon.name}*

🔹 *Nome:* ${pokemon.name}
🔹 *ID:* ${pokemon.id}
🔹 *Tipo:* ${Array.isArray(pokemon.type) ? pokemon.type.join(', ') : pokemon.type}
🔹 *Abilità:* ${Array.isArray(pokemon.abilities) ? pokemon.abilities.join(', ') : pokemon.abilities}
🔹 *Altezza:* ${pokemon.height}
🔹 *Peso:* ${pokemon.weight}

📝 *Descrizione:*
${pokemon.description || 'Nessuna descrizione disponibile'}

🌐 *Maggiori info:*
https://www.pokemon.com/it/pokedex/${encodeURIComponent(pokemon.name.toLowerCase())}
    `.trim();

    // Invio messaggio semplificato
    await conn.sendMessage(m.chat, { 
      text: infoPokemon,
      mentions: [m.sender]
    });
    
    await m.react(config.emoji.completato);

  } catch (error) {
    console.error('Errore ricerca Pokémon:', error);
    await m.react(config.emoji.errore);
    await conn.sendMessage(m.chat, { 
      text: '⚠️ Errore nella ricerca del Pokémon',
      mentions: [m.sender]
    });
  }
};

handler.help = ['pokedex <pokémon>'];
handler.tags = ['utility', 'giochi'];
handler.command = ['pokedex', 'pokemon'];
export default handler;