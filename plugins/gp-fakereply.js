// Codice elaborato da: https://github.com/ChatUnity

import fetch from 'node-fetch';
import fs from 'fs';
const fantasyAddPath = './fantasyAdd.json';
let fantasyAddData = [];

let handler = async (m, { command, usedPrefix, conn, text }) => {
  const helpMessage = `
> *Fantasy - Aggiungi personaggio*

_Questo comando ti permette di aggiungere nuovi personaggi al database._

*Uso:*
\`${usedPrefix + command}\` link + nome + origine + info + classe + tipo

*Parametri:*
\`url:\` » Link dell'immagine (deve iniziare con 'https://telegra.ph/file/').\n
\`name\` » Nome dell'anime o del personaggio (prima lettera di ogni parola in maiuscolo).\n
\`desp\` » Origine del personaggio (Nome dell'Anime, serie, film, ecc...\n
\`info\` » Fornisci una breve descrizione del personaggio.\n
\`class\` » Classe del personaggio (Comune, Poco Comune, Raro, Epico, Leggendario, Sacro, Supremo, o Trascendentale).\n
\`type\` » Etichette del personaggio, separate da ":" o ";" o "/" (prima lettera di ogni etichetta in maiuscolo).

> *Nota*
> _Per ottenere il link dell'immagine puoi usare il comando *${usedPrefix}tourl* rispondendo all'immagine, oppure puoi migliorare la qualità dell'immagine rispondendo all'immagine con *${usedPrefix}hd*_

*Esempio:*
\`${usedPrefix + command}\` https://telegra.ph/file/abcd1234.jpg + Son Goku + Dragon Ball + Son Goku è il protagonista principale della serie Dragon Ball. È un Saiyan inviato sulla Terra da bambino con la missione di conquistare il pianeta, ma a causa di un colpo alla testa perde la memoria e diventa un eroe. + Epico + Avventura / Azione
`.trim();

  if (!text) return conn.reply(m.chat, helpMessage, m);

  try {
    if (fs.existsSync(fantasyAddPath)) {
      const data = fs.readFileSync(fantasyAddPath, 'utf8');
      fantasyAddData = JSON.parse(data);
    }

    const [url, name, desp, info, classInput, typeInput] = text.split('+').map((item) => item.trim());
    if (!url || !name || !desp || !info || !classInput || !typeInput) {
      return conn.reply(m.chat, '> *Parametri mancanti.* Assicurati di fornire tutti i dati richiesti.', m);
    }

    if (!url.startsWith('https://telegra.ph/file/')) {
      return conn.reply(m.chat, '> *Inserisci un link valido per l\'immagine!*\n\n*Esempio:*\nhttps://telegra.ph/file/13739fe030f0a5c8cdd9c.jpg', m);
    }

    const formattedName = name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
    const formattedDesp = desp;
    const formattedInfo = info.replace(/"/g, "'");

    const validClasses = ['Comune', 'Poco Comune', 'Raro', 'Epico', 'Leggendario', 'Sacro', 'Supremo', 'Trascendentale'];
    const formattedClass = classInput.trim().toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    if (!validClasses.includes(formattedClass)) {
      return conn.reply(m.chat, `> *Classe non valida!* Sono accettate solo le seguenti:\n\n\`Comune, Poco Comune, Raro, Epico, Leggendario, Sacro, Supremo, Trascendentale\``, m);
    }

    const formattedType = typeInput.split(/[:;/]/).map((item) => item.trim().toLowerCase()).map((item) => item.replace(/^\w/, (c) => c.toUpperCase())).join(', ');

    const jsonURL = 'https://raw.githubusercontent.com/ChatUnity/module/main/imagen_json/anime.json';
    const response = await fetch(jsonURL);
    const data = await response.json();
    const nextIndex = data.infoImg.length + 1;

    let price;
    switch (formattedClass) {
      case 'Comune':
        price = Math.floor(Math.random() * (200 - 100 + 1) + 100);
        break;
      case 'Poco Comune':
        price = Math.floor(Math.random() * (500 - 300 + 1) + 300);
        break;
      case 'Raro':
        price = Math.floor(Math.random() * (700 - 600 + 1) + 600);
        break;
      case 'Epico':
        price = Math.floor(Math.random() * (1500 - 800 + 1) + 800);
        break;
      case 'Leggendario':
        price = Math.floor(Math.random() * (3000 - 1600 + 1) + 1600);
        break;
      case 'Sacro':
        price = Math.floor(Math.random() * (9999 - 3100 + 1) + 3100);
        break;
      case 'Supremo':
        price = Math.floor(Math.random() * (30000 - 10000 + 1) + 10000);
        break;
      case 'Trascendentale':
        price = Math.floor(Math.random() * (999999 - 30000 + 1) + 30000);
        break;
      default:
        break;
    }

    const codigoImagen = generarCodigo();

    fantasyAddData.push({
      index: true,
      url,
      name: formattedName,
      desp: formattedDesp,
      info: formattedInfo,
      class: formattedClass,
      type: formattedType,
      price,
      code: codigoImagen,
    });

    fs.writeFileSync(fantasyAddPath, JSON.stringify(fantasyAddData, null, 2), 'utf8');
    const reply = await conn.reply(m.chat, '> *Personaggio aggiunto con successo!*\n\nRispondi a questo messaggio con "invia" o "👍" solo se desideri inviare i personaggi ai miei creatori per aggiungerli a *chatunity-bot*.', m);

    handler.before = async function (m, { conn }) {
      if (m.quoted && m.quoted.id === reply.id && ['invia', '👍'].includes(m.text.toLowerCase())) {
        const databaseFantasyAdd = Buffer.from(JSON.stringify(fantasyAddData, null, 2), 'utf-8');
        const jsonString = JSON.stringify(fantasyAddData, null, 2);
        await conn.reply('393515533859@s.whatsapp.net', `*Richiesta di @${m.sender.split("@")[0]} per aggiungere personaggi di Fantasy RPG in chatunity-bot*`, null, { mentions: [m.sender] });
        await conn.sendMessage('393515533859@s.whatsapp.net', { document: databaseFantasyAdd, mimetype: 'application/json', fileName: `fantasyAdd_${m.sender}.json` }, { quoted: m });
        await conn.reply('393515533859@s.whatsapp.net', `${jsonString}`, m);
        await conn.reply(m.chat, `File inviato ai miei creatori! Continua ad aggiungere altri personaggi che desideri vedere in chatunity-bot`, m);
      }
    };
  } catch (error) {
    console.error('Errore durante l\'elaborazione della richiesta: ', error);
    conn.reply(m.chat, 'Si è verificato un errore durante l\'elaborazione della richiesta!', m);
  }
};

function generarCodigo() {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const numeros = '0123456789';
  const caratteresEspeciales = '#@%_*!^<';
  let codigo = '';
  for (let i = 0; i < 3; i++) {
    codigo += letras.charAt(Math.floor(Math.random() * letras.length));
  }
  for (let i = 0; i < 2; i++) {
    codigo += numeros.charAt(Math.floor(Math.random() * numeros.length));
  }
  for (let i = 0; i < 1; i++) {
    codigo += caratteresEspeciales.charAt(Math.floor(Math.random() * caratteresEspeciales.length));
  }
  codigo = codigo.split('').sort(() => Math.random() - 0.5).join('');
  return codigo;
}

handler.command = /^(fantasyadd|fyadd|fyagregar)$/i;
export default handler;