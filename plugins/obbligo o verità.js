//Plugin by Gab, Lucifero & 333 staff

let user = a => '@' + a.split('@')[0]
  let handler = async (m, { conn, command, text, groupMetadata, usedPrefix, args}) => {



  if (command == 'obbligo') { 
 conn.reply(m.chat, `══════ ೋೋ ═════\n${pickRandom(['manda un nudino ad una persona a tua scelta e dici a chi lo mandi','fatti fare un obbligo da una persona a tua scelta','manda foto del tuo intimo preferito al gruppo','decidi con chi fare sexcam del gruppo','decidi con chi fare sexchat del gruppo','Fatti un selfie con le labbra a bacio a mandalo','Invia un vocale in cui ripeti il mio nome di chi ti faresti di questo gruppo in modo seducente','manda un video dove twerki','Ricrea il pompino perfetto con una banana o un cetriolo.','manda un video mentre fai la tua faccia sensuale per rimorchiare','dici 3 nomi di persone di questo gruppo che ti faresti'])}\n═════•⊰✰⊱•═════`)
function pickRandom(list) {
return list[Math.floor(Math.random() * list.length)]}
}

 if (command == 'verità') {
  conn.reply(m.chat, `══════ ೋೋ ═════\n${pickRandom(['quante volte ti masturbi al giorno?','dimmi il massimo numero di persone che ti sei scopat* in tutta la tua vita','dimmi il massimo numero di vote che ti sei masturbat* in un giorno','ti sei mai scopato o solo fatto pensieri perversi su un ex o il tipo/tipe del tuo amico/amica?','Hai mai rubato i soldi di tua madre o di tuo padre? La ragione?','cosa ti rende felice quando sei triste?','sei vergine? se è un no racconta la volta tua prima volta e dagli un voto da 1 a 10','chi è la persona più influente nella tua vita?','racconta la scopata più imbarazzante che hai fatto','chi è la persona che ti fa arrapare più di tutti?', 'dici 3 nomi di persone di questo gruppo che ti faresti','Chi è il più vicino al tuo tipo di partner ideale qui?','preferisci essere sottomess* o dominare a letto?','dicci un fetish strano che hai','dicci un fetish vhe fai sempre quando scopi','dicci un tuo sogno erotico','Qual è la cosa più strana che ti è capitata in camera da letto?','Hai mai giocato a strip poker? se si con chi? se no con chi lo faresti in questa stanza?','Qual è la tua frase da rimorchio più sexy?','Che tipo di abbigliamento ti eccita di più?','il posto più strano dove hai scopato?', ' con chi faresti la doccia di questo gruppo?','Qual è la tua posizione sessuale preferita?','Qual è la cosa più sconcia che hai pensato di qualcuno di questo gruppo? ovviamente dici il nome','Quale posizione sessuale hai sempre voluto provare, ma non ne hai mai avuto occasione di farla?','Hai mai fatto sesso in pubblico?','Guardi i porno? se si che categoria?','hai mai visto un porno non etero? se si racconta','Registreresti mai un video hard?','Hai mai fatto sesso con più di una persona alla volta?','da chi ti farebbe piacere ricevere una foto hot o nudini di questo gruppo?','chi è l admin con cui faresti zozzerie?'])}\n══════ ೋೋ ═════`)
function pickRandom(list) {
return list[Math.floor(Math.random() * list.length)]}
}}
handler.command = ['obbligo', 'verità']
handler.group = true
export default handler