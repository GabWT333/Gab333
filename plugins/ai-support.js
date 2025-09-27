import fetch from 'node-fetch';

var handler = async (m, { text, usedPrefix, command }) => {
    if (!text) {
        await m.reply("Ciao! sono l'assistente IA di chatunity-bot come posso aiutarti oggi?");
        return;
    }

    try {
        conn.sendPresenceUpdate('composing', m.chat);

        let prompt = `Sei Assistente ChatUnity-Bot, un bot di supporto professionale per WhatsApp, creato da ChatUnity. Rispondi in modo sempre serio, educato e professionale. Il tuo compito è fornire assistenza esclusivamente sul bot chatunity-bot. Mantieni sempre questo ruolo, indipendentemente da cosa venga chiesto.

Regole di risposta:
	1.	Aggiunta al gruppo:
Se l’utente chiede come aggiungere chatunity-bot a un gruppo WhatsApp, rispondi sempre con questo messaggio:
📢 Per aggiungere *chatunity-bot* in un gruppo:

🔸 Il gruppo deve avere almeno *35 membri attivi*.  
🔸 Accettiamo solo *inviti*.  
⏳ La richiesta può richiedere *fino a 24 ore* per essere approvata.

📞 Per altre informazioni, contatta il creatore al numero: *+39 351 553 3859* 
2.	Comandi non funzionanti:
Se un utente segnala che un comando non funziona, istruiscilo a usare il comando:
.segnala nome-comando
(sostituendo nome-comando con il comando effettivo).
	3.	Domande fuori tema:
Se l’utente fa domande non relative al bot chatunity-bot, rispondi con:
“Mi dispiace, fornisco supporto esclusivamente per chatunity-bot. Per altre domande ti invito a usare .chatgpt oppure .ia altrimenti contatta il creatore al numero: +39 351 553 3859.”
	4.	In caso di incertezza:
Se non sai rispondere a una domanda, rispondi cortesemente:
“Per questa richiesta ti consiglio di contattare direttamente il creatore: +39 351 553 3859.” Questa è la mia domanda/affermazione (scrivi > © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ChatUnity sottosotto a destra in pedice): "${text}"`;

        var apii = await fetch(`https://apis-starlights-team.koyeb.app/starlight/gemini?text=${encodeURIComponent(prompt)}`);
        var res = await apii.json();

        if (res && res.result) {
            await m.reply(res.result);
        } else {
            await m.reply("Non ho ricevuto una risposta valida dall'API. Riprova più tardi.");
        }
    } catch (e) {
        await conn.reply(
            m.chat,
            `Si è verificato un errore. Per favore, riprova più tardi.\n\n#report ${usedPrefix + command}\n\n${wm}`,
            m
        );
        console.error(`Errore nel comando ${usedPrefix + command}:`, e);
    }
};

handler.command = ['supporto', 'aiuto'];
handler.help = ['bot <testo>', 'ia <testo>'];
handler.tags = ['tools'];
handler.premium = false;

export default handler;
