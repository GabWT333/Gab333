//plugin for gabs
import fs from 'fs';

function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

function jaccardSimilarity(str1, str2) {
  const set1 = new Set(str1.split(''));
  const set2 = new Set(str2.split(''));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
}

function longestCommonSubsequence(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  return dp[m][n];
}

function normalizeString(str) {
  return str.toLowerCase()
    .replace(/[_\-\s\.]/g, '')
    .replace(/[àáâãäåæ]/g, 'a')
    .replace(/[èéêëē]/g, 'e')
    .replace(/[ìíîïī]/g, 'i')
    .replace(/[òóôõöøō]/g, 'o')
    .replace(/[ùúûüū]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[ñ]/g, 'n')
    .replace(/[ý]/g, 'y')
    .replace(/[ß]/g, 's')
    .replace(/[đ]/g, 'd')
    .replace(/[ł]/g, 'l')
    .replace(/[ř]/g, 'r')
    .replace(/[š]/g, 's')
    .replace(/[ž]/g, 'z')
    .replace(/[0-9]/g, '');
}

function calculateAdvancedSimilarity(input, plugin) {
  const normalizedInput = normalizeString(input);
  const normalizedPlugin = normalizeString(plugin);
  
  if (normalizedInput === normalizedPlugin) return 1.0;
  if (normalizedInput.length === 0 || normalizedPlugin.length === 0) return 0;
  
  const exactMatch = normalizedInput === normalizedPlugin;
  const containsMatch = normalizedPlugin.includes(normalizedInput) || normalizedInput.includes(normalizedPlugin);
  const startsWithMatch = normalizedPlugin.startsWith(normalizedInput) || normalizedInput.startsWith(normalizedPlugin);
  const endsWithMatch = normalizedPlugin.endsWith(normalizedInput) || normalizedInput.endsWith(normalizedPlugin);
  
  const distance = levenshteinDistance(normalizedInput, normalizedPlugin);
  const maxLength = Math.max(normalizedInput.length, normalizedPlugin.length);
  const levenshteinSimilarity = 1 - (distance / maxLength);
  
  const jaccardScore = jaccardSimilarity(normalizedInput, normalizedPlugin);
  
  const lcsLength = longestCommonSubsequence(normalizedInput, normalizedPlugin);
  const lcsScore = (2 * lcsLength) / (normalizedInput.length + normalizedPlugin.length);
  
  let nGramScore = 0;
  const nGramSize = Math.min(2, Math.min(normalizedInput.length, normalizedPlugin.length));
  if (nGramSize > 0) {
    const inputNGrams = new Set();
    const pluginNGrams = new Set();
    
    for (let i = 0; i <= normalizedInput.length - nGramSize; i++) {
      inputNGrams.add(normalizedInput.substr(i, nGramSize));
    }
    
    for (let i = 0; i <= normalizedPlugin.length - nGramSize; i++) {
      pluginNGrams.add(normalizedPlugin.substr(i, nGramSize));
    }
    
    const intersection = new Set([...inputNGrams].filter(x => pluginNGrams.has(x)));
    const union = new Set([...inputNGrams, ...pluginNGrams]);
    nGramScore = intersection.size / union.size;
  }
  
  let positionScore = 0;
  for (let i = 0; i < Math.min(normalizedInput.length, normalizedPlugin.length); i++) {
    if (normalizedInput[i] === normalizedPlugin[i]) {
      positionScore += (1 / Math.max(normalizedInput.length, normalizedPlugin.length));
    }
  }
  
  let score = 0;
  if (exactMatch) score = 1.0;
  else if (startsWithMatch) score = 0.95;
  else if (endsWithMatch) score = 0.9;
  else if (containsMatch) score = 0.85;
  else {
    const weights = {
      levenshtein: 0.3,
      jaccard: 0.25,
      lcs: 0.2,
      nGram: 0.15,
      position: 0.1
    };
    
    score = (levenshteinSimilarity * weights.levenshtein) +
            (jaccardScore * weights.jaccard) +
            (lcsScore * weights.lcs) +
            (nGramScore * weights.nGram) +
            (positionScore * weights.position);
  }
  
  const lengthPenalty = Math.abs(normalizedInput.length - normalizedPlugin.length) / Math.max(normalizedInput.length, normalizedPlugin.length);
  score *= (1 - lengthPenalty * 0.1);
  
  return Math.max(0, Math.min(1, score));
}

