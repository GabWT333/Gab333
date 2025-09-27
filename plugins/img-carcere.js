
import axios from "axios";
import FormData from 'form-data';
import fs from 'fs';
import os from 'os';
import path from "path";

let handler = async (m, { conn, args }) => {
  try {
    let who;
    
    if (m.mentionedJid && m.mentionedJid[0]) {
      who = m.mentionedJid[0];
    } 
    else if (m.quoted) {
      who = m.quoted.sender;
    }
    else {
      who = m.sender;
    }

    let mediaBuffer;
    try {
      let url = await conn.profilePictureUrl(who, 'image');
      const res = await axios.get(url, { responseType: 'arraybuffer' });
      mediaBuffer = Buffer.from(res.data);
      mimeType = 'image/jpeg';
    } catch (e) {
      return m.reply("Non è stato possibile recuperare la foto profilo.");
    }

    let extension = '.jpg';
    const tempFilePath = path.join(os.tmpdir(), `imgscan_${Date.now()}${extension}`);
    fs.writeFileSync(tempFilePath, mediaBuffer);

    const form = new FormData();
    form.append('fileToUpload', fs.createReadStream(tempFilePath), `image${extension}`);
    form.append('reqtype', 'fileupload');

    const uploadResponse = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders()
    });

    const imageUrl = uploadResponse.data;
    fs.unlinkSync(tempFilePath);

    if (!imageUrl) {
      throw "Failed to upload image";
    }

    const apiUrl = `https://api.popcat.xyz/v2/jail?image=${encodeURIComponent(imageUrl)}`;
    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

    if (!response || !response.data) {
      return m.reply("Errore API");
    }

    const imageBuffer = Buffer.from(response.data, "binary");

    await conn.sendMessage(m.chat, {
      image: imageBuffer,
      caption: `> *Powered by ChatUnity*`
    });

  } catch (error) {
    console.error("Error:", error);
    m.reply(`Errore: ${error.response?.data?.message || error.message || "Errore sconosciuto"}`);
  }
};

handler.help = ['jail'];
handler.tags = ['img'];
handler.command = /^(jail|carcere)$/i;

export default handler;
