exports.up = function(knex, Promise) {
    return Promise.all([
      knex.schema.createTable('coaches_teams', function(table) {
        table.integer('coach_id').unsigned();
        table.foreign('coach_id').references('coach_id').inTable('coaches');
        table.integer('team_id').unsigned();
        table.foreign('team_id').references('team_id').inTable('teams');
      })
    ])
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('coaches_teams')
    ]);
};
