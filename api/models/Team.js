const Bookshelf = require('../config/bookshelf.config');

require('./Coach');
require('./Player');
require('./Game');

const TeamSchema = Bookshelf.Model.extend({
  tableName: 'teams',
  coach: function() {
    return this.belongsToMany('Coach').withPivot(['role']);
  },
  players: function() {
    return this.belongsToMany('Player');
  },
  games: function() {
    return this.hasMany('Game');
  }
});
module.exports = Bookshelf.model('Team', TeamSchema);
