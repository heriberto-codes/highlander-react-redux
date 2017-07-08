exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('teams_players', function(table) {
      table.integer('team_id').unsigned();
      table.foreign('team_id').references('id').inTable('teams');
      table.integer('player_id').unsigned();
      table.foreign('player_id').references('id').inTable('players');
      table.timestamps(true, true);
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('teams_players')
  ]);
};
