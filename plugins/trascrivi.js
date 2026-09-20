//Plugin by Gab, Lucifero & 333 staff

import fs from "fs"
import path from "path"
import { exec } from "child_process"
import { FormData } from "formdata-node"

const WHISPER_BIN = process.env.WHISPER_BIN || "/root/whisper.cpp/build/bin/whisper-cli"
const WHISPER_MODELS = [
    process.env.WHISPER_MODEL,
    "/root/whisper.cpp/models/ggml-large.bin",
    "/root/whisper.cpp/models/ggml-large-v2.bin",
    "/root/whisper.cpp/models/ggml-medium.bin",
    "/root/whisper.cpp/models/ggml-small.bin",
    "/root/whisper.cpp/models/ggml-base.bin",
].filter(Boolean)
const TMP = "/root/tmp"
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || ""
const OPENAI_MODEL = process.env.OPENAI_MODEL || "whisper-1"

const ensureTempDir = () => {
    if (!fs.existsSync(TMP)) {
        fs.mkdirSync(TMP, { recursive: true })
    }
}

const cleanupFiles = (...files) => {
    for (const file of files) {
        try {
            if (file && fs.existsSync(file)) fs.unlinkSync(file)
        } catch {}
    }
}

const chooseLocalModel = () => {
    for (const modelPath of WHISPER_MODELS) {
        if (fs.existsSync(modelPath)) return modelPath
    }
    return null
}

const transcribeWithWhisper = (wavPath, modelPath) => {
    return new Promise((resolve, reject) => {
        const cmd = `"${WHISPER_BIN}" -m "${modelPath}" -f "${wavPath}" -l it -nt`
        exec(cmd, (err, stdout, stderr) => {
            if (err) return reject(new Error(stderr || err.message))
            resolve(stdout)
        })
    })
}

const transcribeWithOpenAI = async (wavPath) => {
    const form = new FormData()
    form.append("file", fs.createReadStream(wavPath), "audio.wav")
    form.append("model", OPENAI_MODEL)
    form.append("language", "it")

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: form,
    })

    if (!response.ok) {
        const body = await response.text()
        throw new Error(`OpenAI error: ${response.status} ${body}`)
    }

    const data = await response.json()
    return data.text || ""
}

let handler = async (m, { conn }) => {
    const msg = m.quoted || m
    const mime = (msg.msg || msg).mimetype || ""

    if (!mime.includes("audio") && !mime.includes("voice")) {
        return m.reply("Rispondi a un messaggio vocale o audio per trascriverlo.")
    }

    ensureTempDir()

    let buffer
    try {
        buffer = await msg.download?.() || await conn.downloadMediaMessage(msg)
    } catch (error) {
        console.log("DOWNLOAD ERROR:", error)
        return m.reply("Errore durante il download dell'audio. Riprova.")
    }

    if (!buffer || buffer.length < 500) {
        return m.reply("Audio non valido o troppo breve.")
    }

    const fileId = `${process.pid}-${Date.now()}`
    const oggPath = path.join(TMP, `${fileId}.ogg`)
    const wavPath = path.join(TMP, `${fileId}.wav`)

    fs.writeFileSync(oggPath, buffer)
    await conn.sendMessage(m.chat, { text: "⏳ Trascrivo l'audio, attendi..." }, { quoted: m })

    try {
        await new Promise((resolve, reject) => {
            exec(
                `ffmpeg -y -i "${oggPath}" -ar 16000 -ac 1 -c:a pcm_s16le "${wavPath}"`,
                (err, stdout, stderr) => {
                    if (err) return reject(new Error(stderr || err.message))
                    resolve()
                }
            )
        })
    } catch (error) {
        console.log("FFMPEG ERROR:", error)
        cleanupFiles(oggPath, wavPath)
        return m.reply("Errore nella conversione dell'audio. Assicurati che ffmpeg sia installato.")
    }

    if (!fs.existsSync(wavPath)) {
        cleanupFiles(oggPath, wavPath)
        return m.reply("Impossibile creare il file WAV.")
    }

    let text = ""
    let source = ""

    if (OPENAI_API_KEY && OPENAI_API_KEY !== "333") {
        try {
            text = await transcribeWithOpenAI(wavPath)
            source = "OpenAI"
        } catch (error) {
            console.log("OPENAI TRANSCRIPTION ERROR:", error)
        }
    }

    if (!text) {
        const modelPath = chooseLocalModel()
        if (!modelPath) {
            cleanupFiles(oggPath, wavPath)
            return m.reply("Nessun modello Whisper trovato. Installa un modello valido in /root/whisper.cpp/models.")
        }

        try {
            const stdout = await transcribeWithWhisper(wavPath, modelPath)
            text = stdout
                .split("\n")
                .map(line => line.trim())
                .filter(Boolean)
                .join(" ")
                .trim()
            source = `Whisper locale (${path.basename(modelPath)})`
        } catch (error) {
            console.log("WHISPER ERROR:", error)
            cleanupFiles(oggPath, wavPath)
            return m.reply("Errore durante la trascrizione. Verifica il modello Whisper e i permessi del file.")
        }
    }

    cleanupFiles(oggPath, wavPath)

    if (!text) {
        return conn.sendMessage(m.chat, { text: "❌ Non ho riconosciuto testo nell'audio." }, { quoted: m })
    }

    conn.sendMessage(m.chat, { text: `📝 Trascrizione (${source}):\n${text}` }, { quoted: m })
}

handler.help = ["trascrivi"]
handler.tags = ["audio"]
handler.command = ["trascrivi"]
handler.group = true

export default handler