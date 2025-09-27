//comando creato da sam aka vare github.com/realvare
let handler = async (m, { conn, args, participants, isAdmin, isBotAdmin }) => {
  if (m.text?.toLowerCase() === '.skipbandiera') {
    if (!m.isGroup) return m.reply('⚠️ Questo comando funziona solo nei gruppi!')
    if (!global.bandieraGame?.[m.chat]) return m.reply('⚠️ Non c\'è nessuna partita attiva in questo gruppo!')
    
    if (!isAdmin && !m.fromMe) {
      return m.reply('❌ *Questo comando può essere usato solo dagli admin!*')
    }

    clearTimeout(global.bandieraGame[m.chat].timeout)
    await conn.reply(m.chat, `🛑 *Gioco delle bandiere interrotto dall'admin*\n✨ La risposta era: *${global.bandieraGame[m.chat].risposta}*`, m)
    delete global.bandieraGame[m.chat]
    return
  }

  if (global.bandieraGame?.[m.chat]) {
    return m.reply('⚠️ C\'è già una partita attiva in questo gruppo!')
  }

  const cooldownKey = `bandiera_${m.chat}`
  const lastGame = global.cooldowns?.[cooldownKey] || 0
  const now = Date.now()
  const cooldownTime = 10000

  if (now - lastGame < cooldownTime) {
    const remainingTime = Math.ceil((cooldownTime - (now - lastGame)) / 1000)
    return m.reply(`⏳ *Aspetta ancora ${remainingTime} secondi prima di avviare un nuovo gioco!*`)
  }

  global.cooldowns = global.cooldowns || {}
  global.cooldowns[cooldownKey] = now

  let bandiere = [
    { url: 'https://flagcdn.com/w320/it.png', nome: 'Italia' },
    { url: 'https://flagcdn.com/w320/fr.png', nome: 'Francia' },
    { url: 'https://flagcdn.com/w320/de.png', nome: 'Germania' },
    { url: 'https://flagcdn.com/w320/gb.png', nome: 'Regno Unito' },
    { url: 'https://flagcdn.com/w320/es.png', nome: 'Spagna' },
    { url: 'https://flagcdn.com/w320/se.png', nome: 'Svezia' },
    { url: 'https://flagcdn.com/w320/no.png', nome: 'Norvegia' },
    { url: 'https://flagcdn.com/w320/fi.png', nome: 'Finlandia' },
    { url: 'https://flagcdn.com/w320/dk.png', nome: 'Danimarca' },
    { url: 'https://flagcdn.com/w320/pl.png', nome: 'Polonia' },
    { url: 'https://flagcdn.com/w320/pt.png', nome: 'Portogallo' },
    { url: 'https://flagcdn.com/w320/gr.png', nome: 'Grecia' },
    { url: 'https://flagcdn.com/w320/ch.png', nome: 'Svizzera' },
    { url: 'https://flagcdn.com/w320/at.png', nome: 'Austria' },
    { url: 'https://flagcdn.com/w320/be.png', nome: 'Belgio' },
    { url: 'https://flagcdn.com/w320/nl.png', nome: 'Paesi Bassi' },
    { url: 'https://flagcdn.com/w320/ua.png', nome: 'Ucraina' },
    { url: 'https://flagcdn.com/w320/ro.png', nome: 'Romania' },
    { url: 'https://flagcdn.com/w320/hu.png', nome: 'Ungheria' },
    { url: 'https://flagcdn.com/w320/cz.png', nome: 'Repubblica Ceca' },
    { url: 'https://flagcdn.com/w320/ie.png', nome: 'Irlanda' },
    { url: 'https://flagcdn.com/w320/ee.png', nome: 'Estonia' },
    { url: 'https://flagcdn.com/w320/lt.png', nome: 'Lituania' },
    { url: 'https://flagcdn.com/w320/lv.png', nome: 'Lettonia' },
    { url: 'https://flagcdn.com/w320/sk.png', nome: 'Slovacchia' },
    { url: 'https://flagcdn.com/w320/si.png', nome: 'Slovenia' },
    { url: 'https://flagcdn.com/w320/hr.png', nome: 'Croazia' },
    { url: 'https://flagcdn.com/w320/ba.png', nome: 'Bosnia ed Erzegovina' },
    { url: 'https://flagcdn.com/w320/me.png', nome: 'Montenegro' },
    { url: 'https://flagcdn.com/w320/mk.png', nome: 'Macedonia del Nord' },
    { url: 'https://flagcdn.com/w320/al.png', nome: 'Albania' },
    { url: 'https://flagcdn.com/w320/bg.png', nome: 'Bulgaria' },
    { url: 'https://flagcdn.com/w320/md.png', nome: 'Moldavia' },
    { url: 'https://flagcdn.com/w320/by.png', nome: 'Bielorussia' },
    { url: 'https://flagcdn.com/w320/is.png', nome: 'Islanda' },
    { url: 'https://flagcdn.com/w320/mt.png', nome: 'Malta' },
    { url: 'https://flagcdn.com/w320/cy.png', nome: 'Cipro' },
    { url: 'https://flagcdn.com/w320/lu.png', nome: 'Lussemburgo' },
    { url: 'https://flagcdn.com/w320/li.png', nome: 'Liechtenstein' },
    { url: 'https://flagcdn.com/w320/sm.png', nome: 'San Marino' },
    { url: 'https://flagcdn.com/w320/ad.png', nome: 'Andorra' },
    { url: 'https://flagcdn.com/w320/mc.png', nome: 'Monaco' },
    { url: 'https://flagcdn.com/w320/va.png', nome: 'Città del Vaticano' },
    { url: 'https://flagcdn.com/w320/rs.png', nome: 'Serbia' },
    { url: 'https://flagcdn.com/w320/xk.png', nome: 'Kosovo' },
    { url: 'https://flagcdn.com/w320/cn.png', nome: 'Cina' },
    { url: 'https://flagcdn.com/w320/jp.png', nome: 'Giappone' },
    { url: 'https://flagcdn.com/w320/in.png', nome: 'India' },
    { url: 'https://flagcdn.com/w320/kr.png', nome: 'Corea del Sud' },
    { url: 'https://flagcdn.com/w320/kp.png', nome: 'Corea del Nord' },
    { url: 'https://flagcdn.com/w320/th.png', nome: 'Thailandia' },
    { url: 'https://flagcdn.com/w320/vn.png', nome: 'Vietnam' },
    { url: 'https://flagcdn.com/w320/id.png', nome: 'Indonesia' },
    { url: 'https://flagcdn.com/w320/ph.png', nome: 'Filippine' },
    { url: 'https://flagcdn.com/w320/my.png', nome: 'Malesia' },
    { url: 'https://flagcdn.com/w320/sg.png', nome: 'Singapore' },
    { url: 'https://flagcdn.com/w320/mm.png', nome: 'Myanmar' },
    { url: 'https://flagcdn.com/w320/kh.png', nome: 'Cambogia' },
    { url: 'https://flagcdn.com/w320/la.png', nome: 'Laos' },
    { url: 'https://flagcdn.com/w320/lk.png', nome: 'Sri Lanka' },
    { url: 'https://flagcdn.com/w320/np.png', nome: 'Nepal' },
    { url: 'https://flagcdn.com/w320/bt.png', nome: 'Bhutan' },
    { url: 'https://flagcdn.com/w320/bd.png', nome: 'Bangladesh' },
    { url: 'https://flagcdn.com/w320/pk.png', nome: 'Pakistan' },
    { url: 'https://flagcdn.com/w320/af.png', nome: 'Afghanistan' },
    { url: 'https://flagcdn.com/w320/ir.png', nome: 'Iran' },
    { url: 'https://flagcdn.com/w320/iq.png', nome: 'Iraq' },
    { url: 'https://flagcdn.com/w320/tr.png', nome: 'Turchia' },
    { url: 'https://flagcdn.com/w320/il.png', nome: 'Israele' },
    { url: 'https://flagcdn.com/w320/ps.png', nome: 'Palestina' },
    { url: 'https://flagcdn.com/w320/sa.png', nome: 'Arabia Saudita' },
    { url: 'https://flagcdn.com/w320/ae.png', nome: 'Emirati Arabi Uniti' },
    { url: 'https://flagcdn.com/w320/qa.png', nome: 'Qatar' },
    { url: 'https://flagcdn.com/w320/om.png', nome: 'Oman' },
    { url: 'https://flagcdn.com/w320/jo.png', nome: 'Giordania' },
    { url: 'https://flagcdn.com/w320/lb.png', nome: 'Libano' },
    { url: 'https://flagcdn.com/w320/sy.png', nome: 'Siria' },
    { url: 'https://flagcdn.com/w320/ye.png', nome: 'Yemen' },
    { url: 'https://flagcdn.com/w320/kz.png', nome: 'Kazakistan' },
    { url: 'https://flagcdn.com/w320/uz.png', nome: 'Uzbekistan' },
    { url: 'https://flagcdn.com/w320/tj.png', nome: 'Tagikistan' },
    { url: 'https://flagcdn.com/w320/kg.png', nome: 'Kirghizistan' },
    { url: 'https://flagcdn.com/w320/tm.png', nome: 'Turkmenistan' },
    { url: 'https://flagcdn.com/w320/mn.png', nome: 'Mongolia' },
    { url: 'https://flagcdn.com/w320/az.png', nome: 'Azerbaigian' },
    { url: 'https://flagcdn.com/w320/ge.png', nome: 'Georgia' },
    { url: 'https://flagcdn.com/w320/am.png', nome: 'Armenia' },
    { url: 'https://flagcdn.com/w320/kw.png', nome: 'Kuwait' },
    { url: 'https://flagcdn.com/w320/bh.png', nome: 'Bahrain' },
    { url: 'https://flagcdn.com/w320/tw.png', nome: 'Taiwan' },
    { url: 'https://flagcdn.com/w320/hk.png', nome: 'Hong Kong' },
    { url: 'https://flagcdn.com/w320/eg.png', nome: 'Egitto' },
    { url: 'https://flagcdn.com/w320/ng.png', nome: 'Nigeria' },
    { url: 'https://flagcdn.com/w320/ma.png', nome: 'Marocco' },
    { url: 'https://flagcdn.com/w320/tn.png', nome: 'Tunisia' },
    { url: 'https://flagcdn.com/w320/ke.png', nome: 'Kenya' },
    { url: 'https://flagcdn.com/w320/et.png', nome: 'Etiopia' },
    { url: 'https://flagcdn.com/w320/gh.png', nome: 'Ghana' },
    { url: 'https://flagcdn.com/w320/cm.png', nome: 'Camerun' },
    { url: 'https://flagcdn.com/w320/ci.png', nome: "Costa d'Avorio" },
    { url: 'https://flagcdn.com/w320/sn.png', nome: 'Senegal' },
    { url: 'https://flagcdn.com/w320/zm.png', nome: 'Zambia' },
    { url: 'https://flagcdn.com/w320/zw.png', nome: 'Zimbabwe' },
    { url: 'https://flagcdn.com/w320/ao.png', nome: 'Angola' },
    { url: 'https://flagcdn.com/w320/mg.png', nome: 'Madagascar' },
    { url: 'https://flagcdn.com/w320/tz.png', nome: 'Tanzania' },
    { url: 'https://flagcdn.com/w320/ug.png', nome: 'Uganda' },
    { url: 'https://flagcdn.com/w320/mz.png', nome: 'Mozambico' },
    { url: 'https://flagcdn.com/w320/rw.png', nome: 'Ruanda' },
    { url: 'https://flagcdn.com/w320/mw.png', nome: 'Malawi' },
    { url: 'https://flagcdn.com/w320/bw.png', nome: 'Botswana' },
    { url: 'https://flagcdn.com/w320/na.png', nome: 'Namibia' },
    { url: 'https://flagcdn.com/w320/sz.png', nome: 'Eswatini' },
    { url: 'https://flagcdn.com/w320/ls.png', nome: 'Lesotho' },
    { url: 'https://flagcdn.com/w320/dz.png', nome: 'Algeria' },
    { url: 'https://flagcdn.com/w320/ly.png', nome: 'Libia' },
    { url: 'https://flagcdn.com/w320/sd.png', nome: 'Sudan' },
    { url: 'https://flagcdn.com/w320/ss.png', nome: 'Sudan del Sud' },
    { url: 'https://flagcdn.com/w320/er.png', nome: 'Eritrea' },
    { url: 'https://flagcdn.com/w320/dj.png', nome: 'Gibuti' },
    { url: 'https://flagcdn.com/w320/so.png', nome: 'Somalia' },
    { url: 'https://flagcdn.com/w320/cd.png', nome: 'Repubblica Democratica del Congo' },
    { url: 'https://flagcdn.com/w320/cg.png', nome: 'Repubblica del Congo' },
    { url: 'https://flagcdn.com/w320/cf.png', nome: 'Repubblica Centrafricana' },
    { url: 'https://flagcdn.com/w320/td.png', nome: 'Ciad' },
    { url: 'https://flagcdn.com/w320/ne.png', nome: 'Niger' },
    { url: 'https://flagcdn.com/w320/ml.png', nome: 'Mali' },
    { url: 'https://flagcdn.com/w320/bf.png', nome: 'Burkina Faso' },
    { url: 'https://flagcdn.com/w320/mr.png', nome: 'Mauritania' },
    { url: 'https://flagcdn.com/w320/gn.png', nome: 'Guinea' },
    { url: 'https://flagcdn.com/w320/gw.png', nome: 'Guinea-Bissau' },
    { url: 'https://flagcdn.com/w320/sl.png', nome: 'Sierra Leone' },
    { url: 'https://flagcdn.com/w320/lr.png', nome: 'Liberia' },
    { url: 'https://flagcdn.com/w320/tg.png', nome: 'Togo' },
    { url: 'https://flagcdn.com/w320/bj.png', nome: 'Benin' },
    { url: 'https://flagcdn.com/w320/ga.png', nome: 'Gabon' },
    { url: 'https://flagcdn.com/w320/gq.png', nome: 'Guinea Equatoriale' },
    { url: 'https://flagcdn.com/w320/cv.png', nome: 'Capo Verde' },
    { url: 'https://flagcdn.com/w320/gm.png', nome: 'Gambia' },
    { url: 'https://flagcdn.com/w320/bi.png', nome: 'Burundi' },
    { url: 'https://flagcdn.com/w320/km.png', nome: 'Comore' },
    { url: 'https://flagcdn.com/w320/mu.png', nome: 'Mauritius' },
    { url: 'https://flagcdn.com/w320/sc.png', nome: 'Seychelles' },
    { url: 'https://flagcdn.com/w320/us.png', nome: 'Stati Uniti' },
    { url: 'https://flagcdn.com/w320/ca.png', nome: 'Canada' },
    { url: 'https://flagcdn.com/w320/mx.png', nome: 'Messico' },
    { url: 'https://flagcdn.com/w320/br.png', nome: 'Brasile' },
    { url: 'https://flagcdn.com/w320/ar.png', nome: 'Argentina' },
    { url: 'https://flagcdn.com/w320/cl.png', nome: 'Cile' },
    { url: 'https://flagcdn.com/w320/co.png', nome: 'Colombia' },
    { url: 'https://flagcdn.com/w320/pe.png', nome: 'Perù' },
    { url: 'https://flagcdn.com/w320/ve.png', nome: 'Venezuela' },
    { url: 'https://flagcdn.com/w320/cu.png', nome: 'Cuba' },
    { url: 'https://flagcdn.com/w320/bo.png', nome: 'Bolivia' },
    { url: 'https://flagcdn.com/w320/ec.png', nome: 'Ecuador' },
    { url: 'https://flagcdn.com/w320/uy.png', nome: 'Uruguay' },
    { url: 'https://flagcdn.com/w320/py.png', nome: 'Paraguay' },
    { url: 'https://flagcdn.com/w320/cr.png', nome: 'Costa Rica' },
    { url: 'https://flagcdn.com/w320/pa.png', nome: 'Panama' },
    { url: 'https://flagcdn.com/w320/do.png', nome: 'Repubblica Dominicana' },
    { url: 'https://flagcdn.com/w320/jm.png', nome: 'Giamaica' },
    { url: 'https://flagcdn.com/w320/gt.png', nome: 'Guatemala' },
    { url: 'https://flagcdn.com/w320/hn.png', nome: 'Honduras' },
    { url: 'https://flagcdn.com/w320/ni.png', nome: 'Nicaragua' },
    { url: 'https://flagcdn.com/w320/sv.png', nome: 'El Salvador' },
    { url: 'https://flagcdn.com/w320/bz.png', nome: 'Belize' },
    { url: 'https://flagcdn.com/w320/ht.png', nome: 'Haiti' },
    { url: 'https://flagcdn.com/w320/gy.png', nome: 'Guyana' },
    { url: 'https://flagcdn.com/w320/sr.png', nome: 'Suriname' },
    { url: 'https://flagcdn.com/w320/gf.png', nome: 'Guyana Francese' },
    { url: 'https://flagcdn.com/w320/tt.png', nome: 'Trinidad e Tobago' },
    { url: 'https://flagcdn.com/w320/bb.png', nome: 'Barbados' },
    { url: 'https://flagcdn.com/w320/lc.png', nome: 'Santa Lucia' },
    { url: 'https://flagcdn.com/w320/dm.png', nome: 'Dominica' },
    { url: 'https://flagcdn.com/w320/bs.png', nome: 'Bahamas' },
    { url: 'https://flagcdn.com/w320/au.png', nome: 'Australia' },
    { url: 'https://flagcdn.com/w320/nz.png', nome: 'Nuova Zelanda' },
    { url: 'https://flagcdn.com/w320/fj.png', nome: 'Fiji' },
    { url: 'https://flagcdn.com/w320/pg.png', nome: 'Papua Nuova Guinea' },
    { url: 'https://flagcdn.com/w320/nc.png', nome: 'Nuova Caledonia' },
    { url: 'https://flagcdn.com/w320/pr.png', nome: 'Porto Rico' },
    { url: 'https://flagcdn.com/w320/gl.png', nome: 'Groenlandia' },
    { url: 'https://flagcdn.com/w320/gi.png', nome: 'Gibilterra' },
    { url: 'https://flagcdn.com/w320/aq.png', nome: 'Antartide' },
    { url: 'https://flagcdn.com/w320/eh.png', nome: 'Sahara Occidentale' },
  ]

  let frasi = [
    `🇺🇳 *INDOVINA LA BANDIERA!* 🇺🇳`,
    `🌍 *Che nazione rappresenta questa bandiera?*`,
    `🏳️ *Sfida geografica: riconosci questa bandiera?*`,
    `🧭 *Indovina la nazione dalla sua bandiera!*`,
    `🎯 *Quiz bandiere: quale paese è questo?*`,
    `🌟 *Metti alla prova la tua conoscenza geografica!*`,
    `🔍 *Osserva attentamente e indovina la nazione!*`,
  ]

  let scelta = bandiere[Math.floor(Math.random() * bandiere.length)]
  let frase = frasi[Math.floor(Math.random() * frasi.length)]

  try {
    let msg = await conn.sendMessage(m.chat, {
      image: { url: scelta.url },
      caption: `${frase}\n\n ㌌ *Rispondi con il nome della nazione!*\n⏱️ *Tempo disponibile:* 30 secondi\n\n> \`vare ✧ bot\``,
      quoted: m
    })

    global.bandieraGame = global.bandieraGame || {}
    global.bandieraGame[m.chat] = {
      id: msg.key.id,
      risposta: scelta.nome.toLowerCase(),
      rispostaOriginale: scelta.nome,
      tentativi: {},
      suggerito: false,
      startTime: Date.now(),
      timeout: setTimeout(() => {
        if (global.bandieraGame?.[m.chat]) {
          conn.reply(m.chat, `⏳ *Tempo scaduto!*\n\n🌍 *La risposta era:* *${scelta.nome}*\n\n> \`vare ✧ bot\``, msg)
          delete global.bandieraGame[m.chat]
        }
      }, 30000)
    }
  } catch (error) {
    console.error('Errore nel gioco bandiere:', error)
    m.reply('❌ *Si è verificato un errore durante l\'avvio del gioco*\n\n🔄 *Riprova tra qualche secondo*')
  }
}

