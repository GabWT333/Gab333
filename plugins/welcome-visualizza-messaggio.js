//Plugin by Gab, Lucifero & 333 staff

import fetch from 'node-fetch'

const handler = m => m
handler.all = async function (m) {
  const chat = global.db.data.chats[m.chat]

  if (m.messageStubType == 29) {
    const botJid = this.decodeJid(this.user?.jid || this.user?.id || '')
    const targetJid = this.decodeJid(m.messageStubParameters[0])
    
    if (botJid === targetJid) {
      try {
        const metadata = await this.groupMetadata(m.chat).catch(() => null)
        const groupName = metadata?.subject || 'questo gruppo'
        
        let pic
        try {
          pic = await this.profilePictureUrl(m.chat, 'image')
        } catch {
          pic = null
        }

        const ppBuffer = pic
          ? await (await fetch(pic)).buffer()
          : await (await fetch('https://telegra.ph/file/17e7701f8b0a63806e312.png')).buffer()

        const fake = {
          key: {
            participants: '0@s.whatsapp.net',
            fromMe: false,
            id: '333BotAttivo'
          },
          message: {
            locationMessage: {
              name: '𝐁𝐎𝐓 𝐀𝐓𝐓𝐈𝐕𝐎 ✅',
              jpegThumbnail: ppBuffer.toString('base64'),
              vcard: 'BEGIN:VCARD\nVERSION:3.0\nN:;Admin;;;\nFN:Admin\nEND:VCARD'
            }
          },
          participant: '0@s.whatsapp.net'
        }

        this.sendMessage(m.chat, {
          text: `*👋 Ciao a tutti membri di ${groupName}*\n\n*🤖 Sono 333 bot* — un bot italiano sviluppato da *Gab* e *Lucifero*, con oltre *300 comandi*.\n\n*✅ Ora sono operativo in questo gruppo.*\n\n*👉 Per iniziare:* digita *'.menu'* per visualizzare la lista completa dei comandi.\n\n*🔗 Il nostro canale per aggiornamenti:* https://whatsapp.com/channel/0029VauhQviCsU9Ibrwlkb0h\n\n*🛠️ Supporto:* per qualsiasi problema o info potete entrare nel gruppo supporto: https://chat.whatsapp.com/L7Hz1iQpctTDfOoU4LARWL`
        }, { quoted: fake })
      } catch (e) {
        console.error('[welcome] Error:', e)
      }
    }
  }
}

export default handler