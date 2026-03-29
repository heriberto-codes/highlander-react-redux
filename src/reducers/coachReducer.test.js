jest.mock('../actions/loginAction', () => ({
  LOGIN_SUCCESS: 'LOGIN_SUCCESS'
}));

jest.mock('../actions/coachAction', () => ({
  GET_PROFILE: 'GET_PROFILE',
  PROFILE_SUCCESS: 'PROFILE_SUCCESS',
  PROFILE_ERROR: 'PROFILE_ERROR'
}));

import { coachReducer } from './coachReducer';
import { LOGIN_SUCCESS } from '../actions/loginAction';
import { GET_PROFILE, PROFILE_SUCCESS } from '../actions/coachAction';

describe('coachReducer', () => {
  it('should handle LOGIN_SUCCESS', () => {
    const action = { type: LOGIN_SUCCESS, response: { data: { id: 2 } } };
    const state = coachReducer(undefined, action);
    expect(state.id).toBe(2);
  });

  it('should handle PROFILE_SUCCESS', () => {
    const action = {
      type: PROFILE_SUCCESS,
      response: {
        data: {
          availableSeasons: [2026, 2025],
          activeSeason: 2026,
          teams: [
            {
              players: [
                {
                  id: 1,
                  first_name: 'P',
                  last_name: 'One',
                  position: 'Pitcher',
                  derivedStats: {
                    battingAverage: 0.5,
                    homeRunRate: 0.1,
                    era: 3.5,
                    strikeoutsPerInning: 1.2
                  },
                  stats: [
                    { description: 'Hits', _pivot_how_many: 5 },
                    { description: 'At Bats', _pivot_how_many: 10 }
                  ]
                },
                {
                  id: 1,
                  first_name: 'P',
                  last_name: 'One',
                  position: 'Pitcher',
                  derivedStats: {
                    battingAverage: 0.5,
                    homeRunRate: 0.1,
                    era: 3.5,
                    strikeoutsPerInning: 1.2
                  },
                  stats: [
                    { description: 'Hits', _pivot_how_many: 5 },
                    { description: 'At Bats', _pivot_how_many: 10 }
                  ]
                }
              ]
            }
          ],
          first_name: 'Coach',
          last_name: 'Test',
          email: 'c@example.com',
          id: 1
        }
      }
    };
    const state = coachReducer(undefined, action);
    expect(state.first_name).toBe('Coach');
    expect(state.availableSeasons).toEqual([2026, 2025]);
    expect(state.activeSeason).toBe(2026);
    expect(state.filters).toEqual({
      teamSearch: '',
      playerSearch: '',
      position: ''
    });
    expect(state.players).toHaveLength(1);
    expect(state.stats[0].stats.Hits).toBe(5);
    expect(state.stats[0].stats['At Bats']).toBe(10);
    expect(state.stats[0].derivedStats).toEqual({
      battingAverage: 0.5,
      homeRunRate: 0.1,
      era: 3.5,
      strikeoutsPerInning: 1.2
    });
  });

  it('should default missing derivedStats fields to null', () => {
    const action = {
      type: PROFILE_SUCCESS,
      response: {
        data: {
          teams: [
            {
              players: [
                {
                  id: 2,
                  first_name: 'P',
                  last_name: 'Two',
                  position: 'Catcher',
                  stats: [
                    { description: 'Hits', _pivot_how_many: 3 },
                    { description: 'At Bats', _pivot_how_many: 9 }
                  ]
                }
              ]
            }
          ],
          first_name: 'Coach',
          last_name: 'Test',
          email: 'c@example.com',
          id: 1
        }
      }
    };

    const state = coachReducer(undefined, action);

    expect(state.stats[0].derivedStats).toEqual({
      battingAverage: null,
      homeRunRate: null,
      era: null,
      strikeoutsPerInning: null
    });
    expect(state.availableSeasons).toEqual([]);
    expect(state.activeSeason).toBe(null);
    expect(state.filters).toEqual({
      teamSearch: '',
      playerSearch: '',
      position: ''
    });
  });

  it('should store normalized filter state on GET_PROFILE', () => {
    const state = coachReducer(undefined, {
      type: GET_PROFILE,
      id: 12,
      season: 2026,
      filters: {
        teamSearch: ' War ',
        playerSearch: ' Ace ',
        position: ' Pitcher '
      }
    });

    expect(state.filters).toEqual({
      teamSearch: 'War',
      playerSearch: 'Ace',
      position: 'Pitcher'
    });
  });

  it('should reset prior coach filter state when GET_PROFILE is dispatched without filters', () => {
    const previousState = coachReducer(undefined, {
      type: GET_PROFILE,
      id: 12,
      season: 2026,
      filters: {
        teamSearch: 'War',
        playerSearch: 'Ace',
        position: 'Pitcher'
      }
    });

    const nextState = coachReducer(previousState, {
      type: GET_PROFILE,
      id: 12,
      season: undefined,
      filters: {}
    });

    expect(nextState.filters).toEqual({
      teamSearch: '',
      playerSearch: '',
      position: ''
    });
  });

  it('should preserve existing filter state across PROFILE_SUCCESS', () => {
    const previousState = coachReducer(undefined, {
      type: GET_PROFILE,
      id: 12,
      season: 2026,
      filters: {
        teamSearch: 'War',
        playerSearch: 'Ace',
        position: 'Pitcher'
      }
    });

    const nextState = coachReducer(previousState, {
      type: PROFILE_SUCCESS,
      response: {
        data: {
          availableSeasons: [2026],
          activeSeason: 2026,
          teams: [],
          first_name: 'Coach',
          last_name: 'Test',
          email: 'c@example.com',
          id: 12
        }
      }
    });

    expect(nextState.filters).toEqual({
      teamSearch: 'War',
      playerSearch: 'Ace',
      position: 'Pitcher'
    });
  });

  it('should aggregate duplicate stat descriptions into raw totals', () => {
    const action = {
      type: PROFILE_SUCCESS,
      response: {
        data: {
          teams: [
            {
              players: [
                {
                  id: 3,
                  first_name: 'P',
                  last_name: 'Three',
                  position: 'Infielder',
                  derivedStats: {
                    battingAverage: 0.5,
                    homeRunRate: 0.2,
                    era: null,
                    strikeoutsPerInning: null
                  },
                  stats: [
                    { description: 'Hits', _pivot_how_many: 2 },
                    { description: 'Hits', _pivot_how_many: 3 },
                    { description: 'At Bats', _pivot_how_many: 4 },
                    { description: 'At Bats', _pivot_how_many: 6 },
                    { description: 'Home Runs', _pivot_how_many: 1 },
                    { description: 'Home Runs', _pivot_how_many: 1 }
                  ]
                }
              ]
            }
          ],
          first_name: 'Coach',
          last_name: 'Test',
          email: 'c@example.com',
          id: 1
        }
      }
    };

    const state = coachReducer(undefined, action);

    expect(state.stats[0].stats).toEqual({
      Hits: 5,
      'At Bats': 10,
      'Home Runs': 2,
      'Earned Runs': 0,
      'Innings Pitched': 0,
      Strikeouts: 0
    });
  });

  it('should replace dashboard season data when a later PROFILE_SUCCESS switches seasons', () => {
    const previousState = coachReducer(undefined, {
      type: PROFILE_SUCCESS,
      response: {
        data: {
          availableSeasons: [2026, 2025],
          activeSeason: 2026,
          teams: [
            {
              id: 10,
              season: 2026,
              players: [
                {
                  id: 1,
                  first_name: 'Pat',
                  last_name: 'Summer',
                  position: 'Pitcher',
                  derivedStats: {
                    battingAverage: 0.5,
                    homeRunRate: null,
                    era: null,
                    strikeoutsPerInning: 1.5
                  },
                  stats: [
                    { description: 'Hits', _pivot_how_many: 5 },
                    { description: 'At Bats', _pivot_how_many: 10 },
                    { description: 'Strikeouts', _pivot_how_many: 9 },
                    { description: 'Innings Pitched', _pivot_how_many: 6 }
                  ]
                }
              ]
            }
          ],
          first_name: 'Coach',
          last_name: 'Test',
          email: 'c@example.com',
          id: 1
        }
      }
    });

    const nextState = coachReducer(previousState, {
      type: PROFILE_SUCCESS,
      response: {
        data: {
          availableSeasons: [2026, 2025],
          activeSeason: 2025,
          teams: [
            {
              id: 11,
              season: 2025,
              players: [
                {
                  id: 2,
                  first_name: 'Pat',
                  last_name: 'Spring',
                  position: 'Catcher',
                  derivedStats: {
                    battingAverage: 0.25,
                    homeRunRate: 0.125,
                    era: null,
                    strikeoutsPerInning: null
                  },
                  stats: [
                    { description: 'Hits', _pivot_how_many: 2 },
                    { description: 'At Bats', _pivot_how_many: 8 },
                    { description: 'Home Runs', _pivot_how_many: 1 }
                  ]
                }
              ]
            }
          ],
          first_name: 'Coach',
          last_name: 'Test',
          email: 'c@example.com',
          id: 1
        }
      }
    });

    expect(nextState.activeSeason).toBe(2025);
    expect(nextState.teams).toEqual([
      expect.objectContaining({ id: 11, season: 2025 })
    ]);
    expect(nextState.players).toEqual([
      expect.objectContaining({ id: 2, first_name: 'Pat', last_name: 'Spring' })
    ]);
    expect(nextState.stats).toEqual([
      {
        first_name: 'Pat',
        last_name: 'Spring',
        position: 'Catcher',
        stats: {
          Hits: 2,
          'At Bats': 8,
          'Home Runs': 1,
          'Earned Runs': 0,
          'Innings Pitched': 0,
          Strikeouts: 0
        },
        derivedStats: {
          battingAverage: 0.25,
          homeRunRate: 0.125,
          era: null,
          strikeoutsPerInning: null
        }
      }
    ]);
    expect(nextState.filters).toEqual({
      teamSearch: '',
      playerSearch: '',
      position: ''
    });
  });

});
