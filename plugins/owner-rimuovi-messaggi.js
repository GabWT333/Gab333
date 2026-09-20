//Plugin by Gab, Lucifero & 333 staff

const handler = async (message) => {
  const userId = (message.mentionedJid && message.mentionedJid[0]) || message.sender;
  const userData = global.db.data.users[userId];
  
  if (!userData) {
    return message.reply("Inserisci la menzione nel comando!");
  }
  
  const numberMatch = message.text.match(/\d+/);
  const messageCount = numberMatch ? parseInt(numberMatch[0]) : 0;
  
  if (messageCount <= 0) {
    return message.reply("Inserisci un numero valido di messaggi da rimuovere!");
  }
  
  if (!userData.messaggi || userData.messaggi < messageCount) {
    const username = userId.split('@')[0];
    return message.reply(
      `L'utente @${username} non ha abbastanza messaggi da rimuovere.`,
      null,
      { mentions: [userId] }
    );
  }
  
  userData.messaggi -= messageCount;
  
  const quotedMessage = {
    key: {
      participants: "users",
      fromMe: false,
      id: "Halo"
    },
    message: {
      extendedTextMessage: {
        text: "Eseguito con successo ✓",
        vcard:
          `BEGIN:VCARD
VERSION:3.0
N:;Unlimited;;;
FN:Unlimited
ORG:Unlimited
TITLE:
item1.TEL;waid=19709001746:+1 (970) 900-1746
item1.X-ABLabel:Unlimited
X-WA-BIZ-DESCRIPTION:ofc
X-WA-BIZ-NAME:Unlimited
END:VCARD`
      }
    },
    participant: "0@s.whatsapp.net"
  };
  
  conn.reply(
    message.chat,
    `Ho rimosso *${messageCount}* messaggi a questo utente!`,
    null,
    { quoted: quotedMessage }
  );
};

handler.command = /^(rimuovi)$/i;
handler.rowner = true;
export default handler;