//Plugin by Gab, Lucifero & 333 staff

import fetch from 'node-fetch'

const rapidApiKey = 'c9d9e589b3mshc7eecec96ccc03ep126bb1jsnbd4082441abd'
const rapidApiHost = 'tiktok-api23.p.rapidapi.com'

const getTikTokVideoId = async (url) => {
  const normalizedUrl = url.match(/https?:\/\/[^\s<>]+/i)?.[0]?.replace(/[),.;!?]+$/, '')
  if (!normalizedUrl) throw new Error(`Link TikTok non valido: ${url}`)

  const findVideoId = (value) => {
    const decodedUrl = decodeURIComponent(value)
    return decodedUrl.match(/\/video\/(\d+)/)?.[1]
  }

  const directMatch = findVideoId(normalizedUrl)
  if (directMatch) return directMatch

  const response = await fetch(normalizedUrl, { redirect: 'follow' })
  const redirectedVideoId = findVideoId(response.url)
  if (!redirectedVideoId) {
    throw new Error(`Impossibile ricavare il videoId dal link TikTok. URL finale: ${response.url}`)
  }

  return redirectedVideoId
}

let handler = async (m, { conn, text }) => {

  if (!text) {
    return m.reply('❌ Inserisci un link TikTok')
  }

  if (
    !text.includes('tiktok.com') &&
    !text.includes('vm.tiktok.com')
  ) {
    return m.reply('❌ Link TikTok non valido')
  }

  await m.reply(
`⏳ 𝐒𝐜𝐚𝐫𝐢𝐜𝐨 𝐢𝐥 𝐯𝐢𝐝𝐞𝐨...

> 𝟥𝟥𝟥 𝔹𝕆𝕋 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐫`
  )

  try {

    const videoId = await getTikTokVideoId(text.trim())
    const api = `https://${rapidApiHost}/api/post/detail?videoId=${encodeURIComponent(videoId)}`

    const res = await fetch(api, {
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': rapidApiHost
      }
    })
    const responseBody = await res.text()

    if (!res.ok) {
      throw new Error(`RapidAPI HTTP ${res.status} ${res.statusText}\n${responseBody}`)
    }

    let json
    try {
      json = JSON.parse(responseBody)
    } catch (error) {
      throw new Error(`Risposta RapidAPI non valida:\n${responseBody}`, { cause: error })
    }

    const video = json.itemInfo?.itemStruct
    const mediaUrls = [
      video?.video?.playAddr,
      video?.video?.downloadAddr,
      ...(video?.video?.bitrateInfo || []).flatMap(({ PlayAddr }) => PlayAddr?.UrlList || [])
    ].filter((url, index, urls) => url && urls.indexOf(url) === index)

    if (!mediaUrls.length) {
      throw new Error(`RapidAPI non ha restituito un URL video:\n${JSON.stringify(json, null, 2)}`)
    }

    let mediaBuffer
    const mediaErrors = []
    for (const mediaUrl of mediaUrls) {
      const mediaRes = await fetch(mediaUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Accept: 'video/mp4,video/*;q=0.9,*/*;q=0.8',
          Referer: 'https://www.tiktok.com/'
        }
      })
      if (!mediaRes.ok) {
        mediaErrors.push(`${new URL(mediaUrl).hostname}: HTTP ${mediaRes.status} ${mediaRes.statusText}`)
        continue
      }

      mediaBuffer = Buffer.from(await mediaRes.arrayBuffer())
      const contentType = mediaRes.headers.get('content-type') || ''
      const isMp4 = mediaBuffer.length > 12 && mediaBuffer.subarray(4, 8).toString() === 'ftyp'
      const isVideo = contentType.startsWith('video/') || isMp4
      if (mediaBuffer.length && isVideo) break

      mediaErrors.push(`${new URL(mediaUrl).hostname}: risposta non video (${contentType || 'content-type assente'})`)
      mediaBuffer = null
    }

    if (!mediaBuffer?.length) {
      throw new Error(`Nessun mirror CDN TikTok scaricabile:\n${mediaErrors.join('\n')}`)
    }

    await conn.sendMessage(m.chat, {
      video: mediaBuffer,
      mimetype: 'video/mp4',
      caption:
`🎬 𝐕𝐢𝐝𝐞𝐨 𝐬𝐜𝐚𝐫𝐢𝐜𝐚𝐭𝐨

    🎵 ${video.desc || 'TikTok Video'}

> 𝟥𝟥𝟥 𝔹𝕆𝕋 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐫`
    }, { quoted: m })

  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e || 'Errore non specificato'))
    const details = [
      `Messaggio: ${error.message}`,
      error.cause ? `Causa: ${error.cause.stack || error.cause.message || error.cause}` : '',
      `Stack: ${error.stack || 'non disponibile'}`
    ].filter(Boolean).join('\n')

    console.error('[fun-scarica] Errore download TikTok:', details)
    m.reply(`❌ Errore download TikTok:\n\n${details}`)
  }
}

handler.command = /^(tt|tiktok|scaricatk)$/i
handler.help = ['tt <link>']
handler.tags = ['downloader']

export default handler