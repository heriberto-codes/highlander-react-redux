/**
 * @jest-environment node
 */

const request = require('supertest');

process.env.NODE_ENV = 'development';
process.env.DATABASE_URL = 'postgresql://localhost/highlander-react-redux-test';
process.env.CLIENT_ORIGIN = 'http://localhost:3000';
process.env.SECRET = 'test-secret';

const mockFetch = jest.fn();
const mockTeamFetch = jest.fn();
const mockTeamForge = jest.fn();
const mockStatCatalogFetch = jest.fn();
const mockGameForge = jest.fn();
const mockPlayerStatForge = jest.fn();
const mockTransaction = jest.fn();

jest.mock('../api/models/Coach', () => ({
  where: jest.fn()
}));

jest.mock('../api/models/Team', () => ({
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
const Game = require('../api/models/Game');
const PlayerStat = require('../api/models/PlayerStat');
const Stat_Catalog = require('../api/models/Stat_Catalog');
const Bookshelf = require('../api/config/bookshelf.config');
const ensureAuthenticated = require('../api/middleware/ensureAuthenticated');

describe('server routes', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockTeamFetch.mockReset();
    mockTeamForge.mockReset();
    mockStatCatalogFetch.mockReset();
    mockGameForge.mockReset();
    mockPlayerStatForge.mockReset();
    mockTransaction.mockReset();
    Coach.where.mockReset();
    Team.where.mockReset();
    Team.forge.mockReset();
    Game.forge.mockReset();
    PlayerStat.forge.mockReset();
    Stat_Catalog.where.mockReset();
    Bookshelf.transaction.mockReset();
    ensureAuthenticated.mockReset();
    Coach.where.mockReturnValue({
      fetch: mockFetch
    });
    Team.where.mockReturnValue({
      fetch: mockTeamFetch
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
    ensureAuthenticated.mockImplementation((req, res, next) => next());
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
    const response = await request(app)
      .post('/teams')
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
    const response = await request(app)
      .post('/teams')
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

    const response = await request(app)
      .post('/teams')
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

  it('PUT /teams/:id rejects requests with an invalid season', async () => {
    const response = await request(app)
      .put('/teams/50')
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
    const response = await request(app)
      .put('/teams/50')
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
        save
      })
    });

    const response = await request(app)
      .put('/teams/50')
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

  it('POST /teams/:id/games creates a game and linked non-zero stat rows in one transaction', async () => {
    const gameSave = jest.fn().mockResolvedValue({ id: 90 });
    const playerStatSave = jest.fn().mockResolvedValue({ id: 91 });

    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 50,
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

    const response = await request(app)
      .post('/teams/50/games')
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
    const response = await request(app)
      .post('/teams/50/games')
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
        players: [
          { id: 1 }
        ]
      })
    });

    const response = await request(app)
      .post('/teams/50/games')
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
        players: [
          { id: 1 }
        ]
      })
    });
    mockStatCatalogFetch.mockResolvedValue(null);

    const response = await request(app)
      .post('/teams/50/games')
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

    const response = await request(app)
      .post('/teams/50/games')
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
    const response = await request(app)
      .post('/teams/50/games')
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
    const response = await request(app)
      .post('/teams/50/games')
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
    const response = await request(app)
      .post('/teams/50/games')
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

    const response = await request(app)
      .post('/teams/999/games')
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
});
