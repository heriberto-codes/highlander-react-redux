const Bookshelf = require('../config/bookshelf.config');

require('./Team');
require('./PlayerStat');
require('./Notification');

const GameSchema = Bookshelf.Model.extend({
  tableName: 'games',
  team: function() {
    return this.belongsTo('Team');
  },
  playerStats: function() {
    return this.hasMany('PlayerStat');
  },
  notifications: function() {
    return this.hasMany('Notification');
  }
});

module.exports = Bookshelf.model('Game', GameSchema);
