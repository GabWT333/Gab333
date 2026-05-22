//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn }) => {
  let users = m.mentionedJid || []
  if (users.length < 2) return m.reply('❌ Tagga due persone per il threesome!')

  let [u1, u2] = users
  let me = `@${m.sender.split('@')[0]}`
  let captionList = [
    `𝐈𝐍𝐈𝐙𝐈𝐀𝐌𝐎 𝐈𝐋 𝐃𝐈𝐕𝐄𝐑𝐓𝐈𝐌𝐄𝐍𝐓𝐎🔥\n\n${me} prende di spalle alla sprovvista @${u1.split('@')[0]} e inizia a toccarlo/a sensualmente, @${u2.split('@')[0]} vedendo la scena decide di unirsi e piegarsi davanti ad entrambi, che vedendolo/a, ne approfittano subito per incularlo/a, da qui in poi nasce il threesome violento 🔞`,
  ]

  let caption = captionList[Math.floor(Math.random() * captionList.length)]
  await m.reply(caption, null, { mentions: [u1, u2, m.sender] })
}

handler.help = ['𝐭𝐫𝐡𝐞𝐞𝐬𝐨𝐦𝐞 @tag1 @tag2']
handler.tags = ['fun']
handler.command = /^(trheesome|threesome)$/i
export default handler