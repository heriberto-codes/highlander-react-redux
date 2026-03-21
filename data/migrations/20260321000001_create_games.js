exports.up = function(knex) {
  return knex.schema.createTable('games', function(table) {
    table.increments('id').unsigned().primary();
    table.integer('team_id').unsigned().notNullable();
    table.foreign('team_id').references('id').inTable('teams');
    table.string('opponent').notNullable();
    table.dateTime('game_date').notNullable();
    table.index(['team_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('games');
};