function findBestMatches(input, allPlugins, threshold = 0.2, maxResults = 5) {
  const results = allPlugins.map(plugin => {
    const pluginName = plugin.replace('.js', '');
    const score = calculateAdvancedSimilarity(input, pluginName);
    return { plugin, pluginName, score };
  });
  
  const filtered = results.filter(item => item.score >= threshold);
  const sorted = filtered.sort((a, b) => {
    if (Math.abs(a.score - b.score) < 0.01) {
      return a.pluginName.length - b.pluginName.length;
    }
    return b.score - a.score;
  });
  
  return sorted.slice(0, maxResults);
}

function createResponseMessage() {
  return {
    key: {
      participants: '0@s.whatsapp.net',
      fromMe: false,
      id: 'EditPlugin'
    },
    message: {
      locationMessage: {
        name: 'Plugin Editato',
        jpegThumbnail: null,
        vcard: 'BEGIN:VCARD\nVERSION:3.0\nN:;Plugin;;;\nFN:Plugin\nEND:VCARD'
      }
    },
    participant: '0@s.whatsapp.net'
  };
}

async function loadThumbnail() {
  try {
    return await (await fetch('https://telegra.ph/file/876cc3f192ec040e33aba.png')).buffer();
  } catch {
    return null;
  }
}

let handler = async (message, { text, usedPrefix, command, conn }) => {
  if (!text) throw '𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐢𝐥 𝐧𝐨𝐦𝐞 𝐝𝐞𝐥 𝐩𝐥𝐮𝐠𝐢𝐧 𝐝𝐚 𝐞𝐝𝐢𝐭𝐚𝐫𝐞';
  if (!message.quoted || !message.quoted.text) throw '𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚𝐥 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐜𝐡𝐞 𝐜𝐨𝐧𝐭𝐢𝐞𝐧𝐞 𝐢𝐥 𝐧𝐮𝐨𝐯𝐨 𝐜𝐨𝐝𝐢𝐜𝐞';

  const pluginPath = `plugins/${text}.js`;

  if (!fs.existsSync(pluginPath)) {
    const allPlugins = fs.readdirSync('plugins').filter(file => file.endsWith('.js'));
    const matches = findBestMatches(text, allPlugins);

    if (matches.length === 0) {
      throw `𝐍𝐞𝐬𝐬𝐮𝐧 𝐩𝐥𝐮𝐠𝐢𝐧 𝐬𝐢𝐦𝐢𝐥𝐞 𝐚 "${text}" 𝐭𝐫𝐨𝐯𝐚𝐭𝐨`;
    }

    if (matches.length === 1 && matches[0].score > 0.7) {
      global.editPluginData = {
        chat: message.chat,
        pluginName: matches[0].pluginName,
        newCode: message.quoted.text,
        sender: message.sender,
        autoConfirm: true
      };

      return conn.sendMessage(message.chat, {
        text: `✨ 𝐓𝐫𝐨𝐯𝐚𝐭𝐨 "${matches[0].pluginName}" (${Math.round(matches[0].score * 100)}%)\n𝐂𝐨𝐧𝐟𝐞𝐫𝐦𝐢?\n\n📝 si/no`,
      }, { quoted: message });
    }

    global.editPluginData = {
      chat: message.chat,
      options: matches,
      newCode: message.quoted.text,
      sender: message.sender,
      isMultipleChoice: true
    };

    const optionsText = matches.map((item, index) => 
      `${index + 1}. ${item.pluginName} (${Math.round(item.score * 100)}%)`
    ).join('\n');

    return conn.sendMessage(message.chat, {
      text: `🔍 𝐑𝐢𝐬𝐮𝐥𝐭𝐚𝐭𝐢 𝐩𝐞𝐫 "${text}":\n\n${optionsText}\n\n📝 𝐒𝐜𝐞𝐠𝐥𝐢 𝐢𝐥 𝐧𝐮𝐦𝐞𝐫𝐨 𝐨 "no" 𝐩𝐞𝐫 𝐚𝐧𝐧𝐮𝐥𝐥𝐚𝐫𝐞`,
    }, { quoted: message });
  }

  try {
    fs.writeFileSync(pluginPath, message.quoted.text);
    const responseMessage = createResponseMessage();
    responseMessage.message.locationMessage.jpegThumbnail = await loadThumbnail();
    
    conn.reply(message.chat, `✅ 𝐏𝐥𝐮𝐠𝐢𝐧 "${text}" 𝐞𝐝𝐢𝐭𝐚𝐭𝐨 𝐜𝐨𝐧 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐨`, responseMessage);
  } catch (error) {
    throw `❌ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐧𝐞𝐥𝐥'𝐞𝐝𝐢𝐭𝐢𝐧𝐠: ${error.message}`;
  }
};

