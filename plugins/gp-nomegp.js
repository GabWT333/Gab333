//Plugin by Gab, Lucifero & 333 staff

const handler = async (m, { conn, args }) => {
  if (!args[0]) return conn.reply(m.chat, 'Che nome gli metto?', m)

  const nuovoNome = args.join(' ')
  if (nuovoNome.length > 100)
    return conn.reply(m.chat, 'Il nome del gruppo non può superare i 100 caratteri.', m)

  await conn.groupUpdateSubject(m.chat, nuovoNome)
  await conn.reply(m.chat, `✅ Nome del gruppo cambiato:\n> *${nuovoNome}*`, m)
}

handler.help = ['𝐧𝐨𝐦𝐞𝐠𝐩 <𝐧𝐨𝐦𝐞>']
handler.tags = ['admin']
handler.command = /^(nomegp|setnomegp)$/i
handler.group = true
handler.admin = true

export default handler