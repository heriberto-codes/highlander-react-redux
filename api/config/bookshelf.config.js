var env = process.env.NODE_ENV || 'development';
var config = require('../../knexfile');
var knex = require('knex') (config[env]);
var Bookshelf = require('bookshelf') (knex);

Bookshelf.plugin('registry');

module.exports = Bookshelf;
