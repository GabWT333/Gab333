let handler = async (m, { conn, text }) => {
    let id = m.chat
    conn.math = conn.math ? conn.math : {}
    if (id in conn.math) {
      clearTimeout(conn.math[id][3])
      delete conn.math[id]
      m.reply('.... ')
    }
    
    let val = text
      .replace(/[^0-9\-\/+*×÷πEe()piPI/]/g, '')
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π|pi/gi, 'Math.PI')
      .replace(/e/gi, 'Math.E')
      .replace(/\/+/g, '/')
      .replace(/\++/g, '+')
      .replace(/-+/g, '-')
    
    let format = val
      .replace(/Math\.PI/g, 'π')
      .replace(/Math\.E/g, 'e')
      .replace(/\//g, '÷')
      .replace(/\*/g, '×')
  
    try {
      console.log(val)
      let result = (new Function('return ' + val))()
      if (!result) throw result
      
      m.reply(`📊 *Risultato calcolo*\n\n` +
              `🔢 *Equazione:* ${format}\n` +
              `🧮 *Risultato:* _${result}_`)
              
    } catch (e) {
      if (e == undefined) {
        return m.reply('🚩 Inserisci un\'equazione valida.\n\nPuoi usare i simboli: +, -, *, /, ×, ÷, π, e, (, )')
      }
      return m.reply('Formato non valido. Sono consentiti solo numeri (0-9) e i simboli: +, -, *, /, ×, ÷, π, e, (, )')
    }
  }
  
  handler.help = ['calc <equazione>']
  handler.tags = ['utilità']
  handler.command = ['cal', 'calc', 'calcola', 'calcolatrice'] 
  handler.exp = 5
  handler.register = true 
  export default handler