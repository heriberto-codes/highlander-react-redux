exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.createTable('coaches', function(table) {
			table.increments('id').primary();
			table.string('email');
			table.string('password');
			table.string('first_name');
			table.string('last_name');
			table.timestamps(true, true);
		})
	]);
};

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.dropTable('coaches')
	]);
};
