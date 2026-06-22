jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn()
}));

import { teamReducer } from './teamReducer';
import {
  GET_TEAM_PROFILE,
  GET_TEAM_PROFILE_SUCCESS,
  GET_TEAM_PROFILE_ERROR,
  GET_TEAM_COLLABORATORS,
  GET_TEAM_COLLABORATORS_SUCCESS,
  GET_TEAM_COLLABORATORS_ERROR,
  ADD_PLAYER,
  ADD_PLAYER_ERROR,
  ADD_TEAM_COLLABORATOR,
  ADD_TEAM_COLLABORATOR_SUCCESS,
  ADD_TEAM_COLLABORATOR_ERROR,
  UPDATE_TEAM_COLLABORATOR,
  UPDATE_TEAM_COLLABORATOR_SUCCESS,
  UPDATE_TEAM_COLLABORATOR_ERROR,
  REMOVE_TEAM_COLLABORATOR,
  REMOVE_TEAM_COLLABORATOR_SUCCESS,
  REMOVE_TEAM_COLLABORATOR_ERROR,
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
          collaborators: [
            { id: 1, first_name: 'C', last_name: 'L', email: 'c', role: 'owner' },
            { id: 2, first_name: 'A', last_name: 'S', email: 'a', role: 'assistant' }
          ],
          currentCoachRole: 'owner',
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
      teamDetailPagination: {
        playerPage: 1,
        playerLimit: 10
      },
      playerPagination: {
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false
      },
      players: [
        { id: 7, first_name: 'P', last_name: 'L', email: 'e', position: 'p' }
      ],
      coach: { first_name: 'C', last_name: 'L', email: 'c' },
      collaborators: [
        { id: 1, first_name: 'C', last_name: 'L', email: 'c', role: 'owner' },
        { id: 2, first_name: 'A', last_name: 'S', email: 'a', role: 'assistant' }
      ],
      currentCoachRole: 'owner',
      isLoadingTeamProfile: false,
      isLoadingCollaborators: false,
      collaboratorLoadError: null,
      isAddingCollaborator: false,
      addCollaboratorSuccess: false,
      addCollaboratorError: null,
      isUpdatingCollaborator: false,
      updateCollaboratorSuccess: false,
      updateCollaboratorError: null,
      isRemovingCollaborator: false,
      removeCollaboratorSuccess: false,
      removeCollaboratorError: null,
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

  it('keeps the player modal open when adding a player fails', () => {
    const initial = teamReducer(undefined, { type: '@@INIT' });
    const state = teamReducer(
      { ...initial, showModal: true },
      { type: ADD_PLAYER_ERROR, response: new Error('request failed') }
    );

    expect(state.showModal).toBe(true);
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
    expect(state.collaborators).toEqual([]);
    expect(state.currentCoachRole).toBe(null);
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
    expect(state.isLoadingTeamProfile).toBe(true);
    expect(state.errorMessage).toBe(null);
  });

  it('should store requested team detail pagination state on GET_TEAM_PROFILE', () => {
    const state = teamReducer(undefined, {
      type: GET_TEAM_PROFILE,
      id: 9,
      season: 2026,
      filters: {
        playerSearch: ' Ace ',
        position: ' Pitcher ',
        playerPage: '2',
        playerLimit: 25
      }
    });

    expect(state.filters).toEqual({
      playerSearch: 'Ace',
      position: 'Pitcher'
    });
    expect(state.teamDetailPagination).toEqual({
      playerPage: 2,
      playerLimit: 25
    });
    expect(state.isLoadingTeamProfile).toBe(true);
    expect(state.errorMessage).toBe(null);
  });

  it('should default invalid team detail pagination requests on GET_TEAM_PROFILE', () => {
    const state = teamReducer(undefined, {
      type: GET_TEAM_PROFILE,
      id: 9,
      season: 2026,
      filters: {
        playerPage: 0,
        playerLimit: 'all'
      }
    });

    expect(state.teamDetailPagination).toEqual({
      playerPage: 1,
      playerLimit: 10
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
    expect(nextState.isLoadingTeamProfile).toBe(true);
    expect(nextState.errorMessage).toBe(null);
  });

  it('should clear prior team profile errors when a new GET_TEAM_PROFILE request starts', () => {
    const previousState = {
      ...teamReducer(undefined, { type: '@@INIT' }),
      errorMessage: { message: 'old profile error' }
    };

    const state = teamReducer(previousState, {
      type: GET_TEAM_PROFILE,
      id: 9,
      season: 2026,
      filters: {}
    });

    expect(state.isLoadingTeamProfile).toBe(true);
    expect(state.errorMessage).toBe(null);
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
    expect(nextState.isLoadingTeamProfile).toBe(false);
    expect(nextState.errorMessage).toBe(null);
  });

  it('should store team detail pagination metadata across GET_TEAM_PROFILE_SUCCESS', () => {
    const previousState = teamReducer(undefined, {
      type: GET_TEAM_PROFILE,
      id: 9,
      season: 2026,
      filters: {
        playerPage: 2,
        playerLimit: 25
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
          playerPagination: {
            page: 2,
            limit: 25,
            totalItems: 40,
            totalPages: 2,
            hasPreviousPage: true,
            hasNextPage: false
          },
          coach: [
            { first_name: 'Casey', last_name: 'Jones', email: 'coach@example.com' }
          ]
        }
      }
    });

    expect(nextState.teamDetailPagination).toEqual({
      playerPage: 2,
      playerLimit: 25
    });
    expect(nextState.playerPagination).toEqual({
      page: 2,
      limit: 25,
      totalItems: 40,
      totalPages: 2,
      hasPreviousPage: true,
      hasNextPage: false
    });
    expect(nextState.isLoadingTeamProfile).toBe(false);
    expect(nextState.errorMessage).toBe(null);
  });

  it('should store team profile errors without clearing existing profile data', () => {
    const previousState = teamReducer(undefined, {
      type: GET_TEAM_PROFILE_SUCCESS,
      response: {
        data: {
          name: 'Highlanders',
          city: 'Bronx',
          state: 'NY',
          season: 2026,
          activeSeason: 2026,
          availableSeasons: [2026],
          players: [
            { id: 11, first_name: 'Pat', last_name: 'Summer', email: 'summer@example.com', position: 'P' }
          ],
          coach: [
            { first_name: 'Casey', last_name: 'Jones', email: 'coach@example.com' }
          ]
        }
      }
    });
    const loadingState = teamReducer(previousState, {
      type: GET_TEAM_PROFILE,
      id: 9,
      season: 2026,
      filters: {}
    });
    const error = { message: 'profile failed' };

    const state = teamReducer(loadingState, {
      type: GET_TEAM_PROFILE_ERROR,
      response: error
    });

    expect(state.isLoadingTeamProfile).toBe(false);
    expect(state.errorMessage).toBe(error);
    expect(state.name).toBe('Highlanders');
    expect(state.city).toBe('Bronx');
    expect(state.players).toEqual([
      { id: 11, first_name: 'Pat', last_name: 'Summer', email: 'summer@example.com', position: 'P' }
    ]);
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

  it('should track collaborator fetch loading and success state', () => {
    const loadingState = teamReducer(undefined, {
      type: GET_TEAM_COLLABORATORS,
      id: 50
    });

    expect(loadingState.isLoadingCollaborators).toBe(true);
    expect(loadingState.collaboratorLoadError).toBe(null);

    const state = teamReducer(loadingState, {
      type: GET_TEAM_COLLABORATORS_SUCCESS,
      response: {
        data: [
          { id: 1, first_name: 'Owner', last_name: 'One', email: 'owner@example.com', role: 'owner' },
          { id: 2, first_name: 'Assist', last_name: 'Two', email: 'assist@example.com', role: 'assistant' }
        ]
      }
    });

    expect(state.isLoadingCollaborators).toBe(false);
    expect(state.collaboratorLoadError).toBe(null);
    expect(state.collaborators).toEqual([
      { id: 1, first_name: 'Owner', last_name: 'One', email: 'owner@example.com', role: 'owner' },
      { id: 2, first_name: 'Assist', last_name: 'Two', email: 'assist@example.com', role: 'assistant' }
    ]);
  });

  it('should store collaborator fetch errors', () => {
    const loadingState = teamReducer(undefined, {
      type: GET_TEAM_COLLABORATORS,
      id: 50
    });
    const error = { message: 'fetch failed' };

    const state = teamReducer(loadingState, {
      type: GET_TEAM_COLLABORATORS_ERROR,
      response: error
    });

    expect(state.isLoadingCollaborators).toBe(false);
    expect(state.collaboratorLoadError).toBe(error);
  });

  it('should track collaborator add request and success state', () => {
    const loadingState = teamReducer(undefined, {
      type: ADD_TEAM_COLLABORATOR,
      id: 50,
      coachId: 2,
      role: 'assistant'
    });

    expect(loadingState.isAddingCollaborator).toBe(true);
    expect(loadingState.addCollaboratorSuccess).toBe(false);
    expect(loadingState.addCollaboratorError).toBe(null);

    const state = teamReducer(loadingState, {
      type: ADD_TEAM_COLLABORATOR_SUCCESS,
      response: {
        data: { id: 2, first_name: 'Assist', last_name: 'Two', email: 'assist@example.com', role: 'assistant' }
      }
    });

    expect(state.isAddingCollaborator).toBe(false);
    expect(state.addCollaboratorSuccess).toBe(true);
    expect(state.addCollaboratorError).toBe(null);
    expect(state.collaborators).toEqual([
      { id: 2, first_name: 'Assist', last_name: 'Two', email: 'assist@example.com', role: 'assistant' }
    ]);
  });

  it('should store collaborator add errors', () => {
    const loadingState = teamReducer(undefined, {
      type: ADD_TEAM_COLLABORATOR,
      id: 50,
      coachId: 2,
      role: 'assistant'
    });
    const error = { message: 'create failed' };

    const state = teamReducer(loadingState, {
      type: ADD_TEAM_COLLABORATOR_ERROR,
      response: error
    });

    expect(state.isAddingCollaborator).toBe(false);
    expect(state.addCollaboratorSuccess).toBe(false);
    expect(state.addCollaboratorError).toBe(error);
  });

  it('should track collaborator update request and success state', () => {
    const previousState = {
      ...teamReducer(undefined, { type: '@@INIT' }),
      collaborators: [
        { id: 1, first_name: 'Owner', last_name: 'One', email: 'owner@example.com', role: 'owner' },
        { id: 2, first_name: 'Assist', last_name: 'Two', email: 'assist@example.com', role: 'assistant' }
      ]
    };

    const loadingState = teamReducer(previousState, {
      type: UPDATE_TEAM_COLLABORATOR,
      id: 50,
      coachId: 2,
      role: 'owner'
    });

    expect(loadingState.isUpdatingCollaborator).toBe(true);
    expect(loadingState.updateCollaboratorSuccess).toBe(false);
    expect(loadingState.updateCollaboratorError).toBe(null);

    const state = teamReducer(loadingState, {
      type: UPDATE_TEAM_COLLABORATOR_SUCCESS,
      response: {
        data: { id: 2, first_name: 'Assist', last_name: 'Two', email: 'assist@example.com', role: 'owner' }
      }
    });

    expect(state.isUpdatingCollaborator).toBe(false);
    expect(state.updateCollaboratorSuccess).toBe(true);
    expect(state.updateCollaboratorError).toBe(null);
    expect(state.collaborators).toEqual([
      { id: 1, first_name: 'Owner', last_name: 'One', email: 'owner@example.com', role: 'owner' },
      { id: 2, first_name: 'Assist', last_name: 'Two', email: 'assist@example.com', role: 'owner' }
    ]);
  });

  it('should store collaborator update errors', () => {
    const loadingState = teamReducer(undefined, {
      type: UPDATE_TEAM_COLLABORATOR,
      id: 50,
      coachId: 2,
      role: 'owner'
    });
    const error = { message: 'update failed' };

    const state = teamReducer(loadingState, {
      type: UPDATE_TEAM_COLLABORATOR_ERROR,
      response: error
    });

    expect(state.isUpdatingCollaborator).toBe(false);
    expect(state.updateCollaboratorSuccess).toBe(false);
    expect(state.updateCollaboratorError).toBe(error);
  });

  it('should track collaborator removal request and success state', () => {
    const previousState = {
      ...teamReducer(undefined, { type: '@@INIT' }),
      collaborators: [
        { id: 1, first_name: 'Owner', last_name: 'One', email: 'owner@example.com', role: 'owner' },
        { id: 2, first_name: 'Assist', last_name: 'Two', email: 'assist@example.com', role: 'assistant' }
      ]
    };

    const loadingState = teamReducer(previousState, {
      type: REMOVE_TEAM_COLLABORATOR,
      id: 50,
      coachId: 2
    });

    expect(loadingState.isRemovingCollaborator).toBe(true);
    expect(loadingState.removeCollaboratorSuccess).toBe(false);
    expect(loadingState.removeCollaboratorError).toBe(null);

    const state = teamReducer(loadingState, {
      type: REMOVE_TEAM_COLLABORATOR_SUCCESS,
      id: 50,
      coachId: 2
    });

    expect(state.isRemovingCollaborator).toBe(false);
    expect(state.removeCollaboratorSuccess).toBe(true);
    expect(state.removeCollaboratorError).toBe(null);
    expect(state.collaborators).toEqual([
      { id: 1, first_name: 'Owner', last_name: 'One', email: 'owner@example.com', role: 'owner' }
    ]);
  });

  it('should store collaborator removal errors', () => {
    const loadingState = teamReducer(undefined, {
      type: REMOVE_TEAM_COLLABORATOR,
      id: 50,
      coachId: 2
    });
    const error = { message: 'delete failed' };

    const state = teamReducer(loadingState, {
      type: REMOVE_TEAM_COLLABORATOR_ERROR,
      response: error
    });

    expect(state.isRemovingCollaborator).toBe(false);
    expect(state.removeCollaboratorSuccess).toBe(false);
    expect(state.removeCollaboratorError).toBe(error);
  });

  it('should clear stale collaborator mutation state on team profile and collaborator reloads', () => {
    const previousState = {
      ...teamReducer(undefined, { type: '@@INIT' }),
      isAddingCollaborator: false,
      addCollaboratorSuccess: true,
      addCollaboratorError: { message: 'old add error' },
      isUpdatingCollaborator: false,
      updateCollaboratorSuccess: true,
      updateCollaboratorError: { message: 'old update error' },
      isRemovingCollaborator: false,
      removeCollaboratorSuccess: true,
      removeCollaboratorError: { message: 'old remove error' }
    };

    const loadingProfileState = teamReducer(previousState, {
      type: GET_TEAM_PROFILE,
      id: 9,
      season: 2026,
      filters: {}
    });

    expect(loadingProfileState.addCollaboratorSuccess).toBe(false);
    expect(loadingProfileState.addCollaboratorError).toBe(null);
    expect(loadingProfileState.updateCollaboratorSuccess).toBe(false);
    expect(loadingProfileState.updateCollaboratorError).toBe(null);
    expect(loadingProfileState.removeCollaboratorSuccess).toBe(false);
    expect(loadingProfileState.removeCollaboratorError).toBe(null);

    const loadingCollaboratorsState = teamReducer(previousState, {
      type: GET_TEAM_COLLABORATORS,
      id: 9
    });

    expect(loadingCollaboratorsState.addCollaboratorSuccess).toBe(false);
    expect(loadingCollaboratorsState.addCollaboratorError).toBe(null);
    expect(loadingCollaboratorsState.updateCollaboratorSuccess).toBe(false);
    expect(loadingCollaboratorsState.updateCollaboratorError).toBe(null);
    expect(loadingCollaboratorsState.removeCollaboratorSuccess).toBe(false);
    expect(loadingCollaboratorsState.removeCollaboratorError).toBe(null);
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
