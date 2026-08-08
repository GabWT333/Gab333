//Plugin by Gab, Lucifero & 333 staff

const handler = async (m, {conn, isOwner}) => {
  const chats = Object.entries(global.db.data.chats).filter((chat) => chat[1].isBanned);
  const users = Object.entries(global.db.data.users).filter((user) => user[1].banned);
  const caption = `
┌〔𝐔𝐭𝐞𝐧𝐭𝐢 𝐛𝐥𝐨𝐜𝐜𝐚𝐭𝐢 👨🏻‍✈️〕
├ Totale: ${users.length} ${users ? '\n' + users.map(([jid], i) => `
├${isOwner ? '@' + jid.split`@`[0] : jid}`.trim()).join('\n') : '├'}
└────

┌〔𝐂𝐡𝐚𝐭 𝐛𝐥𝐨𝐜𝐜𝐚𝐭𝐞 👨🏻‍✈️〕
├ Totale: ${chats.length} ${chats ? '\n' + chats.map(([jid], i) => `
├ ${isOwner ? '@' + jid.split`@`[0] : jid}`.trim()).join('\n') : '├'}
└────
`.trim();
  m.reply(caption, null, {mentions: conn.parseMention(caption)});
};
handler.help = ['𝐛𝐚𝐧𝐥𝐢𝐬𝐭'];
handler.command = /^banlist(ned)?|ban(ned)?list|daftarban(ned)?$/i;
handler.mods = true;
handler.tags = ['owner'];
export default handler;
