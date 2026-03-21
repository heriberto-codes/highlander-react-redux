exports.seed = function(knex, Promise) {
  const seededGames = [
    {
      teamName: 'Highlanders',
      opponent: 'Lions',
      game_date: new Date('2026-03-28T00:00:00Z')
    },
    {
      teamName: 'Gem Stars',
      opponent: 'Sharks',
      game_date: new Date('2026-03-29T00:00:00Z')
    },
    {
      teamName: 'Warriors',
      opponent: 'Falcons',
      game_date: new Date('2026-03-30T00:00:00Z')
    },
    {
      teamName: 'Tigers',
      opponent: 'Bears',
      game_date: new Date('2026-03-31T00:00:00Z')
    }
  ];

  return knex('games').del()
    .then(function() {
      return knex('teams').select('id', 'name');
    })
    .then(function(teams) {
      const teamIdsByName = teams.reduce(function(acc, team) {
        acc[team.name] = team.id;
        return acc;
      }, {});

      return seededGames
        .map(function(game) {
          if (!teamIdsByName[game.teamName]) {
            return null;
          }

          return {
            team_id: teamIdsByName[game.teamName],
            opponent: game.opponent,
            game_date: game.game_date
          };
        })
        .filter(Boolean);
    })
    .then(function(games) {
      if (games.length === 0) {
        return [];
      }

      return knex('games').insert(games);
    });
};
