import fs, { promises } from 'fs'
import path, { join } from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TEMP_DIR = path.join(__dirname, '../temp')

async function ffmpeg(buffer, args = [], ext = '', ext2 = '') {
  await promises.mkdir(TEMP_DIR, { recursive: true })
  return new Promise((resolve, reject) => {
    try {
      const temp = path.join(TEMP_DIR, `${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`)
      const out = `${temp}.${ext2}`
      promises.writeFile(temp, buffer).then(() => {
        spawn('ffmpeg', [
          '-y',
          '-i', temp,
          ...args,
          out
        ], { stdio: 'ignore' })
          .on('error', reject)
          .on('close', async (code) => {
            try {
              await promises.unlink(temp).catch(() => {})
              if (code !== 0) {
                await promises.unlink(out).catch(() => {})
                return reject(new Error(`ffmpeg exited with code ${code}`))
              }
              resolve({
                data: await promises.readFile(out),
                filename: out,
                delete() {
                  return promises.unlink(out)
                }
              })
            } catch (e) {
              await promises.unlink(out).catch(() => {})
              reject(e)
            }
          })
      }).catch(reject)
    } catch (e) {
      reject(e)
    }
  })
}

/**
 * Convert Audio to Playable WhatsApp Audio
 * @param {Buffer} buffer Audio Buffer
 * @param {String} ext File Extension 
 * @returns {Promise<{data: Buffer, filename: String, delete: Function}>}
 */
function toPTT(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn',
    '-c:a', 'libopus',
    '-b:a', '128k',
    '-vbr', 'on',
  ], ext, 'ogg')
}

/**
 * Convert Audio to Playable WhatsApp PTT
 * @param {Buffer} buffer Audio Buffer
 * @param {String} ext File Extension 
 * @returns {Promise<{data: Buffer, filename: String, delete: Function}>}
 */
function toAudio(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn',
    '-c:a', 'libopus',
    '-b:a', '128k',
    '-vbr', 'on',
    '-compression_level', '10'
  ], ext, 'opus')
}

/**
 * Convert Audio to Playable WhatsApp Video
 * @param {Buffer} buffer Video Buffer
 * @param {String} ext File Extension 
 * @returns {Promise<{data: Buffer, filename: String, delete: Function}>}
 */
function toVideo(buffer, ext) {
  return ffmpeg(buffer, [
    '-c:v', 'libx264',
    '-c:a', 'aac',
    '-ab', '128k',
    '-ar', '44100',
    '-crf', '32',
    '-preset', 'slow'
  ], ext, 'mp4')
}

export {
  toAudio,
  toPTT,
  toVideo,
  ffmpeg,
}
