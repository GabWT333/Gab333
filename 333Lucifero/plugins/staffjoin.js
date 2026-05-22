//Plugin by Gab, Lucifero & 333 staff

import { fileURLToPath } from 'url'
import path from 'path'

const pendingStaffJoin = {}

const STAFF_GROUP = "120363403774208578@g.us" 

const isStaff = (jid) =>
  (global.db.data.pluginPerms?.[jid] ?? []).includes('staff')

const notifyOwners = async (conn, req) => {
  const { id, staff, link, members } = req

  await conn.sendMessage(STAFF_GROUP, {
    text:
`🚨 *STAFF RICHIESTO JOIN GRUPPO*

👤 Staff: ${staff.split('@')[0]}
🔗 Link gruppo: ${link}
👥 Membri totali: ${members}
🆔 ID: ${id}`,

    buttons: [
      { buttonId: `.staffaccept ${id}`, buttonText: { displayText: '✅ Approva' }, type: 1 },
      { buttonId: `.staffreject ${id}`, buttonText: { displayText: '❌ Rifiuta' }, type: 1 }
    ],
    headerType: 1
  })
}

let handler = async (m, { conn, text, command }) => {
  const cmd = command?.toLowerCase()

  if (cmd === 'staffaccept' || cmd === 'staffreject') {
    const id = text?.trim()
    if (!id) return m.reply('❌ ID mancante')

    const req = pendingStaffJoin[id]
    if (!req) return m.reply('❌ Richiesta non trovata')

    if (cmd === 'staffaccept') {
      try {
        let res = await conn.groupAcceptInvite(req.code)

        await conn.sendMessage(res, {
          text:
`✅ *STAFF APPROVATO*

👤 Staff: ${req.staff.split('@')[0]}
📢 Entrato nel gruppo`
        })

        delete pendingStaffJoin[id]
      } catch (e) {
        return m.reply('❌ Errore join (già dentro o link invalido)')
      }
      return
    }

    if (cmd === 'staffreject') {
      await conn.sendMessage(req.staff, {
        text:
`❌ *STAFF JOIN RIFIUTATO*

La tua richiesta è stata rifiutata dagli owner.`
      })

      delete pendingStaffJoin[id]
      return
    }
  }

  if (cmd !== 'staffjoin') return

  if (!isStaff(m.sender))
    return m.reply('❌ Solo lo staff può usare questo comando')

  let linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i
  let [_, code] = text.match(linkRegex) || []
  if (!code) return m.reply('❌ Link gruppo non valido')

  let info = await conn.groupGetInviteInfo(code).catch(() => null)
  if (!info) return m.reply('❌ Impossibile leggere info gruppo')

  let id = `SJ-${Date.now()}`

  pendingStaffJoin[id] = {
    id,
    code,
    staff: m.sender,
    link: text,
    members: info.participants?.length || 0
  }

  await notifyOwners(conn, pendingStaffJoin[id])

  return m.reply(
`📨 *Richiesta inviata nel gruppo staff*

👤 Staff: ${m.sender.split('@')[0]}
🆔 ID: ${id}

⏳ In attesa di approvazione`)
}

handler.command = /^(staffjoin|staffaccept|staffreject)$/i
export default handler