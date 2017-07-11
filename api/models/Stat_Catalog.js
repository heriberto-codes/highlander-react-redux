const Bookshelf = require('../config/bookshelf.config')

require('./Player');

const StatCatalogSchema = Bookshelf.Model.extend({
  tableName: 'stat_catalogs',
  players: function() {
    return this.belongsToMany('Player', 'stats');
  },
  stats: function() {
    return this.hasMany('Stat')
  }
});

module.exports = Bookshelf.model('Stat_Catalog', StatCatalogSchema);
