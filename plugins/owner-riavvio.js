const handler = async (m, { conn, isROwner, text }) => {
    const datas = global
    
    if (!process.send) throw 'Dont: node main.js\nDo: node index.js'
    const { key } = await conn.sendMessage(m.chat, {text: `Sto riavviando`}, {quoted: m})
    await delay(1000 * 1)
    await conn.sendMessage(m.chat, {text: `🚀🚀🚀🚀`, edit: key})
    await delay(1000 * 1)
    await conn.sendMessage(m.chat, {text: `🚀🚀🚀🚀🚀🚀`, edit: key})
    await conn.sendMessage(m.chat, {text: `Riavviato con successo`, edit: key})
    //process.send('reset')
    process.exit(0); 
    }
    handler.help = ['riavvia'] 
    handler.tags = ['owner']
    handler.command = ['riavvia','reiniciar'] 
    handler.owner = true
    export default handler
    
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))