const { DATABASE_URL } = require('./config');

module.exports = {
        development: {
                client: 'pg',
                connection: DATABASE_URL,
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
                connection: DATABASE_URL,
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
