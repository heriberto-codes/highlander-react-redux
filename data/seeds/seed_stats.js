exports.seed = function (knex, Promise) {
  return knex('stats').del()
  .then(function () {
    return knex('stats').insert([
      {player_id: 1, stat_catalog_id: 1, how_many: 6, game_date: new Date()},
      {player_id: 2, stat_catalog_id: 2, how_many: 4, game_date: new Date()},
      {player_id: 3, stat_catalog_id: 3, how_many: 2, game_date: new Date()},
      {player_id: 4, stat_catalog_id: 6, how_many: 2, game_date: new Date()},
      {player_id: 1, stat_catalog_id: 2, how_many: 2, game_date: new Date()},
      {player_id: 5, stat_catalog_id: 4, how_many: 6, game_date: new Date()},
      {player_id: 3, stat_catalog_id: 5, how_many: 8, game_date: new Date()},
      {player_id: 4, stat_catalog_id: 5, how_many: 8, game_date: new Date()}
    ]);
  });
};
