exports.up = function(knex) {
  return knex.schema.createTable('teams', function(table){
    table.increments('id').primary();
    table.string('name');
    table.string('city');
    table.string('state');
    table.dateTime('game_date');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('teams');
};
