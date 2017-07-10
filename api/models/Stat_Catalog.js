const Bookshelf = require('../config/bookshelf.config')

require('./Player');

const Stat_Catalog = Bookshelf.Model.extend({
  tableName: 'stat_catalogs',
  players: function() {
    return this.belongsToMany('Player', 'stats');
  },
  stats: function() {
    return this.hasMany('Stat')
  }
});

module.exports = Bookshelf.model('Stat_Catalog', Stat_Catalog);
