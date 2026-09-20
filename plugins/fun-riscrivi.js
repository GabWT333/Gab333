//Codice di fun-riscrivi.js

//Codice di fun-riscrivi.js

let handler = async (m, { text, usedPrefix }) => {
  const frase = text?.trim()
  if (!frase) throw 'Scrivi una frase dopo .riscrivi'
  if (usedPrefix && frase.startsWith(usedPrefix)) return
  await m.reply(frase)
}

handler.command = /^riscrivi$/i
handler.help = ['riscrivi <frase>']
handler.tags = ['fun']

export default handler​