/**
 * @jest-environment node
 */

function loadCoachModel() {
  jest.resetModules();
  jest.unmock('../api/models/Coach');

  const mockBookshelf = {
    Model: {
      extend: jest.fn((instanceProps, staticProps) => Object.assign({}, instanceProps, staticProps))
    },
    model: jest.fn((name, schema) => schema)
  };

  jest.doMock('../api/config/bookshelf.config', () => mockBookshelf);
  jest.doMock('../api/models/Team', () => ({}));
  jest.doMock('../api/models/Player', () => ({}));
  jest.doMock('../api/models/Notification', () => ({}));

  return require('../api/models/Coach');
}

function loadTeamModel() {
  jest.resetModules();
  jest.unmock('../api/models/Team');

  const mockBookshelf = {
    Model: {
      extend: jest.fn((instanceProps, staticProps) => Object.assign({}, instanceProps, staticProps))
    },
    model: jest.fn((name, schema) => schema)
  };

  jest.doMock('../api/config/bookshelf.config', () => mockBookshelf);
  jest.doMock('../api/models/Coach', () => ({}));
  jest.doMock('../api/models/Player', () => ({}));
  jest.doMock('../api/models/Game', () => ({}));
  jest.doMock('../api/models/Notification', () => ({}));

  return require('../api/models/Team');
}

function loadGameModel() {
  jest.resetModules();
  jest.unmock('../api/models/Game');

  const mockBookshelf = {
    Model: {
      extend: jest.fn((instanceProps, staticProps) => Object.assign({}, instanceProps, staticProps))
    },
    model: jest.fn((name, schema) => schema)
  };

  jest.doMock('../api/config/bookshelf.config', () => mockBookshelf);
  jest.doMock('../api/models/Team', () => ({}));
  jest.doMock('../api/models/PlayerStat', () => ({}));
  jest.doMock('../api/models/Notification', () => ({}));

  return require('../api/models/Game');
}

function loadNotificationModel() {
  jest.resetModules();
  jest.unmock('../api/models/Notification');

  const mockBookshelf = {
    Model: {
      extend: jest.fn((instanceProps, staticProps) => Object.assign({}, instanceProps, staticProps))
    },
    model: jest.fn((name, schema) => schema)
  };

  jest.doMock('../api/config/bookshelf.config', () => mockBookshelf);
  jest.doMock('../api/models/Coach', () => ({}));
  jest.doMock('../api/models/Team', () => ({}));
  jest.doMock('../api/models/Game', () => ({}));

  return require('../api/models/Notification');
}

describe('model relation metadata', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('Coach teams relation includes the role pivot column', () => {
    const Coach = loadCoachModel();
    const relation = {
      withPivot: jest.fn(() => 'coach-team-relation')
    };
    const belongsToMany = jest.fn(() => relation);

    const result = Coach.teams.call({ belongsToMany });

    expect(belongsToMany).toHaveBeenCalledWith('Team');
    expect(relation.withPivot).toHaveBeenCalledWith(['role']);
    expect(result).toBe('coach-team-relation');
  });

  it('Team coach relation includes the role pivot column', () => {
    const Team = loadTeamModel();
    const relation = {
      withPivot: jest.fn(() => 'team-coach-relation')
    };
    const belongsToMany = jest.fn(() => relation);

    const result = Team.coach.call({ belongsToMany });

    expect(belongsToMany).toHaveBeenCalledWith('Coach');
    expect(relation.withPivot).toHaveBeenCalledWith(['role']);
    expect(result).toBe('team-coach-relation');
  });

  it('Coach notifications relation uses hasMany Notification', () => {
    const Coach = loadCoachModel();
    const hasMany = jest.fn(() => 'coach-notifications-relation');

    const result = Coach.notifications.call({ hasMany });

    expect(hasMany).toHaveBeenCalledWith('Notification');
    expect(result).toBe('coach-notifications-relation');
  });

  it('Team notifications relation uses hasMany Notification', () => {
    const Team = loadTeamModel();
    const hasMany = jest.fn(() => 'team-notifications-relation');

    const result = Team.notifications.call({ hasMany });

    expect(hasMany).toHaveBeenCalledWith('Notification');
    expect(result).toBe('team-notifications-relation');
  });

  it('Game notifications relation uses hasMany Notification', () => {
    const Game = loadGameModel();
    const hasMany = jest.fn(() => 'game-notifications-relation');

    const result = Game.notifications.call({ hasMany });

    expect(hasMany).toHaveBeenCalledWith('Notification');
    expect(result).toBe('game-notifications-relation');
  });

  it('Notification belongs to Coach, Team, and Game', () => {
    const Notification = loadNotificationModel();
    const belongsTo = jest.fn()
      .mockReturnValueOnce('notification-coach-relation')
      .mockReturnValueOnce('notification-team-relation')
      .mockReturnValueOnce('notification-game-relation');

    const coachRelation = Notification.coach.call({ belongsTo });
    const teamRelation = Notification.team.call({ belongsTo });
    const gameRelation = Notification.game.call({ belongsTo });

    expect(belongsTo).toHaveBeenNthCalledWith(1, 'Coach');
    expect(belongsTo).toHaveBeenNthCalledWith(2, 'Team');
    expect(belongsTo).toHaveBeenNthCalledWith(3, 'Game');
    expect(coachRelation).toBe('notification-coach-relation');
    expect(teamRelation).toBe('notification-team-relation');
    expect(gameRelation).toBe('notification-game-relation');
  });
});
