const Bookshelf = require('../config/bookshelf.config')

require('./Player');

const StatCatalogSchema = Bookshelf.Model.extend({
  tableName: 'stat_catalogs',
  players: function() {
    return this.belongsToMany('Player');
  }
});

module.exports = Bookshelf.model('Stat_Catalog', StatCatalogSchema);
