jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn()
}));

import { teamReducer } from './teamReducer';
import {
  GET_TEAM_PROFILE,
  GET_TEAM_PROFILE_SUCCESS,
  ADD_PLAYER,
  CREATE_TEAM,
  HIDE_MODAL,
  CREATE_GAME_ENTRY,
  CREATE_GAME_ENTRY_SUCCESS,
  CREATE_GAME_ENTRY_ERROR
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
            { id: 7, first_name: 'P', last_name: 'L', email: 'e', position: 'p' }
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
      filters: {
        playerSearch: '',
        position: ''
      },
      players: [
        { id: 7, first_name: 'P', last_name: 'L', email: 'e', position: 'p' }
      ],
      coach: { first_name: 'C', last_name: 'L', email: 'c' },
      isSubmittingGame: false,
      gameSubmissionSuccess: false,
      lastCreatedGame: null,
      gameSubmissionError: null,
      errorMessage: null,
      showModal: false
    });
  });

  it('should handle ADD_PLAYER', () => {
    const initial = teamReducer(undefined, { type: '@@INIT' });
    const action = {
      type: ADD_PLAYER,
      response: {
        data: { id: 8, first_name: 'N', last_name: 'P', email: 'n', position: 's' }
      }
    };
    const state = teamReducer(initial, action);
    expect(state.players).toHaveLength(1);
    expect(state.players[0].id).toBe(8);
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
    expect(state.filters).toEqual({
      playerSearch: '',
      position: ''
    });
  });

  it('should store normalized filter state on GET_TEAM_PROFILE', () => {
    const state = teamReducer(undefined, {
      type: GET_TEAM_PROFILE,
      id: 9,
      season: 2026,
      filters: {
        playerSearch: ' Ace ',
        position: ' Pitcher '
      }
    });

    expect(state.filters).toEqual({
      playerSearch: 'Ace',
      position: 'Pitcher'
    });
  });

  it('should reset prior team filter state when GET_TEAM_PROFILE is dispatched without filters', () => {
    const previousState = teamReducer(undefined, {
      type: GET_TEAM_PROFILE,
      id: 9,
      season: 2026,
      filters: {
        playerSearch: 'Ace',
        position: 'Pitcher'
      }
    });

    const nextState = teamReducer(previousState, {
      type: GET_TEAM_PROFILE,
      id: 9,
      season: undefined,
      filters: {}
    });

    expect(nextState.filters).toEqual({
      playerSearch: '',
      position: ''
    });
  });

  it('should preserve existing filter state across GET_TEAM_PROFILE_SUCCESS', () => {
    const previousState = teamReducer(undefined, {
      type: GET_TEAM_PROFILE,
      id: 9,
      season: 2026,
      filters: {
        playerSearch: 'Ace',
        position: 'Pitcher'
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
          availableSeasons: [2026],
          players: [],
          coach: [
            { first_name: 'Casey', last_name: 'Jones', email: 'coach@example.com' }
          ]
        }
      }
    });

    expect(nextState.filters).toEqual({
      playerSearch: 'Ace',
      position: 'Pitcher'
    });
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
            { id: 10, first_name: 'Pat', last_name: 'Spring', email: 'spring@example.com', position: 'C' }
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
            { id: 11, first_name: 'Pat', last_name: 'Summer', email: 'summer@example.com', position: 'P' }
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
    expect(nextState.filters).toEqual({
      playerSearch: '',
      position: ''
    });
    expect(nextState.players).toEqual([
      { id: 11, first_name: 'Pat', last_name: 'Summer', email: 'summer@example.com', position: 'P' }
    ]);
  });

  it('should track game submission loading state', () => {
    const state = teamReducer(undefined, {
      type: CREATE_GAME_ENTRY,
      id: 50,
      payload: {}
    });

    expect(state.isSubmittingGame).toBe(true);
    expect(state.gameSubmissionSuccess).toBe(false);
    expect(state.lastCreatedGame).toBe(null);
    expect(state.gameSubmissionError).toBe(null);
  });

  it('should store a successful created game response', () => {
    const loadingState = teamReducer(undefined, {
      type: CREATE_GAME_ENTRY,
      id: 50,
      payload: {}
    });

    const state = teamReducer(loadingState, {
      type: CREATE_GAME_ENTRY_SUCCESS,
      response: {
        data: {
          id: 90,
          team_id: 50,
          insertedStatRows: 2
        }
      }
    });

    expect(state.isSubmittingGame).toBe(false);
    expect(state.gameSubmissionSuccess).toBe(true);
    expect(state.lastCreatedGame).toEqual({
      id: 90,
      team_id: 50,
      insertedStatRows: 2
    });
    expect(state.gameSubmissionError).toBe(null);
  });

  it('should store game submission errors', () => {
    const loadingState = teamReducer(undefined, {
      type: CREATE_GAME_ENTRY,
      id: 50,
      payload: {}
    });
    const error = { message: 'request failed' };

    const state = teamReducer(loadingState, {
      type: CREATE_GAME_ENTRY_ERROR,
      response: error
    });

    expect(state.isSubmittingGame).toBe(false);
    expect(state.gameSubmissionSuccess).toBe(false);
    expect(state.lastCreatedGame).toBe(null);
    expect(state.gameSubmissionError).toBe(error);
  });

  it('should reset prior game submission result state when a new submission starts', () => {
    const previousState = {
      ...teamReducer(undefined, { type: '@@INIT' }),
      isSubmittingGame: false,
      gameSubmissionSuccess: true,
      lastCreatedGame: { id: 90, insertedStatRows: 2 },
      gameSubmissionError: { message: 'old error' }
    };

    const state = teamReducer(previousState, {
      type: CREATE_GAME_ENTRY,
      id: 50,
      payload: {}
    });

    expect(state.isSubmittingGame).toBe(true);
    expect(state.gameSubmissionSuccess).toBe(false);
    expect(state.lastCreatedGame).toBe(null);
    expect(state.gameSubmissionError).toBe(null);
  });
});
