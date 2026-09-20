import { igdl } from "ruhend-scraper"

let handler = async (m, { args, conn }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `╭─⟪ 📸 *Instagram Downloader* ⟫─╮
│ ✨ Invia un link Instagram valido
│ 🔗 Esempio: .scaricaig https://www.instagram.com/...
╰─────────╯`, m)
  }

  try {
    await m.react('⏳')
    const res = await igdl(args[0])
    const data = res?.data || []

    if (!data.length) {
      await m.react('⚠️')
      return conn.reply(m.chat, `╭─⟪ ⚠️ *Nessun contenuto trovato* ⟫─╮
│ Il link potrebbe essere privato o non supportato.
╰─────────╯`, m)
    }

    for (const media of data) {
      await new Promise(resolve => setTimeout(resolve, 800))
      await conn.sendFile(m.chat, media.url, 'igdl_333bot.mp4', '📲 333bot', m)
    }
  } catch (e) {
    await m.react('❌')
    conn.reply(m.chat, `╭─⟪ ❌ *Errore download* ⟫─╮
│ Non ho potuto scaricare il contenuto.
│ Controlla il link e riprova.
╰─────────╯`, m)
  }
}

handler.command = ['scaricaig']
handler.tags = ['fun']
handler.help = ['scaricaig']
handler.group = true

export default handler