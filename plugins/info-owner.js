//Plugin by Gab, Lucifero & 333 staff

function handler(m) {
  const data = global.owner.filter(([id, isCreator]) => id && isCreator)
  const prova = { "key": {"participants":"0@s.whatsapp.net", "fromMe": false, "id": "Halo"
    }, "message": { 
    "locationMessage": { name: 'Ꮻ𝐖𝐍𝚵𝐑    ꙰ 𝟥𝟥𝟥 𝔹𝕆𝕋  ꙰', "jpegThumbnail": fs.readFileSync('./icone/bal.png'),
    "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
    }}, "participant": "0@s.whatsapp.net"}
  this.sendContact(m.chat, data.map(([id, name]) => [id, name]), prova)

}

handler.help = ['owner']
handler.tags = ['main']
handler.command = ['padroni','proprietario'] 
export default handler