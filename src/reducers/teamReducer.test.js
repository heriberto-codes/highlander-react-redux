import { teamReducer } from './teamReducer';
import {
  GET_TEAM_PROFILE_SUCCESS,
  ADD_PLAYER,
  CREATE_TEAM,
  HIDE_MODAL
} from '../actions/teamAction';

describe('teamReducer', () => {
  it('should handle GET_TEAM_PROFILE_SUCCESS', () => {
    const action = {
      type: GET_TEAM_PROFILE_SUCCESS,
      response: {
        data: {
          name: 'T',
          city: 'C',
          state: 'S',
          players: [
            { first_name: 'P', last_name: 'L', email: 'e', position: 'p' }
          ],
          coach: [
            { first_name: 'C', last_name: 'L', email: 'c' }
          ]
        }
      }
    };
    const state = teamReducer(undefined, action);
    expect(state).toEqual({
      name: 'T',
      city: 'C',
      state: 'S',
      players: [
        { first_name: 'P', last_name: 'L', email: 'e', position: 'p' }
      ],
      coach: { first_name: 'C', last_name: 'L', email: 'c' },
      errorMessage: null,
      showModal: false
    });
  });

  it('should handle ADD_PLAYER', () => {
    const initial = teamReducer(undefined, { type: '@@INIT' });
    const action = {
      type: ADD_PLAYER,
      response: {
        data: { first_name: 'N', last_name: 'P', email: 'n', position: 's' }
      }
    };
    const state = teamReducer(initial, action);
    expect(state.players).toHaveLength(1);
    expect(state.players[0].first_name).toBe('N');
  });

  it('should toggle modal with CREATE_TEAM and HIDE_MODAL', () => {
    const opened = teamReducer(undefined, { type: CREATE_TEAM });
    expect(opened.showModal).toBe(true);
    const closed = teamReducer(opened, { type: HIDE_MODAL });
    expect(closed.showModal).toBe(false);
  });
});