function normalizeString(str) {
    if (!str) return ''
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .trim()
}

function calculateSimilarity(str1, str2) {
    const words1 = str1.split(' ').filter(word => word.length > 1)
    const words2 = str2.split(' ').filter(word => word.length > 1)
    
    if (words1.length === 0 || words2.length === 0) return 0
    
    const matches = words1.filter(word => 
        words2.some(w2 => w2.includes(word) || word.includes(w2))
    )
    
    return matches.length / Math.max(words1.length, words2.length)
}

function isAnswerCorrect(userAnswer, correctAnswer) {
    if (userAnswer.length < 2) return false
    
    const similarityScore = calculateSimilarity(userAnswer, correctAnswer)
    
    return (
        userAnswer === correctAnswer ||
        (correctAnswer.includes(userAnswer) && userAnswer.length > correctAnswer.length * 0.5) ||
        (userAnswer.includes(correctAnswer) && userAnswer.length < correctAnswer.length * 1.5) ||
        similarityScore >= 0.8
    )
}

handler.before = async (m, { conn }) => {
    const chat = m.chat
    const game = global.bandieraGame?.[chat]
    
    if (!game || !m.quoted || m.quoted.id !== game.id || m.key.fromMe) return
    
    const userAnswer = normalizeString(m.text || '')
    const correctAnswer = normalizeString(game.risposta)
    
    if (!userAnswer || userAnswer.length < 2) return
    
    const similarityScore = calculateSimilarity(userAnswer, correctAnswer)

    if (isAnswerCorrect(userAnswer, correctAnswer)) {
        clearTimeout(game.timeout)
        
        const timeTaken = Math.round((Date.now() - game.startTime) / 1000)
        let reward = Math.floor(Math.random() * 31) + 20
        let exp = 500
        
        const timeBonus = timeTaken <= 10 ? 20 : timeTaken <= 20 ? 10 : 0
        reward += timeBonus
        
        // Inizializza il portafoglio se non esiste
        if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
        if (global.db.data.users[m.sender].limit == null) global.db.data.users[m.sender].limit = 0
        if (global.db.data.users[m.sender].exp == null) global.db.data.users[m.sender].exp = 0

        // Aggiungi UnityCoins e exp (usa .limit come saldo portafoglio)
        global.db.data.users[m.sender].limit = Number(global.db.data.users[m.sender].limit) + Number(reward)
        global.db.data.users[m.sender].exp = Number(global.db.data.users[m.sender].exp) + Number(exp)

        // Forza la scrittura del database e aggiorna la cache in memoria
        if (global.db && typeof global.db.write === 'function') {
            await global.db.write();
            await global.db.read(); // aggiorna la cache dopo la scrittura
        }

        let congratsMessage = `
╭━『 🎉 *RISPOSTA CORRETTA!* 』━╮
┃
┃ 🌍 *Nazione:* ${game.rispostaOriginale}
┃ ⏱️ *Tempo impiegato:* ${timeTaken}s
┃
┃ 🎁 *Ricompense:*
┃ • ${reward} 🪙 UnityCoins${timeBonus > 0 ? ` (+${timeBonus} bonus velocità)` : ''}
┃ • ${exp} 🆙 EXP
┃
┃ 💰 *Saldo attuale:* ${global.db.data.users[m.sender].limit} UnityCoins
╰━━━━━━━━━━━━━━━━╯

> \`vare ✧ bot\``

        await conn.reply(chat, congratsMessage, m)
        delete global.bandieraGame[chat]
        
    } else if (similarityScore >= 0.6 && !game.suggerito) {
        game.suggerito = true
        await conn.reply(chat, '👀 *Ci sei quasi!*', m)
        
    } else if (game.tentativi[m.sender] >= 3) {
        await conn.reply(chat, '❌ *Hai esaurito i tuoi 3 tentativi!*\n\n⏳ *Aspetta che altri giocatori provino o che finisca il tempo*', m)
        
    } else {
        game.tentativi[m.sender] = (game.tentativi[m.sender] || 0) + 1
        const tentativiRimasti = 3 - game.tentativi[m.sender]
        
        if (tentativiRimasti === 1) {
            const primaLettera = game.rispostaOriginale[0].toUpperCase()
            const numeroLettere = game.rispostaOriginale.length
            await conn.reply(chat, `❌ *Risposta errata!*

💡 *Suggerimento:*
   • Inizia con la lettera *"${primaLettera}"*
   • È composta da *${numeroLettere} lettere*`, m)
        } else if (tentativiRimasti === 2) {
            await conn.reply(chat, `❌ *Risposta errata!*

📝 *Tentativi rimasti:* 
🤔 *Pensa bene alla tua prossima risposta!*`, m)
        } else {
            await conn.reply(chat, `❌ *Risposta errata!*

📝 *Ultimo tentativo rimasto..*`, m)
        }
    }
}

handler.help = ['bandiera']
handler.tags = ['giochi']
handler.command = /^(bandiera|skipbandiera)$/i
handler.group = true
handler.register = true

export default handler