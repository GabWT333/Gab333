//Plugin by Gab, Lucifero & 333 staff

let user = a => '@' + a.split('@')[0]; // Per taggare l'utente

let handler = async (m, { conn, command, groupMetadata }) => {

  const members = groupMetadata.participants.map(u => u.id);


  function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
  }


  const obblighi = [
    'Manda un nudino a una persona a tua scelta e indica a chi lo mandi.',
    'Fatti fare un obbligo da una persona a tua scelta.',
    'Manda una foto del tuo intimo preferito al gruppo.',
    'Decidi con chi fare sexcam del gruppo.',
    'Decidi con chi fare sexchat del gruppo.',
    'Fatti un selfie con le labbra a bacio e mandalo.',
    'Invia un vocale in cui ripeti il nome di chi ti faresti di questo gruppo in modo seducente.',
    'Manda un video dove twerki.',
    'Ricrea il pompino perfetto con una banana o un cetriolo.',
    'Manda un video mentre fai la tua faccia sensuale per rimorchiare.',
    'Dici 3 nomi di persone di questo gruppo che ti faresti.'
  ];


  const verità = [
    'Quante volte ti masturbi al giorno?',
    'Dimmi il massimo numero di persone che ti sei scopat* in tutta la tua vita.',
    'Dimmi il massimo numero di volte che ti sei masturbat* in un giorno.',
    'Ti sei mai scopato o solo fatto pensieri perversi su un ex o il tipo/tipe del tuo amico/amica?',
    'Hai mai rubato i soldi di tua madre o di tuo padre? La ragione?',
    'Sei vergine? Se no, racconta la tua prima volta e dagli un voto da 1 a 10.',
    'Chi è la persona più influente nella tua vita?',
    'Racconta la scopata più imbarazzante che hai fatto.',
    'Chi è la persona che ti fa arrapare più di tutti?',
    'Qual è la tua posizione sessuale preferita?',
    'Dici 3 nomi di persone di questo gruppo che ti faresti.'
  ];


  const scelto = pickRandom(members);
  

  if (command === 'bottiglia') {
    const scelta = pickRandom(['obbligo', 'verità']);
    const contenuto = scelta === 'obbligo' ? pickRandom(obblighi) : pickRandom(verità);

    conn.reply(
      m.chat,
      `🎉 *Gioco della Bottiglia* 🎉\n\nLa bottiglia punta a ${user(scelto)}!\n\n🔹 Tipo: *${scelta.toUpperCase()}*\n🔸 Obbligo/Verità: ${contenuto}`,
      null,
      { mentions: [scelto] }
    );
  }
};

handler.command = ['bottiglia']; 
handler.help = ['𝐛𝐨𝐭𝐭𝐢𝐠𝐥𝐢𝐚'];
handler.tags = ['fun'];
handler.group = true; // Solo nei gruppi
export default handler;