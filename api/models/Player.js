const Bookshelf = require('../config/bookshelf.config');

require('./Team');
require('./Stat_Catalog');

const PlayerSchema = Bookshelf.Model.extend({
  tableName: 'players',
  teams: function() {
    return this.belongsToMany('Team');
  },
  stats: function() {
    return this.belongsToMany('Stat_Catalog').withPivot(['how_many', 'game_date']);
  }
});

module.exports = Bookshelf.model('Player', PlayerSchema);
