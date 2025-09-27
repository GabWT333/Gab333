let handler = async (m, { conn, isOwner }) => {
  let adv = Object.entries(global.db.data.users).filter(user => user[1].warn)
  let warns = global.db.data.users.warn
  let user = global.db.data.users

let mappedAdv = adv.length
  ? await Promise.all(
      adv.map(async ([jid, user], i) => `
│
│ *${i + 1}.* ${await conn.getName(jid) || 'Sconosciuto'} *(${user.warn}/3)*
│ ${isOwner ? '@' + jid.split`@`[0] : jid}
│ - - - - - - - - -`.trim())
    )
  : [];

let caption = `⚠️ Utenti Avvertiti
*╭•·–––––––––––––––––––·•*
│ *Totale: ${adv.length} utenti*${mappedAdv.length ? '\n' + mappedAdv.join('\n') : ''}
*╰•·–––––––––––––––––––·•*\n\n⚠️ Avvisi ⇢ ${warns ? `*${warns}/3*` : '*0/3*'}`
await conn.reply(m.chat, caption, m, { mentions: await conn.parseMention(caption) })
}

handler.help = ['listawarn']
handler.tags = ['gruppo']
handler.command = ['listawarn', 'listwarn']

export default handler