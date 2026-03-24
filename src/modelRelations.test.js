/**
 * @jest-environment node
 */

function loadCoachModel() {
  jest.resetModules();

  const mockBookshelf = {
    Model: {
      extend: jest.fn((instanceProps, staticProps) => Object.assign({}, instanceProps, staticProps))
    },
    model: jest.fn((name, schema) => schema)
  };

  jest.doMock('../api/config/bookshelf.config', () => mockBookshelf);
  jest.doMock('../api/models/Team', () => ({}));
  jest.doMock('../api/models/Player', () => ({}));

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

  return require('../api/models/Team');
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
});
