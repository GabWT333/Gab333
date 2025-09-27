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
    const scanUrl = `https://apis.davidcyriltech.my.id/imgscan?url=${encodeURIComponent(imageUrl)}`;
    const scanResponse = await axios.get(scanUrl);

    if (!scanResponse.data.success) {
      throw scanResponse.data.message || "Failed to analyze image";
    }

    // Format the response
    await m.reply(
      `🔍 *Image Analysis Results*\n\n` +
      `${scanResponse.data.result}\n\n` +
      `> © Powered by ChatUnity`
    );

  } catch (error) {
    console.error('Image Scan Error:', error);
    await m.reply(`❌ Error: ${error.message || error}`);
  }
};

// Definizione comando per handler.js
handler.help = ['imgscan'];
handler.tags = ['img'];
handler.command = /^(imgscan|scanimg|imagescan|analyzeimg)$/i;

export default handler;