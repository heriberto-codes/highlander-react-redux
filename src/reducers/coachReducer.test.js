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
  });
});
