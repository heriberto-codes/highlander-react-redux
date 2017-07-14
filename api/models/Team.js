const Bookshelf = require('../config/bookshelf.config');

require('./Coach');
require('./Player');

const TeamSchema = Bookshelf.Model.extend({
  tableName: 'teams',
  coach: function() {
    return this.belongsToMany('Coach', 'coaches_teams');
  },
  players: function() {
    return this.belongsToMany('Player', 'players_teams');
  }
});
module.exports = Bookshelf.model('Team', TeamSchema);
