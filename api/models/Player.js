const Bookshelf = require('../config/bookshelf.config');

require('./Team');
require('./Stat_Catalog');
require('./Stat');

const PlayerSchema = Bookshelf.Model.extend({
  tableName: 'players',
  teams: function() {
    return this.belongsToMany('Team', 'players_teams', 'player_id', 'team_id', 'player_id', 'team_id');
  },
  stats: function() {
    return this.hasMany('Stat');
  }
});

module.exports = Bookshelf.model('Player', PlayerSchema);
