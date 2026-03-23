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
const mockStatCatalogFetch = jest.fn();
const mockGameForge = jest.fn();
const mockPlayerStatForge = jest.fn();
const mockTransaction = jest.fn();

jest.mock('../api/models/Coach', () => ({
  where: jest.fn(),
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
const Stat_Catalog = require('../api/models/Stat_Catalog');
const Bookshelf = require('../api/config/bookshelf.config');
const ensureAuthenticated = require('../api/middleware/ensureAuthenticated');
const trustedOrigin = process.env.CLIENT_ORIGIN;

function withTrustedOrigin(testRequest) {
  return testRequest.set('Origin', trustedOrigin);
}

describe('server routes', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockPlayerFetchAll.mockReset();
    mockTeamFetch.mockReset();
    mockTeamForge.mockReset();
    mockStatCatalogFetch.mockReset();
    mockGameForge.mockReset();
    mockPlayerStatForge.mockReset();
    mockTransaction.mockReset();
    Coach.where.mockReset();
    Coach.validatePassword.mockReset();
    Team.where.mockReset();
    Player.fetchAll.mockReset();
    Player.where.mockReset();
    Team.forge.mockReset();
    Game.forge.mockReset();
    PlayerStat.forge.mockReset();
    Stat_Catalog.where.mockReset();
    Bookshelf.transaction.mockReset();
    ensureAuthenticated.mockReset();
    Coach.where.mockReturnValue({
      fetch: mockFetch
    });
    Coach.validatePassword.mockResolvedValue(true);
    Team.where.mockReturnValue({
      fetch: mockTeamFetch
    });
    Player.fetchAll.mockImplementation(mockPlayerFetchAll);
    Player.where.mockReturnValue({
      fetch: mockFetch
    });
    Team.forge.mockImplementation(mockTeamForge);
    Stat_Catalog.where.mockReturnValue({
      fetch: mockStatCatalogFetch
    });
    Game.forge.mockImplementation(mockGameForge);
    PlayerStat.forge.mockImplementation(mockPlayerStatForge);
    Bookshelf.transaction.mockImplementation(function(callback) {
      return callback(mockTransaction);
    });
    ensureAuthenticated.mockImplementation((req, res, next) => {
      const authenticatedCoachId = req.path.indexOf('/coaches/') === 0
        ? Number(req.params.id)
        : 1;
      req.authenticatedCoachId = authenticatedCoachId;
      req.session.coachId = authenticatedCoachId;
      next();
    });
  });

  it('GET /coaches/:id adds derived stats from related player stats and sums duplicate rows', async () => {
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

    const response = await request(app).get('/coaches/10').expect(200);
    const player = response.body.teams[0].players[0];

    expect(player.derivedStats).toEqual({
      battingAverage: 0.5,
      homeRunRate: 0.25,
      era: 4.5,
      strikeoutsPerInning: 1.25
    });
  });

  it('GET /coaches/:id rejects access to another coach profile', async () => {
    ensureAuthenticated.mockImplementationOnce((req, res, next) => {
      req.authenticatedCoachId = 999;
      req.session.coachId = 999;
      next();
    });

    const response = await request(app).get('/coaches/10').expect(403);

    expect(response.text).toBe('Unauthorized');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('GET /coaches returns only the authenticated coach', async () => {
    mockFetch.mockResolvedValue({
      toJSON: () => ({
        id: 1,
        first_name: 'Test',
        last_name: 'Coach'
      })
    });

    const response = await request(app).get('/coaches').expect(200);

    expect(Coach.where).toHaveBeenCalledWith({ id: 1 });
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toBe(1);
  });

  it('GET /players returns only players owned by the authenticated coach', async () => {
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

    const response = await request(app).get('/players').expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toBe(10);
    expect(response.body[0].teams).toBeUndefined();
  });

  it('GET /players/:id rejects access to a player outside the authenticated coach', async () => {
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

    const response = await request(app).get('/players/12').expect(403);

    expect(response.text).toBe('Unauthorized');
  });

  it('GET /players/:id/stats rejects access to player stats outside the authenticated coach', async () => {
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

    const response = await request(app).get('/players/13/stats').expect(403);

    expect(response.text).toBe('Unauthorized');
  });

  it('POST /sessions/login rejects requests from an untrusted origin', async () => {
    const response = await request(app)
      .post('/sessions/login')
      .set('Origin', 'http://malicious.example')
      .send({
        email: 'coach@example.com',
        pwd: 'secret'
      })
      .expect(403);

    expect(response.text).toBe('Invalid request origin');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('POST /sessions/login rate limits repeated invalid credentials', async () => {
    Coach.validatePassword.mockResolvedValue(false);
    mockFetch.mockResolvedValue({
      id: 1,
      get: jest.fn(() => 'hashed-password')
    });

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await withTrustedOrigin(request(app)
        .post('/sessions/login'))
        .send({
          email: 'coach@example.com',
          pwd: 'wrong-password'
        })
        .expect(401);
    }

    const response = await withTrustedOrigin(request(app)
      .post('/sessions/login'))
      .send({
        email: 'coach@example.com',
        pwd: 'wrong-password'
      })
      .expect(429);

    expect(response.body).toBe('Too many login attempts, please try again later');
  });

  it('GET /coaches/:id returns null derived stats when denominators are missing or zero', async () => {
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

    const response = await request(app).get('/coaches/11').expect(200);
    const player = response.body.teams[0].players[0];

    expect(player.derivedStats).toEqual({
      battingAverage: null,
      homeRunRate: null,
      era: null,
      strikeoutsPerInning: null
    });
  });

  it('GET /coaches/:id defaults to the latest available season and returns season metadata', async () => {
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

    const response = await request(app).get('/coaches/12').expect(200);

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

  it('GET /coaches/:id filters teams and stats to the requested season', async () => {
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

    const response = await request(app).get('/coaches/13?season=2025').expect(200);

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

  it('GET /coaches/:id filters teams by teamSearch', async () => {
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

    const response = await request(app).get('/coaches/130?teamSearch=war').expect(200);

    expect(response.body.availableSeasons).toEqual([2026]);
    expect(response.body.activeSeason).toBe(2026);
    expect(response.body.teams).toHaveLength(1);
    expect(response.body.teams[0].id).toBe(241);
  });

  it('GET /coaches/:id filters players by playerSearch across filtered teams', async () => {
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

    const response = await request(app).get('/coaches/131?playerSearch=slug').expect(200);

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

  it('GET /coaches/:id filters players by position across filtered teams', async () => {
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

    const response = await request(app).get('/coaches/132?position=pitch').expect(200);

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

  it('GET /coaches/:id returns 200 with empty players for a valid no-match player filter', async () => {
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

    const response = await request(app).get('/coaches/133?playerSearch=nomatch').expect(200);

    expect(response.body.availableSeasons).toEqual([2026]);
    expect(response.body.activeSeason).toBe(2026);
    expect(response.body.teams).toHaveLength(1);
    expect(response.body.teams[0].players).toEqual([]);
  });

  it('GET /coaches/:id applies combined season and teamSearch filters', async () => {
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

    const response = await request(app).get('/coaches/134?season=2025&teamSearch=war').expect(200);

    expect(response.body.availableSeasons).toEqual([2026, 2025]);
    expect(response.body.activeSeason).toBe(2025);
    expect(response.body.teams).toHaveLength(1);
    expect(response.body.teams[0].id).toBe(245);
  });

  it('GET /coaches/:id applies combined season and playerSearch filters', async () => {
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

    const response = await request(app).get('/coaches/135?season=2025&playerSearch=slug').expect(200);

    expect(response.body.availableSeasons).toEqual([2026, 2025]);
    expect(response.body.activeSeason).toBe(2025);
    expect(response.body.teams).toHaveLength(1);
    expect(response.body.teams[0].id).toBe(248);
    expect(response.body.teams[0].players).toHaveLength(1);
    expect(response.body.teams[0].players[0].id).toBe(345);
  });

  it('GET /coaches/:id returns 200 with empty teams for a valid no-match teamSearch', async () => {
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

    const response = await request(app).get('/coaches/136?teamSearch=nomatch').expect(200);

    expect(response.body.availableSeasons).toEqual([2026]);
    expect(response.body.activeSeason).toBe(2026);
    expect(response.body.teams).toEqual([]);
  });

  it('GET /coaches/:id rejects an invalid season query', async () => {
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

    const response = await request(app).get('/coaches/14?season=summer').expect(400);

    expect(response.text).toBe('Sorry your season is invalid please try again');
  });

  it('GET /coaches/:id rejects an invalid teamSearch query', async () => {
    const response = await request(app)
      .get(`/coaches/14?teamSearch=${'x'.repeat(101)}`)
      .expect(400);

    expect(response.text).toBe('Sorry your teamSearch is invalid please try again');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('GET /coaches/:id rejects an invalid position query', async () => {
    const response = await request(app)
      .get(`/coaches/14?position=${'x'.repeat(101)}`)
      .expect(400);

    expect(response.text).toBe('Sorry your position is invalid please try again');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('GET /coaches/:id ignores a whitespace-only teamSearch query', async () => {
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

    const response = await request(app).get('/coaches/15?teamSearch=%20%20%20').expect(200);

    expect(response.body.teams).toHaveLength(1);
    expect(response.body.teams[0].id).toBe(27);
  });

  it('GET /coaches/:id ignores a whitespace-only playerSearch query', async () => {
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

    const response = await request(app).get('/coaches/16?playerSearch=%20%20').expect(200);

    expect(response.body.teams).toHaveLength(1);
    expect(response.body.teams[0].players).toHaveLength(1);
    expect(response.body.teams[0].players[0].id).toBe(36);
  });

  it('GET /coaches/:id ignores a whitespace-only position query', async () => {
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

    const response = await request(app).get('/coaches/17?position=%20%20').expect(200);

    expect(response.body.teams).toHaveLength(1);
    expect(response.body.teams[0].players).toHaveLength(1);
    expect(response.body.teams[0].players[0].id).toBe(37);
  });

  it('GET /teams/:id adds derived stats from related player stats', async () => {
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
              { description: 'Hits', _pivot_how_many: 5, _pivot_game_id: 300 },
              { description: 'At Bats', _pivot_how_many: 10, _pivot_game_id: 300 },
              { description: 'Home Runs', _pivot_how_many: 2, _pivot_game_id: 300 },
              { description: 'Earned Runs', _pivot_how_many: 3, _pivot_game_id: 300 },
              { description: 'Innings Pitched', _pivot_how_many: 6, _pivot_game_id: 300 },
              { description: 'Strikeouts', _pivot_how_many: 9, _pivot_game_id: 300 }
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

    const response = await request(app).get('/teams/50').expect(200);
    const player = response.body.players[0];

    expect(player.derivedStats).toEqual({
      battingAverage: 0.5,
      homeRunRate: 0.2,
      era: 4.5,
      strikeoutsPerInning: 1.5
    });
  });

  it('GET /teams/:id defaults to the latest same-name season and returns season metadata', async () => {
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

    const response = await request(app).get('/teams/53').expect(200);

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

  it('GET /teams/:id filters player stats to the requested season and same-name family', async () => {
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

    const response = await request(app).get('/teams/56?season=2025').expect(200);

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

  it('GET /teams/:id filters players by playerSearch', async () => {
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

    const response = await request(app).get('/teams/560?playerSearch=slug').expect(200);

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

  it('GET /teams/:id rejects access to a team outside the authenticated coach', async () => {
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

    const response = await request(app).get('/teams/569').expect(403);

    expect(response.text).toBe('Unauthorized');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('GET /teams/:id filters players by position', async () => {
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

    const response = await request(app).get('/teams/561?position=pitch').expect(200);

    expect(response.body.players).toHaveLength(1);
    expect(response.body.players[0].id).toBe(642);
    expect(response.body.players[0].derivedStats).toEqual({
      battingAverage: null,
      homeRunRate: null,
      era: null,
      strikeoutsPerInning: 2
    });
  });

  it('GET /teams/:id returns 200 with empty players for a valid no-match player filter', async () => {
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

    const response = await request(app).get('/teams/562?playerSearch=nomatch').expect(200);

    expect(response.body.availableSeasons).toEqual([2026]);
    expect(response.body.activeSeason).toBe(2026);
    expect(response.body.players).toEqual([]);
  });

  it('GET /teams/:id applies combined season and playerSearch filters', async () => {
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

    const response = await request(app).get('/teams/563?season=2025&playerSearch=slug').expect(200);

    expect(response.body.availableSeasons).toEqual([2026, 2025]);
    expect(response.body.activeSeason).toBe(2025);
    expect(response.body.players).toHaveLength(1);
    expect(response.body.players[0].id).toBe(645);
    expect(response.body.players[0].stats).toEqual([
      { description: 'Hits', _pivot_how_many: 3, _pivot_game_date: '2025-05-10T00:00:00Z' },
      { description: 'At Bats', _pivot_how_many: 6, _pivot_game_date: '2025-05-10T00:00:00Z' }
    ]);
  });

  it('GET /teams/:id applies combined season and position filters', async () => {
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

    const response = await request(app).get('/teams/565?season=2025&position=pitch').expect(200);

    expect(response.body.availableSeasons).toEqual([2026, 2025]);
    expect(response.body.activeSeason).toBe(2025);
    expect(response.body.players).toHaveLength(1);
    expect(response.body.players[0].id).toBe(647);
    expect(response.body.players[0].stats).toEqual([
      { description: 'Strikeouts', _pivot_how_many: 6, _pivot_game_date: '2025-05-10T00:00:00Z' },
      { description: 'Innings Pitched', _pivot_how_many: 3, _pivot_game_date: '2025-05-10T00:00:00Z' }
    ]);
  });

  it('GET /teams/:id preserves availableSeasons and activeSeason for valid no-match combined filters', async () => {
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

    const response = await request(app).get('/teams/567?season=2025&playerSearch=slug').expect(200);

    expect(response.body.availableSeasons).toEqual([2026, 2025]);
    expect(response.body.activeSeason).toBe(2025);
    expect(response.body.players).toEqual([]);
  });

  it('GET /teams/:id applies combined playerSearch and position filters', async () => {
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

    const response = await request(app).get('/teams/568?playerSearch=slug&position=pitch').expect(200);

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

  it('GET /teams/:id rejects an invalid season query', async () => {
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

    const response = await request(app).get('/teams/59?season=fall').expect(400);

    expect(response.text).toBe('Sorry your season is invalid please try again');
  });

  it('GET /teams/:id rejects an invalid playerSearch query', async () => {
    const response = await request(app)
      .get(`/teams/59?playerSearch=${'x'.repeat(101)}`)
      .expect(400);

    expect(response.text).toBe('Sorry your playerSearch is invalid please try again');
    expect(mockTeamFetch).not.toHaveBeenCalled();
  });

  it('GET /teams/:id rejects an invalid position query', async () => {
    const response = await request(app)
      .get(`/teams/59?position=${'x'.repeat(101)}`)
      .expect(400);

    expect(response.text).toBe('Sorry your position is invalid please try again');
    expect(mockTeamFetch).not.toHaveBeenCalled();
  });

  it('GET /teams/:id ignores a whitespace-only playerSearch query', async () => {
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

    const response = await request(app).get('/teams/65?playerSearch=%20%20').expect(200);

    expect(response.body.players).toHaveLength(1);
    expect(response.body.players[0].id).toBe(66);
  });

  it('GET /teams/:id ignores a whitespace-only position query', async () => {
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

    const response = await request(app).get('/teams/67?position=%20%20').expect(200);

    expect(response.body.players).toHaveLength(1);
    expect(response.body.players[0].id).toBe(68);
  });

  it('GET /teams/:id returns null derived stats when denominators are missing or zero', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 51,
        name: 'Highlander',
        players: [
          {
            id: 61,
            first_name: 'Utility',
            stats: [
              { description: 'Hits', _pivot_how_many: 2 },
              { description: 'At Bats', _pivot_how_many: 0 },
              { description: 'Home Runs', _pivot_how_many: 1 }
            ]
          }
        ]
      })
    });

    const response = await request(app).get('/teams/51').expect(200);
    const player = response.body.players[0];

    expect(player.derivedStats).toEqual({
      battingAverage: null,
      homeRunRate: null,
      era: null,
      strikeoutsPerInning: null
    });
  });

  it('GET /teams/:id sums duplicate stat rows before computing derived stats', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 52,
        name: 'Highlander',
        players: [
          {
            id: 62,
            first_name: 'Closer',
            stats: [
              { description: 'Earned Runs', _pivot_how_many: 1 },
              { description: 'Earned Runs', _pivot_how_many: 2 },
              { description: 'Innings Pitched', _pivot_how_many: 3 },
              { description: 'Innings Pitched', _pivot_how_many: 3 },
              { description: 'Strikeouts', _pivot_how_many: 4 },
              { description: 'Strikeouts', _pivot_how_many: 2 }
            ]
          }
        ]
      })
    });

    const response = await request(app).get('/teams/52').expect(200);
    const player = response.body.players[0];

    expect(player.derivedStats).toEqual({
      battingAverage: null,
      homeRunRate: null,
      era: 4.5,
      strikeoutsPerInning: 1
    });
  });

  it('POST /teams rejects requests with an invalid season', async () => {
    const response = await withTrustedOrigin(request(app)
      .post('/teams'))
      .send({
        name: 'Highlanders',
        city: 'Bronx',
        state: 'NY',
        coachId: 1,
        season: 'spring'
      })
      .expect(400);

    expect(response.text).toBe('Sorry your season is invalid please try again');
    expect(Coach.where).not.toHaveBeenCalled();
    expect(Team.forge).not.toHaveBeenCalled();
  });

  it('POST /teams rejects requests with a missing season', async () => {
    const response = await withTrustedOrigin(request(app)
      .post('/teams'))
      .send({
        name: 'Highlanders',
        city: 'Bronx',
        state: 'NY',
        coachId: 1
      })
      .expect(400);

    expect(response.text).toBe('Sorry your missing season please try again');
    expect(Coach.where).not.toHaveBeenCalled();
    expect(Team.forge).not.toHaveBeenCalled();
  });

  it('POST /teams persists a validated season', async () => {
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
      .post('/teams'))
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
    expect(attach).toHaveBeenCalledWith(1);
    expect(response.body.season).toBe(2026);
  });

  it('POST /teams rejects requests from an untrusted origin', async () => {
    const response = await request(app)
      .post('/teams')
      .set('Origin', 'http://malicious.example')
      .send({
        name: 'Highlanders',
        city: 'Bronx',
        state: 'NY',
        coachId: 1,
        season: '2026'
      })
      .expect(403);

    expect(response.text).toBe('Invalid request origin');
    expect(Coach.where).not.toHaveBeenCalled();
    expect(Team.forge).not.toHaveBeenCalled();
  });

  it('POST /teams rejects requests for another coach', async () => {
    const response = await withTrustedOrigin(request(app)
      .post('/teams'))
      .send({
        name: 'Highlanders',
        city: 'Bronx',
        state: 'NY',
        coachId: 2,
        season: '2026'
      })
      .expect(403);

    expect(response.text).toBe('Unauthorized');
    expect(Coach.where).not.toHaveBeenCalled();
    expect(Team.forge).not.toHaveBeenCalled();
  });

  it('PUT /teams/:id rejects requests with an invalid season', async () => {
    const response = await withTrustedOrigin(request(app)
      .put('/teams/50'))
      .send({
        name: 'Highlanders',
        city: 'Bronx',
        state: 'NY',
        season: 'summer'
      })
      .expect(400);

    expect(response.text).toBe('Sorry your season is invalid please try again');
    expect(Team.where).not.toHaveBeenCalled();
  });

  it('PUT /teams/:id rejects requests with a missing season', async () => {
    const response = await withTrustedOrigin(request(app)
      .put('/teams/50'))
      .send({
        name: 'Highlanders',
        city: 'Bronx',
        state: 'NY'
      })
      .expect(400);

    expect(response.text).toBe('Sorry your missing season please try again');
    expect(Team.where).not.toHaveBeenCalled();
  });

  it('PUT /teams/:id persists a validated season', async () => {
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
      .put('/teams/50'))
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

  it('PUT /teams/:id rejects updates for a team outside the authenticated coach', async () => {
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
      .put('/teams/50'))
      .send({
        name: 'Highlanders',
        city: 'Bronx',
        state: 'NY',
        season: '2027'
      })
      .expect(403);

    expect(response.text).toBe('Unauthorized');
    expect(save).not.toHaveBeenCalled();
  });

  it('POST /teams/:id/games creates a game and linked non-zero stat rows in one transaction', async () => {
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
      .post('/teams/50/games'))
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

  it('POST /teams/:id/games rejects requests with an invalid game date', async () => {
    const response = await withTrustedOrigin(request(app)
      .post('/teams/50/games'))
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

    expect(response.text).toBe('Sorry your game_date is invalid please try again');
    expect(Team.where).not.toHaveBeenCalled();
    expect(Bookshelf.transaction).not.toHaveBeenCalled();
  });

  it('POST /teams/:id/games rejects requests for players outside the team roster', async () => {
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
      .post('/teams/50/games'))
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

    expect(response.text).toBe('Sorry your playerId is invalid please try again');
    expect(Stat_Catalog.where).not.toHaveBeenCalled();
    expect(Bookshelf.transaction).not.toHaveBeenCalled();
  });

  it('POST /teams/:id/games rejects requests with an unknown stat catalog id', async () => {
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
      .post('/teams/50/games'))
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

    expect(response.text).toBe('Sorry your statCatalogId is invalid please try again');
    expect(Bookshelf.transaction).not.toHaveBeenCalled();
  });

  it('POST /teams/:id/games rejects unauthenticated requests', async () => {
    ensureAuthenticated.mockImplementationOnce((req, res) => res.status(401).send('Unauthorized'));

    const response = await withTrustedOrigin(request(app)
      .post('/teams/50/games'))
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

  it('POST /teams/:id/games rejects requests with an invalid opponent', async () => {
    const response = await withTrustedOrigin(request(app)
      .post('/teams/50/games'))
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

    expect(response.text).toBe('Sorry your opponent is invalid please try again');
    expect(Team.where).not.toHaveBeenCalled();
    expect(Bookshelf.transaction).not.toHaveBeenCalled();
  });

  it('POST /teams/:id/games rejects requests with negative stat values', async () => {
    const response = await withTrustedOrigin(request(app)
      .post('/teams/50/games'))
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

    expect(response.text).toBe('Sorry your playerStats are invalid please try again');
    expect(Team.where).not.toHaveBeenCalled();
    expect(Bookshelf.transaction).not.toHaveBeenCalled();
  });

  it('POST /teams/:id/games rejects requests with only zero-valued stat rows', async () => {
    const response = await withTrustedOrigin(request(app)
      .post('/teams/50/games'))
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

    expect(response.text).toBe('Sorry your playerStats are invalid please try again');
    expect(Team.where).not.toHaveBeenCalled();
    expect(Bookshelf.transaction).not.toHaveBeenCalled();
  });

  it('POST /teams/:id/games rejects requests for an unknown team id', async () => {
    mockTeamFetch.mockResolvedValue(null);

    const response = await withTrustedOrigin(request(app)
      .post('/teams/999/games'))
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

    expect(response.text).toBe('Sorry your teamId is invalid please try again');
    expect(Stat_Catalog.where).not.toHaveBeenCalled();
    expect(Bookshelf.transaction).not.toHaveBeenCalled();
  });

  it('POST /teams/:id/games rejects requests for a team outside the authenticated coach', async () => {
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
      .post('/teams/50/games'))
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

    expect(response.text).toBe('Unauthorized');
    expect(Stat_Catalog.where).not.toHaveBeenCalled();
    expect(Bookshelf.transaction).not.toHaveBeenCalled();
  });

  it('POST /teams/:id/player rejects requests for a team outside the authenticated coach', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 50,
        coach: [
          { id: 2 }
        ]
      })
    });

    const response = await withTrustedOrigin(request(app)
      .post('/teams/50/player'))
      .send({
        email: 'pat@example.com',
        first_name: 'Pat',
        last_name: 'Lee',
        position: 'Pitcher'
      })
      .expect(403);

    expect(response.text).toBe('Unauthorized');
  });
});
