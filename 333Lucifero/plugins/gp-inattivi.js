//Plugin by Blood

let handler = async (m, { conn, text, args, groupMetadata, isAdmin, isOwner }) => {
  await conn.sendPresenceUpdate('composing', m.chat)

  let total = 0
  let sider = []
  let adesso = Date.now()
  let tempoInattivita = 2 * 60 * 60 * 1000 

  if (!global.db.data) global.db.data = {}
  if (!global.db.data.users) global.db.data.users = {}

  if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
  global.db.data.users[m.sender].lastseen = adesso

  let member = groupMetadata.participants.map(v => v.id)

  for (let i = 0; i < member.length; i++) {
    let jid = member[i]
    
    if (jid === conn.user.jid) continue

    let userGroupData = groupMetadata.participants.find(u => u.id === jid)
    if (userGroupData?.admin || userGroupData?.isSuperAdmin) continue

    let userData = global.db.data.users[jid]
    let ultimoMessaggio = userData && userData.lastseen ? userData.lastseen : 0
    let isWhitelist = userData ? (userData.whitelist === true) : false
    let isBanned = userData ? (userData.banned === true) : false

    let eInattivo = (ultimoMessaggio === 0) || (adesso - ultimoMessaggio > tempoInattivita)

    if (eInattivo && !isWhitelist && !isBanned) {
      total++
      sider.push(jid)
    }
  }

  if (!args[0]) {
    const buttons = [
      { buttonId: `.inattivi lista`, buttonText: { displayText: '📋 Visualizza Lista' }, type: 1 },
      { buttonId: `.inattivi rimuovi`, buttonText: { displayText: '🗑️ Rimuovi Inattivi' }, type: 1 }
    ]

    const buttonMessage = {
      text: `╭━━━━━━━━━━━━━━━╮
┃ 𝐆𝐄𝐒𝐓𝐈𝐎𝐍𝐄 𝐈𝐍𝐀𝐓𝐓𝐈𝐕𝐈 😴
┃
┃ 𝐓𝐨𝐭𝐚𝐥𝐞 Inattivi: ${total}/${member.length}
┃ 𝘕𝘰𝘯 𝘴𝘤𝘳𝘪𝘷𝘰𝘯𝘰 𝘥𝘢: > 2 Ore
╰━━━━━━━━━━━━━━━╯`,
      footer: 'Gestione inattività',
      buttons: buttons,
      headerType: 1
    }

    return conn.sendMessage(m.chat, buttonMessage, { quoted: m })
  }

  if (args[0] === 'lista') {
    if (!isAdmin && !isOwner) {
      return conn.reply(m.chat, '❌ Solo gli *admin* possono vedere la lista degli inattivi.', m)
    }

    if (total === 0) {
      return conn.reply(m.chat, `✨ *Nessun inattivo!* Tutti hanno scritto nelle ultime 2 ore.`, m)
    }

    const message = `╭━━━━━━━━━━━━━━━╮
┃ 𝐈𝐍𝐀𝐓𝐓𝐈𝐕𝐈 𝐑𝐈𝐋𝐄𝐕𝐀𝐓𝐈 😴
┃
┃ 𝐓𝐨𝐭𝐚𝐥𝐞: ${sider.length}
${sider.map(v => '┣➤ @' + v.split('@')[0]).join('\n')}
╰━━━━━━━━━━━━━━━╯`

    const listButtons = [
      { buttonId: `.inattivi rimuovi`, buttonText: { displayText: '🗑️ Rimuovi Tutti' }, type: 1 },
      { buttonId: `.inattivi`, buttonText: { displayText: '🔄 Torna al Menu' }, type: 1 }
    ]

    const listMessage = {
      text: message,
      footer: 'Gestione gruppo',
      buttons: listButtons,
      headerType: 1,
      contextInfo: { mentionedJid: sider }
    }

    return conn.sendMessage(m.chat, listMessage, { quoted: m })
  }

  if (args[0] === 'rimuovi') {
    if (!isOwner && !isAdmin) {
      return conn.reply(m.chat, '❌ Solo gli *admin* possono rimuovere gli inattivi.', m)
    }

    if (total === 0) {
      return conn.reply(m.chat, `✨ Non ci sono inattivi da rimuovere.`, m)
    }

    const confirmButtons = [
      { buttonId: `.inattivi conferma`, buttonText: { displayText: '✅ Conferma Rimozione' }, type: 1 },
      { buttonId: `.inattivi`, buttonText: { displayText: '❌ Annulla' }, type: 1 }
    ]

    const confirmMessage = {
      text: `╭━━━━━━━━━━━━━━━╮
┃ 𝐂𝐎𝐍𝐅𝐄𝐑𝐌𝐀 ⚠️
┃
┃ Vuoi rimuovere ${total} utenti
┃ inattivi da più di 2 ore?
╰━━━━━━━━━━━━━━━╯`,
      footer: 'Conferma rimozione',
      buttons: confirmButtons,
      headerType: 1
    }

    return conn.sendMessage(m.chat, confirmMessage, { quoted: m })
  }

  if (args[0] === 'conferma') {
    if (!isOwner && !isAdmin) {
      return conn.reply(m.chat, '❌ Solo gli *admin* possono rimuovere gli inattivi.', m)
    }

    if (total === 0) {
      return conn.reply(m.chat, `✨ Nessun utente da rimuovere.`, m)
    }

    let removedCount = 0
    await conn.reply(m.chat, `⏳ Rimozione di ${sider.length} utenti in corso...`, m)

    for (const user of sider) {
      try {
        await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
        removedCount++
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (e) {
        console.error(e)
      }
    }

    const resultButton = {
      text: `╭━━━━━━━━━━━━━━━╮
┃ 𝐑𝐄𝐒𝐎𝐂𝐎𝐍𝐓𝐎 📋
┃
┃ Rimossi: *${removedCount}*
╰━━━━━━━━━━━━━━━╯`,
      footer: 'Operazione completata',
      buttons: [{ buttonId: `.inattivi`, buttonText: { displayText: '🔄 Torna al Menu' }, type: 1 }],
      headerType: 1
    }

    return conn.sendMessage(m.chat, resultButton, { quoted: m })
  }

  return conn.reply(m.chat, '❌ Opzione non valida.', m)
}

handler.help = ['inattivi']
handler.tags = ['gruppo']
handler.command = /^(inattivi)$/i
handler.group = true
handler.botAdmin = true

export default handler;