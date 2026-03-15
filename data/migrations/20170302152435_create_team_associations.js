exports.up = function(knex) {
  return knex.schema.createTable('players_teams', function(table) {
    table.integer('team_id').unsigned();
    table.foreign('team_id').references('id').inTable('teams');
    table.integer('player_id').unsigned();
    table.foreign('player_id').references('id').inTable('players');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('players_teams');
};
