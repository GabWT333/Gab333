//Plugin by Gab, Lucifero & 333 staff

import pkg from '@realvare/baileys'
const { generateWAMessageFromContent, proto } = pkg

const sintassiLinguaggi = {
  javascript: (txt) => `console.log("${txt}");`,
  js: (txt) => `console.log("${txt}");`,
  python: (txt) => `print("${txt}")`,
  py: (txt) => `print("${txt}")`,
  cpp: (txt) => `#include <iostream>\n\nint main() {\n    std::cout << "${txt}" << std::endl;\n    return 0;\n}`,
  csharp: (txt) => `using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("${txt}");\n    }\n}`,
  cs: (txt) => `using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("${txt}");\n    }\n}`,
  java: (txt) => `public class Main {\n    public static void Main(String[] args) {\n        System.out.println("${txt}");\n    }\n}`,
  php: (txt) => `<?php\n\necho "${txt}";\n\n?>`,
  ruby: (txt) => `puts "${txt}"`,
  bash: (txt) => `echo "${txt}"`,
  sh: (txt) => `echo "${txt}"`
};

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    await conn.reply(m.chat, `💻 *Formattatore Codice*\n\nUso: *${usedPrefix}${command}* [linguaggio] [testo]\n\nEsempio:\n*${usedPrefix}${command} javascript Ciao*`, m)
    return
  }

  const args = text.trim().split(/\s+/);
  if (args.length < 2) {
    await conn.reply(m.chat, `❌ Devi specificare sia il linguaggio che il testo.\n\nEsempio: *${usedPrefix}${command} javascript Ciao*`, m)
    return
  }

  const langInput = args[0].toLowerCase();
  const testoDaStampare = text.substring(text.indexOf(args[1])).trim();

  if (!sintassiLinguaggi[langInput]) {
    await conn.reply(m.chat, `❌ Linguaggio non supportato.\n\nLinguaggi: js, javascript, py, python, cpp, cs, csharp, java, php, ruby, bash`, m)
    return
  }

  const codiceFinale = sintassiLinguaggi[langInput](testoDaStampare);
  
  let langTitle = langInput.charAt(0).toUpperCase() + langInput.slice(1);
  if (langInput === 'js') langTitle = 'Javascript';
  if (langInput === 'py') langTitle = 'Python';
  if (langInput === 'cs') langTitle = 'C#';
  if (langInput === 'cpp') langTitle = 'C++';

  let msg = generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
      message: {
        interactiveMessage: proto.Message.InteractiveMessage.fromObject({
          header: proto.Message.InteractiveMessage.Header.fromObject({
            title: `🤖 *꙰  𝟥𝟥𝟥 𝔹ΟΣ  ꙰ 𝐀𝐈*`,
            hasMediaAttachment: false
          }),
          body: proto.Message.InteractiveMessage.Body.fromObject({
            text: `Ecco il codice richiesto per l'output nel terminale:`
          }),
          carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
            cards: [
              {
                body: proto.Message.InteractiveMessage.Body.fromObject({
                  text: codiceFinale
                }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                  buttons: [
                    {
                      name: "cta_copy",
                      buttonParamsJson: JSON.stringify({
                        display_text: `Codice ${langTitle}`,
                        id: "copy_formatted_code",
                        copy_code: codiceFinale
                      })
                    }
                  ]
                })
              }
            ]
          })
        })
      }
    }
  }, { quoted: m })

  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}

handler.command = ['code']

export default handler