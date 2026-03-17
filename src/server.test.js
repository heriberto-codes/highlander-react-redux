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

jest.mock('../api/models/Coach', () => ({
  where: jest.fn()
}));

jest.mock('../api/models/Team', () => ({
  where: jest.fn()
}));

const { app } = require('../server');
const Coach = require('../api/models/Coach');
const Team = require('../api/models/Team');

describe('server routes', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockTeamFetch.mockReset();
    Coach.where.mockReset();
    Team.where.mockReset();
    Coach.where.mockReturnValue({
      fetch: mockFetch
    });
    Team.where.mockReturnValue({
      fetch: mockTeamFetch
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

  it('GET /teams/:id adds derived stats from related player stats', async () => {
    mockTeamFetch.mockResolvedValue({
      toJSON: () => ({
        id: 50,
        name: 'Highlander',
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

    const response = await request(app).get('/teams/50').expect(200);
    const player = response.body.players[0];

    expect(player.derivedStats).toEqual({
      battingAverage: 0.5,
      homeRunRate: 0.2,
      era: 4.5,
      strikeoutsPerInning: 1.5
    });
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
});
