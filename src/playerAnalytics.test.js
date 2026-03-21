const {
  filterStatsBySeason,
  addDerivedStatsToPlayers,
  buildDerivedStats
} = require('../api/utils/playerAnalytics');

describe('playerAnalytics season helpers', () => {
  it('filterStatsBySeason keeps only stats from the requested year', () => {
    const stats = [
      { description: 'Hits', _pivot_how_many: 3, _pivot_game_date: '2025-03-10T00:00:00Z' },
      { description: 'At Bats', _pivot_how_many: 7, _pivot_game_date: '2025-03-10T00:00:00Z' },
      { description: 'Home Runs', _pivot_how_many: 2, _pivot_game_date: '2026-04-12T00:00:00Z' }
    ];

    expect(filterStatsBySeason(stats, 2025)).toEqual([
      { description: 'Hits', _pivot_how_many: 3, _pivot_game_date: '2025-03-10T00:00:00Z' },
      { description: 'At Bats', _pivot_how_many: 7, _pivot_game_date: '2025-03-10T00:00:00Z' }
    ]);
  });

  it('filterStatsBySeason excludes stats with missing or invalid dates when a season is requested', () => {
    const stats = [
      { description: 'Hits', _pivot_how_many: 3 },
      { description: 'At Bats', _pivot_how_many: 7, _pivot_game_date: 'not-a-date' },
      { description: 'Home Runs', _pivot_how_many: 1, _pivot_game_date: '2026-04-12T00:00:00Z' }
    ];

    expect(filterStatsBySeason(stats, 2026)).toEqual([
      { description: 'Home Runs', _pivot_how_many: 1, _pivot_game_date: '2026-04-12T00:00:00Z' }
    ]);
  });

  it('buildDerivedStats uses only stats from the requested season', () => {
    const player = {
      stats: [
        { description: 'Hits', _pivot_how_many: 2, _pivot_game_date: '2025-03-10T00:00:00Z' },
        { description: 'At Bats', _pivot_how_many: 4, _pivot_game_date: '2025-03-10T00:00:00Z' },
        { description: 'Hits', _pivot_how_many: 5, _pivot_game_date: '2026-03-10T00:00:00Z' },
        { description: 'At Bats', _pivot_how_many: 10, _pivot_game_date: '2026-03-10T00:00:00Z' },
        { description: 'Home Runs', _pivot_how_many: 2, _pivot_game_date: '2026-03-10T00:00:00Z' }
      ]
    };

    expect(buildDerivedStats(player, 2025)).toEqual({
      battingAverage: 0.5,
      homeRunRate: null,
      era: null,
      strikeoutsPerInning: null
    });
  });

  it('addDerivedStatsToPlayers replaces player stats with the season-filtered set', () => {
    const players = [
      {
        id: 1,
        first_name: 'Ace',
        stats: [
          { description: 'Strikeouts', _pivot_how_many: 4, _pivot_game_date: '2025-05-01T00:00:00Z' },
          { description: 'Innings Pitched', _pivot_how_many: 2, _pivot_game_date: '2025-05-01T00:00:00Z' },
          { description: 'Strikeouts', _pivot_how_many: 9, _pivot_game_date: '2026-05-01T00:00:00Z' },
          { description: 'Innings Pitched', _pivot_how_many: 6, _pivot_game_date: '2026-05-01T00:00:00Z' }
        ]
      }
    ];

    const filteredPlayers = addDerivedStatsToPlayers(players, 2026);

    expect(filteredPlayers[0].stats).toEqual([
      { description: 'Strikeouts', _pivot_how_many: 9, _pivot_game_date: '2026-05-01T00:00:00Z' },
      { description: 'Innings Pitched', _pivot_how_many: 6, _pivot_game_date: '2026-05-01T00:00:00Z' }
    ]);
    expect(filteredPlayers[0].derivedStats).toEqual({
      battingAverage: null,
      homeRunRate: null,
      era: null,
      strikeoutsPerInning: 1.5
    });
  });

  it('preserves existing behavior when no season is provided', () => {
    const players = [
      {
        id: 1,
        stats: [
          { description: 'Hits', _pivot_how_many: 3, _pivot_game_date: '2025-03-10T00:00:00Z' },
          { description: 'At Bats', _pivot_how_many: 6, _pivot_game_date: '2026-03-10T00:00:00Z' }
        ]
      }
    ];

    const result = addDerivedStatsToPlayers(players);

    expect(result[0].stats).toEqual(players[0].stats);
    expect(result[0].derivedStats).toEqual({
      battingAverage: 0.5,
      homeRunRate: null,
      era: null,
      strikeoutsPerInning: null
    });
  });
});
