const Bookshelf = require('../config/bookshelf.config');

require('./Coach');
require('./Player');

const TeamSchema = Bookshelf.Model.extend({
  tableName: 'teams',
  coach: function() {
    return this.belongsToMany('Coach', 'coaches_teams', 'team_id', 'coach_id', 'team_id',  'coach_id');
  },
  players: function() {
    return this.belongsToMany('Player', 'players_teams', 'team_id', 'player_id', 'team_id', 'player_id');
  }
});
module.exports = Bookshelf.model('Team', TeamSchema);
