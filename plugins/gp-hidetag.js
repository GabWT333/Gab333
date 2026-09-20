//Codice di gp-hidetag.js

//Plugin by Gab, Lucifero & 333 staff



const HOUR = 60 * 60 * 1000;

const formatTime = (milliseconds) => {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours) return `${hours}h ${minutes}m`;
  if (minutes) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

const handler = async (m, { conn, text, participants }) => {
  try {

    if (m.fromMe) return
    if (m.sender === conn.user.jid) return

    if (text && text.trim().split(" ").length > 1 && text.includes(".tag")) return

    const sender = conn.decodeJid(m.sender);
    const moderators = global.db.data.chats[m.chat]?.moderatori || [];
    const isModerator = moderators.some(moderator =>
      conn.decodeJid(moderator) === sender
    );
    let quota;

    const sendTag = async (content) => {
      if (isModerator) {
        global.hidetagQuotas = global.hidetagQuotas || {};
        const quotaKey = `${m.chat}:${sender}`;
        const now = Date.now();
        quota = global.hidetagQuotas[quotaKey];

        if (!quota || now - quota.startedAt >= HOUR) {
          quota = { startedAt: now, used: 0 };
          global.hidetagQuotas[quotaKey] = quota;
        }

        if (quota.used >= 2) {
          return m.reply(`❌ Hai esaurito i 2 tag da moderatore disponibili. Si resettano tra ${formatTime(HOUR - (now - quota.startedAt))}.`);
        }

        quota.used += 1;
      }

      const result = await conn.sendMessage(m.chat, content, { quoted: m });

      if (isModerator) {
        const remaining = 2 - quota.used;
        await conn.sendMessage(m.chat, {
          text: `@${sender.split('@')[0]} hai ancora ${remaining} tag disponibili, si resettano tra ${formatTime(quota.startedAt + HOUR - Date.now())}.`,
          mentions: [sender]
        });
      }

      return result;
    };

    const afkState = global.afkState || {}
    const getAfkEntry = (jid) => {
      const normalizedJid = conn.decodeJid(jid)
      if (afkState[jid]) return afkState[jid]
      if (afkState[normalizedJid]) return afkState[normalizedJid]

      return Object.entries(afkState)
        .find(([storedJid]) => conn.decodeJid(storedJid) === normalizedJid)?.[1]
    }

    const users = participants
      .map(u => conn.decodeJid(u.id))
      .filter(jid => {
        const entry = getAfkEntry(jid)
        return !entry || (entry.scope !== 'all' && entry.chat !== m.chat)
      })
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
        return await sendTag({
          image: media,
          caption: text || quoted.text || '',
          mentions: users
        })
      }

      if (quoted.mtype === 'videoMessage') {
        const media = await quoted.download()
        return await sendTag({
          video: media,
          caption: text || quoted.text || '',
          mentions: users
        })
      }

      if (quoted.mtype === 'audioMessage') {
        const media = await quoted.download()
        return await sendTag({
          audio: media,
          mimetype: 'audio/mp4',
          mentions: users
        })
      }

      if (quoted.mtype === 'documentMessage') {
        const media = await quoted.download()
        return await sendTag({
          document: media,
          mimetype: quoted.mimetype,
          fileName: quoted.fileName,
          caption: text || quoted.text || '',
          mentions: users
        })
      }

      if (quoted.mtype === 'stickerMessage') {
        const media = await quoted.download()
        return await sendTag({
          sticker: media,
          mentions: users
        })
      }

      return await sendTag({
        text: quoted.text || text || '',
        mentions: users
      })
    }

    if (text) {
      return await sendTag({
        text,
        mentions: users
      })
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