let handler = async (m, { conn }) => {
    await m.reply('👀\nSe ti svegli con 4 palle, \nil nemico è alle spalle, \nse ti svegli con 6 palle, \ni nemici sono alle spalle, \nma se ti svegli senza palle...\nbeh... vol dire che sei tu.\n*(tratto da eventi realmente accaduti)*')
}


handler.command = ['traditore']
handler.group = false
handler.admin = false

export default handler