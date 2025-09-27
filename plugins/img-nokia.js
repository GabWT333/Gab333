import axios from "axios";
import FormData from 'form-data';
import fs from 'fs';
import os from 'os';
import path from "path";

// Sistema comando diretto (compatibile con handler.js)
let handler = async (m, { conn, args }) => {
  try {
    // Cerca l'immagine nel messaggio quotato o nel messaggio stesso
    let quotedMsg = m.quoted ? m.quoted : m;
    let mimeType = (quotedMsg.msg || quotedMsg).mimetype || '';

    let mediaBuffer;
    // Se rispondo a un messaggio normale (non immagine), prendi la foto profilo del target
    if (m.quoted && (!mimeType || !mimeType.startsWith('image/'))) {
      let who = m.quoted.sender || m.sender;
      try {
        let url = await conn.profilePictureUrl(who, 'image');
        const res = await axios.get(url, { responseType: 'arraybuffer' });
        mediaBuffer = Buffer.from(res.data);
        mimeType = 'image/jpeg';
      } catch (e) {
        return m.reply("Non è stato possibile recuperare la foto profilo di questo utente.");
      }
    }
    // Se non c'è quoted e non c'è immagine, prendi la foto profilo dell'utente che ha inviato il comando
    else if (!m.quoted && (!mimeType || !mimeType.startsWith('image/'))) {
      let who = m.sender;
      try {
        let url = await conn.profilePictureUrl(who, 'image');
        const res = await axios.get(url, { responseType: 'arraybuffer' });
        mediaBuffer = Buffer.from(res.data);
        mimeType = 'image/jpeg';
      } catch (e) {
        return m.reply("Non hai una foto profilo o non è stato possibile recuperarla.");
      }
    }
    // Se c'è quoted e contiene immagine, usa quella
    else {
      mediaBuffer = await quotedMsg.download();
    }

    // Get file extension based on mime type
    let extension = '';
    if (mimeType.includes('image/jpeg')) extension = '.jpg';
    else if (mimeType.includes('image/png')) extension = '.png';
    else {
      return m.reply("Unsupported image format. Please use JPEG or PNG");
    }

    const tempFilePath = path.join(os.tmpdir(), `imgscan_${Date.now()}${extension}`);
    fs.writeFileSync(tempFilePath, mediaBuffer);

    // Upload to Catbox
    const form = new FormData();
    form.append('fileToUpload', fs.createReadStream(tempFilePath), `image${extension}`);
    form.append('reqtype', 'fileupload');

    const uploadResponse = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders()
    });

    const imageUrl = uploadResponse.data;
    fs.unlinkSync(tempFilePath); // Clean up temp file

    if (!imageUrl) {
      throw "Failed to upload image to Catbox";
    }

    // Scan the image using the API
    const apiUrl = `https://api.popcat.xyz/v2/nokia?image=${encodeURIComponent(imageUrl)}`;
    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

    if (!response || !response.data) {
      return m.reply("Error: The API did not return a valid image. Try again later.");
    }

    const imageBuffer = Buffer.from(response.data, "binary");

    await conn.sendMessage(m.chat, {
      image: imageBuffer,
      caption: `> *Powered by ChatUnity*`
    });

  } catch (error) {
    console.error("Nokia Error:", error);
    m.reply(`An error occurred: ${error.response?.data?.message || error.message || "Unknown error"}`);
  }
};

// Definizione comando per handler.js
handler.help = ['nokia'];
handler.tags = ['img'];
handler.command = /^(nokia|nokiaedit)$/i;

export default handler;