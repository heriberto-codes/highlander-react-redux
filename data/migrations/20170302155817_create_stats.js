exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('players_stat_catalogs', function(table) {
      table.increments('id').unsigned().primary();
      table.integer('player_id').unsigned();
      table.foreign('player_id').references('id').inTable('players');
      table.integer('stat_catalog_id').unsigned();
      table.foreign('stat_catalog_id').references('id').inTable('stat_catalogs');
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
