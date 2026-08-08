//Plugin by Gab, Lucifero & 333 staff

let quizDB = [

{ domanda: "Chi vinse il Mondiale 2006?", risposte: ["Italia","Francia","Germania","Brasile"], corretta: "Italia" },
{ domanda: "Chi segnò nella finale Mondiale 2014 il gol decisivo?", risposte: ["Gotze","Muller","Kroos","Ozil"], corretta: "Gotze" },
{ domanda: "Chi vinse Champions 2004?", risposte: ["Porto","Milan","Monaco","Real Madrid"], corretta: "Porto" },
{ domanda: "Chi eliminò il Barcellona nel 2010 UCL?", risposte: ["Inter","Chelsea","Arsenal","United"], corretta: "Inter" },
{ domanda: "Chi vinse Serie A 2001-02?", risposte: ["Juventus","Inter","Roma","Lazio"], corretta: "Juventus" },
{ domanda: "Capocannoniere Mondiale 2002?", risposte: ["Ronaldo","Rivaldo","Klose","Ronaldinho"], corretta: "Ronaldo" },
{ domanda: "Chi vinse UCL 2013?", risposte: ["Bayern","Dortmund","Real Madrid","Chelsea"], corretta: "Bayern" },
{ domanda: "Chi vinse Pallone d’Oro 2004?", risposte: ["Shevchenko","Ronaldinho","Henry","Nedved"], corretta: "Shevchenko" },
{ domanda: "Chi segnò il gol vittoria UCL 2014?", risposte: ["Ramos","Bale","CR7","Di Maria"], corretta: "Ramos" },
{ domanda: "Chi vinse Mondiale 2010?", risposte: ["Spagna","Olanda","Germania","Brasile"], corretta: "Spagna" },
{ domanda: "Chi era capitano Milan 2007?", risposte: ["Maldini","Gattuso","Nesta","Pirlo"], corretta: "Maldini" },
{ domanda: "Chi segnò Golden Goal Euro 2000?", risposte: ["Trezeguet","Henry","Zidane","Wiltord"], corretta: "Trezeguet" },
{ domanda: "Chi segnò 5 gol in UCL 2012 contro Leverkusen?", risposte: ["Messi","CR7","Lewandowski","Benzema"], corretta: "Messi" },
{ domanda: "Prima Premier League vincitore?", risposte: ["Man United","Arsenal","Liverpool","Leeds"], corretta: "Man United" },
{ domanda: "Chi allenava Inter Triplete?", risposte: ["Mourinho","Mancini","Benitez","Ranieri"], corretta: "Mourinho" },
{ domanda: "Chi è Il Fenomeno?", risposte: ["Ronaldo Nazario","Ronaldinho","Messi","CR7"], corretta: "Ronaldo Nazario" },
{ domanda: "Chi vinse Copa America 2011?", risposte: ["Uruguay","Argentina","Brasile","Cile"], corretta: "Uruguay" },
{ domanda: "Chi segnò finale Champions 1999 gol decisivo?", risposte: ["Solskjaer","Giggs","Beckham","Cole"], corretta: "Solskjaer" },
{ domanda: "Quale squadra perse la finale UCL 2020?", risposte: ["PSG", "Bayern", "City", "Atletico"], corretta: "PSG" },
{ domanda: "Chi segnò nella finale UCL 2005 per il Liverpool?", risposte: ["Gerrard", "Torres", "Suarez", "Owen"], corretta: "Gerrard" },
{ domanda: "Chi vinse il Mondiale 1998?", risposte: ["Francia", "Brasile", "Italia", "Germania"], corretta: "Francia" },
{ domanda: "Chi fu capocannoniere Mondiale 2014?", risposte: ["James Rodriguez", "Messi", "Muller", "Neymar"], corretta: "James Rodriguez" },
{ domanda: "Quanti gol fece Klose nei Mondiali totali?", risposte: ["14", "15", "16", "17"], corretta: "16" },
{ domanda: "Chi segnò il gol vittoria Mondiale 2014?", risposte: ["Gotze", "Muller", "Kroos", "Schurrle"], corretta: "Gotze" },
{ domanda: "Chi vinse la Serie A 2011-12?", risposte: ["Juventus", "Milan", "Inter", "Napoli"], corretta: "Juventus" },
{ domanda: "Chi vinse la Serie A 2022-23?", risposte: ["Napoli", "Inter", "Milan", "Lazio"], corretta: "Napoli" },
{ domanda: "Chi era il capitano della Roma 2001?", risposte: ["Totti", "De Rossi", "Batistuta", "Montella"], corretta: "Totti" },
{ domanda: "Chi vinse il Pallone d’Oro 2018?", risposte: ["Modric", "Ronaldo", "Messi", "Griezmann"], corretta: "Modric" },
{ domanda: "Chi segnò più gol nella storia del Real Madrid?", risposte: ["Cristiano Ronaldo", "Raul", "Benzema", "Di Stefano"], corretta: "Cristiano Ronaldo" },
{ domanda: "In quale club esplose Haaland?", risposte: ["Salzburg", "Molde", "Dortmund", "Leeds"], corretta: "Salzburg" },
{ domanda: "Quale squadra vinse la prima Coppa dei Campioni?", risposte: ["Real Madrid", "Benfica", "Milan", "Ajax"], corretta: "Real Madrid" },
{ domanda: "Chi allenava il Leicester 2016?", risposte: ["Ranieri", "Mourinho", "Wenger", "Klopp"], corretta: "Ranieri" }

]

