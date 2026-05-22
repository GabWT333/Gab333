//Plugin by Gab, Lucifero & 333 staff

let activeQuiz = {}

const questions = [
  { q: "Il semaforo rosso indica arresto del veicolo.", c: true, lvl: "🟢 Facile" },
  { q: "Le strisce pedonali servono per attraversare la strada.", c: true, lvl: "🟢 Facile" },
  { q: "Il clacson serve per segnalare la propria presenza.", c: true, lvl: "🟢 Facile" },
  { q: "La cintura di sicurezza è facoltativa.", c: false, lvl: "🟢 Facile" },
  { q: "Il casco è obbligatorio per i motociclisti.", c: true, lvl: "🟢 Facile" },

  { q: "In autostrada è sempre consentito fermarsi nella corsia di emergenza.", c: false, lvl: "🟡 Medio" },
  { q: "Il sorpasso a destra è sempre vietato.", c: true, lvl: "🟡 Medio" },
  { q: "La distanza di sicurezza dipende dalla velocità del veicolo.", c: true, lvl: "🟡 Medio" },
  { q: "Il triangolo di emergenza va posto a meno di 10 metri dal veicolo.", c: false, lvl: "🟡 Medio" },
  { q: "La linea continua vieta il sorpasso.", c: true, lvl: "🟡 Medio" },
  { q: "In rotatoria ha precedenza chi entra.", c: false, lvl: "🟡 Medio" },
  { q: "Gli pneumatici lisci aumentano l’aderenza sul bagnato.", c: false, lvl: "🟡 Medio" },
  { q: "Il telefono alla guida è consentito se tenuto in mano a veicolo fermo al semaforo.", c: false, lvl: "🟡 Medio" },
  { q: "La segnaletica verticale prevale su quella orizzontale.", c: true, lvl: "🟡 Medio" },
  { q: "L’uso delle cinture posteriori è obbligatorio.", c: true, lvl: "🟡 Medio" },

  { q: "Il sorpasso è consentito in curva se la visibilità è buona.", c: false, lvl: "🔴 Difficile" },
  { q: "In caso di nebbia bisogna usare gli abbaglianti.", c: false, lvl: "🔴 Difficile" },
  { q: "La guida in stato di stanchezza è equiparata a guida pericolosa.", c: true, lvl: "🔴 Difficile" },
  { q: "Il freno a mano può essere usato per fermate di emergenza.", c: true, lvl: "🔴 Difficile" },
  { q: "La precedenza a destra vale sempre anche su strade principali.", c: false, lvl: "🔴 Difficile" },
  { q: "Il limite urbano standard è 50 km/h salvo diversa indicazione.", c: true, lvl: "🔴 Difficile" },
  { q: "In caso di incidente si può abbandonare il veicolo senza avvisare.", c: false, lvl: "🔴 Difficile" },
  { q: "La frenata su strada bagnata richiede maggiore distanza.", c: true, lvl: "🔴 Difficile" },
  { q: "Il sorpasso è vietato in prossimità degli incroci.", c: true, lvl: "🔴 Difficile" },
  { q: "Le luci di posizione bastano per guidare di notte fuori città.", c: false, lvl: "🔴 Difficile" },
  { q: "La cintura posteriore è obbligatoria anche sui sedili vuoti.", c: false, lvl: "🔴 Difficile" },
  { q: "Il segnale triangolare indica sempre obbligo.", c: false, lvl: "🔴 Difficile" }
]

function getQuiz() {
  return [...questions].sort(() => Math.random() - 0.5).slice(0, 10)
}

let handler = async (m, { conn, command }) => {
  if (command !== "quizpatente") return

  activeQuiz[m.sender] = {
    index: 0,
    score: 0,
    quiz: getQuiz(),
    wrong: [], 
    timeout: null
  }

  return sendQuestion(m, conn)
}

function sendQuestion(m, conn) {
  let data = activeQuiz[m.sender]
  if (!data) return

  if (data.index >= data.quiz.length) return finishQuiz(m, conn)

  let q = data.quiz[data.index]

  if (data.timeout) clearTimeout(data.timeout)

  data.timeout = setTimeout(() => {
    delete activeQuiz[m.sender]
    conn.sendMessage(m.chat, {
      text: "⏰ Tempo scaduto. Esame annullato."
    }, { quoted: m })
  }, 30000)

  return conn.sendMessage(m.chat, {
    text:
`🚗 *ESAME PATENTE VERO / FALSO*

📊 Domanda ${data.index + 1}/10
🏷️ ${q.lvl}

❓ ${q.q}

⏱️ 30 secondi.`,
    buttons: [
      { buttonId: ".ansvf true", buttonText: { displayText: "✔️ Vero" }, type: 1 },
      { buttonId: ".ansvf false", buttonText: { displayText: "❌ Falso" }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.before = async (m, { conn }) => {
  let data = activeQuiz[m.sender]
  if (!data) return

  let id =
    m.message?.buttonsResponseMessage?.selectedButtonId ||
    m.msg?.selectedButtonId ||
    m.text

  if (!id?.startsWith(".ansvf")) return

  let ans = id.split(" ")[1] === "true"
  let q = data.quiz[data.index]

  if (ans === q.c) {
    data.score++
  } else {
    data.wrong.push({
      domanda: q.q,
      corretta: q.c ? "✔️ Vero" : "❌ Falso"
    })
  }

  data.index++
  return sendQuestion(m, conn)
}

function finishQuiz(m, conn) {
  let data = activeQuiz[m.sender]
  if (!data) return

  let s = data.score

  let wrongText = data.wrong.length
    ? "\n\n📉 *Errori:*\n" + data.wrong.map((e, i) =>
        `${i + 1}) ${e.domanda}\n✔️ Risposta: ${e.corretta}`
      ).join("\n\n")
    : "\n\n💀 Perfetto… zero errori. Sei inquietante."

  delete activeQuiz[m.sender]

  return conn.sendMessage(m.chat, {
    text:
`🏁 *ESAME TERMINATO*

📊 Punteggio: *${s}/10*
🚗 ${s >= 8 ? "PROMOSSO 🟢" : s >= 5 ? "QUASI 🟡" : "BOCCIATO 🔴"}${wrongText}`
  }, { quoted: m })
}

handler.command = /^quizpatente$/i
export default handler