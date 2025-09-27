let leaderboardHandler = async (m, { conn }) => {
  let users = Object.entries(global.db.data.users)
    .map(([id, data]) => ({
      id,
      name: data.name || id,
      count: data.pokemons?.length || 0
    }))
    .filter(u => u.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  if (users.length === 0) {
    return m.reply('😢 Nessun collezionista trovato.')
  }

  let rankMsg = `🏆 *Top 10 Collezionisti Pokémon*:\n\n` + users.map((u, i) =>
    `${i + 1}. ${u.name} - ${u.count} carte`
  ).join('\n')

  m.reply(rankMsg)
}

leaderboardHandler.help = ['classifica']
leaderboardHandler.tags = ['pokemon']
leaderboardHandler.command = /^classificapokemon$/i

export default leaderboardHandler