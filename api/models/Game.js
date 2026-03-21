const Bookshelf = require('../config/bookshelf.config');

require('./Team');
require('./PlayerStat');

const GameSchema = Bookshelf.Model.extend({
  tableName: 'games',
  team: function() {
    return this.belongsTo('Team');
  },
  playerStats: function() {
    return this.hasMany('PlayerStat');
  }
});

module.exports = Bookshelf.model('Game', GameSchema);
