//Plugin by Gab, Lucifero & 333 staff


const RAPID_KEY = "c9d9e589b3mshc7eecec96ccc03ep126bb1jsnbd4082441abd"
const TIK_HOST = "tiktok-api23.p.rapidapi.com"

async function fetchTik(endpoint) {
  try {
    const res = await fetch(`https://${TIK_HOST}/${endpoint}`, {
      headers: {
        "x-rapidapi-key": RAPID_KEY,
        "x-rapidapi-host": TIK_HOST
      }
    })
    return await res.json()
  } catch (e) { return null }
}

function formatNum(n) {
  if (!n) return "0"
  if (n >= 1000000000) return (n / 1000000000).toFixed(1) + "B"
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M"
  if (n >= 1000) return (n / 1000).toFixed(1) + "K"
  return n.toString()
}

let handler = async (m, { conn, args }) => {
  const chat = m.chat
  const cmd = args[0]?.toLowerCase()

  if (!cmd) {
    return m.reply(
`╭──────────────────╮
┃ 🎵 𝐂𝐎𝐌𝐀𝐍𝐃𝐈 𝐓𝐈𝐊𝐓𝐎𝐊
┃━━━━━━━━━━━━━━━━━━
┃ *.tiktok profilo @utente*
┃ → info profilo, follower, like
┃
┃ *.tiktok video [link]*
┃ → scarica video senza watermark
┃
┃ *.tiktok stats [link]*
┃ → statistiche video
╰──────────────────╯`)
  }

  if (cmd === "profilo") {
    const username = args[1]?.replace("@", "")
    if (!username) return m.reply("❌ Specifica un utente!\nEs: *.tiktok profilo @charlidamelio*")

    await m.reply(`🔍 Cerco il profilo @${username}...`)

    const data = await fetchTik(`api/user/info?uniqueId=${username}`)
    if (!data || data.statusCode !== 0) return m.reply("❌ Utente non trovato.")

    const user = data.userInfo?.user
    const stats = data.userInfo?.stats

    if (!user) return m.reply("❌ Errore nel recuperare il profilo.")

    const nickname = user.nickname || username
    const bio = user.signature || "Nessuna bio"
    const verified = user.verified ? "✅ Verificato" : ""
    const privato = user.privateAccount ? "🔒 Account privato" : "🌍 Account pubblico"
    const followers = formatNum(stats?.followerCount)
    const following = formatNum(stats?.followingCount)
    const likes = formatNum(stats?.heartCount)
    const video = formatNum(stats?.videoCount)
    const region = user.region || "N/D"

    let testo =
`╭──────────────────╮
┃ 🎵 𝐏𝐑𝐎𝐅𝐈𝐋𝐎 𝐓𝐈𝐊𝐓𝐎𝐊
┃━━━━━━━━━━━━━━━━━━
┃ 👤 *${nickname}* ${verified}
┃ 🔗 @${user.uniqueId}
┃ ${privato}
┃ 🌍 ${region}
┃━━━━━━━━━━━━━━━━━━
┃ 👥 Follower: *${followers}*
┃ ➡️ Following: *${following}*
┃ ❤️ Like totali: *${likes}*
┃ 🎬 Video: *${video}*
┃━━━━━━━━━━━━━━━━━━
┃ 📝 *Bio:*
┃ ${bio}
╰──────────────────╯`

    if (user.avatarLarger) {
      await conn.sendMessage(chat, {
        image: { url: user.avatarLarger },
        caption: testo
      }, { quoted: m })
    } else {
      await conn.sendMessage(chat, { text: testo }, { quoted: m })
    }
    return
  }

  if (cmd === "video") {
    const url = args[1]
    if (!url || !url.includes("tiktok.com")) return m.reply("❌ Manda un link TikTok valido!\nEs: *.tiktok video https://tiktok.com/@...*")

    await m.reply("⬇️ Scarico il video...")

    const data = await fetchTik(`api/download?url=${encodeURIComponent(url)}&hd=1`)
    if (!data || data.statusCode !== 0) return m.reply("❌ Errore nel scaricare il video.")

    const video = data.data
    if (!video) return m.reply("❌ Video non trovato.")

    const title = video.title || "Video TikTok"
    const author = video.author?.nickname || "N/D"
    const likes = formatNum(video.diggCount)
    const views = formatNum(video.playCount)
    const comments = formatNum(video.commentCount)
    const shares = formatNum(video.shareCount)

    const videoUrl = video.hdplay || video.play || video.wmplay

    if (!videoUrl) return m.reply("❌ Link video non disponibile.")

    await conn.sendMessage(chat, {
      video: { url: videoUrl },
      caption:
`🎵 *${title}*
👤 ${author}
━━━━━━━━━━━━
▶️ Views: *${views}*
❤️ Like: *${likes}*
💬 Commenti: *${comments}*
↗️ Condivisioni: *${shares}*`
    }, { quoted: m })
    return
  }

  if (cmd === "stats") {
    const url = args[1]
    if (!url || !url.includes("tiktok.com")) return m.reply("❌ Manda un link TikTok valido!\nEs: *.tiktok stats https://tiktok.com/@...*")

    await m.reply("📊 Recupero le statistiche...")

    const data = await fetchTik(`api/download?url=${encodeURIComponent(url)}&hd=0`)
    if (!data || data.statusCode !== 0) return m.reply("❌ Errore nel recuperare le statistiche.")

    const video = data.data
    if (!video) return m.reply("❌ Video non trovato.")

    const title = video.title || "N/D"
    const author = video.author?.nickname || "N/D"
    const authorUser = video.author?.uniqueId || "N/D"
    const likes = formatNum(video.diggCount)
    const views = formatNum(video.playCount)
    const comments = formatNum(video.commentCount)
    const shares = formatNum(video.shareCount)
    const saves = formatNum(video.collectCount)
    const duration = video.duration ? `${video.duration}s` : "N/D"
    const musica = video.music?.title || "N/D"
    const musicaAutore = video.music?.author || "N/D"

    const cover = video.cover || video.origin_cover

    let testo =
`╭──────────────────╮
┃ 📊 𝐒𝐓𝐀𝐓𝐈𝐒𝐓𝐈𝐂𝐇𝐄 𝐕𝐈𝐃𝐄𝐎
┃━━━━━━━━━━━━━━━━━━
┃ 🎬 *${title}*
┃ 👤 ${author} (@${authorUser})
┃━━━━━━━━━━━━━━━━━━
┃ ▶️ Views: *${views}*
┃ ❤️ Like: *${likes}*
┃ 💬 Commenti: *${comments}*
┃ ↗️ Condivisioni: *${shares}*
┃ 🔖 Salvati: *${saves}*
┃ ⏱ Durata: *${duration}*
┃━━━━━━━━━━━━━━━━━━
┃ 🎵 *${musica}*
┃ 🎤 ${musicaAutore}
╰──────────────────╯`

    if (cover) {
      await conn.sendMessage(chat, {
        image: { url: cover },
        caption: testo
      }, { quoted: m })
    } else {
      await conn.sendMessage(chat, { text: testo }, { quoted: m })
    }
    return
  }

  return m.reply(
`╭──────────────────╮
┃ 🎵 𝐂𝐎𝐌𝐀𝐍𝐃𝐈 𝐓𝐈𝐊𝐓𝐎𝐊
┃━━━━━━━━━━━━━━━━━━
┃ *.tiktok profilo @utente*
┃ *.tiktok video [link]*
┃ *.tiktok stats [link]*
╰──────────────────╯`)
}

handler.command = ["tiktok"]
export default handler

