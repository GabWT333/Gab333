//Plugin by Gab, Lucifero & 333 staff

import fetch from 'node-fetch'
import { parse } from 'node-html-parser'

let handler = async (m, { conn }) => {
  const sender = m.sender
  const titoloOriginale = global.lyricsRequest?.[sender]

  if (!titoloOriginale)
    return m.reply("⏱️ 𝐒𝐨𝐧𝐨 𝐩𝐚𝐬𝐬𝐚𝐭𝐢 𝟏𝟓 𝐬𝐞𝐜𝐨𝐧𝐝𝐢 𝐝𝐚𝐥𝐥𝐚 𝐠𝐞𝐧𝐞𝐫𝐚𝐳𝐢𝐨𝐧𝐞 𝐝𝐞𝐥𝐥𝐚 𝐜𝐚𝐧𝐳𝐨𝐧𝐞! 𝐏𝐞𝐫 𝐚𝐯𝐞𝐫𝐞 𝐢𝐥 𝐭𝐞𝐬𝐭𝐨 𝐟𝐚𝐫𝐞 ’’.𝐩𝐥𝐚𝐲 (𝐜𝐚𝐧𝐳𝐨𝐧𝐞)’’ 𝐞 𝐬𝐜𝐡𝐢𝐚𝐜𝐜𝐢𝐚𝐫𝐞 ’’𝐬𝐢’’ 𝐞𝐧𝐭𝐫𝐨 𝟏𝟓 𝐬𝐞𝐜𝐨𝐧𝐝𝐢.")

  if (global.pendingLyrics?.[sender]) {
    clearTimeout(global.pendingLyrics[sender])
    delete global.pendingLyrics[sender]
  }

  try {
    const lyrics = await trovaTesto(titoloOriginale)

    if (!lyrics)
      throw "Non trovato"

    await conn.sendMessage(
      m.chat,
      {
        text:
`📜 𝐓𝐄𝐒𝐓𝐎 𝐃𝐈 *${titoloOriginale}*
━━━━━━━━━━━━━━
${lyrics}
━━━━━━━━━━━━━━
> 𝟑𝟑𝟑 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐫 𝐥𝐲𝐫𝐢𝐜𝐬`
      },
      { quoted: m }
    )

  } catch (e) {
    m.reply(`❌ 𝐍𝐨𝐧 𝐡𝐨 𝐭𝐫𝐨𝐯𝐚𝐭𝐨 𝐢𝐥 𝐭𝐞𝐬𝐭𝐨 𝐝𝐢 "${titoloOriginale}".`)
  }

  delete global.lyricsRequest[sender]
}

handler.command = /^lyrics_yes$/i
handler.tags = ['fun']
handler.help = ['lyrics_yes']

export default handler


async function trovaTesto(titolo) {

  let cleanTitle = titolo

  if (cleanTitle.includes('–')) cleanTitle = cleanTitle.split('–')[1]
  else if (cleanTitle.includes('-')) cleanTitle = cleanTitle.split('-')[1]

  cleanTitle = cleanTitle
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/official video|video ufficiale|lyrics|testo|audio/gi, '')
    .replace(/feat\.?|ft\.?/gi, '')
    .replace(/,/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  let testo = await cercaGenius(cleanTitle)
  if (testo) return testo

  const parole = cleanTitle.split(' ').slice(0, 4).join(' ')
  testo = await cercaGenius(parole)
  if (testo) return testo

  return null
}

async function cercaGenius(query) {
  try {
    const searchUrl = `https://genius.com/api/search/multi?q=${encodeURIComponent(query)}`
    const searchRes = await fetch(searchUrl)
    const searchData = await searchRes.json()

    const sections = searchData?.response?.sections || []
    const songSection = sections.find(s => s.type === "song")
    const hit = songSection?.hits?.[0]

    if (!hit) return null

    const url = hit.result.url
    const pageRes = await fetch(url)
    const html = await pageRes.text()
    const root = parse(html)

    const lyrics = root
      .querySelectorAll("[data-lyrics-container='true']")
      .map(x => x.text.trim())
      .filter(Boolean)
      .join("\n\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim()

    return lyrics || null

  } catch {
    return null
  }
}