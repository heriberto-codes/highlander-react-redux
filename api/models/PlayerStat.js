const Bookshelf = require('../config/bookshelf.config')

require('./Player');
require('./Stat_Catalog');

const PlayerStatSchema = Bookshelf.Model.extend({
  tableName: 'players_stat_catalogs',
  players: function() {
    return this.belongsTo('Player');
  },
  catalogs: function() {
    return this.belongsTo('Stat_Catalog');
  }
});

module.exports = Bookshelf.model('PlayerStat', PlayerStatSchema);
