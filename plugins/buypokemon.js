let handler = async (m, { conn, args }) => {
  const user = m.sender;
  const type = args[0]?.toLowerCase();
  const quantity = Math.max(1, parseInt(args[1]) || 1);

  const prices = {
    base: 500,
    imperium: 1500,
    premium: 5000,
  };

  if (!['base', 'imperium', 'premium'].includes(type)) {
    return m.reply(`❌ Usa: .buypokemon <base|imperium|premium> <quantità>\nEsempio: .buypokemon base 3`);
  }

  global.db.data.users[user] = global.db.data.users[user] || {};
  const data = global.db.data.users[user];

  data.packInventory = data.packInventory || { base: 0, imperium: 0, premium: 0 };
  data.limit = data.limit || 0; // UnityCoins

  const totalCost = prices[type] * quantity;

  if (data.limit < totalCost) {
    return m.reply(`❌ Ti servono *${totalCost}* UnityCoins per acquistare ${quantity} pacchetti ${type.toUpperCase()}.\n💰 Saldo attuale: ${data.limit}`);
  }

  data.limit -= totalCost;
  data.packInventory[type] += quantity;

  return m.reply(`✅ Hai comprato *${quantity}* pacchetti ${type.toUpperCase()}!\n📦 Totale ora: ${data.packInventory[type]}\n💸 UnityCoins rimanenti: ${data.limit}`);
};

handler.help = ['buypokemon <tipo> <quantità>'];
handler.tags = ['pokemon'];
handler.command = /^buypokemon$/i;

export default handler;