let handler = async (m, { conn }) => {
    let stats = Object.entries(db.data.stats).map(([key, val]) => {
        let name = Array.isArray(plugins[key]?.help) ? plugins[key]?.help?.join(' , ') : plugins[key]?.help || key 
        
        if (/exec/.test(name)) return
        return { name, ...val }
    })
     
    stats = stats.sort((a, b) => b.total - a.total)
    
    let txt = stats.slice(0, 10).map(({ name, total, last }) => {
        return `┏━━━━━━━━━━━━━┓
┣📚 COMANDO : ${name}
┣🗂️ USI : ${total}
┣⏱️ ULTIMO USO : ${getTime(last)}
┗━━━━━━━━━━━━━┛`
    }).join('\n\n')
    
    await conn.reply(m.chat, `⚡ *TOP 10 COMANDI PIÙ UTILIZZATI* ⚡\n\n${txt}`, m)
}

handler.help = ['dashboard']
handler.tags = ['info']
handler.command = /^dashboard$/i

export default handler

function parseMs(ms) {
    if (typeof ms !== 'number') throw 'Parametro non valido'
    return {
        giorni: Math.floor(ms / 86400000),
        ore: Math.floor(ms / 3600000) % 24,
        minuti: Math.floor(ms / 60000) % 60,
        secondi: Math.floor(ms / 1000) % 60
    }
}

function getTime(ms) {
    if (!ms) return 'Mai usato'
    let now = parseMs(+new Date() - ms)
    if (now.giorni) return `${now.giorni} giorni fa`
    if (now.ore) return `${now.ore} ore fa`
    if (now.minuti) return `${now.minuti} minuti fa`
    return `pochi secondi fa`
}