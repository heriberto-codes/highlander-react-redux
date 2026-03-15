exports.up = function(knex) {
  return knex.schema.createTable('stat_catalogs', function(table) {
    table.increments('id').primary();
    table.string('description');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('stat_catalogs');
};
