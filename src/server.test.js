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

jest.mock('../api/models/Coach', () => ({
  where: jest.fn()
}));

jest.mock('../api/models/Team', () => ({
  where: jest.fn(),
  forge: jest.fn()
}));

jest.mock('../api/middleware/ensureAuthenticated', () => (req, res, next) => next());

const { app } = require('../server');
const Coach = require('../api/models/Coach');
const Team = require('../api/models/Team');

describe('server routes', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockTeamFetch.mockReset();
    mockTeamForge.mockReset();
    Coach.where.mockReset();
    Team.where.mockReset();
    Team.forge.mockReset();
    Coach.where.mockReturnValue({
      fetch: mockFetch
    });
    Team.where.mockReturnValue({
      fetch: mockTeamFetch
    });
    Team.forge.mockImplementation(mockTeamForge);
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
                  { description: 'Hits', _pivot_how_many: 4 },
                  { description: 'Hits', _pivot_how_many: 2 },
                  { description: 'At Bats', _pivot_how_many: 7 },
                  { description: 'At Bats', _pivot_how_many: 5 },
                  { description: 'Home Runs', _pivot_how_many: 3 },
                  { description: 'Earned Runs', _pivot_how_many: 4 },
                  { description: 'Innings Pitched', _pivot_how_many: 8 },
                  { description: 'Strikeouts', _pivot_how_many: 10 }
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
                  { description: 'Hits', _pivot_how_many: 2, _pivot_game_date: '2025-04-10T00:00:00Z' },
                  { description: 'At Bats', _pivot_how_many: 4, _pivot_game_date: '2025-04-10T00:00:00Z' }
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
                  { description: 'Hits', _pivot_how_many: 3, _pivot_game_date: '2026-05-10T00:00:00Z' },
                  { description: 'At Bats', _pivot_how_many: 6, _pivot_game_date: '2026-05-10T00:00:00Z' },
                  { description: 'Hits', _pivot_how_many: 9, _pivot_game_date: '2025-05-10T00:00:00Z' },
                  { description: 'At Bats', _pivot_how_many: 9, _pivot_game_date: '2025-05-10T00:00:00Z' }
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
      { description: 'Hits', _pivot_how_many: 3, _pivot_game_date: '2026-05-10T00:00:00Z' },
      { description: 'At Bats', _pivot_how_many: 6, _pivot_game_date: '2026-05-10T00:00:00Z' }
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
              { description: 'Hits', _pivot_how_many: 5 },
              { description: 'At Bats', _pivot_how_many: 10 },
              { description: 'Home Runs', _pivot_how_many: 2 },
              { description: 'Earned Runs', _pivot_how_many: 3 },
              { description: 'Innings Pitched', _pivot_how_many: 6 },
              { description: 'Strikeouts', _pivot_how_many: 9 }
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
              { description: 'Hits', _pivot_how_many: 4, _pivot_game_date: '2026-04-10T00:00:00Z' },
              { description: 'At Bats', _pivot_how_many: 8, _pivot_game_date: '2026-04-10T00:00:00Z' },
              { description: 'Hits', _pivot_how_many: 9, _pivot_game_date: '2025-04-10T00:00:00Z' },
              { description: 'At Bats', _pivot_how_many: 9, _pivot_game_date: '2025-04-10T00:00:00Z' }
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
      { description: 'Hits', _pivot_how_many: 4, _pivot_game_date: '2026-04-10T00:00:00Z' },
      { description: 'At Bats', _pivot_how_many: 8, _pivot_game_date: '2026-04-10T00:00:00Z' }
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
});
