const Bookshelf = require('../config/bookshelf.config');
const Bcrypt = require('bcrypt');
const saltRounds = 10;

require('./Team');
require('./Player');

const CoachSchema = Bookshelf.Model.extend({
  tableName: 'coaches',
  teams: function() {
    return this.belongsToMany('Team', 'coaches_teams', 'coach_id', 'team_id', 'coach_id', 'team_id');
    // return this.belongsToMany('Team');

  }
    // tableName: 'coaches',
    // idAttribute: 'coach_id'
},
{
  hashPassword: function(password) {
    let hashed = Bcrypt.hash(password, saltRounds)
    return hashed
  },
  validatePassword: function(hashedPassword, plainTextPassword) {
    return Bcrypt.compare(plainTextPassword, hashedPassword)
  }
});


module.exports = Bookshelf.model('Coach', CoachSchema);
