const Bookshelf = require('../config/bookshelf.config');

require('./Coach');
require('./Player');

const TeamSchema = Bookshelf.Model.extend({
  tableName: 'teams',
  coach: function() {
    return this.belongsToMany('Coach');
  },
  players: function() {
    return this.belongsToMany('Player');
  }
});
module.exports = Bookshelf.model('Team', TeamSchema);
