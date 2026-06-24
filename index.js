import { join, dirname } from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { setupMaster, fork } from 'cluster';
import { watchFile, unwatchFile, existsSync } from 'fs';
import { createInterface } from 'readline';
import yargs from 'yargs';
import { execSync } from 'child_process';

process.env.SUPPRESS_BANNER = 'true';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(__dirname);

const checkAndInstallModules = () => {
  const nodeModulesPath = join(__dirname, 'node_modules');
  
  if (!existsSync(nodeModulesPath)) {
    console.clear();
    console.log('\n\n');
    console.log('\x1b[31m' + '═'.repeat(70) + '\x1b[0m');
    console.log('\x1b[33m\n   Bro e senza moduli come avvi il bot? \x1b[0m');
    console.log('\x1b[36m   Menomale che ci sono io! 😎\x1b[0m\n');
    console.log('\x1b[31m' + '═'.repeat(70) + '\x1b[0m');
    console.log('\n\x1b[35m⚡ Installazione moduli in corso...\x1b[0m\n');
    
    try {
      execSync('npm install', { stdio: 'inherit' });
      console.log('\n\x1b[32m✓ Moduli installati con successo!\x1b[0m');
      console.log('\x1b[36m🚀 Avvio del bot...\x1b[0m\n');
    } catch (error) {
      console.error('\n\x1b[31m✖ Errore durante l\'installazione dei moduli\x1b[0m');
      process.exit(1);
    }
  }
};

checkAndInstallModules();

const { name, author } = require(join(__dirname, './package.json'));

let cfonts;
try {
  cfonts = (await import('cfonts')).default;
} catch (e) {
  console.error('Errore caricamento cfonts, reinstallazione...');
  execSync('npm install', { stdio: 'inherit' });
  cfonts = (await import('cfonts')).default;
}

const rl = createInterface(process.stdin, process.stdout);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const typeWriterBig = async (text, delay = 100) => {
  let current = '';
  for (let char of text) {
    current += char;
    console.clear();
    console.log('\n\n');
    cfonts.say(current, {
      font: 'block',
      align: 'center',
      gradient: ['red', 'magenta', 'cyan'],
      transitionGradient: true,
    });
    await sleep(delay);
  }
};

const loading = async (text, duration = 1000) => {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  const startTime = Date.now();
  let i = 0;
  
  return new Promise(resolve => {
    const interval = setInterval(() => {
      process.stdout.write(`\r\x1b[35m${frames[i]} \x1b[36m${text}\x1b[0m`);
      i = (i + 1) % frames.length;
      
      if (Date.now() - startTime >= duration) {
        clearInterval(interval);
        process.stdout.write(`\r\x1b[32m✓ \x1b[36m${text}\x1b[0m\n`);
        resolve();
      }
    }, 60);
  });
};

const progressBar = async (label, duration = 1200) => {
  const barLength = 40;
  const steps = 50;
  const stepDuration = duration / steps;
  
  for (let i = 0; i <= steps; i++) {
    const filled = Math.floor((i / steps) * barLength);
    const empty = barLength - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const percent = Math.floor((i / steps) * 100);
    process.stdout.write(`\r\x1b[36m${label} \x1b[35m[${bar}] \x1b[33m${percent}%\x1b[0m`);
    await sleep(stepDuration);
  }
  console.log();
};

const pulse = async (text, times = 3) => {
  const colors = ['\x1b[31m', '\x1b[33m', '\x1b[35m', '\x1b[36m'];
  for (let i = 0; i < times; i++) {
    for (let color of colors) {
      process.stdout.write(`\r${color}${text}\x1b[0m`);
      await sleep(60);
    }
  }
  console.log();
};

const typeWriter = async (text, delay = 25, color = '\x1b[36m') => {
  const reset = '\x1b[0m';
  for (let char of text) {
    process.stdout.write(color + char + reset);
    await sleep(delay);
  }
  console.log();
};

async function epicStartup() {
  console.clear();
  
  await sleep(300);
  
  await typeWriterBig('333\nBOT V10\n2026', 120);
  
  await sleep(400);
  
  console.log('\n');
  await typeWriter('                     Ultimo Aggiornamento: 21/05/2026', 40, '\x1b[33m');
  
  console.log('\n');
  await typeWriter('                    Edit by Gab, Lucifero & 333 Staff', 35, '\x1b[36m');
  
  console.log('\n\n');
  console.log('\x1b[90m' + '━'.repeat(70) + '\x1b[0m');
  console.log('\n');
  
  await progressBar('Caricamento sistema', 1100);
  await loading('Inizializzazione moduli', 600);
  await loading('Connessione database', 550);
  await loading('Attivazione protocolli', 600);
  await loading('Sincronizzazione', 500);
  await progressBar('Finalizzazione', 900);
  
  console.log('\n');
  console.log('\x1b[90m' + '━'.repeat(70) + '\x1b[0m');
  console.log('\n');
  
  await sleep(200);
  await pulse('                     #333NEVERDIES', 4);
  
  console.log('\n');
  console.log('\x1b[90m' + '━'.repeat(70) + '\x1b[0m');
  console.log('\n\n');
}

let isRunning = false;

async function start(file) {
  if (isRunning) return;
  isRunning = true;

  await epicStartup();

  const args = [join(__dirname, file), ...process.argv.slice(2)];

  console.log('\x1b[32m✓ Sistema pronto\x1b[0m');
  console.log('\x1b[32m✓ Bot online\x1b[0m');
  console.log('\x1b[32m✓ Tutti i sistemi operativi\x1b[0m\n');

  setupMaster({
    exec: args[0],
    args: args.slice(1),
  });

  let processInstance = fork();

  processInstance.on('message', (data) => {
    console.log('\x1b[36m[→]\x1b[0m', data);
    switch (data) {
      case 'reset':
        console.log('\x1b[33m\n⟳ Riavvio in corso...\x1b[0m\n');
        processInstance.kill();
        isRunning = false;
        start(file);
        break;
      case 'uptime':
        processInstance.send(process.uptime());
        break;
    }
  });

  processInstance.on('exit', (_, code) => {
    isRunning = false;
    console.error('\n\x1b[31m✖ Errore processo [' + code + ']\x1b[0m\n');

    if (code !== 0) {
      watchFile(args[0], () => {
        unwatchFile(args[0]);
        console.log('\x1b[32m↻ Recupero automatico...\x1b[0m\n');
        start(file);
      });
    }
  });

  let opts = new Object(
    yargs(process.argv.slice(2)).exitProcess(false).parse()
  );
  
  if (!opts['test']) {
    if (!rl.listenerCount('line')) {
      rl.on('line', (line) => {
        processInstance.send(line.trim());
      });
    }
  }
}

start('333.js');
