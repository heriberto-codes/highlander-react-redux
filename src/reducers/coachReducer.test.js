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
import { PROFILE_SUCCESS } from '../actions/coachAction';

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
});
