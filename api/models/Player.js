const Bookshelf = require('../config/bookshelf.config');

require('./Team');
require('./Stat_Catalog');
require('./Stat');

const PlayerSchema = Bookshelf.Model.extend({
  tableName: 'players',
  teams: function() {
    return this.belongsToMany('Team');
  },
  stats: function() {
    return this.belongsToMany('Stat_Catalog');
  }
});

module.exports = Bookshelf.model('Player', PlayerSchema);
