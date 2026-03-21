exports.up = function(knex) {
  return knex.schema.table('players_stat_catalogs', function(table) {
    table.integer('game_id').unsigned().nullable();
    table.foreign('game_id').references('id').inTable('games');
  });
};

exports.down = function(knex) {
  return knex.schema.table('players_stat_catalogs', function(table) {
    table.dropForeign('game_id');
    table.dropColumn('game_id');
  });
};
