exports.up = function(knex) {
  return knex.schema.createTable('session', function(table) {
    table.specificType('sid', 'varchar').notNullable().primary();
    table.json('sess').notNullable();
    table.specificType('expire', 'timestamp(6)').notNullable();
    table.index(['expire'], 'IDX_session_expire');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('session');
};
