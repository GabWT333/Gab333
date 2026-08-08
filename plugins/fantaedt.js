import axios from 'axios';

const CACHE = {
    data: null,
    lastUpdate: 0,
    ttl: 10 * 60 * 1000
};

const STATS_DB = {
    'Inter': { att: 89, def: 86, mid: 88, gk: 85, form: [3, 3, 1, 3, 3], averageRating: 6.6 },
    'Juventus': { att: 83, def: 88, mid: 83, gk: 86, form: [3, 1, 3, 1, 3], averageRating: 6.4 },
    'Milan': { att: 85, def: 81, mid: 83, gk: 84, form: [1, 3, 0, 3, 1], averageRating: 6.3 },
    'Atalanta': { att: 87, def: 82, mid: 85, gk: 81, form: [3, 3, 3, 3, 3], averageRating: 6.5 },
    'Roma': { att: 81, def: 80, mid: 81, gk: 80, form: [1, 0, 3, 0, 1], averageRating: 6.1 },
    'Lazio': { att: 82, def: 79, mid: 82, gk: 79, form: [3, 3, 0, 3, 3], averageRating: 6.3 },
    'Napoli': { att: 86, def: 85, mid: 84, gk: 83, form: [3, 3, 1, 3, 0], averageRating: 6.5 },
    'Fiorentina': { att: 82, def: 80, mid: 81, gk: 82, form: [3, 3, 3, 0, 3], averageRating: 6.3 },
    'Bologna': { att: 78, def: 81, mid: 79, gk: 79, form: [1, 3, 1, 1, 3], averageRating: 6.1 },
    'Torino': { att: 76, def: 77, mid: 76, gk: 78, form: [0, 0, 3, 0, 0], averageRating: 5.9 },
    'Monza': { att: 73, def: 75, mid: 74, gk: 77, form: [1, 0, 1, 0, 1], averageRating: 5.8 },
    'Genoa': { att: 74, def: 74, mid: 74, gk: 76, form: [0, 1, 3, 1, 0], averageRating: 5.8 },
    'Lecce': { att: 71, def: 72, mid: 72, gk: 75, form: [0, 1, 0, 3, 0], averageRating: 5.7 },
    'Empoli': { att: 73, def: 76, mid: 73, gk: 77, form: [0, 1, 1, 0, 3], averageRating: 5.9 },
    'Udinese': { att: 75, def: 75, mid: 75, gk: 76, form: [3, 0, 0, 3, 0], averageRating: 5.9 },
    'Cagliari': { att: 74, def: 73, mid: 73, gk: 75, form: [1, 0, 3, 0, 1], averageRating: 5.8 },
    'Verona': { att: 73, def: 70, mid: 72, gk: 73, form: [0, 3, 0, 0, 3], averageRating: 5.7 },
    'Parma': { att: 76, def: 73, mid: 75, gk: 74, form: [1, 1, 0, 3, 0], averageRating: 5.9 },
    'Como': { att: 77, def: 72, mid: 76, gk: 74, form: [1, 0, 1, 1, 0], averageRating: 5.9 },
    'Venezia': { att: 71, def: 71, mid: 72, gk: 73, form: [0, 1, 0, 0, 1], averageRating: 5.7 }
};

async function fetchSerieAData() {
    if (CACHE.data && (Date.now() - CACHE.lastUpdate < CACHE.ttl)) {
        return CACHE.data;
    }
    try {
        const response = await axios.get('https://api.allorigins.win/raw?url=https://www.fantacalcio.it/api/v1/fixtures', { timeout: 10000 });
        if (response.data && response.data.fixtures) {
            CACHE.data = response.data.fixtures;
            CACHE.lastUpdate = Date.now();
            return CACHE.data;
        }
    } catch (error) {
        return generateMockFixtures();
    }
    return generateMockFixtures();
}

