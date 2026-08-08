//Plugin by Gab, Lucifero & 333 staff

const handler = async (m, { conn }) => {
  try {
    if (!m.isGroup) return conn.reply(m.chat, 'Questo comando funziona solo nei gruppi.', m)

    const metadata = await conn.groupMetadata(m.chat).catch(() => null)
    const participants = (metadata?.participants || [])

    const normalizeId = p => (p?.id || p?.jid || p)?.toString()
    let ids = participants.map(normalizeId).filter(Boolean)

    const me = conn.user?.id || conn.user?.jid
    ids = ids.filter(id => id && id !== me && id !== '0@s.whatsapp.net')

    if (ids.length === 0) return conn.reply(m.chat, 'Nessun partecipante trovato da taggare.', m)

    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[ids[i], ids[j]] = [ids[j], ids[i]]
    }

    const pick = ids.slice(0, Math.min(10, ids.length))

    const lines = pick.map((jid, i) => `${i + 1}. @${jid.split('@')[0]}`)
    const caption = `🏳️‍🌈 *TOP 10 GAY DEL GRUPPO*\n\n${lines.join('\n')}\n\nAttenti se vi piegate davanti a loro!`;

    await conn.sendMessage(m.chat, { text: caption, mentions: pick }, { quoted: m })
  } catch (e) {
    console.error(e)
    return conn.reply(m.chat, 'Errore interno.', m)
  }
}

handler.command = /^([\.]?topgay)$/i
handler.help = ['topgay']
handler.tags = ['fun']
handler.group = true

export default handler
