jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn()
}));

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
          season: 2025,
          activeSeason: 2026,
          availableSeasons: [2026, 2025],
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
      season: 2025,
      activeSeason: 2026,
      availableSeasons: [2026, 2025],
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

  it('should default missing season metadata on GET_TEAM_PROFILE_SUCCESS', () => {
    const action = {
      type: GET_TEAM_PROFILE_SUCCESS,
      response: {
        data: {
          name: 'T',
          city: 'C',
          state: 'S',
          players: [],
          coach: [
            { first_name: 'C', last_name: 'L', email: 'c' }
          ]
        }
      }
    };

    const state = teamReducer(undefined, action);

    expect(state.season).toBe(null);
    expect(state.activeSeason).toBe(null);
    expect(state.availableSeasons).toEqual([]);
  });

  it('should replace team season state when a later GET_TEAM_PROFILE_SUCCESS switches seasons', () => {
    const previousState = teamReducer(undefined, {
      type: GET_TEAM_PROFILE_SUCCESS,
      response: {
        data: {
          name: 'Highlanders',
          city: 'Bronx',
          state: 'NY',
          season: 2025,
          activeSeason: 2025,
          availableSeasons: [2026, 2025],
          players: [
            { first_name: 'Pat', last_name: 'Spring', email: 'spring@example.com', position: 'C' }
          ],
          coach: [
            { first_name: 'Casey', last_name: 'Jones', email: 'coach@example.com' }
          ]
        }
      }
    });

    const nextState = teamReducer(previousState, {
      type: GET_TEAM_PROFILE_SUCCESS,
      response: {
        data: {
          name: 'Highlanders',
          city: 'Bronx',
          state: 'NY',
          season: 2026,
          activeSeason: 2026,
          availableSeasons: [2026, 2025],
          players: [
            { first_name: 'Pat', last_name: 'Summer', email: 'summer@example.com', position: 'P' }
          ],
          coach: [
            { first_name: 'Casey', last_name: 'Jones', email: 'coach@example.com' }
          ]
        }
      }
    });

    expect(nextState.season).toBe(2026);
    expect(nextState.activeSeason).toBe(2026);
    expect(nextState.availableSeasons).toEqual([2026, 2025]);
    expect(nextState.players).toEqual([
      { first_name: 'Pat', last_name: 'Summer', email: 'summer@example.com', position: 'P' }
    ]);
  });
});
