import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    // Mostra un messaggio di attesa
    await conn.sendMessage(m.chat, { text: '⏳ Caricamento waifu in corso...' }, { quoted: m })
    
    const res = await fetch('https://api.waifu.pics/sfw/waifu')
    if (!res.ok) throw new Error(`Errore API: ${res.status}`)
    
    const json = await res.json()
    if (!json.url) throw new Error('Nessun URL immagine ricevuto')
    
    // Invia l'immagine con il bottone
    await conn.sendButton(
      m.chat,
      '😻 Ecco la tua waifu! 😻',
      'Clicca sotto per un\'altra waifu',
      json.url,
      [['Prossima Waifu', `${usedPrefix}${command}`]],
      m
    )
    
  } catch (error) {
    console.error('Errore:', error)
    await conn.sendMessage(
      m.chat, 
      { 
        text: `❌ Errore nel caricamento dell'immagine\n${error.message}` 
      }, 
      { quoted: m }
    )
  }
}

handler.help = ['waifu']
handler.tags = ['anime']
handler.command = /^(waifu)$/i

export default handler