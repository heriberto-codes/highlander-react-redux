exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('players_stat_catalogs', function(table) {
      table.increments('players_stat_catalogs_id').unsigned().primary();
      table.integer('player_id').unsigned();
      table.foreign('player_id').references('player_id').inTable('players');
      table.integer('stat_catalog_id').unsigned();
      table.foreign('stat_catalog_id').references('stat_catalogs_id').inTable('stat_catalogs');
      table.integer('how_many');
      table.datetime('game_date');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('players_stat_catalogs')
  ]);
};
