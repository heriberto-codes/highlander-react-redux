exports.up = function(knex) {
    return knex.schema.createTable('coaches_teams', function(table) {
        table.integer('coach_id').unsigned();
        table.foreign('coach_id').references('id').inTable('coaches');
        table.integer('team_id').unsigned();
        table.foreign('team_id').references('id').inTable('teams');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('coaches_teams');
};
