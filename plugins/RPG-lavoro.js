//Plugin by Gab, Lucifero & 333 staff



let handler = async (m, { conn }) => {

  let user = global.db.data.users[m.sender]

  let cooldown = 1000 * 60 * 30
  let now = Date.now()

  if (!user.workCooldown) user.workCooldown = 0

  if (now < user.workCooldown) {
    let time = msToTime(user.workCooldown - now)
    return m.reply(`⏳ Hai già lavorato recentemente\nRiprova tra ${time}`)
  }

  user.workCooldown = now + cooldown

  let successRate = 0.7
  let success = Math.random() < successRate

  let lavori = [
    "hai lavorato come sviluppatore e non è esploso nulla",
    "hai fatto il rider sotto la pioggia come un eroe",
    "hai venduto roba inutile a prezzo folle",
    "hai fatto il DJ e nessuno si è lamentato",
    "hai lavorato in nero ma ti è andata bene",
    "hai fatto il meccanico e l’auto funziona ancora",
    "hai fatto il programmatore e hai fixato un bug",
    "hai fatto il muratore senza morire di caldo",
    "hai truffato qualcuno con successo",
    "hai fatto il freelance e ti hanno pagato davvero"
  ]

  let fallimenti = [
    "ti hanno licenziato in tempo record",
    "hai rotto tutto e devi pagare i danni",
    "il capo è sparito con i tuoi soldi",
    "sei stato truffato male",
    "hai perso tutto in un attimo",
    "ti sei addormentato sul lavoro",
    "hai fatto una figura ridicola",
    "hai perso il cliente più ricco",
    "sei stato beccato a non fare nulla",
    "hai fatto crashare tutto"
  ]

  let evento = pickRandom(success ? lavori : fallimenti)
  let amount = Math.floor(Math.random() * 2000) + 1

  let text = `╭━━━ 💼 *LAVORO* ━━━╮\n\n`

  if (success) {
    user.money += amount
    text += `✨ ${evento}\n\n💰 Guadagno: +${amount}€`
  } else {
    user.money -= amount
    if (user.money < 0) user.money = 0
    text += `💀 ${evento}\n\n💸 Perdita: -${amount}€`
  }

  text += `\n\n💼 Saldo: ${user.money}€`
  text += `\n╰━━━━━━━━━━━━━━╯`

  return conn.sendMessage(m.chat, {
    text
  }, { quoted: m })
}

handler.command = ['lavora']
handler.group = true

export default handler

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

function msToTime(ms) {
  let minutes = Math.floor(ms / 60000)
  let seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}m ${seconds}s`
}