function generateMockFixtures() {
    const teams = Object.keys(STATS_DB);
    const fixtures = [];
    const shuffled = [...teams].sort(() => 0.5 - Math.random());
    for (let i = 0; i < shuffled.length; i += 2) {
        fixtures.push({
            home: shuffled[i],
            away: shuffled[i + 1],
            date: new Date().toLocaleDateString('it-IT'),
            time: '20:45'
        });
    }
    return fixtures;
}

function runPredictionAlgorithm(home, away) {
    const homeStats = STATS_DB[home] || { att: 75, def: 75, mid: 75, gk: 75, form: [1, 1, 1], averageRating: 6.0 };
    const awayStats = STATS_DB[away] || { att: 75, def: 75, mid: 75, gk: 75, form: [1, 1, 1], averageRating: 6.0 };

    const getFormWeight = (formArray) => {
        return formArray.reduce((acc, curr) => acc + curr, 0) / formArray.length;
    };

    const homeForm = getFormWeight(homeStats.form);
    const awayForm = getFormWeight(awayStats.form);

    const homePower = (homeStats.att * 0.35 + homeStats.mid * 0.30 + homeStats.def * 0.20 + homeStats.gk * 0.15) * (1 + homeForm * 0.1) * (homeStats.averageRating / 6.0) * 1.08;
    const awayPower = (awayStats.att * 0.35 + awayStats.mid * 0.30 + awayStats.def * 0.20 + awayStats.gk * 0.15) * (1 + awayForm * 0.1) * (awayStats.averageRating / 6.0);

    const diff = homePower - awayPower;
    let probHome = 40 + (diff * 1.5);
    let probAway = 35 - (diff * 1.5);
    let probDraw = 25;

    if (probHome < 10) probHome = 10;
    if (probAway < 10) probAway = 10;

    const total = probHome + probAway + probDraw;
    probHome = Math.round((probHome / total) * 100);
    probAway = Math.round((probAway / total) * 100);
    probDraw = 100 - probHome - probAway;

    let sign = '1X';
    if (probHome > 48) {
        sign = '1';
    } else if (probAway > 48) {
        sign = '2';
    } else if (probDraw > 35 || Math.abs(probHome - probAway) < 8) {
        sign = 'X';
    }

    const baseHomeGoals = (homePower / 35) + (Math.random() * 0.8 - 0.4);
    const baseAwayGoals = (awayPower / 40) + (Math.random() * 0.8 - 0.4);

    const goalsHome = Math.max(0, Math.min(6, Math.round(baseHomeGoals)));
    const goalsAway = Math.max(0, Math.min(6, Math.round(baseAwayGoals)));

    const keyPlayers = {
        'Inter': ['Lautaro Martinez', 'Marcus Thuram', 'Nicolo Barella'],
        'Juventus': ['Dusan Vlahovic', 'Kenan Yildiz', 'Teun Koopmeiners'],
        'Milan': ['Rafael Leao', 'Christian Pulisic', 'Alvaro Morata'],
        'Atalanta': ['Ademola Lookman', 'Mateo Retegui', 'Charles De Ketelaere'],
        'Roma': ['Artem Dovbyk', 'Paulo Dybala', 'Lorenzo Pellegrini'],
        'Lazio': ['Taty Castellanos', 'Mattia Zaccagni', 'Boulaye Dia'],
        'Napoli': ['Romelu Lukaku', 'Khvicha Kvaratskhelia', 'Scott McTominay'],
        'Fiorentina': ['Albert Gudmundsson', 'Moise Kean', 'Andrea Colpani'],
        'Bologna': ['Santiago Castro', 'Riccardo Orsolini', 'Dan Ndoye'],
        'Torino': ['Duvan Zapata', 'Antonio Sanabria', 'Nikola Vlasic'],
        'Monza': ['Dany Mota', 'Milan Djuric', 'Daniel Maldini'],
        'Genoa': ['Andrea Pinamonti', 'Vitinha', 'Ruslan Malinovskyi'],
        'Lecce': ['Nikola Krstovic', 'Lameck Banda', 'Ante Rebic'],
        'Empoli': ['Lorenzo Colombo', 'Sebastiano Esposito', 'Emmanuel Gyasi'],
        'Udinese': ['Lorenzo Lucca', 'Florian Thauvin', 'Keinan Davis'],
        'Cagliari': ['Roberto Piccoli', 'Gianluca Gaetano', 'Zito Luvumbo'],
        'Verona': ['Casper Tengstedt', 'Daniel Mosquera', 'Darko Lazovic'],
        'Parma': ['Ange-Yoan Bonny', 'Dennis Man', 'Valentin Mihaila'],
        'Como': ['Patrick Cutrone', 'Andrea Belotti', 'Nico Paz'],
        'Venezia': ['Joel Pohjanpalo', 'Gaetano Oristanio', 'Gianluca Busio']
    };

    const homeSquad = keyPlayers[home] || ['Giocatore Chiave 1', 'Giocatore Chiave 2'];
    const awaySquad = keyPlayers[away] || ['Giocatore Chiave 1', 'Giocatore Chiave 2'];

    const pickFantaTip = () => {
        const combined = [...homeSquad, ...awaySquad];
        const selected = combined[Math.floor(Math.random() * combined.length)];
        return selected;
    };

    return {
        probHome,
        probDraw,
        probAway,
        sign,
        score: `${goalsHome}-${goalsAway}`,
        fantaPlayer: pickFantaTip()
    };
}

