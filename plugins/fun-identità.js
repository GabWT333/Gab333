//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn }) => {

  let target = m.mentionedJid?.[0] || m.quoted?.sender || m.sender
  let tag = "@" + target.split("@")[0]

  const rand = (arr) => arr[Math.floor(Math.random() * arr.length)]

  const jobs = [
    "Rubatore seriale di Wi-Fi",
    "Esperto di problemi inutili",
    "Programmatore di bug",
    "Influencer senza pubblico",
    "Tester di fallimenti",
    "Professionista del procrastinare",
    "Streamer senza stream",
    "Consulente del nulla"
  ]

  const crimes = [
    "Ha risposto 'ok' dopo 4 ore",
    "Ha ghostato senza motivo",
    "Ha mandato vocali da 5 minuti inutili",
    "Ha detto 'arrivo' ed è sparito",
    "Ha cagato sul muro",
    "Ha scritto e cancellato 12 volte",
    "Ha letto e ignorato",
    "Ha fatto finta di capire"
  ]

  const iq = Math.floor(Math.random() * 120)
  const respect = Math.floor(Math.random() * 100)
  const luck = Math.floor(Math.random() * 100)
  const danger = Math.floor(Math.random() * 100)
  const social = Math.floor(Math.random() * 100)

  const qualities = [
    "Confuso ma determinato",
    "Inutile ma costante",
    "Caos vivente",
    "Energia da NPC",
    "Genio incompreso (solo da lui)",
    "Stranamente convinto"
  ]

  const defects = [
    "Lag mentale permanente",
    "Decisioni sempre sbagliate",
    "Non capisce nemmeno quello che scrive",
    "Autostima basata su illusioni",
    "Fa domande e si risponde male",
    "Parla tanto, conclude zero"
  ]

  const secrets = [
    "Controlla chi è online senza scrivere",
    "Cancella i messaggi sperando nessuno li abbia letti",
    "Rilegge chat vecchie di anni",
    "Scrive… poi cancella sempre",
    "Finge di capire",
    "Aspetta che scrivano gli altri"
  ]

  const futures = [
    "Farà una scelta sbagliata e darà la colpa al destino",
    "Dirà 'domani cambio' e non cambierà nulla",
    "Inizierà qualcosa e lo lascerà a metà",
    "Avrà un’idea geniale… ignorata",
    "Rimanderà tutto ancora"
  ]

  const insults = [
    "Sei il bug che nessuno vuole fixare",
    "Hai il carisma di un aggiornamento di sistema",
    "Se fossi un’app saresti disinstallata",
    "Sei un NPC anche nei sogni",
    "Hai meno stabilità di una connessione nel 2008",
    "Sei la prova vivente che qualcosa è andato storto"
  ]

  const addictions = [
    "Scroll infinito senza motivo",
    "Controllare chat senza scrivere",
    "Aprire app a caso",
    "Pensare troppo e fare poco",
    "Guardare storie e non reagire"
  ]

  const fears = [
    "Essere ignorato",
    "Rispondere subito e sembrare disperato",
    "Fare una figura di merda",
    "Scrivere e non ricevere risposta",
    "Essere troppo sincero"
  ]

  const text =
`╔═🪪 𝐈𝐃𝐄𝐍𝐓𝐈𝐓𝐀̀ 𝐒𝐄𝐆𝐑𝐄𝐓𝐀 ═╗
┃
┃ 👤 𝐒𝐨𝐠𝐠𝐞𝐭𝐭𝐨: ${tag}
┃
┃ 💼 𝐋𝐚𝐯𝐨𝐫𝐨: ${rand(jobs)}
┃
┃ 🚨 𝐂𝐫𝐢𝐦𝐢𝐧𝐞:
┃ ${rand(crimes)}
┃
┃ 📊 𝐒𝐭𝐚𝐭𝐢𝐬𝐭𝐢𝐜𝐡𝐞:
┃ 🧠 𝐈𝐐: ${iq}
┃ 🏆 𝐑𝐈𝐒𝐏𝐄𝐓𝐓𝐎: ${respect}%
┃ 🍀 𝐅𝐎𝐑𝐓𝐔𝐍𝐀: ${luck}%
┃ ⚠️ 𝐏𝐄𝐑𝐈𝐂𝐎𝐋𝐎𝐒𝐈𝐓𝐀̀: ${danger}%
┃ 💬 𝐒𝐎𝐂𝐈𝐀𝐋: ${social}%
┃
┃ 🧠 𝐏𝐞𝐫𝐬𝐨𝐧𝐚𝐥𝐢𝐭𝐚̀:
┃ ${rand(qualities)}
┃
┃ ⚠️ 𝐃𝐢𝐟𝐞𝐭𝐭𝐨:
┃ ${rand(defects)}
┃
┃ 🤫 𝐒𝐞𝐠𝐫𝐞𝐭𝐨:
┃ ${rand(secrets)}
┃
┃ 📱 𝐃𝐢𝐩𝐞𝐧𝐝𝐞𝐧𝐳𝐚:
┃ ${rand(addictions)}
┃
┃ 😨 𝐏𝐚𝐮𝐫𝐚:
┃ ${rand(fears)}
┃
┃ 🔮 𝐅𝐮𝐭𝐮𝐫𝐨:
┃ ${rand(futures)}
┃
┃ 💀 𝐕𝐞𝐫𝐢𝐭𝐚̀:
┃ "${rand(insults)}"
┃
╚══════════════╝`

  conn.sendMessage(m.chat, {
    text,
    mentions: [target]
  }, { quoted: m })
}

handler.command = /^identita$/i
export default handler