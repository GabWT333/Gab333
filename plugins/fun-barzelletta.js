//Plugin by Gab, Lucifero & 333 staff

const handler = async (m, { conn }) => {

    const barzellette = [
        "Perché il pomodoro non riesce a dormire? Perché il letto è di lattuga!",
        "Qual è il colmo per un elettricista? Non avere tensioni!",
        "Cosa fa una triglia in un campo di calcio? Il trigliare di rigore!",
        "Perché il mare è salato? Perché i pesci fanno i salti di gioia!",
        "Cosa fa un gallo in palestra? Il sollevamento pulcini!",
        "Qual è il colmo per un giardiniere? Avere un brutto carattere!",
        "Qual è il colmo per un pasticciere? Fare una brutta figura!",
        "Perché le galline non parlano? Perché sono tutte senza becco…!",
        "Perché i pesci non hanno bisogno di soldi? Perché hanno già il conto in banca!",
        "Cosa fa un prete in palestra? Il sollevamento spiritico!",
        "Qual è il colmo per un ladro? Avere una faccia da galera!",
        "Che cos’è una zebra? Un cavallo evaso di prigione!",
        "Perché i carabinieri mettono la sveglia sul comodino? Perché sul letto non ci sta!",
        "Perché il computer ha freddo? Perché lascia sempre le finestre aperte!",
        "Cosa fa un'ape sulla luna? Un'ape lunare!",
        "Qual è il colmo per un orologiaio? Avere un brutto tempo!",
        "Perché gli scheletri non dicono bugie? Perché non hanno la faccia tosta!",
        "Cosa fa un vigile urbano nel deserto? Il controllo del traffico a cammello!",
        "Perché i fantasmi non vanno in discoteca? Perché hanno paura di essere smaterializzati!",
        "Che cosa dice una pallina da ping pong a un’altra? Ti faccio rimbalzare!",
        "Perché il libro di matematica era triste? Perché aveva troppi problemi!",
        "Cosa fa una mucca in mezzo al mare? Il latte condensato!",
        "Perché le fragole non vanno mai in vacanza? Perché finiscono sempre in marmellata!",
        "Cosa dice un vigile a un semaforo? Non guardarmi, sono rosso!",
        "Perché il lampione non va a scuola? Perché già illumina la strada!",
        "Cosa fa un vigile urbano in giardino? Regola il traffico di lumache!",
        "Perché gli orologi non si annoiano mai? Perché passano il tempo!",
        "Perché il sole non ha amici? Perché brucia sempre tutti!",
        "Perché il gatto studia matematica? Per imparare le radici quadrate!"
    ];


    const barzellettaCasuale = barzellette[Math.floor(Math.random() * barzellette.length)];


    await conn.sendMessage(m.chat, { text: barzellettaCasuale }, { quoted: m });
};


handler.command = ['barzelletta'];
handler.help = ['𝐛𝐚𝐫𝐳𝐞𝐥𝐥𝐞𝐭𝐭𝐚'];
handler.tags = ['fun'];
export default handler;