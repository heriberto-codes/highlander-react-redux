const Bookshelf = require('../config/bookshelf.config');

require('./Coach');
require('./Player');

const Team = Bookshelf.Model.extend({
  tableName: 'teams',
  coach: function() {
    return this.belongsToMany('Coach', 'coaches_teams');
  },
  players: function() {
    return this.belongsToMany('Player', 'teams_players');
  }
});
module.exports = Bookshelf.model('Team', Team);
