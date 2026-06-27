//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn }) => {

let res = await conn.groupRevokeInvite(m.chat)
let gruppo = m.chat
conn.reply(m.sender, 'https://chat.whatsapp.com/' + await conn.groupInviteCode(gruppo), m, )

}
handler.help = ['𝐫𝐞𝐢𝐦𝐩𝐨𝐬𝐭𝐚']
handler.tags = ['admin']
handler.command = ['reimposta', 'revoke','rlink']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler;