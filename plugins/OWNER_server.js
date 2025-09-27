import { exec } from 'child_process';

let handler = async (m, { text, conn, usedPrefix, command }) => {
  let cmd = text.trim();
  if (!cmd) {
    return m.reply("⚠️ Devi specificare il comando da eseguire. Es: `.server ls -la`");
  }

  await m.reply(`🔄 Eseguendo comando: "${cmd}"`);

  exec(cmd, { timeout: 30000 }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Errore: ${error.message}`);
      return m.reply(`❌ Errore durante l'esecuzione: ${error.message}`);
    }
    
    let output = '';
    if (stdout) output += `📤 Output:\n${stdout}`;
    if (stderr) output += `⚠️ Errori/Avvisi:\n${stderr}`;
    
    if (!output) output = "✅ Comando eseguito senza output";
    
    if (output.length > 4000) {
      output = output.substring(0, 4000) + "\n... (output troncato)";
    }
    
    m.reply(output);
  });
};

handler.command = /^(server|cmd|exec)$/i;
handler.owner = true;
export default handler;