exports.seed = function (knex, Promise) {
	return knex('coaches').del()
		.then(function () {
			return knex('coaches').insert([
				{email: 'romanh99@gmail.com', password: 'highlander', first_name: 'Isaac', last_name: 'Brewman'},
				{email: 'hroman@theknowledgehouse.org', password: 'highlander', first_name: 'Danny', last_name: 'Diaz'}
			]);
		});
};
