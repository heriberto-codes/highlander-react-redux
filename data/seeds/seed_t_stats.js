exports.seed = function(knex, Promise) {
  const seededStatRows = [
    { player_id: 1, stat_catalog_id: 1, how_many: 6, opponent: 'Lions' },
    { player_id: 2, stat_catalog_id: 2, how_many: 4, opponent: 'Sharks' },
    { player_id: 3, stat_catalog_id: 3, how_many: 2, opponent: 'Falcons' },
    { player_id: 4, stat_catalog_id: 6, how_many: 2, opponent: 'Bears' },
    { player_id: 1, stat_catalog_id: 2, how_many: 2, opponent: 'Lions' },
    { player_id: 3, stat_catalog_id: 5, how_many: 8, opponent: 'Falcons' },
    { player_id: 4, stat_catalog_id: 5, how_many: 8, opponent: 'Bears' }
  ];

  return knex('players_stat_catalogs').del()
    .then(function() {
      return knex('games').select('id', 'opponent', 'game_date');
    })
    .then(function(games) {
      const gameByOpponent = games.reduce(function(acc, game) {
        if (!(game.opponent in acc)) {
          acc[game.opponent] = game;
        }
        return acc;
      }, {});

      return seededStatRows.map(function(statRow) {
        const game = gameByOpponent[statRow.opponent];
        const gameDate = game ? game.game_date : new Date();

        return {
          player_id: statRow.player_id,
          stat_catalog_id: statRow.stat_catalog_id,
          how_many: statRow.how_many,
          game_id: game ? game.id : null,
          game_date: gameDate
        };
      });
    })
    .then(function(statRows) {
      return knex('players_stat_catalogs').insert(statRows);
    });
};
