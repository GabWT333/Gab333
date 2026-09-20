//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { text }) => {

  if (!text) return m.reply("📱 Scrivi il tuo telefono\n> es: .telefono iphone 13")

  let t = text.toLowerCase()

  let telefoniValidi = ["iphone", "samsung", "xiaomi", "huawei", "oppo", "realme"]

  let valido = telefoniValidi.some(v => t.includes(v))

  if (!valido) {
    return m.reply("❌ Quello non è un telefono, coglione.")
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
  }

  const iphone = [
    "💸 Hai speso uno stipendio intero per un telefono che fa le stesse cose di quello dell’anno scorso, ma hey… la fotocamera è *leggermente* migliore.",
    "📸 Vivi per le storie Instagram. Se non hai postato, non è mai successo davvero.",
    "🔋 La batteria è il tuo peggior nemico. Vivi con l’ansia del 20% come fosse un countdown nucleare.",
    "🧠 Usi la parola 'ecosistema' per giustificare qualsiasi scelta discutibile.",
    "😎 Ti senti superiore… senza un vero motivo valido, ma funziona lo stesso.",
    "🎧 Hai perso almeno un AirPods e hai fatto finta di niente.",
    "📦 Cambi iPhone ogni anno ma non sapresti dire cosa è cambiato.",
    "💳 Stai pagando rate infinite, ma almeno il telefono è lucido.",
    "🪫 Spegni il telefono al 5% come se stessi salvando la tua vita.",
    "📱 Se cade, piangi. Se si rompe, neghi."
  ]

  const samsung = [
    "🧠 Sei quello tecnico del gruppo che nessuno ha chiesto, ma che tutti usano.",
    "⚙️ Hai modificato impostazioni che nemmeno Samsung conosce.",
    "📱 Il tuo telefono può fare tutto… ma usi sempre le stesse 3 app.",
    "🔋 Hai la batteria infinita ma comunque lo metti in carica al 40%.",
    "📸 Hai zoomato la luna almeno una volta nella tua vita.",
    "🤓 Leggi specifiche tecniche per divertimento, e un po’ mi preoccupi.",
    "😐 Litighi con gli utenti iPhone come se fosse una guerra personale.",
    "🛠 Ti senti hacker solo perché hai attivato le opzioni sviluppatore.",
    "📊 Sai tutto del telefono, ma non rispondi ai messaggi.",
    "📱 Ogni anno dici: 'questo è quello definitivo'… non è vero."
  ]

  const xiaomi = [
    "💰 Hai speso poco e lo dici a tutti come fosse una missione.",
    "📊 Hai visto 47 recensioni prima di comprarlo. Nessuna fiducia nel mondo.",
    "🔧 Hai già modificato qualcosa entro le prime 24 ore.",
    "📱 Il rapporto qualità/prezzo è la tua religione ufficiale.",
    "😎 Ti senti più intelligente degli altri… e onestamente, forse sì.",
    "⚡ È veloce, ma ogni tanto fa cose strane e tu fingi sia normale.",
    "📉 Le pubblicità nelle app ti hanno temprato come guerriero.",
    "🧠 Sai più tu del telefono che chi lo ha progettato.",
    "📦 Hai aspettato offerte, sconti, cashback… rispetto.",
    "💀 Ogni aggiornamento è un salto nel vuoto."
  ]

  const huawei = [
    "🚫 Vivi senza Google e ormai è una scelta di vita.",
    "📸 Fai foto assurde, ma poi non puoi condividerle facilmente.",
    "😐 Ogni app è una piccola battaglia personale.",
    "🧠 Hai sviluppato una resilienza che pochi capiscono.",
    "📱 Ottimo telefono… in un universo parallelo.",
    "💀 Installi apk strani come se fosse normale.",
    "🔧 Hai trovato workaround per tutto. Sei sopravvissuto.",
    "😎 Hai fatto una scelta coraggiosa, o forse ti sei complicato la vita.",
    "📦 Lo difendi anche quando non dovresti.",
    "⚠️ Il Play Store è un ricordo lontano."
  ]

  const altri = [
    "👤 Nessuno sa che telefono hai, nemmeno tu a volte.",
    "📱 Probabilmente lagga, ma ti sei abituato.",
    "💀 Esiste ancora quel modello? Impressionante.",
    "🧓 Sembra uscito da un museo della tecnologia.",
    "📦 L’hai trovato in offerta o per disperazione.",
    "😐 Funziona… più o meno… nei giorni buoni.",
    "🔋 La batteria dura tanto perché lo usi poco.",
    "🤨 Nome del modello impronunciabile.",
    "📉 Supporto ufficiale? Mai sentito.",
    "🗿 È praticamente un reperto storico."
  ]

  let frase = ""

  if (t.includes("iphone")) frase = pickRandom(iphone)
  else if (t.includes("samsung")) frase = pickRandom(samsung)
  else if (t.includes("xiaomi")) frase = pickRandom(xiaomi)
  else if (t.includes("huawei")) frase = pickRandom(huawei)
  else frase = pickRandom(altri)

  let voto = Math.floor(Math.random() * 10) + 1

  let risposta = `
╭━ 📱 𝐀𝐍𝐀𝐋𝐈𝐒𝐈 𝐓𝐄𝐋𝐄𝐅𝐎𝐍𝐎 ━╮

📲 𝐃𝐢𝐬𝐩𝐨𝐬𝐢𝐭𝐢𝐯𝐨:
➤ ${text}

🧠 𝐏𝐫𝐨𝐟𝐢𝐥𝐨 𝐮𝐭𝐞𝐧𝐭𝐞:
➤ ${frase}

📊 𝐕𝐚𝐥𝐮𝐭𝐚𝐳𝐢𝐨𝐧𝐞:
➤ ${voto}/10

╰━━━━━━━━━━━━╯
> *BY 333 BOT*
`

  m.reply(risposta.trim())
}

handler.command = ['telefono']
export default handler