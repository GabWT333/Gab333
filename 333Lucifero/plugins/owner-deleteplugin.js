// Plugin by Gab, Lucifero & 333 staff

import { join } from 'path';
import { unlinkSync, existsSync } from 'fs';

const protectedPluginNames = new Set(['crediti', 'crediti.js']);

const handler = async (m, { conn, args, text, __dirname }) => {
  if (!text) throw '📌 *_Esempio uso:_*\n*#deleteplugin Menu-official*';
  const pluginName = args && args[0] ? args[0].replace(/\.js$/i, '') : text.replace(/\.js$/i, '');

  if (protectedPluginNames.has(pluginName.toLowerCase())) {
    throw 'Questo plugin è protetto e non può essere eliminato.';
  }

  const pluginPath = join(__dirname, '../plugins', `${pluginName}.js`);
  if (!existsSync(pluginPath)) {
    throw '*🗃️ non esiste questo plugin!*\n\nUsa il nome del file plugin senza estensione, ad esempio: #deleteplugin Menu-official';
  }

  unlinkSync(pluginPath);
  return conn.reply(m.chat, `✅ Il plugin "${pluginName}.js" è stato eliminato.`, m);
};

handler.tags = ['owner'];
handler.help = ['deleteplugin <nombre>'];
handler.command = /^(deleteplugin|dp|deleteplu)$/i;
handler.rowner = true;

export default handler;
