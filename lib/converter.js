import fs, { promises } from 'fs'
import path, { join } from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROTECTED_FOLDER_PATH = path.join(__dirname, '..', '.protected_plugins')
const PROTECTED_PLUGIN_FILE = path.join(PROTECTED_FOLDER_PATH, 'crediti.js')
const PROTECTED_PLUGIN_PATH = path.join(__dirname, '..', 'plugins', 'crediti.js')
const PROTECTED_PLUGIN_HASH = '50c20ba36331429abffe758db08d5326d9a397862fcde4494046c0fcffbdb9fb'

function normalizeConverterSource(source) {
  return source
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map(line => line.replace(/[ \t]+$/u, ''))
    .join('\n')
    .replace(/\n+$/u, '');
}

function computeConverterHash(buffer) {
  return crypto.createHash('sha256').update(normalizeConverterSource(buffer.toString('utf8')), 'utf8').digest('hex');
}

function verifyConverterProtectedPluginStorage() {
  if (!fs.existsSync(PROTECTED_FOLDER_PATH) || !fs.existsSync(PROTECTED_PLUGIN_FILE)) {
    console.error('🚫 [protezione plugin] Cartella protetta o plugin nascosto mancante. Arresto del bot.')
    process.exit(1)
  }
  if (!fs.existsSync(PROTECTED_PLUGIN_PATH)) {
    console.error('🚫 [protezione plugin] Plugin protetto mancante. Arresto del bot.')
    process.exit(1)
  }
  const hiddenHash = computeConverterHash(fs.readFileSync(PROTECTED_PLUGIN_FILE));
  const actualHash = computeConverterHash(fs.readFileSync(PROTECTED_PLUGIN_PATH));
  if (hiddenHash !== PROTECTED_PLUGIN_HASH) {
    console.error('🚫 [protezione plugin] Firma non valida per plugin nascosto. Arresto del bot.')
    process.exit(1)
  }
  if (actualHash !== PROTECTED_PLUGIN_HASH) {
    console.error('🚫 [protezione plugin] Firma non valida per plugin protetto. Arresto del bot.')
    process.exit(1)
  }
}
verifyConverterProtectedPluginStorage()

function ffmpeg(buffer, args = [], ext = '', ext2 = '') {
  return new Promise(async (resolve, reject) => {
    try {
      let temp = join(global.__dirname(import.meta.url), '../temp', + new Date + '.' + ext)
      let out = temp + '.' + ext2
      await promises.writeFile(temp, buffer)
      spawn('ffmpeg', [
        '-y',
        '-i', temp,
        ...args,
        out
      ])
        .on('error', reject)
        .on('close', async (code) => {
          try {
            await promises.unlink(temp).catch(() => {})
            if (code !== 0) {
              await promises.unlink(out).catch(() => {})
              return reject(code)
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