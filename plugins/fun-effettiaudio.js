//Plugin by Gab, Lucifero & 333 staff

import { unlinkSync, readFileSync } from 'fs'
import { join } from 'path'
import { exec } from 'child_process'

let handler = async (m, { conn, __dirname, usedPrefix, command }) => {
    try {
        let q = m.quoted ? m.quoted : m
        let mime = ((m.quoted ? m.quoted : m.msg).mimetype || '')
        let set

        if (!/audio/.test(mime)) throw `*Rispondi a un audio o nota vocale usando ${usedPrefix + command}*`


        if (/bass/.test(command)) set = '-af equalizer=f=94:width_type=o:width=2:g=30'
        if (/blown/.test(command)) set = '-af acrusher=.1:1:64:0:log'
        if (/deep/.test(command)) set = '-af atempo=1,asetrate=44500*2/3'
        if (/earrape/.test(command)) set = '-af volume=12'
        if (/fast/.test(command)) set = '-filter:a "atempo=1.63,asetrate=44100"'
        if (/fat/.test(command)) set = '-filter:a "atempo=1.6,asetrate=22100"'
        if (/nightcore/.test(command)) set = '-filter:a atempo=1.06,asetrate=44100*1.25'
        if (/reverse/.test(command)) set = '-filter_complex "areverse"'
        if (/robot/.test(command)) set = '-filter_complex "afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\':win_size=512:overlap=0.75"'
        if (/slow/.test(command)) set = '-filter:a "atempo=0.7,asetrate=44100"'
        if (/smooth/.test(command)) set = '-filter:v "minterpolate=\'mi_mode=mci:mc_mode=aobmc:vsbmc=1:fps=120\'"'
        if (/chipmunk/.test(command)) set = '-filter:a "atempo=0.5,asetrate=65100"'
        if (/echo/.test(command)) set = '-af "aecho=0.8:0.88:60:0.4"'
        if (/vibrato/.test(command)) set = '-af "vibrato=f=10:d=0.5"'
        if (/reverb/.test(command)) set = '-af "aecho=0.8:0.9:1000:0.3,afir=gtype=gn"'
        if (/distort/.test(command)) set = '-af "acrusher=.2:1:64:0:log"'
        if (/chip/.test(command)) set = '-af "asetrate=44100*1.5,atempo=0.75"'

        let ran = getRandom('.mp3')
        let output = join(__dirname, '../tmp/' + ran)
        let media = await q.download()
        let inputPath = join(__dirname, '../tmp/input_' + getRandom('.mp3'))
        await fs.promises.writeFile(inputPath, media)

        exec(`ffmpeg -y -i "${inputPath}" ${set} "${output}"`, async (err) => {
            unlinkSync(inputPath)
            if (err) throw `_*Errore durante l'elaborazione audio*_`
            await conn.sendMessage(m.chat, { audio: readFileSync(output), mimetype: 'audio/mpeg' }, { quoted: m })
            unlinkSync(output)
        })
    } catch (e) {
        throw e
    }
}

handler.help = ['bass','blown','deep','earrape','fast','fat','nightcore','reverse','robot','robot2','slow','smooth','tupai','squirrel','chipmunk','echo','vibrato','reverb','distort','chip'].map(v => v + ' [vn]')
handler.tags = ['audio']
handler.command = /^(bass|blown|deep|earrape|fas?t|nightcore|reverse|robot|robot2|slow|smooth|chipmunk|echo|vibrato|reverb|distort|chip)$/i
export default handler

const getRandom = (ext) => `${Math.floor(Math.random() * 10000)}${ext}`