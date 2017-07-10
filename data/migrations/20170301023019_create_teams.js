exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('teams', function(table){
      table.increments('team_id').primary();
      table.string('name');
      table.string('city');
      table.string('state');
      table.dateTime('game_date');
      table.timestamps(true, true);
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('teams')
  ]);
};
