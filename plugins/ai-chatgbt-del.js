let handler = async (m, { usedPrefix }) => {
    try {
        delete global.chatgpt.data.users[m.sender]  
        await m.reply(`*[ ✔️ ] La cronologia dei messaggi tra te e ChatGPT (IA) è stata eliminata con successo!\n\nRicorda che puoi usare questo comando quando hai qualche problema con il comando ${usedPrefix}ia2*`)    
    } catch (error) {   
        console.error('Errore nel comando delchatgpt:', error)
        await m.reply(`*⚠️ Errore, per favore riprova più tardi*`)   
    }
} 

handler.help = ['delchatgpt']
handler.tags = ['ai']
handler.command = ['delchatgpt']
handler.desc = 'Elimina la cronologia delle chat con ChatGPT'
export default handler