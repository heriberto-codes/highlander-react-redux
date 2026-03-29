exports.up = function(knex) {
  return knex.schema.createTable('coach_notifications', function(table) {
    table.increments('id').unsigned().primary();
    table.integer('coach_id').unsigned().notNullable();
    table.foreign('coach_id').references('id').inTable('coaches');
    table.integer('team_id').unsigned().nullable();
    table.foreign('team_id').references('id').inTable('teams');
    table.integer('game_id').unsigned().nullable();
    table.foreign('game_id').references('id').inTable('games');
    table.string('kind').notNullable();
    table.text('message').notNullable();
    table.dateTime('scheduled_for').nullable();
    table.dateTime('read_at').nullable();
    table.dateTime('dismissed_at').nullable();
    table.string('idempotency_key').nullable().unique();
    table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    table.index(['coach_id']);
    table.index(['scheduled_for']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('coach_notifications');
};