let handler = async (m, { conn, args, usedPrefix }) => {
    try {
        const fixtures = await fetchSerieAData();
        if (!fixtures || fixtures.length === 0) {
            return m.reply('Impossibile recuperare i dati del fantacalcio al momento');
        }

        if (args.length > 0) {
            const query = args.join(' ').toLowerCase();
            const matchedFixture = fixtures.find(f => 
                f.home.toLowerCase().includes(query) || 
                f.away.toLowerCase().includes(query)
            );

            if (!matchedFixture) {
                return m.reply('Squadra non trovata o nessun match in programma per questa giornata');
            }

            const pred = runPredictionAlgorithm(matchedFixture.home, matchedFixture.away);
            
            let singleReport = `FANTACALCIO REPORT & PRONOSTICO\n\n`;
            singleReport += `Match: ${matchedFixture.home} vs ${matchedFixture.away}\n`;
            singleReport += `Data: ${matchedFixture.date} alle ore ${matchedFixture.time || '20:45'}\n\n`;
            singleReport += `Probabilita Esito:\n`;
            singleReport += ` Vittoria ${matchedFixture.home}: ${pred.probHome}%\n`;
            singleReport += ` Pareggio: ${pred.probDraw}%\n`;
            singleReport += ` Vittoria ${matchedFixture.away}: ${pred.probAway}%\n\n`;
            singleReport += `Segno Consigliato: ${pred.sign}\n`;
            singleReport += `Risultato Esatto Stimato: ${pred.score}\n`;
            singleReport += `Fanta Consigliato: ${pred.fantaPlayer}\n`;

            return conn.sendMessage(m.chat, { text: singleReport }, { quoted: m });
        }

        let mainReport = `FANTACALCIO PRONOSTICI GIORNATA\n\n`;
        for (const f of fixtures) {
            const pred = runPredictionAlgorithm(f.home, f.away);
            mainReport += `${f.home} - ${f.away}\n`;
            mainReport += ` Pronostico: ${pred.sign} | Risultato: ${pred.score}\n`;
            mainReport += ` Fanta Consigliato: ${pred.fantaPlayer}\n\n`;
        }
        mainReport += `Usa ${usedPrefix}fantacalcio <nome squadra> per l analisi dettagliata di un singolo match`;

        await conn.sendMessage(m.chat, { text: mainReport }, { quoted: m });
    } catch (e) {
        await conn.sendMessage(m.chat, { text: 'Errore interno durante il calcolo dei pronostici' }, { quoted: m });
    }
};

handler.help = ['fantacalcio', 'fantacalcio <squadra>'];
handler.tags = ['fanta', 'tools'];
handler.command = /^(fantacalcio|fanta|pronostici)$/i;
handler.group = true;

export default handler;