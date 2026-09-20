//Plugin by Gab, Lucifero & 333 staff

import axios from 'axios';

const langMap = {
  "🇿🇦 Africano": "af",
  "🇦🇱 Albanese": "sq",
  "🇸🇦 Arabo": "ar",
  "🇦🇲 Armeno": "hy",
  "🇦🇿 Azero": "az",
  "🇪🇸 Basco": "eu",
  "🇧🇾 Bielorusso": "be",
  "🇧🇩 Bengalese": "bn",
  "🇧🇬 Bulgaro": "bg",
  "🇪🇸 Catalano": "ca",
  "🇨🇿 Ceco": "cs",
  "🇩🇰 Danese": "da",
  "🇳🇱 Olandese": "nl",
  "🇬🇧 Inglese": "en",
  "🌍 Esperanto": "eo",
  "🇪🇪 Estoniano": "et",
  "🇵🇭 Filippino": "tl",
  "🇫🇮 Finlandese": "fi",
  "🇫🇷 Francese": "fr",
  "🇪🇸 Galiziano": "gl",
  "🇬🇪 Georgiano": "ka",
  "🇩🇪 Tedesco": "de",
  "🇬🇷 Greco": "el",
  "🇮🇳 Gujarati": "gu",
  "🇭🇹 Haitiano": "ht",
  "🇮🇱 Ebraico": "he",
  "🇮🇳 Hindi": "hi",
  "🇭🇺 Ungherese": "hu",
  "🇮🇸 Islandese": "is",
  "🇮🇩 Indonesiano": "id",
  "🇮🇪 Irlandese": "ga",
  "🇮🇹 Italiano": "it",
  "🇯🇵 Giapponese": "ja",
  "🇮🇳 Kannada": "kn",
  "🇰🇷 Coreano": "ko",
  "🇻🇦 Latino": "la",
  "🇱🇻 Lettone": "lv",
  "🇱🇹 Lituano": "lt",
  "🇲🇰 Macedone": "mk",
  "🇮🇳 Malayalam": "ml",
  "🇲🇾 Malese": "ms",
  "🇲🇹 Maltese": "mt",
  "🇳🇴 Norvegese": "no",
  "🇮🇷 Persiano": "fa",
  "🇵🇱 Polacco": "pl",
  "🇵🇹 Portoghese": "pt",
  "🇷🇴 Rumeno": "ro",
  "🇷🇺 Russo": "ru",
  "🇷🇸 Serbo": "sr",
  "🇸🇰 Slovacco": "sk",
  "🇸🇮 Sloveno": "sl",
  "🇪🇸 Spagnolo": "es",
  "🇸🇪 Svedese": "sv",
  "🇰🇪 Swahili": "sw",
  "🇮🇳 Tamil": "ta",
  "🇮🇳 Telugu": "te",
  "🇹🇭 Thai": "th",
  "🇹🇷 Turco": "tr",
  "🇺🇦 Ucraino": "uk",
  "🇵🇰 Urdu": "ur",
  "🇻🇳 Vietnamita": "vi",
  "🇳🇬 Yoruba": "yo",
  "🇿🇦 Zulu": "zu"
};

let handler = async (m, { conn, args }) => {
  if (!args.length) {
    let tutorial = `*🌍 Uso del comando .traduci 🌍*\n`;
    tutorial += `📌 Formato: *.traduci <testo> <lingua>*\n📖 Esempio: *.traduci ciao giapponese*\n\n`;
    tutorial += `🌐 *Lingue supportate:* 🌐\n\n`;

    for (const [nome, codice] of Object.entries(langMap)) {
      tutorial += `🔹 ${nome} = \`${codice}\`\n`;
    }

    return conn.reply(m.chat, tutorial, m);
  }

  if (args.length < 2) {
    return conn.reply(m.chat, `⚠️ Uso corretto: *.traduci <testo> <lingua>*\n📖 Esempio: *.traduci ciao cinese*`, m);
  }

  const text = args.slice(0, -1).join(" ");
  const langInput = args[args.length - 1].toLowerCase();
  const targetLang = Object.values(langMap).includes(langInput) ? langInput : langMap[Object.keys(langMap).find(k => k.toLowerCase().includes(langInput))];

  if (!targetLang) {
    return conn.reply(m.chat, `❌ Lingua non riconosciuta. Usa *.traduci* per vedere la lista delle lingue disponibili.`, m);
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const { data } = await axios.get(url);
    const translatedText = data[0]?.[0]?.[0] || "Nessuna traduzione trovata.";

    return conn.reply(
      m.chat,
      `🌍 *Traduzione:* 🌍\n📌 *Testo originale:* ${text}\n📖 *Lingua di destinazione:* ${langInput} (${targetLang})\n\n🔹 *Risultato:* ${translatedText}`,
      m
    );
  } catch (error) {
    console.error("Errore nella traduzione:", error);
    return conn.reply(m.chat, `❌ Errore nella traduzione. Verifica i parametri e riprova.`, m);
  }
};

handler.help = ['𝐭𝐫𝐚𝐝𝐮𝐜𝐢 <𝐭𝐞𝐬𝐭𝐨> <𝐥𝐢𝐧𝐠𝐮𝐚>'];
handler.tags = ['fun'];
handler.command = /^traduci$/i;

export default handler;