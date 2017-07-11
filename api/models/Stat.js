const Bookshelf = require('../config/bookshelf.config');

require('./Stat_Catalog');

const StatSchema = Bookshelf.Model.extend({
  tableName: 'stats',
  player: function() {
    return this.belongsTo('Player')
  },
  catalog: function() {
    return this.belongsTo('Stat_Catalog')
  }
})

module.exports = Bookshelf.model('Stat', StatSchema);
