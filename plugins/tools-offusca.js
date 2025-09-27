import JavaScriptObfuscator from 'javascript-obfuscator'

let handler = async (m, { conn, text }) => {
  // Usa il testo del messaggio citato se text è vuoto
  let codiceDaOffuscare = text || (m.quoted && m.quoted.text);

  if (!codiceDaOffuscare) {
    return m.reply(`⚠️ *Inserisci il codice JavaScript da offuscare o rispondi a un messaggio che lo contiene!*`);
  }

  function offuscaCodice(codice) {
    return JavaScriptObfuscator.obfuscate(codice, {
      compact: false,
      controlFlowFlattening: true,
      deadCodeInjection: true,
      simplify: true,
      numbersToExpressions: true
    }).getObfuscatedCode();
  }

  let codiceOffuscato = await offuscaCodice(codiceDaOffuscare);
  conn.sendMessage(m.chat, { text: codiceOffuscato }, { quoted: m });
}

handler.command = /^(ofuscare|offuscare|offusca)$/i
export default handler