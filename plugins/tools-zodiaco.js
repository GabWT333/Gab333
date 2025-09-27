let handler = async (m, { usedPrefix, command, text }) => {
    if (!text) return m.reply(`🔮 *Esempio di utilizzo:*\n${usedPrefix + command} *2003 02 25*`)

    const date = new Date(text)
    if (date == '❌ *Data non valida!*\nUsa il formato: *AAAA MM GG*\nEsempio: *2001 01 01*') throw date
    
    const oggi = new Date()
    const [anno, mese, giorno] = [oggi.getFullYear(), oggi.getMonth() + 1, oggi.getDate()]
    const nascita = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    
    const segnoZodiacale = getZodiac(nascita[1], nascita[2])
    const differenza = new Date(oggi - date)
    const eta = differenza.getFullYear() - new Date(1970, 0, 1).getFullYear()

    const prossimoCompleanno = [anno + (nascita[1] < mese ? 1 : 0), ...nascita.slice(1)]
    const verificaEta = mese === nascita[1] && giorno === nascita[2] 
        ? `🎂 *${eta} anni* - BUON COMPLEANNO! 🥳` 
        : `📅 *${eta} anni*`

    const descrizioneSegno = getDescrizioneSegno(segnoZodiacale)
    const emojiSegno = getZodiacEmoji(segnoZodiacale)

    // Define the textbot variable
    const textbot = '> ChatUnity Bot';

    const testo = `
✨ *PROFILO ZODIACALE* ✨

📆 *Data di nascita:* ${nascita.join('-')}
🔄 *Prossimo compleanno:* ${prossimoCompleanno.join('-')}
🧮 *Età attuale:* ${verificaEta}
🌟 *Segno zodiacale:* ${segnoZodiacale} ${emojiSegno}

📜 *Caratteristica:* ${descrizioneSegno}

${getRandomHoroscope(segnoZodiacale)}

⚡ *${textbot}*
`.trim()
    
    await m.reply(testo)
}

// Funzioni helper
function getZodiac(mese, giorno) {
    let d = new Date(1970, mese - 1, giorno)
    return segniZodiacali.find(([_,_d]) => d >= _d)[0]
}

function getZodiacEmoji(segno) {
    const emojiMap = {
        'Capricorno': '🐐',
        'Acquario': '🏺',
        'Pesci': '🐠',
        'Ariete': '🐏',
        'Toro': '🐂',
        'Gemelli': '👯',
        'Cancro': '🦀',
        'Leone': '🦁',
        'Vergine': '🌾',
        'Bilancia': '⚖️',
        'Scorpione': '🦂',
        'Sagittario': '🏹'
    }
    return emojiMap[segno] || '✨'
}

function getDescrizioneSegno(segno) {
    const descrizioni = {
        'Capricorno': 'I Capricorno sono determinati e pratici, sempre concentrati sui loro obiettivi come una capra che scala la montagna! 🗻',
        'Acquario': 'Gli Acquario sono innovatori e anticonformisti, sempre un passo avanti come l\'acqua che scorre. 💧',
        'Pesci': 'I Pesci sono empatici e sognatori, nuotano tra realtà e fantasia come pesci nell\'oceano. 🌊',
        'Ariete': 'Gli Ariete sono coraggiosi e impulsivi, caricano a testa bassa come un ariete in battaglia! ⚔️',
        'Toro': 'I Toro sono pazienti e testardi, fermi come una roccia quando decidono qualcosa. 🪨',
        'Gemelli': 'I Gemelli sono versatili e comunicativi, cambiano umore come il vento. 🌬️',
        'Cancro': 'I Cancro sono sensibili e protettivi, con un guscio duro ma un cuore tenero. 🏠',
        'Leone': 'I Leone sono orgogliosi e generosi, re della giungla che ama essere al centro dell\'attenzione. 👑',
        'Vergine': 'Le Vergine sono precise e analitiche, perfezioniste che notano ogni dettaglio. 🔍',
        'Bilancia': 'Le Bilancia sono diplomatiche e amanti dell\'armonia, sempre in cerca di equilibrio. ☯️',
        'Scorpione': 'Gli Scorpione sono intensi e misteriosi, con un fascino magnetico e un pungiglione pronto. 🦂',
        'Sagittario': 'I Sagittario sono avventurosi e ottimisti, sempre con la freccia puntata verso l\'orizzonte. 🌄'
    }
    return descrizioni[segno] || 'Segno misterioso e affascinante!'
}

function getRandomHoroscope(segno) {
    const oroscopi = {
        'Capricorno': 'Oggi è un buon giorno per pianificare il futuro! 💼',
        'Acquario': 'La tua creatività è al massimo oggi, sfruttala! 💡',
        'Pesci': 'Segui il tuo intuito oggi, ti porterà lontano! 🔮',
        'Ariete': 'Energia alle Unitycoins oggi, ma attento agli impeti! 🚀',
        'Toro': 'Giorno perfetto per goderti i piaceri della vita! 🍷',
        'Gemelli': 'La comunicazione è la tua arma vincente oggi! 💬',
        'Cancro': 'Coccola i tuoi cari oggi, ne hai bisogno! 💕',
        'Leone': 'Tutti gli occhi sono su di te oggi, brilla! ✨',
        'Vergine': 'Attenzione ai dettagli oggi, ti salveranno! 📝',
        'Bilancia': 'Cerca l\'armonia oggi, evita i conflitti! ☮️',
        'Scorpione': 'La tua passione è magnetica oggi, usala bene! 🔥',
        'Sagittario': 'Avventura in vista oggi, preparati a partire! 🌍'
    }
    return `🔮 *Oroscopo del giorno:* ${oroscopi[segno] || 'Giorno fortunato in arrivo!'}`
}

const segniZodiacali = [
    ["Capricorno", new Date(1970, 0, 1)],
    ["Acquario", new Date(1970, 0, 20)],
    ["Pesci", new Date(1970, 1, 19)],
    ["Ariete", new Date(1970, 2, 21)],
    ["Toro", new Date(1970, 3, 21)],
    ["Gemelli", new Date(1970, 4, 21)],
    ["Cancro", new Date(1970, 5, 22)],
    ["Leone", new Date(1970, 6, 23)],
    ["Vergine", new Date(1970, 7, 23)],
    ["Bilancia", new Date(1970, 8, 23)],
    ["Scorpione", new Date(1970, 9, 23)],
    ["Sagittario", new Date(1970, 10, 22)],
    ["Capricorno", new Date(1970, 11, 22)]
].reverse()

handler.help = ['zodiaco <AAAA MM GG>']
handler.tags = ['oroscopo']
handler.command = /^(zodiaco|segno|oroscopo)$/i
handler.register = true

export default handler