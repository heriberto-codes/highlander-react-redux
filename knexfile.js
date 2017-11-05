module.exports = {
	development: {
		client: 'postgresql',
		connection: {
			database: 'highlander-react-redux',
			user: 'iamromanh',
			password: 'BananaBanana99',
			charset: 'utf8'
		},
		migrations: {
			directory: 'data/migrations'
		},
		seeds: {
			directory: 'data/seeds'
		},
		debug: true,
		useNullAsDefault: true,
	},

	production: {
		client: 'pg',
		connection: process.env.HEROKU_POSTGRESQL_ONYX_URL,
		pool: {
			min: 2,
			max: 10
		},
		migrations: {
			directory: 'data/migrations',
			tableName: 'knex_migrations'
		},
		seeds: {
			directory: 'data/prod_seeds'
		}
	}
};
