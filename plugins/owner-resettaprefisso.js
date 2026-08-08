//Plugin by Gab, Lucifero & 333 staff

let handler = async(m, { conn }) => {

  global.prefix = new RegExp('^[' + (opts['prefix'] || '‎xzXZ/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']')
    await m.reply(`ⓘ 𝐈𝐥 𝐩𝐫𝐞𝐟𝐢𝐬𝐬𝐨 𝐞' 𝐬𝐭𝐚𝐭𝐨 𝐫𝐞𝐬𝐞𝐭𝐭𝐚𝐭𝐨`)

}
handler.help = ['𝐫𝐞𝐬𝐞𝐭𝐭𝐚𝐩𝐫𝐞𝐟𝐢𝐬𝐬𝐨']
handler.tags = ['owner']
handler.command = /^(resetprefix|resettaprefisso)$/i
handler.rowner = true


export default handler
