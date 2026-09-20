import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const BOUNTY_FILE = path.join(__dirname, '..', 'data', 'bounty.json')

function ensureBountyFile() {
    const directory = path.dirname(BOUNTY_FILE)
    if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true })
    if (!fs.existsSync(BOUNTY_FILE)) fs.writeFileSync(BOUNTY_FILE, '{}', 'utf8')
}

export function loadBounty() {
    ensureBountyFile()
    try {
        return JSON.parse(fs.readFileSync(BOUNTY_FILE, 'utf8'))
    } catch {
        return {}
    }
}

export function saveBounty(bounty) {
    ensureBountyFile()
    fs.writeFileSync(BOUNTY_FILE, JSON.stringify(bounty, null, 2), 'utf8')
}