// Plugin: Solo Maggiorenni (Abilita/disabilita phsearch per +18)
// Attiva con: .attiva solomaggiorenni | .disabilita solomaggiorenni

let handler = async (m, { conn, command, usedPrefix, args, isAdmin, isOwner }) => {
  const chat = global.db.data.chats[m.chat];
  if (!chat) return m.reply('Impossibile trovare i dati del gruppo.');

  // Solo admin o owner può attivare/disattivare
  if (!isAdmin && !isOwner) return m.reply('Solo gli admin possono attivare/disattivare questa funzione.');

  if (/attiva/i.test(command)) {
    chat.solomaggiorenni = true;
    return m.reply('✅ Solo Maggiorenni attivato! Ora il comando .phsearch è disponibile.');
  } else if (/disabilita/i.test(command)) {
    chat.solomaggiorenni = false;
    return m.reply('❌ Solo Maggiorenni disattivato! Ora il comando .phsearch NON è più disponibile.');
  } else {
    return m.reply(`Usa:\n${usedPrefix}attiva solomaggiorenni\n${usedPrefix}disabilita solomaggiorenni`);
  }
};

handler.help = ['attiva solomaggiorenni', 'disabilita solomaggiorenni'];
handler.tags = ['sicurezza'];
handler.command = /^(attiva|disabilita)\s?solomaggiorenni$/i;
handler.admin = true;
handler.group = true;

export default handler;
