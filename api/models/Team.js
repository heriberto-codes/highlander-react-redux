const Bookshelf = require('../config/bookshelf.config');

require('./Coach');
require('./Player');
require('./Game');
require('./Notification');

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
  },
  notifications: function() {
    return this.hasMany('Notification');
  }
});
module.exports = Bookshelf.model('Team', TeamSchema);