handler.before = async (message, { conn }) => {
  if (!global.editPluginData) return;
  if (message.chat !== global.editPluginData.chat) return;
  if (message.sender !== global.editPluginData.sender) return;
  
  const response = message.text.toLowerCase().trim();
  
  if (global.editPluginData.isMultipleChoice) {
    const choice = parseInt(response);
    if (choice >= 1 && choice <= global.editPluginData.options.length) {
      const selectedPlugin = global.editPluginData.options[choice - 1];
      
      try {
        const pluginPath = `plugins/${selectedPlugin.pluginName}.js`;
        fs.writeFileSync(pluginPath, global.editPluginData.newCode);
        
        const responseMessage = createResponseMessage();
        responseMessage.message.locationMessage.jpegThumbnail = await loadThumbnail();
        
        conn.reply(message.chat, `✅ 𝐏𝐥𝐮𝐠𝐢𝐧 "${selectedPlugin.pluginName}" 𝐞𝐝𝐢𝐭𝐚𝐭𝐨 𝐜𝐨𝐧 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐨`, responseMessage);
        
        delete global.editPluginData;
        return true;
      } catch (error) {
        conn.reply(message.chat, `❌ 𝐄𝐫𝐫𝐨𝐫𝐞: ${error.message}`, message);
        delete global.editPluginData;
        return true;
      }
    }
    
    if (response === 'no') {
      conn.reply(message.chat, '❌ 𝐎𝐩𝐞𝐫𝐚𝐳𝐢𝐨𝐧𝐞 𝐚𝐧𝐧𝐮𝐥𝐥𝐚𝐭𝐚', message);
      delete global.editPluginData;
      return true;
    }
    
    return;
  }
  
  if (response === 'si' || response === 'sì') {
    try {
      const pluginPath = `plugins/${global.editPluginData.pluginName}.js`;
      fs.writeFileSync(pluginPath, global.editPluginData.newCode);
      
      const responseMessage = createResponseMessage();
      responseMessage.message.locationMessage.jpegThumbnail = await loadThumbnail();
      
      conn.reply(message.chat, `✅ 𝐏𝐥𝐮𝐠𝐢𝐧 "${global.editPluginData.pluginName}" 𝐞𝐝𝐢𝐭𝐚𝐭𝐨 𝐜𝐨𝐧 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐨`, responseMessage);
      
      delete global.editPluginData;
      return true;
    } catch (error) {
      conn.reply(message.chat, `❌ 𝐄𝐫𝐫𝐨𝐫𝐞: ${error.message}`, message);
      delete global.editPluginData;
      return true;
    }
  }
  
  if (response === 'no') {
    conn.reply(message.chat, '❌ 𝐎𝐩𝐞𝐫𝐚𝐳𝐢𝐨𝐧𝐞 𝐚𝐧𝐧𝐮𝐥𝐥𝐚𝐭𝐚', message);
    delete global.editPluginData;
    return true;
  }
};

handler.tags = ['owner'];
handler.command = /^editplugin$/i;
handler.rowner = true;

export default handler;
