/**
 * @jest-environment node
 */

const request = require('supertest');

process.env.NODE_ENV = 'development';
process.env.DATABASE_URL = 'postgresql://localhost/highlander-react-redux-test';
process.env.CLIENT_ORIGIN = 'http://localhost:3000';
process.env.SECRET = 'test-secret';

const mockFetch = jest.fn();
const mockPlayerFetchAll = jest.fn();
const mockTeamFetch = jest.fn();
const mockTeamForge = jest.fn();
const mockCoachForge = jest.fn();
const mockStatCatalogFetch = jest.fn();
const mockGameForge = jest.fn();
const mockPlayerStatForge = jest.fn();
const mockPlayerStatFetch = jest.fn();
const mockNotificationForge = jest.fn();
const mockTransaction = jest.fn();
const mockTeamCoachAttach = jest.fn();
const mockTeamCoachUpdatePivot = jest.fn();
const mockTeamCoachDetach = jest.fn();

jest.mock('../api/models/Coach', () => ({
  where: jest.fn(),
  forge: jest.fn(),
  hashPassword: jest.fn(),
  validatePassword: jest.fn()
}));

jest.mock('../api/models/Team', () => ({
  where: jest.fn(),
  forge: jest.fn()
}));

jest.mock('../api/models/Player', () => ({
  fetchAll: jest.fn(),
  where: jest.fn(),
  forge: jest.fn()
}));

jest.mock('../api/models/Game', () => ({
  forge: jest.fn()
}));

jest.mock('../api/models/PlayerStat', () => ({
  forge: jest.fn(),
  where: jest.fn()
}));

jest.mock('../api/models/Notification', () => ({
  forge: jest.fn()
}));

jest.mock('../api/models/Stat_Catalog', () => ({
  where: jest.fn()
}));

jest.mock('../api/config/bookshelf.config', () => {
  const actualBookshelf = jest.requireActual('../api/config/bookshelf.config');

  return Object.assign({}, actualBookshelf, {
    transaction: jest.fn()
  });
});

jest.mock('../api/middleware/ensureAuthenticated', () => jest.fn((req, res, next) => next()));

const { app } = require('../server');
const Coach = require('../api/models/Coach');
const Team = require('../api/models/Team');
const Player = require('../api/models/Player');
const Game = require('../api/models/Game');
const PlayerStat = require('../api/models/PlayerStat');
const Notification = require('../api/models/Notification');
const Stat_Catalog = require('../api/models/Stat_Catalog');
const Bookshelf = require('../api/config/bookshelf.config');
const ensureAuthenticated = require('../api/middleware/ensureAuthenticated');
const trustedOrigin = process.env.CLIENT_ORIGIN;

function withTrustedOrigin(testRequest) {
  return testRequest.set('Origin', trustedOrigin);
}

function sendNoSessionError(req, res) {
  return res.status(403).json({ error: 'No session available' });
}

