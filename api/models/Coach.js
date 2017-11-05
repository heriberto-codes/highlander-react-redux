const Bookshelf = require('../config/bookshelf.config');
const Bcrypt = require('bcrypt');
const saltRounds = 10;

require('./Team');
require('./Player');

const CoachSchema = Bookshelf.Model.extend({
	tableName: 'coaches',
	teams: function() {
		return this.belongsToMany('Team');
	}
},
{
	hashPassword: function(password) {
		let hashed = Bcrypt.hash(password, saltRounds);
    console.log('This is the hashed paassword for this instance', hashed)
		return hashed;
	},
	validatePassword: function(hashedPassword, plainTextPassword) {
		return Bcrypt.compare(plainTextPassword, hashedPassword);
	}
});

module.exports = Bookshelf.model('Coach', CoachSchema);
