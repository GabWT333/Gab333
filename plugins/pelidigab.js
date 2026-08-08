//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn }) => {

    const text = `
> 🥸Gab non ha peli in culo gli piace averlo liscio per far entrare tanti cazzi🍈🍌🍈
*Elevato alla terza = 777 ha il cazzo enorme*
✅
`

    await conn.sendMessage(m.chat, {
        text: text.trim()
    })
}

handler.command = ['peli']
handler.group = true

export default handler