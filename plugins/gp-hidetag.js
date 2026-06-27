//Plugin by Gab, Lucifero & 333 staff



const handler = async (m, { conn, text, participants }) => {
  try {

    if (m.fromMe) return
    if (m.sender === conn.user.jid) return

    if (text && text.trim().split(" ").length > 1 && text.includes(".tag")) return

    const users = participants.map(u => conn.decodeJid(u.id))
    const quoted = m.quoted

    const isViewOnce =
      quoted?.message?.viewOnceMessage ||
      quoted?.message?.viewOnceMessageV2 ||
      quoted?.message?.viewOnceMessageV2Extension ||
      quoted?.viewOnce ||
      quoted?.type === 'viewOnceMessage'

    if (quoted && isViewOnce) {
      return m.reply("❌ Non puoi usare hidetag su contenuti a visualizzazione singola (presto toglieremo questo blocco)")
    }

    if (quoted) {

      if (quoted.mtype === 'imageMessage') {
        const media = await quoted.download()
        return await conn.sendMessage(m.chat, {
          image: media,
          caption: text || quoted.text || '',
          mentions: users
        }, { quoted: m })
      }

      if (quoted.mtype === 'videoMessage') {
        const media = await quoted.download()
        return await conn.sendMessage(m.chat, {
          video: media,
          caption: text || quoted.text || '',
          mentions: users
        }, { quoted: m })
      }

      if (quoted.mtype === 'audioMessage') {
        const media = await quoted.download()
        return await conn.sendMessage(m.chat, {
          audio: media,
          mimetype: 'audio/mp4',
          mentions: users
        }, { quoted: m })
      }

      if (quoted.mtype === 'documentMessage') {
        const media = await quoted.download()
        return await conn.sendMessage(m.chat, {
          document: media,
          mimetype: quoted.mimetype,
          fileName: quoted.fileName,
          caption: text || quoted.text || '',
          mentions: users
        }, { quoted: m })
      }

      if (quoted.mtype === 'stickerMessage') {
        const media = await quoted.download()
        return await conn.sendMessage(m.chat, {
          sticker: media,
          mentions: users
        }, { quoted: m })
      }

      return await conn.sendMessage(m.chat, {
        text: quoted.text || text || '',
        mentions: users
      }, { quoted: m })
    }

    if (text) {
      return await conn.sendMessage(m.chat, {
        text,
        mentions: users
      }, { quoted: m })
    }

    return m.reply('❌ Inserisci testo o rispondi a qualcosa')

  } catch (e) {
    console.error('Errore hidetag:', e)
    m.reply('❌ errore')
  }
}

handler.help = ['hidetag', 'totag', 'tag']
handler.tags = ['gruppo']
handler.command = /^(\.?hidetag|totag|tag)$/i
handler.mods = true
handler.group = true
handler.botAdmin = true

export default handler