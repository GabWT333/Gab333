//Plugin by Gab, Lucifero & 333 staff

import fetch from "node-fetch";

async function handler(m, { conn, args }) {
  const city = args.join(" ");
  if (!city) return conn.sendMessage(m.chat, { text: "❗ 𝐒𝐜𝐫𝐢𝐯𝐢 𝐚𝐧𝐜𝐡𝐞 𝐥𝐚 𝐜𝐢𝐭𝐭𝐚̀!, 𝐄𝐬𝐞𝐦𝐩𝐢𝐨: `.𝐜𝐚𝐥𝐞𝐧𝐝𝐚𝐫𝐢𝐨 𝐑𝐨𝐦𝐚`" }, { quoted: m });

  const API_KEY = "060a6bcfa19809c2cd4d97a212b19273";

  let meteoData;
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&lang=it&appid=${API_KEY}`;
    const resp = await fetch(url);
    meteoData = await resp.json();
    if (!meteoData || meteoData.cod !== 200) throw new Error();
  } catch {
    return conn.sendMessage(m.chat, { text: "❌ Impossibile ottenere il meteo per quella città." }, { quoted: m });
  }

  const { weather, main } = meteoData;
  const desc = weather[0]?.description || "nessuna info";
  const temp = main?.temp !== undefined ? `${main.temp.toFixed(1)}°C` : "sconosciuta";

  const now = new Date();
  const options = {
    timeZone: "Europe/Rome",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  };
  const fmt = new Intl.DateTimeFormat("it-IT", options);
  const parts = fmt.formatToParts(now);
  const get = (type) => parts.find((p) => p.type === type)?.value;

  const giornoSettimana = get("weekday");
  const giorno = get("day");
  const mese = get("month");
  const anno = get("year");
  const ora = get("hour");
  const minuto = get("minute");
  const secondo = get("second");

  function calcPasqua(year) {
    const f = Math.floor,
      G = year % 19,
      C = f(year / 100),
      H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30,
      I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11)),
      J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
      L = I - J,
      month = 3 + f((L + 40) / 44),
      day = L + 28 - 31 * f(month / 4);
    return new Date(year, month - 1, day);
  }

  const pasqua = calcPasqua(Number(anno));
  const pasquetta = new Date(pasqua);
  pasquetta.setDate(pasqua.getDate() + 1);

  const festeFisse = {
    "1-1": "Capodanno 🎉",
    "6-1": "Epifania 🧙‍♀️",
    "25-4": "Festa della Liberazione",
    "1-5": "Festa dei Lavoratori 👷",
    "2-6": "Festa della Repubblica 🇮🇹",
    "21-6": "Estate ☀️",
    "15-8": "Ferragosto 🌊",
    "1-11": "Ognissanti",
    "8-12": "Immacolata Concezione",
    "25-12": "Natale 🎄",
    "26-12": "Santo Stefano"
  };

  let festivita = "Nessuna";

  const oggi = new Date();
  const meseCorrente = oggi.getMonth() + 1;
  const keyDate = `${giorno}-${meseCorrente}`;

  if (festeFisse[keyDate]) festivita = festeFisse[keyDate];

  if (
    Number(giorno) === pasqua.getDate() &&
    meseCorrente === pasqua.getMonth() + 1
  ) {
    festivita = "Pasqua";
  } else if (
    Number(giorno) === pasquetta.getDate() &&
    meseCorrente === pasquetta.getMonth() + 1
  ) {
    festivita = "Pasquetta";
  }

  const text = `
╔════════════╗
║ 📅 𝐂𝐀𝐋𝐄𝐍𝐃𝐀𝐑𝐈𝐎 𝟑𝟑𝟑
╠════════════╣
║ 🗓 𝐆𝐢𝐨𝐫𝐧𝐨: *${giornoSettimana}*
║ 📆 𝐃𝐚𝐭𝐚: *${giorno} ${mese} ${anno}*
║ 🕒 𝐎𝐫𝐚: *${ora}:${minuto}:${secondo}*
║ 🎉 𝐅𝐞𝐬𝐭𝐢𝐯𝐢𝐭𝐚̀: *${festivita}*
╠════════════╣
║ ☁️ 𝐌𝐞𝐭𝐞𝐨 𝐝𝐢 *${meteoData.name}:*
║ 🌡 𝐓𝐞𝐦𝐩𝐞𝐫𝐚𝐭𝐮𝐫𝐚: *${temp}*
║ 🧭 𝐂𝐨𝐧𝐝𝐢𝐳𝐢𝐨𝐧𝐢: *${desc}*
╚════════════╝
  `.trim();

  conn.sendMessage(m.chat, { text }, { quoted: m });
}

handler.command = /^calendario$/i;
handler.tags = ["utility", "fun"];
handler.help = ["calendario <città>"];
export default handler;