//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return conn.sendMessage(m.chat, {
      text: `⚠️ Uso: *${usedPrefix}${command} +prefisso numero*\n📌 Esempio: ${usedPrefix}${command} +39 3401234567`
    }, { quoted: m })
  }

  const numero = args.join(' ').trim()

  await conn.sendMessage(m.chat, {
    text: `⏳ Controllo *${numero}* in corso...\n_Attendere circa 10 secondi_`
  }, { quoted: m })

  try {
    const res = await fetch(`https://333wt.it/api/scrape?n=${encodeURIComponent(numero)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(30000)
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const data = await res.json()

    const risultato = data.isBanned
      ? `🚫 *BANNATO*\n📞 ${numero}`
      : `✅ *ATTIVO*\n📞 ${numero}`

    await conn.sendMessage(m.chat, { text: risultato }, { quoted: m })

  } catch (e) {
    await conn.sendMessage(m.chat, {
      text: `❌ Errore: ${e.message}`
    }, { quoted: m })
  }
}

handler.command = ['checknum']
handler.owner = true
handler.group = true

export default handler