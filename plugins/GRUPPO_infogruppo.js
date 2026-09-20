//Plugin by Gab, Lucifero & 333 staff


const handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('❌ Questo comando funziona solo nei gruppi.');

  function progress(percent) {
    let bar = ''
    const total = 20
    const filled = Math.floor(percent * total / 100)
    for (let i = 0; i < total; i++) {
      bar += i < filled ? '█' : '▒'
    }
    return `${bar} ${percent}%`
  }

  const msg = await conn.sendMessage(m.chat,{
    text:`╭──〔𝟑𝟑𝟑 𝔹𝕆𝕋 𝐀𝐕𝐕𝐈𝐀𝐓𝐎〕──╮

⌛ 𝐀𝐯𝐯𝐢𝐨 𝐬𝐜𝐚𝐧𝐬𝐢𝐨𝐧𝐞 𝐠𝐫𝐮𝐩𝐩𝐨...

${progress(5)}`
  },{quoted:m})

  async function update(percent,text){
    await conn.sendMessage(m.chat,{
      text:`╭──〔𝟑𝟑𝟑 𝔹𝕆𝕋 𝐀𝐕𝐕𝐈𝐀𝐓𝐎〕──╮

⌛ ${text}

${progress(percent)}`,
      edit:msg.key
    })
  }

  await new Promise(r=>setTimeout(r,700))
  await update(30,"𝐑𝐚𝐜𝐜𝐨𝐥𝐭𝐚 𝐢𝐧𝐟𝐨𝐫𝐦𝐚𝐳𝐢𝐨𝐧𝐢")
  await new Promise(r=>setTimeout(r,700))
  await update(60,"𝐀𝐧𝐚𝐥𝐢𝐬𝐢 𝐦𝐞𝐦𝐛𝐫𝐢")
  await new Promise(r=>setTimeout(r,700))
  await update(85,"𝐕𝐞𝐫𝐢𝐟𝐢𝐜𝐚 𝐩𝐞𝐫𝐦𝐞𝐬𝐬𝐢")
  await new Promise(r=>setTimeout(r,700))
  await update(100,"𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐚𝐭𝐨 𝐜𝐨𝐧 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐨!")

  const metadata = await conn.groupMetadata(m.chat)
  const nome = metadata.subject
  const id = m.chat
  const creatoreJid = metadata.owner
  const descrizione = metadata.desc || "Nessuna descrizione"
  const membri = metadata.participants.length
  const adminsList = metadata.participants.filter(p=>p.admin)
  const admins = adminsList.length
  const percentualeAdmin = Math.floor((admins/membri)*100)
  const creatoIl = new Date(metadata.creation*1000).toLocaleDateString('it-IT')
  const giorniVita = Math.floor((Date.now() - metadata.creation*1000)/86400000)
  const annunci = metadata.announce ? "𝐒𝐨𝐥𝐨 𝐚𝐝𝐦𝐢𝐧 𝐩𝐨𝐬𝐬𝐨𝐧𝐨 𝐬𝐜𝐫𝐢𝐯𝐞𝐫𝐞" : "𝐂𝐡𝐚𝐭 𝐚𝐩𝐞𝐫𝐭𝐚 𝐚 𝐭𝐮𝐭𝐭𝐢"
  const restrizioni = metadata.restrict ? "𝐒𝐨𝐥𝐨 𝐚𝐝𝐦𝐢𝐧 𝐩𝐨𝐬𝐬𝐨𝐧𝐨\n┃ 𝐦𝐨𝐝𝐢𝐟𝐢𝐜𝐚𝐫𝐞 𝐢𝐧𝐟𝐨" : "𝐓𝐮𝐭𝐭𝐢 𝐩𝐨𝐬𝐬𝐨𝐧𝐨\n┃ 𝐦𝐨𝐝𝐢𝐟𝐢𝐜𝐚𝐫𝐞 𝐢𝐧𝐟𝐨"

  const chatData = global.db.data.chats[m.chat] || {}
  let messaggiTotali = chatData.totalmsg || 0
  if (!messaggiTotali && chatData.topUsers) {
    messaggiTotali = Object.values(chatData.topUsers).reduce((sum, value) => sum + (value || 0), 0)
  }
  if (!messaggiTotali && chatData.users) {
    messaggiTotali = Object.values(chatData.users).reduce((sum, user) => sum + ((user?.messages || 0)), 0)
  }

  const getSafeName = async (jid) => {
    const fallback = jid.split('@')[0]
    if (!conn.getName) return fallback
    try {
      const name = await Promise.resolve(conn.getName(jid))
      return typeof name === 'string' && name ? name : fallback
    } catch {
      return fallback
    }
  }

  const creatoreNome = creatoreJid ? await getSafeName(creatoreJid) : null
  const creatore = creatoreNome ? '@'+creatoreNome : "Sconosciuto"

  let listaAdmin=''
  let mentions=[]
  for (let admin of adminsList){
    const numero = admin.id.split('@')[0]
    listaAdmin += `┃ @${numero}\n`
    mentions.push(admin.id)
  }
  if (creatoreJid) mentions.push(creatoreJid)

  await conn.sendMessage(m.chat,{delete:msg.key})

  const messaggio=`
╔══『 👥 𝐈𝐍𝐅𝐎 𝐆𝐑𝐔𝐏𝐏𝐎 』══╗
┃
┃ 📛 𝐍𝐨𝐦𝐞 𝐠𝐫𝐮𝐩𝐩𝐨: *${nome}*
┃
┃ 🛡️ 𝐂𝐫𝐞𝐚𝐭𝐨 𝐝𝐚: ${creatore}
┃ 📆 𝐈𝐥 𝐠𝐢𝐨𝐫𝐧𝐨: *${creatoIl}*
┃ ⏳ 𝐀𝐭𝐭𝐢𝐯𝐨 𝐝𝐚: *${giorniVita}* 𝐆𝐢𝐨𝐫𝐧𝐢
┃
┃ 👥 𝐌𝐞𝐦𝐛𝐫𝐢 𝐭𝐨𝐭𝐚𝐥𝐢: *${membri}*
┃ 🔧 𝐀𝐝𝐦𝐢𝐧 𝐭𝐨𝐭𝐚𝐥𝐢: *${admins}* 
┃
┃ 💬 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐭𝐨𝐭𝐚𝐥𝐢: *${messaggiTotali}*
┃ (vengono contati\n┃ dal momento in\n┃ cui il bot entra\n┃ nel gruppo)
┃
┃ 🔒 𝐀𝐧𝐧𝐮𝐧𝐜𝐢: ${annunci}
┃ ⚙️ 𝐑𝐞𝐬𝐭𝐫𝐢𝐳𝐢𝐨𝐧𝐢: ${restrizioni}
┃
┃ 👑 𝐀𝐝𝐦𝐢𝐧 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨:
${listaAdmin}┃
╚═══════════╝
`

  await conn.sendMessage(
    m.chat,
    {
      text: messaggio,
      contextInfo: { mentionedJid: mentions },
      footer: ' ꙰  𝟥𝟥𝟥 𝔹𝕆𝕋  ꙰ ',
      buttons: [
        { buttonId: '.link', buttonText: { displayText: '🔗 𝐋𝐢𝐧𝐤 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨' }, type: 1 },
        { buttonId: '.menu', buttonText: { displayText: '📜 𝐌𝐞𝐧𝐮 𝐩𝐫𝐢𝐧𝐜𝐢𝐩𝐚𝐥𝐞' }, type: 1 }
      ],
      headerType: 1
    },
    { quoted: m }
  )
}

handler.command=['infogruppo','groupinfo','infogc']
handler.group=true
export default handler