import { join } from 'path';
import { readdirSync, statSync, readFileSync } from 'fs';

const toBold = (str) => {
    const boldChars = {
        a: '𝗮', b: '𝗯', c: '𝗰', d: '𝗱', e: '𝗲', f: '𝗳', g: '𝗴', h: '𝗵', i: '𝗶', 
        j: '𝗷', k: '𝗸', l: '𝗹', m: '𝗺', n: '𝗻', o: '𝗼', p: '𝗽', q: '𝗾', r: '𝗿', 
        s: '𝘀', t: '𝘁', u: '𝘂', v: '𝘃', w: '𝘄', x: '𝘅', y: '𝘆', z: '𝘇',
        A: '𝗔', B: '𝗕', C: '𝗖', D: '𝗗', E: '𝗘', F: '𝗙', G: '𝗚', H: '𝗛', I: '𝗜', 
        J: '𝗝', K: '𝗞', L: '𝗟', M: '𝗠', N: '𝗡', O: '𝗢', P: '𝗣', Q: '𝗤', R: '𝗥', 
        S: '𝗦', T: '𝗧', U: '𝗨', V: '𝗩', W: '𝗪', X: '𝗫', Y: '𝗬', Z: '𝗭', 
        0: '𝟬', 1: '𝟭', 2: '𝟮', 3: '𝟯', 4: '𝟰', 5: '𝟱', 6: '𝟲', 7: '𝟳', 8: '𝟴', 9: '𝟵'
    };
    return str.split('').map(char => boldChars[char] || char).join('');
};

const formatFileSize = (size) => {
    const units = ['B', 'KB', 'MB'];
    let i = 0;
    while (size >= 1024 && i < units.length - 1) {
        size /= 1024;
        i++;
    }
    return `${size.toFixed(1)}${units[i]}`;
};

const extractCommand = (content) => {
    // Pattern diversi per trovare i comandi
    const patterns = [
        // handler.command = /^command$/i
        /handler\.command\s*=\s*\/\^(.+?)\$/,
        // handler.command = /^(command1|command2)$/i  
        /handler\.command\s*=\s*\/\^\((.+?)\)\$/,
        // handler.command = ['cmd1', 'cmd2']
        /handler\.command\s*=\s*\[([^\]]+)\]/,
        // handler.command = 'command'
        /handler\.command\s*=\s*['"`]([^'"`]+)['"`]/,
        // export { command }
        /export\s*{\s*command\s*}\s*.*command\s*=\s*['"`]([^'"`]+)['"`]/,
        // const command = 'cmd'
        /const\s+command\s*=\s*['"`]([^'"`]+)['"`]/,
        // command: 'cmd'
        /command\s*:\s*['"`]([^'"`]+)['"`]/,
        // .help pattern per fallback
        /handler\.help\s*=\s*\[['"`]([^'"`\s]+)/
    ];

    for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match) {
            let commandStr = match[1];
            
            // Se è un array di stringhe ['cmd1', 'cmd2']
            if (commandStr.includes("'") || commandStr.includes('"')) {
                const cmdMatches = commandStr.match(/['"`]([^'"`]+)['"`]/g);
                if (cmdMatches && cmdMatches.length > 1) {
                    return cmdMatches.map(m => m.replace(/['"`]/g, '')).join(' | ');
                } else if (cmdMatches) {
                    commandStr = cmdMatches[0].replace(/['"`]/g, '');
                }
            }
            
            // Pulisci da caratteri speciali regex ma mantieni |
            commandStr = commandStr.replace(/[\^\$\\\(\)\[\]\{\}\*\+\?]/g, '');
            
            // Se contiene più comandi separati da |
            if (commandStr.includes('|')) {
                return commandStr.split('|')
                    .map(cmd => cmd.trim())
                    .filter(cmd => cmd.length > 0)
                    .join(' | ');
            }
            
            return commandStr.trim();
        }
    }
    
    // Ultima risorsa: cerca pattern .command nel contenuto
    const fallbackMatch = content.match(/\.([a-zA-Z][a-zA-Z0-9]*)/);
    if (fallbackMatch) {
        return fallbackMatch[1];
    }
    
    return 'N/A';
};

const getFileInfo = (pluginsPath, file) => {
    try {
        const filePath = join(pluginsPath, file);
        const stats = statSync(filePath);
        const content = readFileSync(filePath, 'utf8');
        
        const command = extractCommand(content);
        
        return {
            name: file.replace('.js', ''),
            size: stats.size,
            modified: stats.mtime,
            command: command
        };
    } catch {
        return { 
            name: file.replace('.js', ''), 
            size: 0, 
            modified: new Date(),
            command: 'N/A'
        };
    }
};

let handler = async (m, { __dirname, args }) => {
    try {
        const pluginsPath = join(__dirname, '../plugins');
        const files = readdirSync(pluginsPath);
        const jsFiles = files.filter(file => file.endsWith('.js'));
        
        if (jsFiles.length === 0) {
            return m.reply('📂 Nessun plugin JavaScript trovato');
        }

        const showDetails = args[0] === 'detail' || args[0] === 'd';
        const searchTerm = args.find(arg => arg !== 'detail' && arg !== 'd');
        
        let pluginInfos = jsFiles.map(file => getFileInfo(pluginsPath, file));
        
        if (searchTerm) {
            pluginInfos = pluginInfos.filter(info => 
                info.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            if (pluginInfos.length === 0) {
                return m.reply(`🔍 Nessun plugin trovato per: ${toBold(searchTerm)}`);
            }
        }

        pluginInfos.sort((a, b) => a.name.localeCompare(b.name));
        
        let response = `📂 ${toBold('Plugin disponibili')} (${pluginInfos.length})\n\n`;
        
        if (showDetails) {
            pluginInfos.forEach((info, index) => {
                response += `${index + 1}. ${toBold(info.name)}\n`;
                response += `   📏 ${formatFileSize(info.size)}\n`;
                response += `   📅 ${info.modified.toLocaleDateString('it-IT')}\n`;
                response += `   💬 .${info.command}\n\n`;
            });
        } else {
            pluginInfos.forEach(info => {
                response += `${toBold(info.name)} → .${info.command}\n`;
            });
        }
        
        response += `\n💡 Usa ${toBold('.listpl d')} per dettagli`;
        response += `\n🔍 Usa ${toBold('.listpl <nome>')} per cercare`;
        
        m.reply(response);
        
    } catch (error) {
        m.reply(`⛔️ Errore: ${error.message}`);
    }
};

handler.help = ['listplugins [detail|d] [search]'];
handler.tags = ['owner'];
handler.command = /^listpl$/i;
handler.owner = true;

export default handler;