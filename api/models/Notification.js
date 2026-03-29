const Bookshelf = require('../config/bookshelf.config');

require('./Coach');
require('./Team');
require('./Game');

const NotificationSchema = Bookshelf.Model.extend({
  tableName: 'coach_notifications',
  coach: function() {
    return this.belongsTo('Coach');
  },
  team: function() {
    return this.belongsTo('Team');
  },
  game: function() {
    return this.belongsTo('Game');
  }
});

module.exports = Bookshelf.model('Notification', NotificationSchema);
