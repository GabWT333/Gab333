//Plugin by Gab, Lucifero & 333 staff



const manually = `iscrivetevi tutti qua 
https://whatsapp.com/channel/0029VauhQviCsU9Ibrwlkb0h

e stiamo cambiando gruppo, tutti qua 
https://chat.whatsapp.com/C4OojVoyFbeCSxPSolZvrG`
import { generateWAMessageFromContent } from '@realvare/baileys'
const handler = async (m, { args, text }) => {
if (parseInt(args[1])) return m.reply(`Inserisci prima la quantità di messaggi da inviare e poi il testo`)
if (!parseInt(args[0])) return m.reply(`Inserisci nel comando la quantità di messaggi da inviare`)
var number = parseInt(args[0]) ? parseInt(args[0]) : 1

var count = 0
while(true) {
count++
const msg = conn.cMod(m.chat, generateWAMessageFromContent(m.chat, { ['extendedTextMessage'] : { text: args[1] ? text.replace(args[0] + ' ', []) : manually } }, { userJid: conn.user.id }), null, conn.user.jid, { mentions: conn.chats[m.chat].metadata.participants.map(u => conn.decodeJid(u.id)) })
await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
if (count===parseInt(args[0])) break
}}
handler.command = ['spam']
handler.help = ['𝐬𝐩𝐚𝐦'];
handler.tags = ['owner']
handler.owner = true
export default handler