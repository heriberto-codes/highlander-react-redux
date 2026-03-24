exports.up = function(knex) {
  return knex.schema
    .table('coaches_teams', function(table) {
      table.string('role');
    })
    .then(function() {
      return knex('coaches_teams').update({
        role: 'owner'
      });
    })
    .then(function() {
      return knex.schema.table('coaches_teams', function(table) {
        table.string('role').notNullable().alter();
      });
    });
};

exports.down = function(knex) {
  return knex.schema.table('coaches_teams', function(table) {
    table.dropColumn('role');
  });
};