let handler = async (m, { conn, args, usedPrefix }) => {

global.quizGame = global.quizGame || {}
global.quizPoints = global.quizPoints || {}
global.quizTimer = global.quizTimer || {}

let chat = m.chat
let user = m.sender

if (args[0]?.toLowerCase() === "classifica") {

let points = global.quizPoints[chat] || {}
let ranking = Object.entries(points).sort((a,b)=>b[1]-a[1]).slice(0,10)

if (!ranking.length) return m.reply("Nessun punteggio")

let text = "🏆 CLASSIFICA QUIZ CALCIO\n\n"

for (let i=0;i<ranking.length;i++){
let name = await conn.getName(ranking[i][0])
text += `${i+1}. ${name} — ${ranking[i][1]} punti\n`
}

return m.reply(text)
}

let risposta = args[0]?.toUpperCase()

if (["A","B","C","D"].includes(risposta)) {

let game = global.quizGame[chat]
if (!game) return m.reply("Nessun quiz attivo")

if (user !== game.creator) return m.reply("⛔ Solo chi ha avviato il quiz può rispondere")

let index = ["A","B","C","D"].indexOf(risposta)

if (game.risposte[index] === game.corretta) {

clearTimeout(global.quizTimer[chat])
delete global.quizTimer[chat]
delete global.quizGame[chat]

global.quizPoints[chat] = global.quizPoints[chat] || {}
global.quizPoints[chat][user] = (global.quizPoints[chat][user] || 0) + 10

return m.reply("✅ CORRETTO +10 punti\n> usa .quizcalcio classifica per vedere la classifica")
} else {
clearTimeout(global.quizTimer[chat])
delete global.quizTimer[chat]
delete global.quizGame[chat]

return m.reply(`❌ Sbagliato\nRisposta: ${game.corretta}`)
}
}

if (global.quizGame[chat]) return m.reply("Quiz già attivo!")

let q = quizDB[Math.floor(Math.random()*quizDB.length)]

global.quizGame[chat] = { ...q, creator: user }

await conn.sendMessage(chat, {
text: `⚽ QUIZ CALCIO\n\n${q.domanda}\n\n⏱ 20 secondi\n👤 Solo chi avvia può rispondere`,
buttons: [
{ buttonId: `${usedPrefix}quizcalcio A`, buttonText: { displayText: `A) ${q.risposte[0]}` }, type: 1 },
{ buttonId: `${usedPrefix}quizcalcio B`, buttonText: { displayText: `B) ${q.risposte[1]}` }, type: 1 },
{ buttonId: `${usedPrefix}quizcalcio C`, buttonText: { displayText: `C) ${q.risposte[2]}` }, type: 1 },
{ buttonId: `${usedPrefix}quizcalcio D`, buttonText: { displayText: `D) ${q.risposte[3]}` }, type: 1 }
],
headerType: 1
}, { quoted: m })

global.quizTimer[chat] = setTimeout(()=>{

if (global.quizGame[chat]) {

conn.sendMessage(chat,{
text:`⏰ Tempo scaduto!\nRisposta: ${q.corretta}`
})

delete global.quizGame[chat]
delete global.quizTimer[chat]

}

},20000)

}

handler.command = ["quizcalcio"]
export default handler