//Codice di gp-rimuovi.js

//Plugin by Gab, Lucifero & 333 staff

import fetch from 'node-fetch'

const logAdminAction = async (chatId, adminJid, actionKey, amount = 1) => {
  if (typeof global.logAdmin?.increment === 'function') {
    await global.logAdmin.increment(chatId, adminJid, actionKey, amount)
  } else {
    global.logAdminQueue = global.logAdminQueue || []
    global.logAdminQueue.push({ chatId, adminJid, actionKey, amount })
  }
}

async function handler(m, {
isBotAdmin, isOwner, text, conn
}) {

if (!isBotAdmin) return m.reply('ⓘ 𝐃𝐞𝐯𝐨 𝐞𝐬𝐬𝐞𝐫𝐞 𝐚𝐝𝐦𝐢𝐧 𝐩𝐞𝐫 𝐩𝐨𝐭𝐞𝐫 𝐟𝐮𝐧𝐳𝐢𝐨𝐧𝐚𝐫𝐞')

const mention = m.mentionedJid?.[0] || m.quoted?.sender || null
const who = mention || m.sender
const normalize = jid => jid && conn.decodeJid ? conn.decodeJid(jid) : jid
const target = normalize(who)
const sender = normalize(m.sender)
const user = global.db.data.users[target] || {}

if (!target) return m.reply('ⓘ 𝐌𝐞𝐧𝐳𝐢𝐨𝐧𝐚 𝐥𝐚 𝐩𝐞𝐫𝐬𝐨𝐧𝐚 𝐝𝐚 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐞')
if (target === sender || target === normalize(conn.user?.jid || conn.user?.id)) return m.reply('ⓘ 𝐌𝐞𝐧𝐳𝐢𝐨𝐧𝐚 𝐥𝐚 𝐩𝐞𝐫𝐬𝐨𝐧𝐚 𝐝𝐚 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐞')

const groupMetadata = conn.chats?.[m.chat]?.metadata || await conn.groupMetadata(m.chat).catch(() => null)
const participants = groupMetadata?.participants || []
if (!participants.length) return m.reply('Impossibile verificare lo status del gruppo o del partecipante.')

const getParticipantIds = p => [p?.id, p?.jid, p?.lid].filter(Boolean).map(normalize)
const utente = participants.find(u => getParticipantIds(u).includes(target))
const senderData = participants.find(u => getParticipantIds(u).includes(sender))

const owner = utente?.admin === 'superadmin'
const admin = utente?.admin === 'admin' || utente?.admin === true
const senderIsAdmin = senderData?.admin === 'admin' || senderData?.admin === 'superadmin' || senderData?.admin === true
const configuredBotOwners = (global.owner || []).map(o => typeof o === 'string' ? normalize(`${o.replace(/[^0-9]/g, '')}@s.whatsapp.net`) : normalize(`${o?.[0]?.replace(/[^0-9]/g, '')}@s.whatsapp.net`)).filter(Boolean)
const dbOwners = Array.isArray(global.db?.data?.owners) ? global.db.data.owners.map(normalize).filter(Boolean) : []
const isBotOwner = configuredBotOwners.includes(target) || dbOwners.includes(target)

if (owner) return m.reply(`> ⚠️ 𝐀𝐧𝐭𝐢-𝐊𝐢𝐜𝐤\n> ⓘ 𝐋'𝐮𝐭𝐞𝐧𝐭𝐞 𝐜𝐡𝐞 𝐡𝐚𝐢 𝐩𝐫𝐨𝐯𝐚𝐭𝐨 𝐚 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐞 𝐞́ 𝐢𝐥 𝐜𝐫𝐞𝐚𝐭𝐨𝐫𝐞 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨.`)
if (isBotOwner) return m.reply(`> ⚠️ 𝐀𝐧𝐭𝐢-𝐊𝐢𝐜𝐤\n> ⓘ 𝐋'𝐮𝐭𝐞𝐧𝐭𝐞 𝐜𝐡𝐞 𝐡𝐚𝐢 𝐩𝐫𝐨𝐯𝐚𝐭𝐨 𝐚 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐞 𝐞́ 𝐮𝐧 𝐨𝐰𝐧𝐞𝐫 𝐝𝐞𝐥 𝐛𝐨𝐭, 𝐧𝐨𝐧 𝐩𝐮𝐨̀ 𝐞𝐬𝐬𝐞𝐫𝐞 𝐫𝐢𝐦𝐨𝐬𝐬𝐨.`)
if (admin) return m.reply(`> ⚠️ 𝐀𝐧𝐭𝐢-𝐊𝐢𝐜𝐤\n> ⓘ 𝐋'𝐮𝐭𝐞𝐧𝐭𝐞 𝐜𝐡𝐞 𝐡𝐚𝐢 𝐩𝐫𝐨𝐯𝐚𝐭𝐨 𝐚 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐞 𝐞́ 𝐚𝐝𝐦𝐢𝐧.`)
if (senderIsAdmin && admin) return m.reply(`> ⚠️ 𝐀𝐧𝐭𝐢-𝐊𝐢𝐜𝐤\n> ⓘ 𝐔𝐧 𝐚𝐦𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐨𝐫𝐞 𝐧𝐨𝐧 𝐩𝐮𝐨̀ 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐞 𝐮𝐧 𝐚𝐥𝐭𝐫𝐨 𝐚𝐦𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐨𝐫𝐞.`)

async function remove() {
  const reason = text ? '\n\n> 𝐌𝐨𝐭𝐢𝐯𝐨: ' + text.replace(m.sender, '') : ''

  const fake = {
    key: {
      participants: '0@s.whatsapp.net',
      fromMe: false,
      id: '333Kick'
    },
    message: {
      contactMessage: {
        displayName: `🚫 𝐑𝐢𝐦𝐨𝐳𝐢𝐨𝐧𝐞`,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${mention.split('@')[0]}:${mention.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
      }
    },
    participant: '0@s.whatsapp.net'
  }

  conn.sendMessage(m.chat, {
    text: `@${mention.split`@`[0]} 𝐫𝐢𝐦𝐨𝐬𝐬𝐨 𝐝𝐚 @${m.sender.split`@`[0]} ${reason}`,
    mentions: [mention, m.sender, ...conn.parseMention(text)]
  }, { quoted: fake })

  await conn.groupParticipantsUpdate(m.chat, [mention], 'remove')
  await logAdminAction(m.chat, m.sender, 'removes')
}

if (mention) await remove()
}

handler.customPrefix = /kick|avadachedabra|puffo/i
handler.tags = ['admin']
handler.help = ['𝐤𝐢𝐜𝐤/𝐩𝐮𝐟𝐟𝐨/avadachedabra']
handler.command = new RegExp
handler.group = true
handler.admin = true
handler.botAdmin = true
export default handler