describe('server routes', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockPlayerFetchAll.mockReset();
    mockTeamFetch.mockReset();
    mockTeamForge.mockReset();
    mockCoachForge.mockReset();
    mockStatCatalogFetch.mockReset();
    mockGameForge.mockReset();
    mockPlayerStatForge.mockReset();
    mockPlayerStatFetch.mockReset();
    mockNotificationForge.mockReset();
    mockTransaction.mockReset();
    mockTeamCoachAttach.mockReset();
    mockTeamCoachUpdatePivot.mockReset();
    mockTeamCoachDetach.mockReset();
    Coach.where.mockReset();
    Coach.forge.mockReset();
    Coach.hashPassword.mockReset();
    Coach.validatePassword.mockReset();
    Team.where.mockReset();
    Player.fetchAll.mockReset();
    Player.where.mockReset();
    Team.forge.mockReset();
    Game.forge.mockReset();
    PlayerStat.forge.mockReset();
    PlayerStat.where.mockReset();
    Stat_Catalog.where.mockReset();
    Bookshelf.transaction.mockReset();
    ensureAuthenticated.mockReset();
    Coach.where.mockReturnValue({
      fetch: mockFetch
    });
    Coach.hashPassword.mockResolvedValue('hashed-password');
    Coach.validatePassword.mockResolvedValue(true);
    Team.where.mockReturnValue({
      fetch: mockTeamFetch
    });
    Player.fetchAll.mockImplementation(mockPlayerFetchAll);
    Player.where.mockReturnValue({
      fetch: mockFetch
    });
    Coach.forge.mockImplementation(mockCoachForge);
    Team.forge.mockImplementation(mockTeamForge);
    Stat_Catalog.where.mockReturnValue({
      fetch: mockStatCatalogFetch
    });
    Game.forge.mockImplementation(mockGameForge);
    PlayerStat.forge.mockImplementation(mockPlayerStatForge);
    Notification.forge.mockImplementation(mockNotificationForge);
    PlayerStat.where.mockReturnValue({
      fetch: mockPlayerStatFetch
    });
    Bookshelf.transaction.mockImplementation(function(callback) {
      return callback(mockTransaction);
    });
    mockTeamCoachAttach.mockResolvedValue(undefined);
    mockTeamCoachUpdatePivot.mockResolvedValue(undefined);
    mockTeamCoachDetach.mockResolvedValue(undefined);
    ensureAuthenticated.mockImplementation((req, res, next) => {
      const requestPath = req.originalUrl || req.path;
      const authenticatedCoachId = requestPath.indexOf('/api/v1/coaches/') === 0
        ? Number(req.params.id)
        : 1;
      req.authenticatedCoachId = authenticatedCoachId;
      req.session.coachId = authenticatedCoachId;
      next();
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('GET /api/v1/coaches/:id adds derived stats from related player stats and sums duplicate rows', async () => {
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        id: 10,
        first_name: 'Test',
        last_name: 'Coach',
        teams: [
          {
            id: 20,
            name: 'Highlander',
            players: [
              {
                id: 30,
                first_name: 'Slugger',
                stats: [
                  { description: 'Hits', _pivot_how_many: 4, _pivot_game_id: 100 },
                  { description: 'Hits', _pivot_how_many: 2, _pivot_game_id: 100 },
                  { description: 'At Bats', _pivot_how_many: 7, _pivot_game_id: 100 },
                  { description: 'At Bats', _pivot_how_many: 5, _pivot_game_id: 100 },
                  { description: 'Home Runs', _pivot_how_many: 3, _pivot_game_id: 100 },
                  { description: 'Earned Runs', _pivot_how_many: 4, _pivot_game_id: 100 },
                  { description: 'Innings Pitched', _pivot_how_many: 8, _pivot_game_id: 100 },
                  { description: 'Strikeouts', _pivot_how_many: 10, _pivot_game_id: 100 }
                ]
              }
            ]
          }
        ]
      })
    });

    const response = await request(app).get('/api/v1/coaches/10').expect(200);
    const player = response.body.teams[0].players[0];

    expect(player.derivedStats).toEqual({
      battingAverage: 0.5,
      homeRunRate: 0.25,
      era: 4.5,
      strikeoutsPerInning: 1.25
    });
  });

  it('GET /api/v1/coaches/:id returns additive notifications and unreadNotificationCount', async () => {
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        id: 10,
        first_name: 'Test',
        last_name: 'Coach',
        teams: [
          {
            id: 20,
            name: 'Highlander',
            season: 2026,
            players: [],
            games: [
              {
                id: 21,
                opponent: 'Rivals',
                game_date: '2026-03-27T08:00:00.000Z'
              }
            ]
          }
        ],
        notifications: [
          {
            id: 7,
            coach_id: 10,
            team_id: 20,
            game_id: 22,
            kind: 'upcoming_game',
            message: 'Existing reminder',
            scheduled_for: '2026-03-27T06:00:00.000Z',
            read_at: null,
            dismissed_at: null,
            created_at: '2026-03-26T12:00:00.000Z',
            idempotency_key: 'upcoming_game:10:20:22'
          }
        ]
      })
    });

    jest.useFakeTimers().setSystemTime(new Date('2026-03-26T12:00:00.000Z'));

    const response = await request(app).get('/api/v1/coaches/10').expect(200);

    expect(response.body.notifications).toHaveLength(2);
    expect(response.body.unreadNotificationCount).toBe(2);
    expect(response.body.notifications[0].idempotency_key).toBe('upcoming_game:10:20:21');
    expect(response.body.notifications[1].idempotency_key).toBe('upcoming_game:10:20:22');
    expect(mockNotificationForge).not.toHaveBeenCalled();
  });

  it('GET /api/v1/coaches/:id does not create a duplicate reminder when the idempotency key already exists', async () => {
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        id: 10,
        first_name: 'Test',
        last_name: 'Coach',
        teams: [
          {
            id: 20,
            name: 'Highlander',
            season: 2026,
            players: [],
            games: [
              {
                id: 21,
                opponent: 'Rivals',
                game_date: '2026-03-27T08:00:00.000Z'
              }
            ]
          }
        ],
        notifications: [
          {
            id: 7,
            coach_id: 10,
            team_id: 20,
            game_id: 21,
            kind: 'upcoming_game',
            message: 'Existing reminder',
            scheduled_for: '2026-03-27T08:00:00.000Z',
            read_at: null,
            dismissed_at: null,
            created_at: '2026-03-26T12:00:00.000Z',
            idempotency_key: 'upcoming_game:10:20:21'
          }
        ]
      })
    });

    jest.useFakeTimers().setSystemTime(new Date('2026-03-26T12:00:00.000Z'));

    const response = await request(app).get('/api/v1/coaches/10').expect(200);

    expect(response.body.notifications).toHaveLength(1);
    expect(response.body.unreadNotificationCount).toBe(1);
    expect(mockNotificationForge).not.toHaveBeenCalled();
  });

  it('GET /api/v1/coaches/:id excludes dismissed notifications from the dashboard payload', async () => {
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        id: 10,
        first_name: 'Test',
        last_name: 'Coach',
        teams: [],
        notifications: [
          {
            id: 7,
            coach_id: 10,
            kind: 'upcoming_game',
            message: 'Dismissed reminder',
            scheduled_for: '2026-03-27T08:00:00.000Z',
            read_at: null,
            dismissed_at: '2026-03-26T12:30:00.000Z',
            created_at: '2026-03-26T12:00:00.000Z',
            idempotency_key: 'upcoming_game:10:20:21'
          },
          {
            id: 8,
            coach_id: 10,
            kind: 'upcoming_game',
            message: 'Visible reminder',
            scheduled_for: '2026-03-27T07:00:00.000Z',
            read_at: null,
            dismissed_at: null,
            created_at: '2026-03-26T11:00:00.000Z',
            idempotency_key: 'upcoming_game:10:20:22'
          }
        ]
      })
    });

    const response = await request(app).get('/api/v1/coaches/10').expect(200);

    expect(response.body.notifications).toEqual([
      expect.objectContaining({
        idempotency_key: 'upcoming_game:10:20:22'
      })
    ]);
    expect(response.body.unreadNotificationCount).toBe(1);
  });

  it('GET /api/v1/coaches/:id returns notifications newest-first by scheduled_for', async () => {
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        id: 10,
        first_name: 'Test',
        last_name: 'Coach',
        teams: [],
        notifications: [
          {
            id: 7,
            coach_id: 10,
            kind: 'upcoming_game',
            message: 'Older reminder',
            scheduled_for: '2026-03-27T07:00:00.000Z',
            read_at: null,
            dismissed_at: null,
            created_at: '2026-03-26T10:00:00.000Z',
            idempotency_key: 'upcoming_game:10:20:21'
          },
          {
            id: 8,
            coach_id: 10,
            kind: 'upcoming_game',
            message: 'Newer reminder',
            scheduled_for: '2026-03-27T09:00:00.000Z',
            read_at: null,
            dismissed_at: null,
            created_at: '2026-03-26T11:00:00.000Z',
            idempotency_key: 'upcoming_game:10:20:22'
          }
        ]
      })
    });

    const response = await request(app).get('/api/v1/coaches/10').expect(200);

    expect(response.body.notifications.map(notification => notification.idempotency_key)).toEqual([
      'upcoming_game:10:20:22',
      'upcoming_game:10:20:21'
    ]);
  });

  it('GET /api/v1/coaches/:id does not show the same persisted and computed reminder twice when idempotency_key matches', async () => {
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        id: 10,
        first_name: 'Test',
        last_name: 'Coach',
        teams: [
          {
            id: 20,
            name: 'Highlander',
            season: 2026,
            players: [],
            games: [
              {
                id: 21,
                opponent: 'Rivals',
                game_date: '2026-03-28T08:00:00.000Z'
              }
            ]
          }
        ],
        notifications: [
          {
            id: 7,
            coach_id: 10,
            team_id: 20,
            game_id: 21,
            kind: 'upcoming_game',
            message: 'Persisted reminder',
            scheduled_for: '2026-03-28T08:00:00.000Z',
            read_at: null,
            dismissed_at: null,
            created_at: '2026-03-27T12:00:00.000Z',
            idempotency_key: 'upcoming_game:10:20:21'
          }
        ]
      })
    });

    jest.useFakeTimers().setSystemTime(new Date('2026-03-27T12:00:00.000Z'));

    const response = await request(app).get('/api/v1/coaches/10').expect(200);

    expect(response.body.notifications).toHaveLength(1);
    expect(response.body.notifications[0].idempotency_key).toBe('upcoming_game:10:20:21');
    expect(mockNotificationForge).not.toHaveBeenCalled();
  });

  it('GET /api/v1/coaches/:id rejects access to another coach profile', async () => {
    ensureAuthenticated.mockImplementationOnce((req, res, next) => {
      req.authenticatedCoachId = 999;
      req.session.coachId = 999;
      next();
    });

    const response = await request(app).get('/api/v1/coaches/10').expect(403);

    expect(response.body).toEqual({
      error: 'Unauthorized'
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('GET /api/v1/coaches returns only the authenticated coach', async () => {
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        id: 1,
        first_name: 'Test',
        last_name: 'Coach'
      })
    });

    const response = await request(app).get('/api/v1/coaches').expect(200);

    expect(Coach.where).toHaveBeenCalledWith({ id: 1 });
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toBe(1);
  });

  it('GET /api/v1/coaches returns a not-found error payload when the authenticated coach is missing', async () => {
    mockFetch.mockResolvedValue(null);

    const response = await request(app).get('/api/v1/coaches').expect(404);

    expect(response.body).toEqual({
      error: 'Coach not found'
    });
  });

  it('GET /api/v1/coaches returns the generic 500 payload for unexpected errors', async () => {
    mockFetch.mockRejectedValue(new Error('database exploded'));

    const response = await request(app).get('/api/v1/coaches').expect(500);

    expect(response.body).toEqual({
      error: 'Internal server error'
    });
  });

  it('POST /api/v1/coaches rejects missing required fields with a validation error payload', async () => {
    const response = await withTrustedOrigin(request(app)
      .post('/api/v1/coaches'))
      .send({
        email: 'coach@example.com',
        first_name: 'Test',
        last_name: 'Coach'
      })
      .expect(400);

    expect(response.body).toEqual({
      error: 'Sorry your missing password please try again'
    });
    expect(ensureAuthenticated).not.toHaveBeenCalled();
    expect(Coach.hashPassword).not.toHaveBeenCalled();
  });

  it('POST /api/v1/coaches returns a sanitized registration response for saved coach models', async () => {
    const mockSave = jest.fn().mockResolvedValue({
      toJSON: () => ({
        id: 7,
        email: 'coach@example.com',
        first_name: 'Test',
        last_name: 'Coach',
        password: 'hashed-password'
      })
    });
    mockCoachForge.mockReturnValue({
      save: mockSave
    });

    const response = await withTrustedOrigin(request(app)
      .post('/api/v1/coaches'))
      .send({
        email: 'coach@example.com',
        first_name: 'Test',
        last_name: 'Coach',
        password: 'highlander'
      })
      .expect(200);

    expect(Coach.hashPassword).toHaveBeenCalledWith('highlander');
    expect(mockCoachForge).toHaveBeenCalledWith({
      email: 'coach@example.com',
      first_name: 'Test',
      last_name: 'Coach',
      password: 'hashed-password'
    });
    expect(mockSave).toHaveBeenCalled();
    expect(response.body).toEqual({
      id: 7,
      email: 'coach@example.com',
      first_name: 'Test',
      last_name: 'Coach'
    });
    expect(response.body).not.toHaveProperty('password');
    expect(ensureAuthenticated).not.toHaveBeenCalled();
  });

  it('POST /api/v1/coaches returns a sanitized registration response for plain saved coach objects', async () => {
    const mockSave = jest.fn().mockResolvedValue({
      id: 8,
      email: 'plain@example.com',
      first_name: 'Plain',
      last_name: 'Coach',
      password: 'hashed-password'
    });
    mockCoachForge.mockReturnValue({
      save: mockSave
    });

    const response = await withTrustedOrigin(request(app)
      .post('/api/v1/coaches'))
      .send({
        email: 'plain@example.com',
        first_name: 'Plain',
        last_name: 'Coach',
        password: 'highlander'
      })
      .expect(200);

    expect(response.body).toEqual({
      id: 8,
      email: 'plain@example.com',
      first_name: 'Plain',
      last_name: 'Coach'
    });
    expect(response.body).not.toHaveProperty('password');
  });

  it('POST /api/v1/coaches rejects untrusted registration requests without requiring a session', async () => {
    const response = await request(app)
      .post('/api/v1/coaches')
      .set('Origin', 'http://malicious.example')
      .send({
        email: 'coach@example.com',
        first_name: 'Test',
        last_name: 'Coach',
        password: 'highlander'
      })
      .expect(403);

    expect(response.body).toEqual({
      error: 'Invalid request origin'
    });
    expect(ensureAuthenticated).not.toHaveBeenCalled();
    expect(Coach.hashPassword).not.toHaveBeenCalled();
  });

  it('GET /api/v1/coaches still rejects unauthenticated access', async () => {
    ensureAuthenticated.mockImplementationOnce(sendNoSessionError);

    const response = await request(app)
      .get('/api/v1/coaches')
      .expect(403);

    expect(response.body).toEqual({
      error: 'No session available'
    });
    expect(ensureAuthenticated).toHaveBeenCalled();
    expect(Coach.where).not.toHaveBeenCalled();
  });

  it('PUT /api/v1/coaches/:id rejects missing required fields with a validation error payload', async () => {
    const response = await withTrustedOrigin(request(app)
      .put('/api/v1/coaches/1'))
      .send({
        email: 'coach@example.com',
        first_name: 'Test'
      })
      .expect(400);

    expect(response.body).toEqual({
      error: 'Sorry your missing last_name please try again'
    });
    expect(Coach.where).not.toHaveBeenCalled();
  });

  it('GET /api/v1/players returns only players owned by the authenticated coach', async () => {
    mockPlayerFetchAll.mockResolvedValue({
      toJSON: () => ([
        {
          id: 10,
          first_name: 'Owned',
          teams: [
            {
              id: 50,
              coach: [{ id: 1 }]
            }
          ]
        },
        {
          id: 11,
          first_name: 'Other',
          teams: [
            {
              id: 51,
              coach: [{ id: 2 }]
            }
          ]
        }
      ])
    });

    const response = await request(app).get('/api/v1/players').expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toBe(10);
    expect(response.body[0].teams).toBeUndefined();
  });

  it('GET /api/v1/players/:id rejects access to a player outside the authenticated coach', async () => {
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        id: 12,
        teams: [
          {
            id: 51,
            coach: [{ id: 2 }]
          }
        ]
      })
    });

    const response = await request(app).get('/api/v1/players/12').expect(403);

    expect(response.body).toEqual({
      error: 'Unauthorized'
    });
  });

  it('GET /api/v1/players/:id/stats rejects access to player stats outside the authenticated coach', async () => {
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        id: 13,
        teams: [
          {
            id: 51,
            coach: [{ id: 2 }]
          }
        ],
        stats: []
      })
    });

    const response = await request(app).get('/api/v1/players/13/stats').expect(403);

    expect(response.body).toEqual({
      error: 'Unauthorized'
    });
  });

  it('GET /api/v1/teams/:id/coaches returns sanitized collaborators for a team member', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 9,
        coach: [
          { id: 1, email: 'owner@example.com', first_name: 'Owner', last_name: 'Coach', _pivot_role: 'owner' },
          { id: 2, email: 'assistant@example.com', first_name: 'Assist', last_name: 'Coach', _pivot_role: 'assistant' }
        ]
      })
    });

    const response = await request(app).get('/api/v1/teams/9/coaches').expect(200);

    expect(response.body).toEqual([
      { id: 1, email: 'owner@example.com', first_name: 'Owner', last_name: 'Coach', role: 'owner' },
      { id: 2, email: 'assistant@example.com', first_name: 'Assist', last_name: 'Coach', role: 'assistant' }
    ]);
  });

  it('GET /api/v1/teams/:id/coaches returns sanitized collaborators for a team member', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 9,
        coach: [
          { id: 1, email: 'owner@example.com', first_name: 'Owner', last_name: 'Coach', _pivot_role: 'owner' },
          { id: 2, email: 'assistant@example.com', first_name: 'Assist', last_name: 'Coach', _pivot_role: 'assistant' }
        ]
      })
    });

    const response = await request(app).get('/api/v1/teams/9/coaches').expect(200);

    expect(response.body).toEqual([
      { id: 1, email: 'owner@example.com', first_name: 'Owner', last_name: 'Coach', role: 'owner' },
      { id: 2, email: 'assistant@example.com', first_name: 'Assist', last_name: 'Coach', role: 'assistant' }
    ]);
  });

  it('GET /api/v1/teams/:id/coaches surfaces role metadata from fetched relation payloads', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 9,
        coach: [
          { id: 1, email: 'owner@example.com', first_name: 'Owner', last_name: 'Coach', _pivot_role: 'owner' },
          { id: 2, email: 'assistant@example.com', first_name: 'Assist', last_name: 'Coach', role: 'assistant' }
        ]
      })
    });

    const response = await request(app).get('/api/v1/teams/9/coaches').expect(200);

    expect(response.body[0].role).toBe('owner');
    expect(response.body[1].role).toBe('assistant');
  });

  it('GET /api/v1/teams/:id/coaches rejects coaches outside the team', async () => {
    ensureAuthenticated.mockImplementationOnce((req, res, next) => {
      req.authenticatedCoachId = 99;
      req.session.coachId = 99;
      next();
    });
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 9,
        coach: [
          { id: 1, _pivot_role: 'owner' }
        ]
      })
    });

    const response = await request(app).get('/api/v1/teams/9/coaches').expect(403);

    expect(response.body).toEqual({
      error: 'Unauthorized'
    });
  });

  it('GET /api/v1/teams/:id/coaches rejects unauthenticated access', async () => {
    ensureAuthenticated.mockImplementationOnce(sendNoSessionError);

    const response = await request(app).get('/api/v1/teams/9/coaches').expect(403);

    expect(response.body).toEqual({
      error: 'No session available'
    });
    expect(mockTeamFetch).not.toHaveBeenCalled();
  });

  it('POST /api/v1/teams/:id/coaches lets an owner add a collaborator with a role', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 9,
        coach: [
          { id: 1, email: 'owner@example.com', first_name: 'Owner', last_name: 'Coach', _pivot_role: 'owner' }
        ]
      }),
      coach: () => ({
        attach: mockTeamCoachAttach,
        updatePivot: mockTeamCoachUpdatePivot
      })
    });
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        id: 2,
        email: 'assistant@example.com',
        first_name: 'Assist',
        last_name: 'Coach'
      })
    });

    const response = await withTrustedOrigin(request(app)
      .post('/api/v1/teams/9/coaches'))
      .send({
        coachId: 2,
        role: 'assistant'
      })
      .expect(201);

    expect(mockTeamCoachAttach).toHaveBeenCalledWith({
      coach_id: 2,
      role: 'assistant'
    });
    expect(mockTeamCoachUpdatePivot).not.toHaveBeenCalled();
    expect(response.body).toEqual({
      id: 2,
      email: 'assistant@example.com',
      first_name: 'Assist',
      last_name: 'Coach',
      role: 'assistant'
    });
  });

  it('POST /api/v1/teams/:id/coaches should write the role during the initial attach and not require updatePivot', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 9,
        coach: [
          { id: 1, email: 'owner@example.com', first_name: 'Owner', last_name: 'Coach', _pivot_role: 'owner' }
        ]
      }),
      coach: () => ({
        attach: mockTeamCoachAttach,
        updatePivot: mockTeamCoachUpdatePivot
      })
    });
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        id: 2,
        email: 'assistant@example.com',
        first_name: 'Assist',
        last_name: 'Coach'
      })
    });

    await withTrustedOrigin(request(app)
      .post('/api/v1/teams/9/coaches'))
      .send({
        coachId: 2,
        role: 'assistant'
      })
      .expect(201);

    expect(mockTeamCoachAttach).toHaveBeenCalledWith({
      coach_id: 2,
      role: 'assistant'
    });
    expect(mockTeamCoachUpdatePivot).not.toHaveBeenCalled();
  });

  it('POST /api/v1/teams/:id/coaches rejects duplicate collaborators', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 9,
        coach: [
          { id: 1, _pivot_role: 'owner' },
          { id: 2, _pivot_role: 'assistant' }
        ]
      }),
      coach: () => ({
        attach: mockTeamCoachAttach,
        updatePivot: mockTeamCoachUpdatePivot
      })
    });

    const response = await withTrustedOrigin(request(app)
      .post('/api/v1/teams/9/coaches'))
      .send({
        coachId: 2,
        role: 'assistant'
      })
      .expect(400);

    expect(response.body).toEqual({
      error: 'Sorry this coach is already assigned to the team'
    });
    expect(mockTeamCoachAttach).not.toHaveBeenCalled();
  });

  it('POST /api/v1/teams/:id/coaches rejects nonexistent coach ids', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 9,
        coach: [
          { id: 1, _pivot_role: 'owner' }
        ]
      }),
      coach: () => ({
        attach: mockTeamCoachAttach,
        updatePivot: mockTeamCoachUpdatePivot
      })
    });
    mockFetch.mockResolvedValue(null);

    const response = await withTrustedOrigin(request(app)
      .post('/api/v1/teams/9/coaches'))
      .send({
        coachId: 99,
        role: 'assistant'
      })
      .expect(400);

    expect(response.body).toEqual({
      error: 'Sorry your coachId is invalid please try again'
    });
    expect(mockTeamCoachAttach).not.toHaveBeenCalled();
  });

  it('POST /api/v1/teams/:id/coaches rejects non-owner collaborators', async () => {
    ensureAuthenticated.mockImplementationOnce((req, res, next) => {
      req.authenticatedCoachId = 2;
      req.session.coachId = 2;
      next();
    });
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 9,
        coach: [
          { id: 1, _pivot_role: 'owner' },
          { id: 2, _pivot_role: 'assistant' }
        ]
      }),
      coach: () => ({
        attach: mockTeamCoachAttach,
        updatePivot: mockTeamCoachUpdatePivot
      })
    });

    const response = await withTrustedOrigin(request(app)
      .post('/api/v1/teams/9/coaches'))
      .send({
        coachId: 3,
        role: 'assistant'
      })
      .expect(403);

    expect(response.body).toEqual({
      error: 'Unauthorized'
    });
    expect(mockTeamCoachAttach).not.toHaveBeenCalled();
  });

  it('POST /api/v1/teams/:id/coaches rejects invalid roles', async () => {
    const response = await withTrustedOrigin(request(app)
      .post('/api/v1/teams/9/coaches'))
      .send({
        coachId: 2,
        role: 'manager'
      })
      .expect(400);

    expect(response.body).toEqual({
      error: 'Sorry your role is invalid please try again'
    });
  });

  it('POST /api/v1/teams/:id/coaches rejects unauthenticated access', async () => {
    ensureAuthenticated.mockImplementationOnce(sendNoSessionError);

    const response = await withTrustedOrigin(request(app)
      .post('/api/v1/teams/9/coaches'))
      .send({
        coachId: 2,
        role: 'assistant'
      })
      .expect(403);

    expect(response.body).toEqual({
      error: 'No session available'
    });
    expect(mockTeamFetch).not.toHaveBeenCalled();
    expect(mockTeamCoachAttach).not.toHaveBeenCalled();
  });

  it('PUT /api/v1/teams/:id/coaches/:coachId lets an owner update a collaborator role', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 9,
        coach: [
          { id: 1, email: 'owner@example.com', first_name: 'Owner', last_name: 'Coach', _pivot_role: 'owner' },
          { id: 2, email: 'assistant@example.com', first_name: 'Assist', last_name: 'Coach', _pivot_role: 'assistant' }
        ]
      }),
      coach: () => ({
        updatePivot: mockTeamCoachUpdatePivot
      })
    });

    const response = await withTrustedOrigin(request(app)
      .put('/api/v1/teams/9/coaches/2'))
      .send({
        role: 'owner'
      })
      .expect(200);

    expect(mockTeamCoachUpdatePivot).toHaveBeenCalledWith(
      { role: 'owner' },
      { query: { coach_id: 2 }, require: true }
    );
    expect(response.body).toEqual({
      id: 2,
      email: 'assistant@example.com',
      first_name: 'Assist',
      last_name: 'Coach',
      role: 'owner'
    });
  });

  it('PUT /api/v1/teams/:id/coaches/:coachId rejects non-owner collaborators', async () => {
    ensureAuthenticated.mockImplementationOnce((req, res, next) => {
      req.authenticatedCoachId = 2;
      req.session.coachId = 2;
      next();
    });
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 9,
        coach: [
          { id: 1, _pivot_role: 'owner' },
          { id: 2, _pivot_role: 'assistant' }
        ]
      }),
      coach: () => ({
        updatePivot: mockTeamCoachUpdatePivot
      })
    });

    const response = await withTrustedOrigin(request(app)
      .put('/api/v1/teams/9/coaches/1'))
      .send({
        role: 'assistant'
      })
      .expect(403);

    expect(response.body).toEqual({
      error: 'Unauthorized'
    });
    expect(mockTeamCoachUpdatePivot).not.toHaveBeenCalled();
  });

  it('PUT /api/v1/teams/:id/coaches/:coachId rejects invalid coach ids', async () => {
    const response = await withTrustedOrigin(request(app)
      .put('/api/v1/teams/9/coaches/not-a-number'))
      .send({
        role: 'assistant'
      })
      .expect(400);

    expect(response.body).toEqual({
      error: 'Sorry your coachId is invalid please try again'
    });
  });

  it('PUT /api/v1/teams/:id/coaches/:coachId rejects nonexistent target coach ids', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 9,
        coach: [
          { id: 1, _pivot_role: 'owner' },
          { id: 2, _pivot_role: 'assistant' }
        ]
      }),
      coach: () => ({
        updatePivot: mockTeamCoachUpdatePivot
      })
    });

    const response = await withTrustedOrigin(request(app)
      .put('/api/v1/teams/9/coaches/99'))
      .send({
        role: 'assistant'
      })
      .expect(400);

    expect(response.body).toEqual({
      error: 'Sorry your coachId is invalid please try again'
    });
    expect(mockTeamCoachUpdatePivot).not.toHaveBeenCalled();
  });

  it('PUT /api/v1/teams/:id/coaches/:coachId rejects missing roles', async () => {
    const response = await withTrustedOrigin(request(app)
      .put('/api/v1/teams/9/coaches/2'))
      .send({})
      .expect(400);

    expect(response.body).toEqual({
      error: 'Sorry your missing role please try again'
    });
  });

  it('PUT /api/v1/teams/:id/coaches/:coachId rejects unauthenticated access', async () => {
    ensureAuthenticated.mockImplementationOnce(sendNoSessionError);

    const response = await withTrustedOrigin(request(app)
      .put('/api/v1/teams/9/coaches/2'))
      .send({
        role: 'assistant'
      })
      .expect(403);

    expect(response.body).toEqual({
      error: 'No session available'
    });
    expect(mockTeamFetch).not.toHaveBeenCalled();
    expect(mockTeamCoachUpdatePivot).not.toHaveBeenCalled();
  });

  it('DELETE /api/v1/teams/:id/coaches/:coachId rejects removing the last owner', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 9,
        coach: [
          { id: 1, _pivot_role: 'owner' },
          { id: 2, _pivot_role: 'assistant' }
        ]
      }),
      coach: () => ({
        detach: mockTeamCoachDetach
      })
    });

    const response = await withTrustedOrigin(request(app)
      .delete('/api/v1/teams/9/coaches/1'))
      .expect(400);

    expect(response.body).toEqual({
      error: 'Sorry this coach cannot be removed from the team'
    });
    expect(mockTeamCoachDetach).not.toHaveBeenCalled();
  });

  it('DELETE /api/v1/teams/:id/coaches/:coachId lets an owner remove a non-owner collaborator', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 9,
        coach: [
          { id: 1, _pivot_role: 'owner' },
          { id: 2, _pivot_role: 'assistant' }
        ]
      }),
      coach: () => ({
        detach: mockTeamCoachDetach
      })
    });

    await withTrustedOrigin(request(app)
      .delete('/api/v1/teams/9/coaches/2'))
      .expect(204);

    expect(mockTeamCoachDetach).toHaveBeenCalledWith([2]);
  });

  it('DELETE /api/v1/teams/:id/coaches/:coachId rejects non-owner collaborators', async () => {
    ensureAuthenticated.mockImplementationOnce((req, res, next) => {
      req.authenticatedCoachId = 2;
      req.session.coachId = 2;
      next();
    });
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 9,
        coach: [
          { id: 1, _pivot_role: 'owner' },
          { id: 2, _pivot_role: 'assistant' }
        ]
      }),
      coach: () => ({
        detach: mockTeamCoachDetach
      })
    });

    const response = await withTrustedOrigin(request(app)
      .delete('/api/v1/teams/9/coaches/1'))
      .expect(403);

    expect(response.body).toEqual({
      error: 'Unauthorized'
    });
    expect(mockTeamCoachDetach).not.toHaveBeenCalled();
  });

  it('DELETE /api/v1/teams/:id/coaches/:coachId rejects invalid collaborator ids', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 9,
        coach: [
          { id: 1, _pivot_role: 'owner' },
          { id: 2, _pivot_role: 'assistant' }
        ]
      }),
      coach: () => ({
        detach: mockTeamCoachDetach
      })
    });

    const response = await withTrustedOrigin(request(app)
      .delete('/api/v1/teams/9/coaches/99'))
      .expect(400);

    expect(response.body).toEqual({
      error: 'Sorry your coachId is invalid please try again'
    });
    expect(mockTeamCoachDetach).not.toHaveBeenCalled();
  });

  it('DELETE /api/v1/teams/:id/coaches/:coachId rejects non-numeric target coach ids explicitly', async () => {
    const response = await withTrustedOrigin(request(app)
      .delete('/api/v1/teams/9/coaches/not-a-number'))
      .expect(400);

    expect(response.body).toEqual({
      error: 'Sorry your coachId is invalid please try again'
    });
    expect(mockTeamCoachDetach).not.toHaveBeenCalled();
  });

  it('DELETE /api/v1/teams/:id/coaches/:coachId rejects unauthenticated access', async () => {
    ensureAuthenticated.mockImplementationOnce(sendNoSessionError);

    const response = await withTrustedOrigin(request(app)
      .delete('/api/v1/teams/9/coaches/2'))
      .expect(403);

    expect(response.body).toEqual({
      error: 'No session available'
    });
    expect(mockTeamFetch).not.toHaveBeenCalled();
    expect(mockTeamCoachDetach).not.toHaveBeenCalled();
  });

  it('POST /api/v1/teams/:id/coaches fails if the initial relation attach does not include the required role', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 9,
        coach: [
          { id: 1, email: 'owner@example.com', first_name: 'Owner', last_name: 'Coach', _pivot_role: 'owner' }
        ]
      }),
      coach: () => ({
        attach: mockTeamCoachAttach,
        updatePivot: mockTeamCoachUpdatePivot
      })
    });
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        id: 2,
        email: 'assistant@example.com',
        first_name: 'Assist',
        last_name: 'Coach'
      })
    });
    mockTeamCoachAttach.mockImplementation(payload => {
      if (!payload || payload.coach_id !== 2 || payload.role !== 'assistant') {
        return Promise.reject(new Error('role required on attach'));
      }
      return Promise.resolve();
    });

    const response = await withTrustedOrigin(request(app)
      .post('/api/v1/teams/9/coaches'))
      .send({
        coachId: 2,
        role: 'assistant'
      })
      .expect(201);

    expect(response.body).toEqual({
      id: 2,
      email: 'assistant@example.com',
      first_name: 'Assist',
      last_name: 'Coach',
      role: 'assistant'
    });
    expect(mockTeamCoachUpdatePivot).not.toHaveBeenCalled();
  });

  it('POST /api/v1/sessions/login rejects requests from an untrusted origin', async () => {
    const response = await request(app)
      .post('/api/v1/sessions/login')
      .set('Origin', 'http://malicious.example')
      .send({
        email: 'coach@example.com',
        pwd: 'secret'
      })
      .expect(403);

    expect(response.body).toEqual({
      error: 'Invalid request origin'
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('POST /api/v1/sessions/login rejects requests from an untrusted origin', async () => {
    const response = await request(app)
      .post('/api/v1/sessions/login')
      .set('Origin', 'http://malicious.example')
      .send({
        email: 'coach@example.com',
        pwd: 'secret'
      })
      .expect(403);

    expect(response.body).toEqual({
      error: 'Invalid request origin'
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('GET /api/v1/sessions returns the current authenticated coach bootstrap payload', async () => {
    mockFetch.mockResolvedValue({
      id: 10,
      email: 'coach@example.com',
      first_name: 'Test',
      last_name: 'Coach',
      password: 'should-not-not-be-returned'
    });

    const response = await request(app)
      .get('/api/v1/sessions')
      .expect(200);

    expect(Coach.where).toHaveBeenCalledWith({ id: 1 });
    expect(response.body).toEqual({
      id: 10,
      email: 'coach@example.com',
      first_name: 'Test',
      last_name: 'Coach'
    });
    expect(response.body.password).toBeUndefined();
  });

  it('GET /api/v1/sessions returns the current authenticated coach bootstrap payload', async () => {
    mockFetch.mockResolvedValue({
      id: 10,
      email: 'coach@example.com',
      first_name: 'Test',
      last_name: 'Coach',
      password: 'should-not-not-be-returned'
    });

    const response = await request(app)
      .get('/api/v1/sessions')
      .expect(200);

    expect(Coach.where).toHaveBeenCalledWith({ id: 1 });
    expect(response.body).toEqual({
      id: 10,
      email: 'coach@example.com',
      first_name: 'Test',
      last_name: 'Coach'
    });
    expect(response.body.password).toBeUndefined();
  });

  it('GET /api/v1/sessions rejects missing middleware sessions with a standardized error payload', async () => {
    ensureAuthenticated.mockImplementationOnce(sendNoSessionError);

    const response = await request(app)
      .get('/api/v1/sessions')
      .expect(403);

    expect(response.body).toEqual({
      error: 'No session available'
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('GET /api/v1/sessions returns 401 when the session coach record no longer exists', async () => {
    mockFetch.mockResolvedValue(null);

    const response = await request(app)
      .get('/api/v1/sessions')
      .expect(401);

    expect(response.body).toEqual({
      error: 'Authentication required'
    });
  });

  it('GET /api/v1/sessions destroys a stale invalid session before returning 401', async () => {
    const destroy = jest.fn((callback) => callback());

    ensureAuthenticated.mockImplementationOnce((req, res, next) => {
      req.session.coachId = 10;
      req.session.destroy = destroy;
      next();
    });
    mockFetch.mockResolvedValue(null);

    const response = await request(app)
      .get('/api/v1/sessions')
      .expect(401);

    expect(destroy).toHaveBeenCalled();
    expect(response.body).toEqual({
      error: 'Authentication required'
    });
  });

  it('POST /api/v1/sessions/login rejects missing credentials with a validation error payload', async () => {
    const response = await withTrustedOrigin(request(app)
      .post('/api/v1/sessions/login'))
      .send({
        email: 'coach@example.com'
      })
      .expect(400);

    expect(response.body).toEqual({
      error: 'Email and password are required'
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('POST /api/v1/sessions/login rejects invalid credentials with an authentication error payload', async () => {
    mockFetch.mockResolvedValue(null);

    const response = await withTrustedOrigin(request(app)
      .post('/api/v1/sessions/login'))
      .send({
        email: 'missing-coach@example.com',
        pwd: 'wrong-password'
      })
      .expect(401);

    expect(response.body).toEqual({
      error: 'Invalid credentials'
    });
    expect(Coach.validatePassword).not.toHaveBeenCalled();
  });

  it('POST /api/v1/sessions/login rate limits repeated invalid credentials', async () => {
    Coach.validatePassword.mockResolvedValue(false);
    mockFetch.mockResolvedValue({
      id: 1,
      get: jest.fn(() => 'hashed-password')
    });

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await withTrustedOrigin(request(app)
        .post('/api/v1/sessions/login'))
        .send({
          email: 'coach@example.com',
          pwd: 'wrong-password'
        })
        .expect(401);
    }

    const response = await withTrustedOrigin(request(app)
      .post('/api/v1/sessions/login'))
      .send({
        email: 'coach@example.com',
        pwd: 'wrong-password'
      })
      .expect(429);

    expect(response.body).toEqual({
      error: 'Too many login attempts, please try again later'
    });
  });

  it('GET /api/v1/coaches/:id returns null derived stats when denominators are missing or zero', async () => {
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        id: 11,
        first_name: 'Test',
        last_name: 'Coach',
        teams: [
          {
            id: 21,
            name: 'Highlander',
            players: [
              {
                id: 31,
                first_name: 'Pitcher',
                stats: [
                  { description: 'Hits', _pivot_how_many: 4 },
                  { description: 'At Bats', _pivot_how_many: 0 },
                  { description: 'Home Runs', _pivot_how_many: 1 },
                  { description: 'Earned Runs', _pivot_how_many: 2 }
                ]
              }
            ]
          }
        ]
      })
    });

    const response = await request(app).get('/api/v1/coaches/11').expect(200);
    const player = response.body.teams[0].players[0];

    expect(player.derivedStats).toEqual({
      battingAverage: null,
      homeRunRate: null,
      era: null,
      strikeoutsPerInning: null
    });
  });

  it('GET /api/v1/coaches/:id returns null derived stats when denominators are missing or zero', async () => {
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        id: 11,
        first_name: 'No',
        last_name: 'Denominator',
        teams: [
          {
            id: 21,
            name: 'Highlander',
            players: [
              {
                id: 31,
                first_name: 'Utility',
                stats: [
                  { description: 'Hits', _pivot_how_many: 0, _pivot_game_id: 100 },
                  { description: 'At Bats', _pivot_how_many: 0, _pivot_game_id: 100 },
                  { description: 'Home Runs', _pivot_how_many: 0, _pivot_game_id: 100 },
                  { description: 'Earned Runs', _pivot_how_many: 0, _pivot_game_id: 100 },
                  { description: 'Innings Pitched', _pivot_how_many: 0, _pivot_game_id: 100 },
                  { description: 'Strikeouts', _pivot_how_many: 0, _pivot_game_id: 100 }
                ]
              }
            ]
          }
        ]
      })
    });

    const response = await request(app).get('/api/v1/coaches/11').expect(200);
    const player = response.body.teams[0].players[0];

    expect(player.derivedStats).toEqual({
      battingAverage: null,
      homeRunRate: null,
      era: null,
      strikeoutsPerInning: null
    });
  });

  it('GET /api/v1/coaches/:id defaults to the latest available season and returns season metadata', async () => {
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        id: 12,
        first_name: 'Test',
        last_name: 'Coach',
        teams: [
          {
            id: 22,
            name: 'Highlander',
            season: 2025,
            players: [
              {
                id: 32,
                first_name: 'Veteran',
                stats: [
                  { description: 'Hits', _pivot_how_many: 2, _pivot_game_date: '2025-04-10T00:00:00Z', _pivot_game_id: 201 },
                  { description: 'At Bats', _pivot_how_many: 4, _pivot_game_date: '2025-04-10T00:00:00Z', _pivot_game_id: 201 }
                ]
              }
            ]
          },
          {
            id: 23,
            name: 'Highlander',
            season: 2026,
            players: [
              {
                id: 33,
                first_name: 'Rookie',
                stats: [
                  { description: 'Hits', _pivot_how_many: 3, _pivot_game_date: '2026-05-10T00:00:00Z', _pivot_game_id: 202 },
                  { description: 'At Bats', _pivot_how_many: 6, _pivot_game_date: '2026-05-10T00:00:00Z', _pivot_game_id: 202 },
                  { description: 'Hits', _pivot_how_many: 9, _pivot_game_date: '2025-05-10T00:00:00Z', _pivot_game_id: 203 },
                  { description: 'At Bats', _pivot_how_many: 9, _pivot_game_date: '2025-05-10T00:00:00Z', _pivot_game_id: 203 }
                ]
              }
            ]
          }
        ]
      })
    });

    const response = await request(app).get('/api/v1/coaches/12').expect(200);

    expect(response.body.availableSeasons).toEqual([2026, 2025]);
    expect(response.body.activeSeason).toBe(2026);
    expect(response.body.teams).toHaveLength(1);
    expect(response.body.teams[0].season).toBe(2026);
    expect(response.body.teams[0].players[0].stats).toEqual([
      { description: 'Hits', _pivot_how_many: 3, _pivot_game_date: '2026-05-10T00:00:00Z', _pivot_game_id: 202 },
      { description: 'At Bats', _pivot_how_many: 6, _pivot_game_date: '2026-05-10T00:00:00Z', _pivot_game_id: 202 }
    ]);
    expect(response.body.teams[0].players[0].derivedStats).toEqual({
      battingAverage: 0.5,
      homeRunRate: null,
      era: null,
      strikeoutsPerInning: null
    });
  });

  it('GET /api/v1/coaches/:id filters teams and stats to the requested season', async () => {
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        id: 13,
        first_name: 'Test',
        last_name: 'Coach',
        teams: [
          {
            id: 24,
            name: 'Highlander',
            season: 2025,
            players: [
              {
                id: 34,
                first_name: 'Slugger',
                stats: [
                  { description: 'Hits', _pivot_how_many: 4, _pivot_game_date: '2025-06-10T00:00:00Z' },
                  { description: 'At Bats', _pivot_how_many: 8, _pivot_game_date: '2025-06-10T00:00:00Z' },
                  { description: 'Home Runs', _pivot_how_many: 2, _pivot_game_date: '2025-06-10T00:00:00Z' }
                ]
              }
            ]
          },
          {
            id: 25,
            name: 'Highlander',
            season: 2026,
            players: [
              {
                id: 35,
                first_name: 'Ace',
                stats: [
                  { description: 'Strikeouts', _pivot_how_many: 6, _pivot_game_date: '2026-06-10T00:00:00Z' },
                  { description: 'Innings Pitched', _pivot_how_many: 3, _pivot_game_date: '2026-06-10T00:00:00Z' }
                ]
              }
            ]
          }
        ]
      })
    });

    const response = await request(app).get('/api/v1/coaches/13?season=2025').expect(200);

    expect(response.body.availableSeasons).toEqual([2026, 2025]);
    expect(response.body.activeSeason).toBe(2025);
    expect(response.body.teams).toHaveLength(1);
    expect(response.body.teams[0].id).toBe(24);
    expect(response.body.teams[0].players[0].derivedStats).toEqual({
      battingAverage: 0.5,
      homeRunRate: 0.25,
      era: null,
      strikeoutsPerInning: null
    });
  });

  it('GET /api/v1/coaches/:id filters teams by teamSearch', async () => {
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        id: 130,
        first_name: 'Test',
        last_name: 'Coach',
        teams: [
          {
            id: 240,
            name: 'Highlander',
            season: 2026,
            players: []
          },
          {
            id: 241,
            name: 'Warriors',
            season: 2026,
            players: []
          }
        ]
      })
    });

    const response = await request(app).get('/api/v1/coaches/130?teamSearch=war').expect(200);

    expect(response.body.availableSeasons).toEqual([2026]);
    expect(response.body.activeSeason).toBe(2026);
    expect(response.body.teams).toHaveLength(1);
    expect(response.body.teams[0].id).toBe(241);
  });

  it('GET /api/v1/coaches/:id filters players by playerSearch across filtered teams', async () => {
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        id: 131,
        first_name: 'Test',
        last_name: 'Coach',
        teams: [
          {
            id: 242,
            name: 'Highlander',
            season: 2026,
            players: [
              {
                id: 340,
                first_name: 'Slugger',
                last_name: 'One',
                email: 'slugger@example.com',
                position: 'Outfield',
                stats: [
                  { description: 'Hits', _pivot_how_many: 3, _pivot_game_date: '2026-06-10T00:00:00Z' },
                  { description: 'At Bats', _pivot_how_many: 6, _pivot_game_date: '2026-06-10T00:00:00Z' }
                ]
              },
              {
                id: 341,
                first_name: 'Ace',
                last_name: 'Two',
                email: 'ace@example.com',
                position: 'Pitcher',
                stats: [
                  { description: 'Strikeouts', _pivot_how_many: 4, _pivot_game_date: '2026-06-10T00:00:00Z' },
                  { description: 'Innings Pitched', _pivot_how_many: 2, _pivot_game_date: '2026-06-10T00:00:00Z' }
                ]
              }
            ]
          }
        ]
      })
    });

    const response = await request(app).get('/api/v1/coaches/131?playerSearch=slug').expect(200);

    expect(response.body.teams).toHaveLength(1);
    expect(response.body.teams[0].players).toHaveLength(1);
    expect(response.body.teams[0].players[0].id).toBe(340);
    expect(response.body.teams[0].players[0].derivedStats).toEqual({
      battingAverage: 0.5,
      homeRunRate: null,
      era: null,
      strikeoutsPerInning: null
    });
  });

  it('GET /api/v1/coaches/:id filters players by position across filtered teams', async () => {
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        id: 132,
        first_name: 'Test',
        last_name: 'Coach',
        teams: [
          {
            id: 243,
            name: 'Highlander',
            season: 2026,
            players: [
              {
                id: 342,
                first_name: 'Ace',
                last_name: 'Pitcher',
                email: 'ace@example.com',
                position: 'Pitcher',
                stats: [
                  { description: 'Strikeouts', _pivot_how_many: 6, _pivot_game_date: '2026-06-10T00:00:00Z' },
                  { description: 'Innings Pitched', _pivot_how_many: 3, _pivot_game_date: '2026-06-10T00:00:00Z' }
                ]
              },
              {
                id: 343,
                first_name: 'Slugger',
                last_name: 'Batter',
                email: 'slugger@example.com',
                position: 'Outfield',
                stats: [
                  { description: 'Hits', _pivot_how_many: 2, _pivot_game_date: '2026-06-10T00:00:00Z' },
                  { description: 'At Bats', _pivot_how_many: 4, _pivot_game_date: '2026-06-10T00:00:00Z' }
                ]
              }
            ]
          }
        ]
      })
    });

    const response = await request(app).get('/api/v1/coaches/132?position=pitch').expect(200);

    expect(response.body.teams).toHaveLength(1);
    expect(response.body.teams[0].players).toHaveLength(1);
    expect(response.body.teams[0].players[0].id).toBe(342);
    expect(response.body.teams[0].players[0].derivedStats).toEqual({
      battingAverage: null,
      homeRunRate: null,
      era: null,
      strikeoutsPerInning: 2
    });
  });

  it('GET /api/v1/coaches/:id returns 200 with empty players for a valid no-match player filter', async () => {
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        id: 133,
        first_name: 'Test',
        last_name: 'Coach',
        teams: [
          {
            id: 244,
            name: 'Highlander',
            season: 2026,
            players: [
              {
                id: 344,
                first_name: 'Ace',
                last_name: 'Pitcher',
                email: 'ace@example.com',
                position: 'Pitcher',
                stats: [
                  { description: 'Strikeouts', _pivot_how_many: 4, _pivot_game_date: '2026-06-10T00:00:00Z' },
                  { description: 'Innings Pitched', _pivot_how_many: 2, _pivot_game_date: '2026-06-10T00:00:00Z' }
                ]
              }
            ]
          }
        ]
      })
    });

    const response = await request(app).get('/api/v1/coaches/133?playerSearch=nomatch').expect(200);

    expect(response.body.availableSeasons).toEqual([2026]);
    expect(response.body.activeSeason).toBe(2026);
    expect(response.body.teams).toHaveLength(1);
    expect(response.body.teams[0].players).toEqual([]);
  });

  it('GET /api/v1/coaches/:id applies combined season and teamSearch filters', async () => {
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        id: 134,
        first_name: 'Test',
        last_name: 'Coach',
        teams: [
          {
            id: 245,
            name: 'Warriors',
            season: 2025,
            players: []
          },
          {
            id: 246,
            name: 'Warriors',
            season: 2026,
            players: []
          },
          {
            id: 247,
            name: 'Highlander',
            season: 2025,
            players: []
          }
        ]
      })
    });

    const response = await request(app).get('/api/v1/coaches/134?season=2025&teamSearch=war').expect(200);

    expect(response.body.availableSeasons).toEqual([2026, 2025]);
    expect(response.body.activeSeason).toBe(2025);
    expect(response.body.teams).toHaveLength(1);
    expect(response.body.teams[0].id).toBe(245);
  });

  it('GET /api/v1/coaches/:id applies combined season and playerSearch filters', async () => {
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        id: 135,
        first_name: 'Test',
        last_name: 'Coach',
        teams: [
          {
            id: 248,
            name: 'Highlander',
            season: 2025,
            players: [
              {
                id: 345,
                first_name: 'Slugger',
                last_name: 'One',
                email: 'slugger@example.com',
                position: 'Outfield',
                stats: [
                  { description: 'Hits', _pivot_how_many: 3, _pivot_game_date: '2025-06-10T00:00:00Z' },
                  { description: 'At Bats', _pivot_how_many: 6, _pivot_game_date: '2025-06-10T00:00:00Z' }
                ]
              }
            ]
          },
          {
            id: 249,
            name: 'Highlander',
            season: 2026,
            players: [
              {
                id: 346,
                first_name: 'Slugger',
                last_name: 'Two',
                email: 'slugger2@example.com',
                position: 'Outfield',
                stats: [
                  { description: 'Hits', _pivot_how_many: 9, _pivot_game_date: '2026-06-10T00:00:00Z' },
                  { description: 'At Bats', _pivot_how_many: 10, _pivot_game_date: '2026-06-10T00:00:00Z' }
                ]
              }
            ]
          }
        ]
      })
    });

    const response = await request(app).get('/api/v1/coaches/135?season=2025&playerSearch=slug').expect(200);

    expect(response.body.availableSeasons).toEqual([2026, 2025]);
    expect(response.body.activeSeason).toBe(2025);
    expect(response.body.teams).toHaveLength(1);
    expect(response.body.teams[0].id).toBe(248);
    expect(response.body.teams[0].players).toHaveLength(1);
    expect(response.body.teams[0].players[0].id).toBe(345);
  });

  it('GET /api/v1/coaches/:id uses default dashboard pagination values', async () => {
    const teams = Array.from({ length: 11 }, (_, index) => ({
      id: 400 + index,
      name: `Team ${index + 1}`,
      season: 2026,
      players: [
        {
          id: 500 + index,
          first_name: `Player${index + 1}`,
          last_name: 'Default',
          email: `player${index + 1}@example.com`,
          position: 'Pitcher',
          stats: []
        }
      ]
    }));

    mockFetch.mockResolvedValue({
      toJSON: () => ({
        id: 141,
        first_name: 'Test',
        last_name: 'Coach',
        teams: teams
      })
    });

    const response = await request(app)
      .get('/api/v1/coaches/141')
      .expect(200);

    expect(response.body.teams).toHaveLength(10);
    expect(response.body.teams[0].id).toBe(400);
    expect(response.body.teams[9].id).toBe(409);
    expect(response.body.teamPagination).toEqual({
      page: 1,
      limit: 10,
      totalItems: 11,
      totalPages: 2,
      hasPreviousPage: false,
      hasNextPage: true
    });
    expect(response.body.playerPagination).toEqual({
      page: 1,
      limit: 10,
      totalItems: 11,
      totalPages: 2,
      hasPreviousPage: false,
      hasNextPage: true
    });
    expect(response.body.notificationPagination).toEqual({
      page: 1,
      limit: 10,
      totalItems: 0,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false
    });
  });

  it('GET /api/v1/coaches/:id paginates dashboard teams and players independently', async () => {
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        id: 137,
        first_name: 'Test',
        last_name: 'Coach',
        teams: [
          {
            id: 251,
            name: 'Highlander',
            season: 2026,
            players: [
              {
                id: 347,
                first_name: 'First',
                last_name: 'Player',
                email: 'first@example.com',
                position: 'Outfield',
                stats: []
              },
              {
                id: 348,
                first_name: 'Second',
                last_name: 'Player',
                email: 'second@example.com',
                position: 'Catcher',
                stats: []
              }
            ]
          },
          {
            id: 252,
            name: 'Warriors',
            season: 2026,
            players: [
              {
                id: 349,
                first_name: 'Third',
                last_name: 'Player',
                email: 'third@example.com',
                position: 'Pitcher',
                stats: []
              }
            ]
          },
          {
            id: 253,
            name: 'Rangers',
            season: 2026,
            players: [
              {
                id: 350,
                first_name: 'Fourth',
                last_name: 'Player',
                email: 'fourth@example.com',
                position: 'Infield',
                stats: []
              }
            ]
          }
        ]
      })
    });

    const response = await request(app)
      .get('/api/v1/coaches/137?teamPage=2&teamLimit=1&playerPage=2&playerLimit=2')
      .expect(200);

    expect(response.body.teams).toHaveLength(1);
    expect(response.body.teams[0].id).toBe(252);
    expect(response.body.teams[0].players).toHaveLength(1);
    expect(response.body.teams[0].players[0].id).toBe(349);
    expect(response.body.teamPagination).toEqual({
      page: 2,
      limit: 1,
      totalItems: 3,
      totalPages: 3,
      hasPreviousPage: true,
      hasNextPage: true
    });
    expect(response.body.playerPagination).toEqual({
      page: 2,
      limit: 2,
      totalItems: 4,
      totalPages: 2,
      hasPreviousPage: true,
      hasNextPage: false
    });
  });

  it('GET /api/v1/coaches/:id applies dashboard pagination after filters and paginates notifications', async () => {
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        id: 138,
        first_name: 'Test',
        last_name: 'Coach',
        teams: [
          {
            id: 254,
            name: 'Warriors',
            season: 2025,
            players: [
              {
                id: 351,
                first_name: 'Slugger',
                last_name: 'Pitch One',
                email: 'slug-one@example.com',
                position: 'Pitcher',
                stats: []
              },
              {
                id: 352,
                first_name: 'Slugger',
                last_name: 'Pitch Two',
                email: 'slug-two@example.com',
                position: 'Pitcher',
                stats: []
              },
              {
                id: 353,
                first_name: 'Slugger',
                last_name: 'Bat',
                email: 'slug-bat@example.com',
                position: 'Outfield',
                stats: []
              }
            ]
          },
          {
            id: 255,
            name: 'Highlander',
            season: 2025,
            players: [
              {
                id: 354,
                first_name: 'Slugger',
                last_name: 'Pitch Three',
                email: 'slug-three@example.com',
                position: 'Pitcher',
                stats: []
              }
            ]
          },
          {
            id: 256,
            name: 'Warriors',
            season: 2026,
            players: [
              {
                id: 355,
                first_name: 'Slugger',
                last_name: 'Pitch Four',
                email: 'slug-four@example.com',
                position: 'Pitcher',
                stats: []
              }
            ]
          }
        ],
        notifications: [
          {
            id: 30,
            coach_id: 138,
            kind: 'upcoming_game',
            message: 'Older reminder',
            scheduled_for: '2026-03-25T06:00:00.000Z',
            read_at: null,
            dismissed_at: null,
            created_at: '2026-03-24T12:00:00.000Z',
            idempotency_key: 'notification:older'
          },
          {
            id: 31,
            coach_id: 138,
            kind: 'upcoming_game',
            message: 'Newer reminder',
            scheduled_for: '2026-03-26T06:00:00.000Z',
            read_at: null,
            dismissed_at: null,
            created_at: '2026-03-25T12:00:00.000Z',
            idempotency_key: 'notification:newer'
          }
        ]
      })
    });

    const response = await request(app)
      .get('/api/v1/coaches/138?season=2025&teamSearch=war&playerSearch=slug&position=pitch&teamLimit=1&playerLimit=1&notificationLimit=1')
      .expect(200);

    expect(response.body.availableSeasons).toEqual([2026, 2025]);
    expect(response.body.activeSeason).toBe(2025);
    expect(response.body.teams).toHaveLength(1);
    expect(response.body.teams[0].id).toBe(254);
    expect(response.body.teams[0].players).toHaveLength(1);
    expect(response.body.teams[0].players[0].id).toBe(351);
    expect(response.body.teamPagination).toEqual({
      page: 1,
      limit: 1,
      totalItems: 1,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false
    });
    expect(response.body.playerPagination).toEqual({
      page: 1,
      limit: 1,
      totalItems: 2,
      totalPages: 2,
      hasPreviousPage: false,
      hasNextPage: true
    });
    expect(response.body.notifications).toHaveLength(1);
    expect(response.body.notifications[0].idempotency_key).toBe('notification:newer');
    expect(response.body.notificationPagination).toEqual({
      page: 1,
      limit: 1,
      totalItems: 2,
      totalPages: 2,
      hasPreviousPage: false,
      hasNextPage: true
    });
    expect(response.body.unreadNotificationCount).toBe(2);
  });

  it('GET /api/v1/coaches/:id rejects invalid dashboard pagination queries', async () => {
    const invalidTeamPageResponse = await request(app)
      .get('/api/v1/coaches/139?teamPage=0')
      .expect(400);

    expect(invalidTeamPageResponse.body).toEqual({
      error: 'Sorry your teamPage is invalid please try again'
    });

    const invalidPlayerLimitResponse = await request(app)
      .get('/api/v1/coaches/139?playerLimit=-1')
      .expect(400);

    expect(invalidPlayerLimitResponse.body).toEqual({
      error: 'Sorry your playerLimit is invalid please try again'
    });

    const invalidNotificationLimitResponse = await request(app)
      .get('/api/v1/coaches/139?notificationLimit=all')
      .expect(400);

    expect(invalidNotificationLimitResponse.body).toEqual({
      error: 'Sorry your notificationLimit is invalid please try again'
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('GET /api/v1/coaches/:id returns empty arrays and metadata for out-of-range dashboard pages', async () => {
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        id: 142,
        first_name: 'Test',
        last_name: 'Coach',
        teams: [
          {
            id: 270,
            name: 'Highlander',
            season: 2026,
            players: [
              {
                id: 370,
                first_name: 'First',
                last_name: 'Player',
                email: 'first@example.com',
                position: 'Pitcher',
                stats: []
              }
            ]
          },
          {
            id: 271,
            name: 'Warriors',
            season: 2026,
            players: [
              {
                id: 371,
                first_name: 'Second',
                last_name: 'Player',
                email: 'second@example.com',
                position: 'Catcher',
                stats: []
              }
            ]
          }
        ],
        notifications: [
          {
            id: 40,
            coach_id: 142,
            kind: 'upcoming_game',
            message: 'Reminder',
            scheduled_for: '2026-03-26T06:00:00.000Z',
            read_at: null,
            dismissed_at: null,
            created_at: '2026-03-25T12:00:00.000Z',
            idempotency_key: 'notification:out-of-range'
          }
        ]
      })
    });

    const response = await request(app)
      .get('/api/v1/coaches/142?teamPage=4&teamLimit=1&playerPage=4&playerLimit=1&notificationLimit=1')
      .expect(200);

    expect(response.body.teams).toEqual([]);
    expect(response.body.notifications).toHaveLength(1);
    expect(response.body.teamPagination).toEqual({
      page: 4,
      limit: 1,
      totalItems: 2,
      totalPages: 2,
      hasPreviousPage: true,
      hasNextPage: false
    });
    expect(response.body.playerPagination).toEqual({
      page: 4,
      limit: 1,
      totalItems: 2,
      totalPages: 2,
      hasPreviousPage: true,
      hasNextPage: false
    });
    expect(response.body.notificationPagination).toEqual({
      page: 1,
      limit: 1,
      totalItems: 1,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false
    });
  });

  it('GET /api/v1/coaches/:id returns 200 with empty teams for a valid no-match teamSearch', async () => {
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        id: 136,
        first_name: 'Test',
        last_name: 'Coach',
        teams: [
          {
            id: 250,
            name: 'Highlander',
            season: 2026,
            players: []
          }
        ]
      })
    });

    const response = await request(app).get('/api/v1/coaches/136?teamSearch=nomatch').expect(200);

    expect(response.body.availableSeasons).toEqual([2026]);
    expect(response.body.activeSeason).toBe(2026);
    expect(response.body.teams).toEqual([]);
  });

  it('GET /api/v1/coaches/:id rejects an invalid season query', async () => {
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        id: 14,
        first_name: 'Test',
        last_name: 'Coach',
        teams: [
          {
            id: 26,
            name: 'Highlander',
            season: 2026,
            players: []
          }
        ]
      })
    });

    const response = await request(app).get('/api/v1/coaches/14?season=summer').expect(400);

    expect(response.body).toEqual({
      error: 'Sorry your season is invalid please try again'
    });
  });

  it('GET /api/v1/coaches/:id rejects an invalid teamSearch query', async () => {
    const response = await request(app)
      .get(`/api/v1/coaches/14?teamSearch=${'x'.repeat(101)}`)
      .expect(400);

    expect(response.body).toEqual({
      error: 'Sorry your teamSearch is invalid please try again'
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('GET /api/v1/coaches/:id rejects an invalid position query', async () => {
    const response = await request(app)
      .get(`/api/v1/coaches/14?position=${'x'.repeat(101)}`)
      .expect(400);

    expect(response.body).toEqual({
      error: 'Sorry your position is invalid please try again'
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('GET /api/v1/coaches/:id ignores a whitespace-only teamSearch query', async () => {
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        id: 15,
        first_name: 'Test',
        last_name: 'Coach',
        teams: [
          {
            id: 27,
            name: 'Highlander',
            season: 2026,
            players: []
          }
        ]
      })
    });

    const response = await request(app).get('/api/v1/coaches/15?teamSearch=%20%20%20').expect(200);

    expect(response.body.teams).toHaveLength(1);
    expect(response.body.teams[0].id).toBe(27);
  });

  it('GET /api/v1/coaches/:id ignores a whitespace-only playerSearch query', async () => {
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        id: 16,
        first_name: 'Test',
        last_name: 'Coach',
        teams: [
          {
            id: 28,
            name: 'Highlander',
            season: 2026,
            players: [
              {
                id: 36,
                first_name: 'Slugger',
                stats: [
                  { description: 'Hits', _pivot_how_many: 2, _pivot_game_date: '2026-06-10T00:00:00Z' },
                  { description: 'At Bats', _pivot_how_many: 4, _pivot_game_date: '2026-06-10T00:00:00Z' }
                ]
              }
            ]
          }
        ]
      })
    });

    const response = await request(app).get('/api/v1/coaches/16?playerSearch=%20%20').expect(200);

    expect(response.body.teams).toHaveLength(1);
    expect(response.body.teams[0].players).toHaveLength(1);
    expect(response.body.teams[0].players[0].id).toBe(36);
  });

  it('GET /api/v1/coaches/:id ignores a whitespace-only position query', async () => {
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        id: 17,
        first_name: 'Test',
        last_name: 'Coach',
        teams: [
          {
            id: 29,
            name: 'Highlander',
            season: 2026,
            players: [
              {
                id: 37,
                first_name: 'Ace',
                position: 'Pitcher',
                stats: [
                  { description: 'Strikeouts', _pivot_how_many: 3, _pivot_game_date: '2026-06-10T00:00:00Z' },
                  { description: 'Innings Pitched', _pivot_how_many: 3, _pivot_game_date: '2026-06-10T00:00:00Z' }
                ]
              }
            ]
          }
        ]
      })
    });

    const response = await request(app).get('/api/v1/coaches/17?position=%20%20').expect(200);

    expect(response.body.teams).toHaveLength(1);
    expect(response.body.teams[0].players).toHaveLength(1);
    expect(response.body.teams[0].players[0].id).toBe(37);
  });

  it('GET /api/v1/teams/:id adds derived stats from related player stats', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 50,
        name: 'Highlander',
        season: 2026,
        coach: [
          { id: 1 }
        ],
        players: [
          {
            id: 60,
            first_name: 'Ace',
            stats: [
              { description: 'Hits', _pivot_how_many: 5, _pivot_game_id: 300, _pivot_game_date: '2026-04-10T00:00:00Z' },
              { description: 'At Bats', _pivot_how_many: 10, _pivot_game_id: 300, _pivot_game_date: '2026-04-10T00:00:00Z' },
              { description: 'Home Runs', _pivot_how_many: 2, _pivot_game_id: 300, _pivot_game_date: '2026-04-10T00:00:00Z' },
              { description: 'Earned Runs', _pivot_how_many: 3, _pivot_game_id: 300, _pivot_game_date: '2026-04-10T00:00:00Z' },
              { description: 'Innings Pitched', _pivot_how_many: 6, _pivot_game_id: 300, _pivot_game_date: '2026-04-10T00:00:00Z' },
              { description: 'Strikeouts', _pivot_how_many: 9, _pivot_game_id: 300, _pivot_game_date: '2026-04-10T00:00:00Z' }
            ]
          }
        ]
      })
    });
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        teams: [
          { id: 49, name: 'Highlander', season: 2025 },
          { id: 50, name: 'Highlander', season: 2026 }
        ]
      })
    });

    const response = await request(app).get('/api/v1/teams/50').expect(200);
    const player = response.body.players[0];

    expect(player.derivedStats).toEqual({
      battingAverage: 0.5,
      homeRunRate: 0.2,
      era: 4.5,
      strikeoutsPerInning: 1.5
    });
  });


  it('GET /api/v1/teams/:id defaults to the latest same-name season and returns season metadata', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 53,
        name: 'Highlander',
        season: 2025,
        coach: [
          { id: 1 }
        ],
        players: [
          {
            id: 63,
            first_name: 'Rookie',
            stats: [
              { description: 'Hits', _pivot_how_many: 4, _pivot_game_date: '2026-04-10T00:00:00Z', _pivot_game_id: 301 },
              { description: 'At Bats', _pivot_how_many: 8, _pivot_game_date: '2026-04-10T00:00:00Z', _pivot_game_id: 301 },
              { description: 'Hits', _pivot_how_many: 9, _pivot_game_date: '2025-04-10T00:00:00Z', _pivot_game_id: 302 },
              { description: 'At Bats', _pivot_how_many: 9, _pivot_game_date: '2025-04-10T00:00:00Z', _pivot_game_id: 302 }
            ]
          }
        ]
      })
    });
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        teams: [
          { id: 53, name: 'Highlander', season: 2025 },
          { id: 54, name: 'Highlander', season: 2026 },
          { id: 55, name: 'Warriors', season: 2026 }
        ]
      })
    });

    const response = await request(app).get('/api/v1/teams/53').expect(200);

    expect(response.body.season).toBe(2025);
    expect(response.body.availableSeasons).toEqual([2026, 2025]);
    expect(response.body.activeSeason).toBe(2026);
    expect(response.body.players[0].stats).toEqual([
      { description: 'Hits', _pivot_how_many: 4, _pivot_game_date: '2026-04-10T00:00:00Z', _pivot_game_id: 301 },
      { description: 'At Bats', _pivot_how_many: 8, _pivot_game_date: '2026-04-10T00:00:00Z', _pivot_game_id: 301 }
    ]);
    expect(response.body.players[0].derivedStats).toEqual({
      battingAverage: 0.5,
      homeRunRate: null,
      era: null,
      strikeoutsPerInning: null
    });
  });

  it('GET /api/v1/teams/:id filters player stats to the requested season and same-name family', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 56,
        name: 'Highlander',
        season: 2026,
        coach: [
          { id: 1 }
        ],
        players: [
          {
            id: 64,
            first_name: 'Slugger',
            stats: [
              { description: 'Hits', _pivot_how_many: 3, _pivot_game_date: '2025-05-10T00:00:00Z' },
              { description: 'At Bats', _pivot_how_many: 6, _pivot_game_date: '2025-05-10T00:00:00Z' },
              { description: 'Home Runs', _pivot_how_many: 1, _pivot_game_date: '2025-05-10T00:00:00Z' },
              { description: 'Hits', _pivot_how_many: 7, _pivot_game_date: '2026-05-10T00:00:00Z' },
              { description: 'At Bats', _pivot_how_many: 14, _pivot_game_date: '2026-05-10T00:00:00Z' }
            ]
          }
        ]
      })
    });
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        teams: [
          { id: 57, name: 'Highlander', season: 2025 },
          { id: 56, name: 'Highlander', season: 2026 },
          { id: 58, name: 'Tigers', season: 2025 }
        ]
      })
    });

    const response = await request(app).get('/api/v1/teams/56?season=2025').expect(200);

    expect(response.body.availableSeasons).toEqual([2026, 2025]);
    expect(response.body.activeSeason).toBe(2025);
    expect(response.body.players[0].stats).toEqual([
      { description: 'Hits', _pivot_how_many: 3, _pivot_game_date: '2025-05-10T00:00:00Z' },
      { description: 'At Bats', _pivot_how_many: 6, _pivot_game_date: '2025-05-10T00:00:00Z' },
      { description: 'Home Runs', _pivot_how_many: 1, _pivot_game_date: '2025-05-10T00:00:00Z' }
    ]);
    expect(response.body.players[0].derivedStats).toEqual({
      battingAverage: 0.5,
      homeRunRate: 1 / 6,
      era: null,
      strikeoutsPerInning: null
    });
  });

  it('GET /api/v1/teams/:id filters players by playerSearch', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 560,
        name: 'Highlander',
        season: 2026,
        coach: [
          { id: 1 }
        ],
        players: [
          {
            id: 640,
            first_name: 'Slugger',
            last_name: 'One',
            email: 'slugger@example.com',
            position: 'Outfield',
            stats: [
              { description: 'Hits', _pivot_how_many: 3, _pivot_game_date: '2026-05-10T00:00:00Z' },
              { description: 'At Bats', _pivot_how_many: 6, _pivot_game_date: '2026-05-10T00:00:00Z' }
            ]
          },
          {
            id: 641,
            first_name: 'Ace',
            last_name: 'Two',
            email: 'ace@example.com',
            position: 'Pitcher',
            stats: [
              { description: 'Strikeouts', _pivot_how_many: 5, _pivot_game_date: '2026-05-10T00:00:00Z' },
              { description: 'Innings Pitched', _pivot_how_many: 2, _pivot_game_date: '2026-05-10T00:00:00Z' }
            ]
          }
        ]
      })
    });
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        teams: [
          { id: 560, name: 'Highlander', season: 2026 }
        ]
      })
    });

    const response = await request(app).get('/api/v1/teams/560?playerSearch=slug').expect(200);

    expect(response.body.availableSeasons).toEqual([2026]);
    expect(response.body.activeSeason).toBe(2026);
    expect(response.body.players).toHaveLength(1);
    expect(response.body.players[0].id).toBe(640);
    expect(response.body.players[0].derivedStats).toEqual({
      battingAverage: 0.5,
      homeRunRate: null,
      era: null,
      strikeoutsPerInning: null
    });
  });

  it('GET /api/v1/teams/:id rejects access to a team outside the authenticated coach', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 569,
        name: 'Highlander',
        season: 2026,
        coach: [
          { id: 2 }
        ],
        players: []
      })
    });

    const response = await request(app).get('/api/v1/teams/569').expect(403);

    expect(response.body).toEqual({
      error: 'Unauthorized'
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('GET /api/v1/teams/:id filters players by position', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 561,
        name: 'Highlander',
        season: 2026,
        coach: [
          { id: 1 }
        ],
        players: [
          {
            id: 642,
            first_name: 'Ace',
            last_name: 'Pitcher',
            email: 'ace@example.com',
            position: 'Pitcher',
            stats: [
              { description: 'Strikeouts', _pivot_how_many: 6, _pivot_game_date: '2026-05-10T00:00:00Z' },
              { description: 'Innings Pitched', _pivot_how_many: 3, _pivot_game_date: '2026-05-10T00:00:00Z' }
            ]
          },
          {
            id: 643,
            first_name: 'Slugger',
            last_name: 'Batter',
            email: 'slugger@example.com',
            position: 'Outfield',
            stats: [
              { description: 'Hits', _pivot_how_many: 2, _pivot_game_date: '2026-05-10T00:00:00Z' },
              { description: 'At Bats', _pivot_how_many: 4, _pivot_game_date: '2026-05-10T00:00:00Z' }
            ]
          }
        ]
      })
    });
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        teams: [
          { id: 561, name: 'Highlander', season: 2026 }
        ]
      })
    });

    const response = await request(app).get('/api/v1/teams/561?position=pitch').expect(200);

    expect(response.body.players).toHaveLength(1);
    expect(response.body.players[0].id).toBe(642);
    expect(response.body.players[0].derivedStats).toEqual({
      battingAverage: null,
      homeRunRate: null,
      era: null,
      strikeoutsPerInning: 2
    });
  });

  it('GET /api/v1/teams/:id returns 200 with empty players for a valid no-match player filter', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 562,
        name: 'Highlander',
        season: 2026,
        coach: [
          { id: 1 }
        ],
        players: [
          {
            id: 644,
            first_name: 'Ace',
            last_name: 'Pitcher',
            email: 'ace@example.com',
            position: 'Pitcher',
            stats: [
              { description: 'Strikeouts', _pivot_how_many: 4, _pivot_game_date: '2026-05-10T00:00:00Z' },
              { description: 'Innings Pitched', _pivot_how_many: 2, _pivot_game_date: '2026-05-10T00:00:00Z' }
            ]
          }
        ]
      })
    });
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        teams: [
          { id: 562, name: 'Highlander', season: 2026 }
        ]
      })
    });

    const response = await request(app).get('/api/v1/teams/562?playerSearch=nomatch').expect(200);

    expect(response.body.availableSeasons).toEqual([2026]);
    expect(response.body.activeSeason).toBe(2026);
    expect(response.body.players).toEqual([]);
  });

  it('GET /api/v1/teams/:id applies combined season and playerSearch filters', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 563,
        name: 'Highlander',
        season: 2026,
        coach: [
          { id: 1 }
        ],
        players: [
          {
            id: 645,
            first_name: 'Slugger',
            last_name: 'One',
            email: 'slugger@example.com',
            position: 'Outfield',
            stats: [
              { description: 'Hits', _pivot_how_many: 3, _pivot_game_date: '2025-05-10T00:00:00Z' },
              { description: 'At Bats', _pivot_how_many: 6, _pivot_game_date: '2025-05-10T00:00:00Z' },
              { description: 'Hits', _pivot_how_many: 4, _pivot_game_date: '2026-05-10T00:00:00Z' },
              { description: 'At Bats', _pivot_how_many: 8, _pivot_game_date: '2026-05-10T00:00:00Z' }
            ]
          },
          {
            id: 646,
            first_name: 'Ace',
            last_name: 'Two',
            email: 'ace@example.com',
            position: 'Pitcher',
            stats: [
              { description: 'Strikeouts', _pivot_how_many: 4, _pivot_game_date: '2025-05-10T00:00:00Z' },
              { description: 'Innings Pitched', _pivot_how_many: 2, _pivot_game_date: '2025-05-10T00:00:00Z' }
            ]
          }
        ]
      })
    });
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        teams: [
          { id: 564, name: 'Highlander', season: 2025 },
          { id: 563, name: 'Highlander', season: 2026 }
        ]
      })
    });

    const response = await request(app).get('/api/v1/teams/563?season=2025&playerSearch=slug').expect(200);

    expect(response.body.availableSeasons).toEqual([2026, 2025]);
    expect(response.body.activeSeason).toBe(2025);
    expect(response.body.players).toHaveLength(1);
    expect(response.body.players[0].id).toBe(645);
    expect(response.body.players[0].stats).toEqual([
      { description: 'Hits', _pivot_how_many: 3, _pivot_game_date: '2025-05-10T00:00:00Z' },
      { description: 'At Bats', _pivot_how_many: 6, _pivot_game_date: '2025-05-10T00:00:00Z' }
    ]);
  });

  it('GET /api/v1/teams/:id applies combined season and position filters', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 565,
        name: 'Highlander',
        season: 2026,
        coach: [
          { id: 1 }
        ],
        players: [
          {
            id: 647,
            first_name: 'Ace',
            last_name: 'Pitcher',
            email: 'ace@example.com',
            position: 'Pitcher',
            stats: [
              { description: 'Strikeouts', _pivot_how_many: 6, _pivot_game_date: '2025-05-10T00:00:00Z' },
              { description: 'Innings Pitched', _pivot_how_many: 3, _pivot_game_date: '2025-05-10T00:00:00Z' },
              { description: 'Strikeouts', _pivot_how_many: 8, _pivot_game_date: '2026-05-10T00:00:00Z' },
              { description: 'Innings Pitched', _pivot_how_many: 4, _pivot_game_date: '2026-05-10T00:00:00Z' }
            ]
          },
          {
            id: 648,
            first_name: 'Slugger',
            last_name: 'Batter',
            email: 'slugger@example.com',
            position: 'Outfield',
            stats: [
              { description: 'Hits', _pivot_how_many: 2, _pivot_game_date: '2025-05-10T00:00:00Z' },
              { description: 'At Bats', _pivot_how_many: 4, _pivot_game_date: '2025-05-10T00:00:00Z' }
            ]
          }
        ]
      })
    });
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        teams: [
          { id: 566, name: 'Highlander', season: 2025 },
          { id: 565, name: 'Highlander', season: 2026 }
        ]
      })
    });

    const response = await request(app).get('/api/v1/teams/565?season=2025&position=pitch').expect(200);

    expect(response.body.availableSeasons).toEqual([2026, 2025]);
    expect(response.body.activeSeason).toBe(2025);
    expect(response.body.players).toHaveLength(1);
    expect(response.body.players[0].id).toBe(647);
    expect(response.body.players[0].stats).toEqual([
      { description: 'Strikeouts', _pivot_how_many: 6, _pivot_game_date: '2025-05-10T00:00:00Z' },
      { description: 'Innings Pitched', _pivot_how_many: 3, _pivot_game_date: '2025-05-10T00:00:00Z' }
    ]);
  });

  it('GET /api/v1/teams/:id preserves availableSeasons and activeSeason for valid no-match combined filters', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 567,
        name: 'Highlander',
        season: 2026,
        coach: [
          { id: 1 }
        ],
        players: [
          {
            id: 649,
            first_name: 'Ace',
            last_name: 'Pitcher',
            email: 'ace@example.com',
            position: 'Pitcher',
            stats: [
              { description: 'Strikeouts', _pivot_how_many: 4, _pivot_game_date: '2025-05-10T00:00:00Z' },
              { description: 'Innings Pitched', _pivot_how_many: 2, _pivot_game_date: '2025-05-10T00:00:00Z' }
            ]
          }
        ]
      })
    });
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        teams: [
          { id: 568, name: 'Highlander', season: 2025 },
          { id: 567, name: 'Highlander', season: 2026 }
        ]
      })
    });

    const response = await request(app).get('/api/v1/teams/567?season=2025&playerSearch=slug').expect(200);

    expect(response.body.availableSeasons).toEqual([2026, 2025]);
    expect(response.body.activeSeason).toBe(2025);
    expect(response.body.players).toEqual([]);
  });

  it('GET /api/v1/teams/:id applies combined playerSearch and position filters', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 568,
        name: 'Highlander',
        season: 2026,
        coach: [
          { id: 1 }
        ],
        players: [
          {
            id: 651,
            first_name: 'Slugger',
            last_name: 'Pitch',
            email: 'slugger@example.com',
            position: 'Pitcher',
            stats: [
              { description: 'Strikeouts', _pivot_how_many: 5, _pivot_game_date: '2026-05-10T00:00:00Z' },
              { description: 'Innings Pitched', _pivot_how_many: 5, _pivot_game_date: '2026-05-10T00:00:00Z' }
            ]
          },
          {
            id: 652,
            first_name: 'Slugger',
            last_name: 'Bat',
            email: 'bat@example.com',
            position: 'Outfield',
            stats: [
              { description: 'Hits', _pivot_how_many: 3, _pivot_game_date: '2026-05-10T00:00:00Z' },
              { description: 'At Bats', _pivot_how_many: 6, _pivot_game_date: '2026-05-10T00:00:00Z' }
            ]
          },
          {
            id: 653,
            first_name: 'Ace',
            last_name: 'Pitch',
            email: 'ace@example.com',
            position: 'Pitcher',
            stats: [
              { description: 'Strikeouts', _pivot_how_many: 4, _pivot_game_date: '2026-05-10T00:00:00Z' },
              { description: 'Innings Pitched', _pivot_how_many: 2, _pivot_game_date: '2026-05-10T00:00:00Z' }
            ]
          }
        ]
      })
    });
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        teams: [
          { id: 568, name: 'Highlander', season: 2026 }
        ]
      })
    });

    const response = await request(app).get('/api/v1/teams/568?playerSearch=slug&position=pitch').expect(200);

    expect(response.body.availableSeasons).toEqual([2026]);
    expect(response.body.activeSeason).toBe(2026);
    expect(response.body.players).toHaveLength(1);
    expect(response.body.players[0].id).toBe(651);
    expect(response.body.players[0].derivedStats).toEqual({
      battingAverage: null,
      homeRunRate: null,
      era: null,
      strikeoutsPerInning: 1
    });
  });

  it('GET /api/v1/teams/:id uses default player pagination values', async () => {
    const players = Array.from({ length: 11 }, (_, index) => ({
      id: 700 + index,
      first_name: `Player${index + 1}`,
      last_name: 'Default',
      email: `player${index + 1}@example.com`,
      position: 'Pitcher',
      stats: []
    }));

    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 573,
        name: 'Highlander',
        season: 2026,
        coach: [
          { id: 1 }
        ],
        players: players
      })
    });
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        teams: [
          { id: 573, name: 'Highlander', season: 2026 }
        ]
      })
    });

    const response = await request(app)
      .get('/api/v1/teams/573')
      .expect(200);

    expect(response.body.players).toHaveLength(10);
    expect(response.body.players[0].id).toBe(700);
    expect(response.body.players[9].id).toBe(709);
    expect(response.body.playerPagination).toEqual({
      page: 1,
      limit: 10,
      totalItems: 11,
      totalPages: 2,
      hasPreviousPage: false,
      hasNextPage: true
    });
  });

  it('GET /api/v1/teams/:id paginates filtered players and returns playerPagination metadata', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 570,
        name: 'Highlander',
        season: 2026,
        coach: [
          { id: 1 }
        ],
        players: [
          {
            id: 654,
            first_name: 'First',
            last_name: 'Player',
            email: 'first@example.com',
            position: 'Pitcher',
            stats: []
          },
          {
            id: 655,
            first_name: 'Second',
            last_name: 'Player',
            email: 'second@example.com',
            position: 'Catcher',
            stats: []
          },
          {
            id: 656,
            first_name: 'Third',
            last_name: 'Player',
            email: 'third@example.com',
            position: 'Outfield',
            stats: []
          }
        ]
      })
    });
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        teams: [
          { id: 570, name: 'Highlander', season: 2026 }
        ]
      })
    });

    const response = await request(app)
      .get('/api/v1/teams/570?playerPage=2&playerLimit=1')
      .expect(200);

    expect(response.body.players).toHaveLength(1);
    expect(response.body.players[0].id).toBe(655);
    expect(response.body.playerPagination).toEqual({
      page: 2,
      limit: 1,
      totalItems: 3,
      totalPages: 3,
      hasPreviousPage: true,
      hasNextPage: true
    });
  });

  it('GET /api/v1/teams/:id applies pagination after season, playerSearch, and position filters', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 571,
        name: 'Highlander',
        season: 2026,
        coach: [
          { id: 1 }
        ],
        players: [
          {
            id: 657,
            first_name: 'Slugger',
            last_name: 'Pitch One',
            email: 'slug-one@example.com',
            position: 'Pitcher',
            stats: [
              { description: 'Strikeouts', _pivot_how_many: 6, _pivot_game_date: '2025-05-10T00:00:00Z' },
              { description: 'Innings Pitched', _pivot_how_many: 3, _pivot_game_date: '2025-05-10T00:00:00Z' }
            ]
          },
          {
            id: 658,
            first_name: 'Slugger',
            last_name: 'Pitch Two',
            email: 'slug-two@example.com',
            position: 'Pitcher',
            stats: [
              { description: 'Strikeouts', _pivot_how_many: 8, _pivot_game_date: '2025-05-10T00:00:00Z' },
              { description: 'Innings Pitched', _pivot_how_many: 4, _pivot_game_date: '2025-05-10T00:00:00Z' },
              { description: 'Strikeouts', _pivot_how_many: 10, _pivot_game_date: '2026-05-10T00:00:00Z' }
            ]
          },
          {
            id: 659,
            first_name: 'Slugger',
            last_name: 'Bat',
            email: 'slug-bat@example.com',
            position: 'Outfield',
            stats: []
          },
          {
            id: 660,
            first_name: 'Ace',
            last_name: 'Pitch',
            email: 'ace@example.com',
            position: 'Pitcher',
            stats: []
          }
        ]
      })
    });
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        teams: [
          { id: 572, name: 'Highlander', season: 2025 },
          { id: 571, name: 'Highlander', season: 2026 }
        ]
      })
    });

    const response = await request(app)
      .get('/api/v1/teams/571?season=2025&playerSearch=slug&position=pitch&playerPage=2&playerLimit=1')
      .expect(200);

    expect(response.body.availableSeasons).toEqual([2026, 2025]);
    expect(response.body.activeSeason).toBe(2025);
    expect(response.body.players).toHaveLength(1);
    expect(response.body.players[0].id).toBe(658);
    expect(response.body.players[0].stats).toEqual([
      { description: 'Strikeouts', _pivot_how_many: 8, _pivot_game_date: '2025-05-10T00:00:00Z' },
      { description: 'Innings Pitched', _pivot_how_many: 4, _pivot_game_date: '2025-05-10T00:00:00Z' }
    ]);
    expect(response.body.playerPagination).toEqual({
      page: 2,
      limit: 1,
      totalItems: 2,
      totalPages: 2,
      hasPreviousPage: true,
      hasNextPage: false
    });
  });

  it('GET /api/v1/teams/:id rejects invalid player pagination queries', async () => {
    const invalidPageResponse = await request(app)
      .get('/api/v1/teams/59?playerPage=0')
      .expect(400);

    expect(invalidPageResponse.body).toEqual({
      error: 'Sorry your playerPage is invalid please try again'
    });

    const invalidLimitResponse = await request(app)
      .get('/api/v1/teams/59?playerLimit=-1')
      .expect(400);

    expect(invalidLimitResponse.body).toEqual({
      error: 'Sorry your playerLimit is invalid please try again'
    });
    expect(mockTeamFetch).not.toHaveBeenCalled();
  });

  it('GET /api/v1/teams/:id returns an empty players array and metadata for an out-of-range player page', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 574,
        name: 'Highlander',
        season: 2026,
        coach: [
          { id: 1 }
        ],
        players: [
          {
            id: 710,
            first_name: 'First',
            last_name: 'Player',
            email: 'first@example.com',
            position: 'Pitcher',
            stats: []
          },
          {
            id: 711,
            first_name: 'Second',
            last_name: 'Player',
            email: 'second@example.com',
            position: 'Catcher',
            stats: []
          }
        ]
      })
    });
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        teams: [
          { id: 574, name: 'Highlander', season: 2026 }
        ]
      })
    });

    const response = await request(app)
      .get('/api/v1/teams/574?playerPage=4&playerLimit=1')
      .expect(200);

    expect(response.body.players).toEqual([]);
    expect(response.body.playerPagination).toEqual({
      page: 4,
      limit: 1,
      totalItems: 2,
      totalPages: 2,
      hasPreviousPage: true,
      hasNextPage: false
    });
  });

  it('GET /api/v1/teams/:id rejects an invalid season query', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 59,
        name: 'Highlander',
        season: 2026,
        coach: [
          { id: 1 }
        ],
        players: []
      })
    });

    const response = await request(app).get('/api/v1/teams/59?season=fall').expect(400);

    expect(response.body).toEqual({
      error: 'Sorry your season is invalid please try again'
    });
  });

  it('GET /api/v1/teams/:id rejects an invalid playerSearch query', async () => {
    const response = await request(app)
      .get(`/api/v1/teams/59?playerSearch=${'x'.repeat(101)}`)
      .expect(400);

    expect(response.body).toEqual({
      error: 'Sorry your playerSearch is invalid please try again'
    });
    expect(mockTeamFetch).not.toHaveBeenCalled();
  });

  it('GET /api/v1/teams/:id rejects an invalid position query', async () => {
    const response = await request(app)
      .get(`/api/v1/teams/59?position=${'x'.repeat(101)}`)
      .expect(400);

    expect(response.body).toEqual({
      error: 'Sorry your position is invalid please try again'
    });
    expect(mockTeamFetch).not.toHaveBeenCalled();
  });

  it('GET /api/v1/teams/:id ignores a whitespace-only playerSearch query', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 65,
        name: 'Highlander',
        season: 2026,
        coach: [
          { id: 1 }
        ],
        players: [
          {
            id: 66,
            first_name: 'Rookie',
            stats: [
              { description: 'Hits', _pivot_how_many: 1, _pivot_game_date: '2026-06-10T00:00:00Z' },
              { description: 'At Bats', _pivot_how_many: 2, _pivot_game_date: '2026-06-10T00:00:00Z' }
            ]
          }
        ]
      })
    });
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        teams: [
          { id: 65, name: 'Highlander', season: 2026 }
        ]
      })
    });

    const response = await request(app).get('/api/v1/teams/65?playerSearch=%20%20').expect(200);

    expect(response.body.players).toHaveLength(1);
    expect(response.body.players[0].id).toBe(66);
  });

  it('GET /api/v1/teams/:id ignores a whitespace-only position query', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 67,
        name: 'Highlander',
        season: 2026,
        coach: [
          { id: 1 }
        ],
        players: [
          {
            id: 68,
            first_name: 'Closer',
            position: 'Pitcher',
            stats: [
              { description: 'Strikeouts', _pivot_how_many: 4, _pivot_game_date: '2026-06-10T00:00:00Z' },
              { description: 'Innings Pitched', _pivot_how_many: 2, _pivot_game_date: '2026-06-10T00:00:00Z' }
            ]
          }
        ]
      })
    });
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        teams: [
          { id: 67, name: 'Highlander', season: 2026 }
        ]
      })
    });

    const response = await request(app).get('/api/v1/teams/67?position=%20%20').expect(200);

    expect(response.body.players).toHaveLength(1);
    expect(response.body.players[0].id).toBe(68);
  });

  it('GET /api/v1/teams/:id returns null derived stats when denominators are missing or zero', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 51,
        name: 'Highlander',
        season: 2026,
        coach: [
          { id: 1 }
        ],
        players: [
          {
            id: 61,
            first_name: 'Utility',
            stats: [
              { description: 'Hits', _pivot_how_many: 2, _pivot_game_date: '2026-05-10T00:00:00Z' },
              { description: 'At Bats', _pivot_how_many: 0, _pivot_game_date: '2026-05-10T00:00:00Z' },
              { description: 'Home Runs', _pivot_how_many: 1, _pivot_game_date: '2026-05-10T00:00:00Z' }
            ]
          }
        ]
      })
    });
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        teams: [
          { id: 51, name: 'Highlander', season: 2026 }
        ]
      })
    });

    const response = await request(app).get('/api/v1/teams/51').expect(200);
    const player = response.body.players[0];

    expect(player.derivedStats).toEqual({
      battingAverage: null,
      homeRunRate: null,
      era: null,
      strikeoutsPerInning: null
    });
  });

  it('GET /api/v1/teams/:id sums duplicate stat rows before computing derived stats', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 52,
        name: 'Highlander',
        season: 2026,
        coach: [
          { id: 1 }
        ],
        players: [
          {
            id: 62,
            first_name: 'Closer',
            stats: [
              { description: 'Earned Runs', _pivot_how_many: 1, _pivot_game_date: '2026-05-10T00:00:00Z' },
              { description: 'Earned Runs', _pivot_how_many: 2, _pivot_game_date: '2026-05-10T00:00:00Z' },
              { description: 'Innings Pitched', _pivot_how_many: 3, _pivot_game_date: '2026-05-10T00:00:00Z' },
              { description: 'Innings Pitched', _pivot_how_many: 3, _pivot_game_date: '2026-05-10T00:00:00Z' },
              { description: 'Strikeouts', _pivot_how_many: 4, _pivot_game_date: '2026-05-10T00:00:00Z' },
              { description: 'Strikeouts', _pivot_how_many: 2, _pivot_game_date: '2026-05-10T00:00:00Z' }
            ]
          }
        ]
      })
    });
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        teams: [
          { id: 52, name: 'Highlander', season: 2026 }
        ]
      })
    });

    const response = await request(app).get('/api/v1/teams/52').expect(200);
    const player = response.body.players[0];

    expect(player.derivedStats).toEqual({
      battingAverage: null,
      homeRunRate: null,
      era: 4.5,
      strikeoutsPerInning: 1
    });
  });

  it('POST /api/v1/teams rejects requests with an invalid season', async () => {
    const response = await withTrustedOrigin(request(app)
      .post('/api/v1/teams'))
      .send({
        name: 'Highlanders',
        city: 'Bronx',
        state: 'NY',
        coachId: 1,
        season: 'spring'
      })
      .expect(400);

    expect(response.body).toEqual({
      error: 'Sorry your season is invalid please try again'
    });
    expect(Coach.where).not.toHaveBeenCalled();
    expect(Team.forge).not.toHaveBeenCalled();
  });

  it('POST /api/v1/teams rejects requests with a missing season', async () => {
    const response = await withTrustedOrigin(request(app)
      .post('/api/v1/teams'))
      .send({
        name: 'Highlanders',
        city: 'Bronx',
        state: 'NY',
        coachId: 1
      })
      .expect(400);

    expect(response.body).toEqual({
      error: 'Sorry your missing season please try again'
    });
    expect(Coach.where).not.toHaveBeenCalled();
    expect(Team.forge).not.toHaveBeenCalled();
  });

  it('POST /api/v1/teams persists a validated season', async () => {
    const attach = jest.fn().mockResolvedValue(undefined);
    const savedTeam = {
      id: 70,
      name: 'Highlanders',
      city: 'Bronx',
      state: 'NY',
      season: 2026,
      coach: () => ({
        attach
      })
    };

    mockFetch.mockResolvedValue({ id: 1 });
    mockTeamForge.mockReturnValue({
      save: jest.fn().mockResolvedValue(savedTeam)
    });

    const response = await withTrustedOrigin(request(app)
      .post('/api/v1/teams'))
      .send({
        name: 'Highlanders',
        city: 'Bronx',
        state: 'NY',
        coachId: 1,
        season: '2026'
      })
      .expect(200);

    expect(Team.forge).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Highlanders',
        city: 'Bronx',
        state: 'NY',
        season: 2026
      })
    );
    expect(attach).toHaveBeenCalledWith({
      coach_id: 1,
      role: 'owner'
    });
    expect(response.body.season).toBe(2026);
  });

  it('POST /api/v1/teams rejects requests from an untrusted origin', async () => {
    const response = await request(app)
      .post('/api/v1/teams')
      .set('Origin', 'http://malicious.example')
      .send({
        name: 'Highlanders',
        city: 'Bronx',
        state: 'NY',
        coachId: 1,
        season: '2026'
      })
      .expect(403);

    expect(response.body).toEqual({
      error: 'Invalid request origin'
    });
    expect(Coach.where).not.toHaveBeenCalled();
    expect(Team.forge).not.toHaveBeenCalled();
  });

  it('POST /api/v1/teams rejects requests for another coach', async () => {
    const response = await withTrustedOrigin(request(app)
      .post('/api/v1/teams'))
      .send({
        name: 'Highlanders',
        city: 'Bronx',
        state: 'NY',
        coachId: 2,
        season: '2026'
      })
      .expect(403);

    expect(response.body).toEqual({
      error: 'Unauthorized'
    });
    expect(Coach.where).not.toHaveBeenCalled();
    expect(Team.forge).not.toHaveBeenCalled();
  });

  it('PUT /api/v1/teams/:id rejects requests with an invalid season', async () => {
    const response = await withTrustedOrigin(request(app)
      .put('/api/v1/teams/50'))
      .send({
        name: 'Highlanders',
        city: 'Bronx',
        state: 'NY',
        season: 'summer'
      })
      .expect(400);

    expect(response.body).toEqual({
      error: 'Sorry your season is invalid please try again'
    });
    expect(Team.where).not.toHaveBeenCalled();
  });

  it('PUT /api/v1/teams/:id rejects requests with a missing season', async () => {
    const response = await withTrustedOrigin(request(app)
      .put('/api/v1/teams/50'))
      .send({
        name: 'Highlanders',
        city: 'Bronx',
        state: 'NY'
      })
      .expect(400);

    expect(response.body).toEqual({
      error: 'Sorry your missing season please try again'
    });
    expect(Team.where).not.toHaveBeenCalled();
  });

  it('PUT /api/v1/teams/:id persists a validated season', async () => {
    const save = jest.fn().mockResolvedValue({
      id: 50,
      name: 'Highlanders',
      city: 'Bronx',
      state: 'NY',
      season: 2027
    });

    Team.where.mockReturnValue({
      fetch: jest.fn().mockResolvedValue({
        toJSON: () => ({
          id: 50,
          coach: [{ id: 1 }]
        }),
        save
      })
    });

    const response = await withTrustedOrigin(request(app)
      .put('/api/v1/teams/50'))
      .send({
        name: 'Highlanders',
        city: 'Bronx',
        state: 'NY',
        season: '2027'
      })
      .expect(200);

    expect(save).toHaveBeenCalledWith({
      name: 'Highlanders',
      city: 'Bronx',
      state: 'NY',
      season: 2027
    });
    expect(response.body.season).toBe(2027);
  });

  it('PUT /api/v1/teams/:id allows assistant collaborators to update team details', async () => {
    ensureAuthenticated.mockImplementationOnce((req, res, next) => {
      req.authenticatedCoachId = 2;
      req.session.coachId = 2;
      next();
    });
    const save = jest.fn().mockResolvedValue({
      id: 50,
      name: 'Highlanders',
      city: 'Bronx',
      state: 'NY',
      season: 2028
    });

    Team.where.mockReturnValue({
      fetch: jest.fn().mockResolvedValue({
        toJSON: () => ({
          id: 50,
          coach: [{ id: 1, _pivot_role: 'owner' }, { id: 2, _pivot_role: 'assistant' }]
        }),
        save
      })
    });

    const response = await withTrustedOrigin(request(app)
      .put('/api/v1/teams/50'))
      .send({
        name: 'Highlanders',
        city: 'Bronx',
        state: 'NY',
        season: '2028'
      })
      .expect(200);

    expect(save).toHaveBeenCalledWith({
      name: 'Highlanders',
      city: 'Bronx',
      state: 'NY',
      season: 2028
    });
    expect(response.body.season).toBe(2028);
  });

  it('PUT /api/v1/teams/:id rejects updates for a team outside the authenticated coach', async () => {
    const save = jest.fn();

    Team.where.mockReturnValue({
      fetch: jest.fn().mockResolvedValue({
        toJSON: () => ({
          id: 50,
          coach: [{ id: 2 }]
        }),
        save
      })
    });

    const response = await withTrustedOrigin(request(app)
      .put('/api/v1/teams/50'))
      .send({
        name: 'Highlanders',
        city: 'Bronx',
        state: 'NY',
        season: '2027'
      })
      .expect(403);

    expect(response.body).toEqual({
      error: 'Unauthorized'
    });
    expect(save).not.toHaveBeenCalled();
  });

  it('PUT /api/v1/teams/:id rejects unauthenticated requests', async () => {
    ensureAuthenticated.mockImplementationOnce((req, res) => res.status(401).send('Unauthorized'));

    const response = await withTrustedOrigin(request(app)
      .put('/api/v1/teams/50'))
      .send({
        name: 'Highlanders',
        city: 'Bronx',
        state: 'NY',
        season: '2027'
      })
      .expect(401);

    expect(response.text).toBe('Unauthorized');
    expect(Team.where).not.toHaveBeenCalled();
  });

  it('POST /api/v1/teams/:id/games creates a game and linked non-zero stat rows in one transaction', async () => {
    const gameSave = jest.fn().mockResolvedValue({ id: 90 });
    const playerStatSave = jest.fn().mockResolvedValue({ id: 91 });

    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 50,
        coach: [
          { id: 1 }
        ],
        players: [
          { id: 1 },
          { id: 2 }
        ]
      })
    });
    mockStatCatalogFetch
      .mockResolvedValueOnce({ id: 1 })
      .mockResolvedValueOnce({ id: 2 });
    mockGameForge.mockReturnValue({
      save: gameSave
    });
    mockPlayerStatForge.mockReturnValue({
      save: playerStatSave
    });

    const response = await withTrustedOrigin(request(app)
      .post('/api/v1/teams/50/games'))
      .send({
        opponent: 'Lions',
        game_date: '2026-03-28T00:00:00Z',
        playerStats: [
          {
            playerId: 1,
            stats: [
              { statCatalogId: 1, howMany: 3 },
              { statCatalogId: 2, howMany: 0 }
            ]
          },
          {
            playerId: 2,
            stats: [
              { statCatalogId: 2, howMany: 4 }
            ]
          }
        ]
      })
      .expect(201);

    expect(Bookshelf.transaction).toHaveBeenCalledTimes(1);
    expect(Team.where).toHaveBeenCalledWith({ id: '50' });
    expect(Game.forge).toHaveBeenCalledWith({
      team_id: 50,
      opponent: 'Lions',
      game_date: new Date('2026-03-28T00:00:00Z')
    });
    expect(gameSave).toHaveBeenCalledWith(null, { transacting: mockTransaction });
    expect(PlayerStat.forge).toHaveBeenCalledTimes(2);
    expect(PlayerStat.forge).toHaveBeenNthCalledWith(1, {
      player_id: 1,
      stat_catalog_id: 1,
      how_many: 3,
      game_id: 90,
      game_date: new Date('2026-03-28T00:00:00Z')
    });
    expect(PlayerStat.forge).toHaveBeenNthCalledWith(2, {
      player_id: 2,
      stat_catalog_id: 2,
      how_many: 4,
      game_id: 90,
      game_date: new Date('2026-03-28T00:00:00Z')
    });
    expect(response.body).toEqual({
      id: 90,
      team_id: 50,
      opponent: 'Lions',
      game_date: '2026-03-28T00:00:00.000Z',
      insertedStatRows: 2
    });
  });

  it('POST /api/v1/teams/:id/games allows assistant collaborators to create game entries', async () => {
    ensureAuthenticated.mockImplementationOnce((req, res, next) => {
      req.authenticatedCoachId = 2;
      req.session.coachId = 2;
      next();
    });
    const gameSave = jest.fn().mockResolvedValue({ id: 91 });
    const playerStatSave = jest.fn().mockResolvedValue({ id: 92 });

    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 50,
        coach: [
          { id: 1, _pivot_role: 'owner' },
          { id: 2, _pivot_role: 'assistant' }
        ],
        players: [
          { id: 1 }
        ]
      })
    });
    mockStatCatalogFetch.mockResolvedValue({ id: 1 });
    mockGameForge.mockReturnValue({
      save: gameSave
    });
    mockPlayerStatForge.mockReturnValue({
      save: playerStatSave
    });

    const response = await withTrustedOrigin(request(app)
      .post('/api/v1/teams/50/games'))
      .send({
        opponent: 'Bears',
        game_date: '2026-04-01T00:00:00Z',
        playerStats: [
          {
            playerId: 1,
            stats: [
              { statCatalogId: 1, howMany: 2 }
            ]
          }
        ]
      })
      .expect(201);

    expect(response.body).toEqual({
      id: 91,
      team_id: 50,
      opponent: 'Bears',
      game_date: '2026-04-01T00:00:00.000Z',
      insertedStatRows: 1
    });
  });

  it('POST /api/v1/teams/:id/games rejects requests with an invalid game date', async () => {
    const response = await withTrustedOrigin(request(app)
      .post('/api/v1/teams/50/games'))
      .send({
        opponent: 'Lions',
        game_date: 'not-a-date',
        playerStats: [
          {
            playerId: 1,
            stats: [
              { statCatalogId: 1, howMany: 3 }
            ]
          }
        ]
      })
      .expect(400);

    expect(response.body).toEqual({
      error: 'Sorry your game_date is invalid please try again'
    });
    expect(Team.where).not.toHaveBeenCalled();
    expect(Bookshelf.transaction).not.toHaveBeenCalled();
  });

  it('POST /api/v1/teams/:id/games rejects requests for players outside the team roster', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 50,
        coach: [
          { id: 1 }
        ],
        players: [
          { id: 1 }
        ]
      })
    });

    const response = await withTrustedOrigin(request(app)
      .post('/api/v1/teams/50/games'))
      .send({
        opponent: 'Lions',
        game_date: '2026-03-28T00:00:00Z',
        playerStats: [
          {
            playerId: 999,
            stats: [
              { statCatalogId: 1, howMany: 3 }
            ]
          }
        ]
      })
      .expect(400);

    expect(response.body).toEqual({
      error: 'Sorry your playerId is invalid please try again'
    });
    expect(Stat_Catalog.where).not.toHaveBeenCalled();
    expect(Bookshelf.transaction).not.toHaveBeenCalled();
  });

  it('POST /api/v1/teams/:id/games rejects requests with an unknown stat catalog id', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 50,
        coach: [
          { id: 1 }
        ],
        players: [
          { id: 1 }
        ]
      })
    });
    mockStatCatalogFetch.mockResolvedValue(null);

    const response = await withTrustedOrigin(request(app)
      .post('/api/v1/teams/50/games'))
      .send({
        opponent: 'Lions',
        game_date: '2026-03-28T00:00:00Z',
        playerStats: [
          {
            playerId: 1,
            stats: [
              { statCatalogId: 999, howMany: 3 }
            ]
          }
        ]
      })
      .expect(400);

    expect(response.body).toEqual({
      error: 'Sorry your statCatalogId is invalid please try again'
    });
    expect(Bookshelf.transaction).not.toHaveBeenCalled();
  });

  it('POST /api/v1/teams/:id/games rejects unauthenticated requests', async () => {
    ensureAuthenticated.mockImplementationOnce((req, res) => res.status(401).send('Unauthorized'));

    const response = await withTrustedOrigin(request(app)
      .post('/api/v1/teams/50/games'))
      .send({
        opponent: 'Lions',
        game_date: '2026-03-28T00:00:00Z',
        playerStats: [
          {
            playerId: 1,
            stats: [
              { statCatalogId: 1, howMany: 3 }
            ]
          }
        ]
      })
      .expect(401);

    expect(response.text).toBe('Unauthorized');
    expect(Team.where).not.toHaveBeenCalled();
    expect(Bookshelf.transaction).not.toHaveBeenCalled();
  });

  it('POST /api/v1/teams/:id/games rejects requests with an invalid opponent', async () => {
    const response = await withTrustedOrigin(request(app)
      .post('/api/v1/teams/50/games'))
      .send({
        opponent: '   ',
        game_date: '2026-03-28T00:00:00Z',
        playerStats: [
          {
            playerId: 1,
            stats: [
              { statCatalogId: 1, howMany: 3 }
            ]
          }
        ]
      })
      .expect(400);

    expect(response.body).toEqual({
      error: 'Sorry your opponent is invalid please try again'
    });
    expect(Team.where).not.toHaveBeenCalled();
    expect(Bookshelf.transaction).not.toHaveBeenCalled();
  });

  it('POST /api/v1/teams/:id/games rejects requests with negative stat values', async () => {
    const response = await withTrustedOrigin(request(app)
      .post('/api/v1/teams/50/games'))
      .send({
        opponent: 'Lions',
        game_date: '2026-03-28T00:00:00Z',
        playerStats: [
          {
            playerId: 1,
            stats: [
              { statCatalogId: 1, howMany: -1 }
            ]
          }
        ]
      })
      .expect(400);

    expect(response.body).toEqual({
      error: 'Sorry your playerStats are invalid please try again'
    });
    expect(Team.where).not.toHaveBeenCalled();
    expect(Bookshelf.transaction).not.toHaveBeenCalled();
  });

  it('POST /api/v1/teams/:id/games rejects requests with only zero-valued stat rows', async () => {
    const response = await withTrustedOrigin(request(app)
      .post('/api/v1/teams/50/games'))
      .send({
        opponent: 'Lions',
        game_date: '2026-03-28T00:00:00Z',
        playerStats: [
          {
            playerId: 1,
            stats: [
              { statCatalogId: 1, howMany: 0 },
              { statCatalogId: 2, howMany: 0 }
            ]
          }
        ]
      })
      .expect(400);

    expect(response.body).toEqual({
      error: 'Sorry your playerStats are invalid please try again'
    });
    expect(Team.where).not.toHaveBeenCalled();
    expect(Bookshelf.transaction).not.toHaveBeenCalled();
  });

  it('POST /api/v1/teams/:id/games rejects requests for an unknown team id', async () => {
    mockTeamFetch.mockResolvedValue(null);

    const response = await withTrustedOrigin(request(app)
      .post('/api/v1/teams/999/games'))
      .send({
        opponent: 'Lions',
        game_date: '2026-03-28T00:00:00Z',
        playerStats: [
          {
            playerId: 1,
            stats: [
              { statCatalogId: 1, howMany: 3 }
            ]
          }
        ]
      })
      .expect(400);

    expect(response.body).toEqual({
      error: 'Sorry your teamId is invalid please try again'
    });
    expect(Stat_Catalog.where).not.toHaveBeenCalled();
    expect(Bookshelf.transaction).not.toHaveBeenCalled();
  });

  it('POST /api/v1/teams/:id/games rejects requests for a team outside the authenticated coach', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 50,
        coach: [
          { id: 2 }
        ],
        players: [
          { id: 1 }
        ]
      })
    });

    const response = await withTrustedOrigin(request(app)
      .post('/api/v1/teams/50/games'))
      .send({
        opponent: 'Lions',
        game_date: '2026-03-28T00:00:00Z',
        playerStats: [
          {
            playerId: 1,
            stats: [
              { statCatalogId: 1, howMany: 3 }
            ]
          }
        ]
      })
      .expect(403);

    expect(response.body).toEqual({
      error: 'Unauthorized'
    });
    expect(Stat_Catalog.where).not.toHaveBeenCalled();
    expect(Bookshelf.transaction).not.toHaveBeenCalled();
  });

  it('POST /api/v1/teams/:id/player rejects requests for a team outside the authenticated coach', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 50,
        coach: [
          { id: 2 }
        ]
      })
    });

    const response = await withTrustedOrigin(request(app)
      .post('/api/v1/teams/50/player'))
      .send({
        email: 'pat@example.com',
        first_name: 'Pat',
        last_name: 'Lee',
        position: 'Pitcher'
      })
      .expect(403);

    expect(response.body).toEqual({
      error: 'Unauthorized'
    });
  });

  it('POST /api/v1/teams/:id/player rejects unauthenticated requests', async () => {
    ensureAuthenticated.mockImplementationOnce((req, res) => res.status(401).send('Unauthorized'));

    const response = await withTrustedOrigin(request(app)
      .post('/api/v1/teams/50/player'))
      .send({
        email: 'pat@example.com',
        first_name: 'Pat',
        last_name: 'Lee',
        position: 'Pitcher'
      })
      .expect(401);

    expect(response.text).toBe('Unauthorized');
    expect(Team.where).not.toHaveBeenCalled();
    expect(Player.forge).not.toHaveBeenCalled();
  });

  it('GET /api/v1/teams/:id includes collaborators and the current coach role in the team detail payload', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 50,
        name: 'Highlanders',
        city: 'Bronx',
        state: 'NY',
        season: 2026,
        coach: [
          { id: 1, email: 'owner@example.com', first_name: 'Owner', last_name: 'Coach', _pivot_role: 'owner' },
          { id: 2, email: 'assistant@example.com', first_name: 'Assist', last_name: 'Coach', _pivot_role: 'assistant' }
        ],
        players: []
      })
    });
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        id: 1,
        teams: [
          { id: 50, name: 'Highlanders', season: 2026 },
          { id: 51, name: 'Highlanders', season: 2025 }
        ]
      })
    });

    const response = await request(app).get('/api/v1/teams/50').expect(200);

    expect(response.body.collaborators).toEqual([
      { id: 1, email: 'owner@example.com', first_name: 'Owner', last_name: 'Coach', role: 'owner' },
      { id: 2, email: 'assistant@example.com', first_name: 'Assist', last_name: 'Coach', role: 'assistant' }
    ]);
    expect(response.body.currentCoachRole).toBe('owner');
  });

  it('GET /api/v1/teams/:id returns currentCoachRole as assistant for assistant-authenticated coaches', async () => {
    ensureAuthenticated.mockImplementationOnce((req, res, next) => {
      req.authenticatedCoachId = 2;
      req.session.coachId = 2;
      next();
    });
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 50,
        name: 'Highlanders',
        city: 'Bronx',
        state: 'NY',
        season: 2026,
        coach: [
          { id: 1, email: 'owner@example.com', first_name: 'Owner', last_name: 'Coach', _pivot_role: 'owner' },
          { id: 2, email: 'assistant@example.com', first_name: 'Assist', last_name: 'Coach', _pivot_role: 'assistant' }
        ],
        players: []
      })
    });
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        id: 1,
        teams: [
          { id: 50, name: 'Highlanders', season: 2026 }
        ]
      })
    });

    const response = await request(app).get('/api/v1/teams/50').expect(200);

    expect(response.body.currentCoachRole).toBe('assistant');
  });

  it('GET /api/v1/teams/:id rejects team reads without a coach relationship', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 50,
        name: 'Highlanders',
        city: 'Bronx',
        state: 'NY',
        season: 2026,
        coach: [],
        players: []
      })
    });

    const response = await request(app).get('/api/v1/teams/50').expect(403);

    expect(response.body).toEqual({ error: 'Unauthorized' });
  });

  it('POST /api/v1/teams/:id/player allows assistant collaborators to add players', async () => {
    ensureAuthenticated.mockImplementationOnce((req, res, next) => {
      req.authenticatedCoachId = 2;
      req.session.coachId = 2;
      next();
    });
    const attach = jest.fn().mockResolvedValue(undefined);
    const savedPlayer = {
      id: 77,
      email: 'pat@example.com',
      first_name: 'Pat',
      last_name: 'Lee',
      position: 'Pitcher',
      teams: () => ({ attach })
    };

    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 50,
        coach: [
          { id: 1, _pivot_role: 'owner' },
          { id: 2, _pivot_role: 'assistant' }
        ]
      })
    });
    Player.forge.mockReturnValue({
      save: jest.fn().mockResolvedValue(savedPlayer)
    });

    const response = await withTrustedOrigin(request(app)
      .post('/api/v1/teams/50/player'))
      .send({
        email: 'pat@example.com',
        first_name: 'Pat',
        last_name: 'Lee',
        position: 'Pitcher'
      })
      .expect(200);

    expect(attach).toHaveBeenCalledWith('50');
    expect(response.body.id).toBe(77);
  });

  it('PUT /api/v1/players/:id allows assistant collaborators to update players', async () => {
    ensureAuthenticated.mockImplementationOnce((req, res, next) => {
      req.authenticatedCoachId = 2;
      req.session.coachId = 2;
      next();
    });
    const save = jest.fn().mockResolvedValue({
      id: 12,
      email: 'ace@example.com',
      first_name: 'Ace',
      last_name: 'Lee',
      position: 'Catcher'
    });

    Player.where.mockReturnValue({
      fetch: jest.fn().mockResolvedValue({
        toJSON: () => ({
          id: 12,
          teams: [
            {
              id: 50,
              coach: [{ id: 1, _pivot_role: 'owner' }, { id: 2, _pivot_role: 'assistant' }]
            }
          ]
        }),
        save
      })
    });

    const response = await withTrustedOrigin(request(app)
      .put('/api/v1/players/12'))
      .send({
        email: 'ace@example.com',
        first_name: 'Ace',
        last_name: 'Lee',
        position: 'Catcher'
      })
      .expect(200);

    expect(save).toHaveBeenCalledWith({
      email: 'ace@example.com',
      first_name: 'Ace',
      last_name: 'Lee',
      position: 'Catcher'
    });
    expect(response.body.position).toBe('Catcher');
  });

  it('POST /api/v1/players rejects missing required fields with a validation error payload', async () => {
    const response = await withTrustedOrigin(request(app)
      .post('/api/v1/players'))
      .send({
        first_name: 'Ace',
        last_name: 'Lee',
        position: 'Catcher'
      })
      .expect(400);

    expect(response.body).toEqual({
      error: 'Sorry your missing email please try again'
    });
    expect(Player.forge).not.toHaveBeenCalled();
  });

  it('PUT /api/v1/players/:id rejects missing required fields with a validation error payload', async () => {
    const response = await withTrustedOrigin(request(app)
      .put('/api/v1/players/12'))
      .send({
        email: 'ace@example.com',
        first_name: 'Ace',
        last_name: 'Lee'
      })
      .expect(400);

    expect(response.body).toEqual({
      error: 'Sorry your missing position please try again'
    });
    expect(Player.where).not.toHaveBeenCalled();
  });

  it('PUT /api/v1/players/:id rejects unauthenticated requests', async () => {
    ensureAuthenticated.mockImplementationOnce((req, res) => res.status(401).send('Unauthorized'));

    const response = await withTrustedOrigin(request(app)
      .put('/api/v1/players/12'))
      .send({
        email: 'ace@example.com',
        first_name: 'Ace',
        last_name: 'Lee',
        position: 'Catcher'
      })
      .expect(401);

    expect(response.text).toBe('Unauthorized');
    expect(Player.where).not.toHaveBeenCalled();
  });

  it('POST /api/v1/players/:player_id/stats/:stat_catalog_id allows assistant collaborators to create stats', async () => {
    ensureAuthenticated.mockImplementationOnce((req, res, next) => {
      req.authenticatedCoachId = 2;
      req.session.coachId = 2;
      next();
    });
    Player.where.mockReturnValue({
      fetch: jest.fn().mockResolvedValue({
        toJSON: () => ({
          id: 12,
          teams: [
            {
              id: 50,
              coach: [{ id: 1, _pivot_role: 'owner' }, { id: 2, _pivot_role: 'assistant' }]
            }
          ]
        })
      })
    });
    mockPlayerStatForge.mockReturnValue({
      save: jest.fn().mockResolvedValue({ id: 88, how_many: 3 })
    });

    const response = await withTrustedOrigin(request(app)
      .post('/api/v1/players/12/stats/5'))
      .send({
        how_many: 3
      })
      .expect(200);

    expect(PlayerStat.forge).toHaveBeenCalledWith({
      player_id: 12,
      stat_catalog_id: 5,
      how_many: 3
    });
    expect(response.body.id).toBe(88);
  });

  it('POST /api/v1/players/:player_id/stats/:stat_catalog_id rejects missing stat fields with a validation error payload', async () => {
    const response = await withTrustedOrigin(request(app)
      .post('/api/v1/players/12/stats/5'))
      .send({})
      .expect(400);

    expect(response.body).toEqual({
      error: 'Sorry your missing how_many please try again'
    });
    expect(Player.where).not.toHaveBeenCalled();
    expect(PlayerStat.forge).not.toHaveBeenCalled();
  });

  it('PUT /api/v1/players/:player_id/stats/:stat_catalog_id allows assistant collaborators to update stats', async () => {
    ensureAuthenticated.mockImplementationOnce((req, res, next) => {
      req.authenticatedCoachId = 2;
      req.session.coachId = 2;
      next();
    });
    const save = jest.fn().mockResolvedValue({ id: 89, how_many: 4 });

    Player.where.mockReturnValue({
      fetch: jest.fn().mockResolvedValue({
        toJSON: () => ({
          id: 12,
          teams: [
            {
              id: 50,
              coach: [{ id: 1, _pivot_role: 'owner' }, { id: 2, _pivot_role: 'assistant' }]
            }
          ]
        })
      })
    });
    mockPlayerStatFetch.mockResolvedValue({
      save
    });

    const response = await withTrustedOrigin(request(app)
      .put('/api/v1/players/12/stats/5'))
      .send({
        how_many: 4
      })
      .expect(200);

    expect(PlayerStat.where).toHaveBeenCalledWith({
      player_id: '12',
      stat_catalog_id: '5'
    });
    expect(save).toHaveBeenCalledWith({
      how_many: 4
    });
    expect(response.body.id).toBe(89);
  });

  it('PUT /api/v1/players/:player_id/stats/:stat_catalog_id rejects missing stat fields with a validation error payload', async () => {
    const response = await withTrustedOrigin(request(app)
      .put('/api/v1/players/12/stats/5'))
      .send({})
      .expect(400);

    expect(response.body).toEqual({
      error: 'Sorry your missing how_many please try again'
    });
    expect(Player.where).not.toHaveBeenCalled();
    expect(PlayerStat.where).not.toHaveBeenCalled();
  });

  it('DELETE /api/v1/players/:id allows assistant collaborators to delete players', async () => {
    ensureAuthenticated.mockImplementationOnce((req, res, next) => {
      req.authenticatedCoachId = 2;
      req.session.coachId = 2;
      next();
    });
    const destroy = jest.fn().mockResolvedValue(undefined);

    Player.where.mockReturnValue({
      fetch: jest.fn().mockResolvedValue({
        toJSON: () => ({
          id: 12,
          teams: [
            {
              id: 50,
              coach: [{ id: 1, _pivot_role: 'owner' }, { id: 2, _pivot_role: 'assistant' }]
            }
          ]
        }),
        destroy
      })
    });

    await withTrustedOrigin(request(app)
      .delete('/api/v1/players/12'))
      .expect(200);

    expect(destroy).toHaveBeenCalled();
  });

  it('DELETE /api/v1/players/:id returns a not-found error payload when the player does not exist', async () => {
    Player.where.mockReturnValue({
      fetch: jest.fn().mockResolvedValue(null)
    });

    const response = await withTrustedOrigin(request(app)
      .delete('/api/v1/players/999'))
      .expect(404);

    expect(response.body).toEqual({
      error: 'Player not found'
    });
  });
});
