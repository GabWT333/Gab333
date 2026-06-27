//Plugin by Gab, Lucifero & 333 staff

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { tmpdir } from 'os'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const encodePlugin = (code) => {
  const KEY = '333neverdies'
  const keyBytes = Buffer.from(KEY, 'utf8')
  const buf = Buffer.from(code, 'utf8')
  const xored = Buffer.from(buf.map((b, i) => b ^ keyBytes[i % keyBytes.length]))
  const encoded = xored.toString('base64')

  return (
    `//Codificato by 333 STAFF\n` +
    `import{writeFileSync,unlinkSync}from'fs';\n` +
    `import{tmpdir}from'os';\n` +
    `import{join}from'path';\n` +
    `const _k=Buffer.from('333neverdies','utf8');\n` +
    `const _s=Buffer.from('${encoded}','base64');\n` +
    `const _d=Buffer.from(_s.map((b,i)=>b^_k[i%_k.length])).toString('utf8');\n` +
    `const _t=join(tmpdir(),'_333_'+Date.now()+'.mjs');\n` +
    `writeFileSync(_t,_d);\n` +
    `const _m=await import(_t);\n` +
    `unlinkSync(_t);\n` +
    `export default _m.default;\n`
  )
}

const handler = async (m, { conn, isOwner, isROwner }) => {
  if (!isOwner && !isROwner) return m.reply('❌ Solo per owner.')

  let code = null
  let filename = 'plugin.js'

  const quoted = m.quoted
  if (quoted && (quoted.mimetype === 'application/javascript' || quoted.mimetype === 'text/javascript' || (quoted.filename && quoted.filename.endsWith('.js')))) {
    const buf = await quoted.download()
    code = buf.toString('utf8')
    filename = quoted.filename || 'plugin.js'
  } else if (m.text && m.text.trim().length > 10) {
    code = m.text.trim()
  }

  if (!code) return m.reply('📎 Rispondi a un file .js oppure incolla il codice.\nUso: .codifica')

  const encoded = encodePlugin(code)
  const outName = filename.replace('.js', '_333.js')
  const outPath = path.join(tmpdir(), outName)
  fs.writeFileSync(outPath, encoded, 'utf8')

  await conn.sendMessage(m.chat, {
    document: fs.readFileSync(outPath),
    mimetype: 'application/javascript',
    fileName: outName,
    caption: `✅ *Codificato*\n📄 ${outName}`
  }, { quoted: m })

  fs.unlinkSync(outPath)
}

handler.command = /^codifica$/i
export default handler