//Plugin by Gab, Lucifero & 333 staff

import jimp from 'jimp'

let frasi = [

  "oggi potevi evitare di esistere",
  "energia NPC rilevata",
  "carisma in manutenzione da anni",
  "livello swag: negativo",
  "se fossi un film saresti la comparsa che muore subito",
  "sei online ma non utile",
  "aura sospetta rilevata",
  "esistenza discutibile",
  "stai partecipando o guardando?",
  "livello imbarazzo: alto",

  "se il silenzio fosse oro tu saresti miliardario",
  "parli tanto ma dici poco",
  "se eri un aggiornamento ti saltavano tutti",
  "sei la notifica che nessuno vuole",
  "se fossi una scelta saresti quella sbagliata",
  "hai la presenza di un mobile ikea rotto",
  "se fossi una skill sarebbe disattivata",
  "sei il lag nella vita reale",
  "hai il carisma di un termosifone spento",

  "non sei inutile, potresti servire come esempio",
  "sei il motivo per cui esiste il tasto silenzia",
  "potenziale sprecato? no proprio assente",
  "sei tipo un bug… nessuno capisce perché esisti",
  "se fossi un’app ti disinstallerebbero subito",
  "hai la profondità di una pozzanghera",
  "sei la pubblicità che non si può skippare",
  "il tuo contributo è facoltativo, e si vede",

  "sei il 'ci penso' che diventa mai",
  "hai l’energia di un lunedì mattina",
  "sei la versione beta mai aggiornata",
  "se fossi un piano sarebbe quello fallito",
  "sei il plot twist inutile",
  "sei il caricamento infinito",
  "hai più delay di una connessione nel 2008",

  "se fossi un meme saresti già morto",
  "sei l’errore 404 della personalità",
  "carattere non trovato",
  "personalità in buffering",
  "se fossi interessante lo sapremmo",
  "hai il talento di complicare cose semplici",

  "sei il 'boh' fatto persona",
  "la tua presenza è opzionale",
  "non sei sbagliato… sei proprio fuori contesto",
  "se fossi un suono saresti rumore bianco",
  "sei l’idea che non andava sviluppata",

  "hai il fascino di un antivirus scaduto",
  "sei la versione prova mai acquistata",
  "ti aggiornano ma peggiori",
  "sei la prova che la vita improvvisa",
  "hai più dubbi che qualità",

  "sei la risposta che nessuno ha chiesto",
  "hai l’impatto di un messaggio visualizzato",
  "sei il riassunto fatto male",
  "se fossi una strategia sarebbe 'speriamo bene'",
  "sei l’errore che si ignora",

  "ti impegni o succede e basta?",
  "sei il piano B di te stesso",
  "hai il potenziale di sorprendere… in negativo",
  "sei il 'ma sì dai' della vita",
  "la tua logica è un optional",

  "sei coerente: sempre inutile",
  "sei il finale deludente",
  "hai l’aura di chi non ha voglia nemmeno di provarci",
  "sei la notizia che non interessa",
  "hai il timing di un ritardo cronico",

  "se fossi un oggetto saresti perso",
  "sei la scusa debole",
  "hai più scuse che risultati",
  "sei il 'poi lo faccio'",
  "sei il caricamento che non arriva mai",

  "non deludi, confermi",
  "sei il minimo indispensabile… ma neanche",
  "hai il talento di non lasciare segni",
  "sei il contorno dimenticato",
  "sei la risposta sbagliata detta con sicurezza",

  "hai il fascino di un captcha",
  "sei la complicazione inutile",
  "hai più presenza offline che online",
  "sei il 'chi?' della conversazione",
  "sei il 'mah' collettivo",

  "sei stabile… nel peggior senso",
  "hai l’energia di chi ha già mollato",
  "sei il riempitivo",
  "hai il carisma di una sedia vuota",
  "sei il backup mai usato"

]

let handler = async (m, { conn }) => {

  let who = m.mentionedJid?.[0] || m.quoted?.sender || m.sender

  let img = await conn.profilePictureUrl(who, 'image').catch(_ => null)

  if (!img)
    return m.reply("❌ Nessuna foto trovata")

  let avatar = await jimp.read(img)
  avatar.resize(300, 300)

  let buffer = await avatar.getBufferAsync(jimp.MIME_PNG)

  let frase = frasi[Math.floor(Math.random() * frasi.length)]

  await conn.sendMessage(m.chat, {
    image: buffer,
    caption:
`🪞 𝐒𝐏𝐄𝐂𝐂𝐇𝐈𝐎 𝐃𝐄𝐋𝐋𝐀 𝐕𝐄𝐑𝐈𝐓À

@${who.split('@')[0]}

"${frase}"`,
    mentions: [who]
  })
}

handler.command = /^specchio$/i
handler.group = true

export default handler