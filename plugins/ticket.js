//Plugin by Gab, Lucifero & 333 staff

import { generateWAMessageFromContent, proto } from '@realvare/baileys'

const SUPPORT_GROUP = '120363405035221899@g.us' // Mettete l'id del vostro gruppo privato (non è ChatGPT coglioni, l'ho scritto io Lucifero in persona)
const pendingFirma = {}

const getGroupJid = async (conn) => {
  if (SUPPORT_GROUP?.endsWith?.('@g.us')) return SUPPORT_GROUP
  try {
    const meta = await conn.groupGetInviteInfo(SUPPORT_GROUP)
    return meta?.id || null
  } catch {
    return null
  }
}

let handler = async (m, { conn, text, command }) => {
  if (!global.db.data.tickets) global.db.data.tickets = {}
  const cmd = command?.toLowerCase()

  if (cmd === 'ticket') {
    if (!text || text.trim().length < 10)
      return m.reply('❌ Scrivi un motivo di almeno *10 caratteri*.\nEsempio: .ticket non riesco ad accedere al gruppo')

    const groupJid = await getGroupJid(conn)
    if (!groupJid) return m.reply('❌ Errore nel trovare il gruppo di supporto.')

    const ticketId = `TKT-${Date.now()}`
    const numero = m.sender.split('@')[0]

    global.db.data.tickets[ticketId] = {
      sender: m.sender,
      chat: m.chat,
      motivo: text.trim(),
      numero,
      status: 'open',
      timestamp: Date.now()
    }

    const interactiveButtons = [
      {
        name: 'cta_copy',
        buttonParamsJson: JSON.stringify({
          display_text: '📋 COPIA TICKET',
          id: ticketId,
          copy_code: ticketId
        })
      }
    ]

    const staffMessage = {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            header: {
              title: '🎫 NUOVO TICKET',
              hasMediaAttachment: false
            },
            body: {
              text: `🎫 *NUOVO TICKET* — ${ticketId}\n\n👤 Utente: *+${numero}*\n💬 Motivo:\n${text.trim()}\n\n📝 Rispondi con *.risposta ${ticketId} [testo]*`
            },
            footer: {
              text: '📋 Premi il pulsante per copiare il numero del ticket'
            },
            nativeFlowMessage: {
              buttons: interactiveButtons
            }
          }
        }
      }
    }

    await conn.relayMessage(groupJid, staffMessage, {})

    await m.reply(
`✅ *Ticket aperto con successo!*

🎫 ID: *${ticketId}*
📨 Il nostro staff ti risponderà il prima possibile.`)
    return
  }

  if (cmd === 'risposta') {
    const parts = text?.trim().split(' ')
    if (!parts || parts.length < 2)
      return m.reply('❌ Uso: *.risposta TKT-123456 testo della risposta*')

    const ticketId = parts[0].toUpperCase()
    const testo = parts.slice(1).join(' ')

    const ticket = global.db.data.tickets[ticketId]
    if (!ticket) return m.reply(`❌ Ticket *${ticketId}* non trovato.`)
    if (ticket.status === 'closed') return m.reply(`⚠️ Ticket *${ticketId}* già chiuso.`)

    pendingFirma[m.sender] = { ticketId, testo }

    return await conn.sendMessage(m.chat, {
      text:
`✏️ *Firma il messaggio*

Scrivi il tuo *nome* per firmare la risposta al ticket *${ticketId}*:`,
      buttons: [
        { buttonId: `.annullafirma`, buttonText: { displayText: '❌ Annulla' }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }

  if (cmd === 'annullafirma') {
    delete pendingFirma[m.sender]
    return m.reply('🗑️ Risposta annullata.')
  }
}

handler.all = async function (m) {
  if (!m.text || m.fromMe) return
  if (!pendingFirma[m.sender]) return

  const { ticketId, testo } = pendingFirma[m.sender]
  const firma = m.text.trim()
  delete pendingFirma[m.sender]

  const ticket = global.db.data.tickets?.[ticketId]
  if (!ticket) return

  ticket.status = 'closed'
  ticket.closedBy = firma

  try {
    await this.sendMessage(ticket.sender, {
      text:
`📩 *Risposta al tuo ticket* — ${ticketId}

${testo}

━━━━━━━━━━━━
✍️ Firmato: *${firma}*
🏷️ 333 Staff`
    })

    await this.sendMessage(m.chat, {
      text:
`✅ Risposta inviata a *+${ticket.numero}*

🎫 Ticket *${ticketId}* chiuso.
✍️ Firmato da: *${firma}*`
    })
  } catch (e) {
    await this.sendMessage(m.chat, {
      text: `❌ Errore nell'invio: ${e.message}`
    })
  }
}

handler.command = /^(ticket|risposta|annullafirma)$/i
export default handler