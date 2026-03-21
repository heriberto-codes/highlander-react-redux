exports.up = function(knex) {
  const fallbackSeason = new Date().getFullYear();

  return knex.schema
    .table('teams', function(table) {
      table.integer('season');
    })
    .then(function() {
      return knex.raw(
        'UPDATE teams SET season = COALESCE(EXTRACT(YEAR FROM game_date)::integer, ?)',
        [fallbackSeason]
      );
    })
    .then(function() {
      return knex.schema.table('teams', function(table) {
        table.integer('season').notNullable().alter();
      });
    })
    .then(function() {
      return knex.schema.table('teams', function(table) {
        table.index(['season']);
      });
    });
};

exports.down = function(knex) {
  return knex.schema.table('teams', function(table) {
    table.dropIndex(['season']);
    table.dropColumn('season');
  });
};
