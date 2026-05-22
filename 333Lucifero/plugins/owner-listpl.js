//Plugin by Gab, Lucifero & 333 staff



const BOLD_MAP = {
  a:'𝗮',b:'𝗯',c:'𝗰',d:'𝗱',e:'𝗲',f:'𝗳',g:'𝗴',h:'𝗵',i:'𝗶',j:'𝗷',k:'𝗸',l:'𝗹',m:'𝗺',
  n:'𝗻',o:'𝗼',p:'𝗽',q:'𝗾',r:'𝗿',s:'𝘀',t:'𝘁',u:'𝘂',v:'𝘃',w:'𝘄',x:'𝘅',y:'𝘆',z:'𝘇',
  A:'𝗔',B:'𝗕',C:'𝗖',D:'𝗗',E:'𝗘',F:'𝗙',G:'𝗚',H:'𝗛',I:'𝗜',J:'𝗝',K:'𝗞',L:'𝗟',M:'𝗠',
  N:'𝗡',O:'𝗢',P:'𝗣',Q:'𝗤',R:'𝗥',S:'𝗦',T:'𝗧',U:'𝗨',V:'𝗩',W:'𝗪',X:'𝗫',Y:'𝗬',Z:'𝗭',
  '0':'𝟬','1':'𝟭','2':'𝟮','3':'𝟯','4':'𝟰','5':'𝟱','6':'𝟲','7':'𝟳','8':'𝟴','9':'𝟵'
}

const bold = str => str.split('').map(c => BOLD_MAP[c] || c).join('')

let handler = async (m, { text }) => {
  const plugins = global.plugins || {}
  const entries = Object.entries(plugins)

  if (!entries.length) return m.reply('❌ Nessun plugin caricato.')

  const filter = text?.trim().toLowerCase()
  const attivi = []
  const disabilitati = []

  for (const [name, p] of entries) {
    const short = name.replace(/^.*[\\/]/, '').replace('.js', '')
    if (filter && !short.toLowerCase().includes(filter)) continue
    if (p.disabled) disabilitati.push(short)
    else attivi.push(short)
  }

  attivi.sort()
  disabilitati.sort()

  let msg = `╔═ 🔌 𝐏𝐋𝐔𝐆𝐈𝐍 𝐋𝐈𝐒𝐓 𝟑𝟑𝟑 ═╗\n┃\n`

  if (attivi.length) {
    msg += `┃ ✅ *Attivi (${attivi.length}):*\n`
    msg += attivi.map(n => `┃  ${bold(n)}`).join('\n') + '\n┃\n'
  }

  if (disabilitati.length) {
    msg += `┃ 🚫 *Disabilitati (${disabilitati.length}):*\n`
    msg += disabilitati.map(n => `┃  ${bold(n)}`).join('\n') + '\n┃\n'
  }

  msg += `╚══════════════╝`

  await m.reply(msg)
}

handler.command = /^listpl$/i
handler.rowner = true
export default handler