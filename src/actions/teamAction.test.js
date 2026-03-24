jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ status: 200, data: {} })),
  post: jest.fn(() => Promise.resolve({ status: 200, data: {} })),
  put: jest.fn(() => Promise.resolve({ status: 200, data: {} })),
  delete: jest.fn(() => Promise.resolve({ status: 204, data: {} }))
}));

const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

import axios from 'axios';
import {
  GET_TEAM_PROFILE,
  GET_TEAM_COLLABORATORS,
  GET_TEAM_COLLABORATORS_SUCCESS,
  getTeamCollaboratorsSuccess,
  GET_TEAM_COLLABORATORS_ERROR,
  getTeamCollaboratorsError,
  getTeamCollaborators,
  CREATE_TEAM,
  createTeam,
  HIDE_MODAL,
  hideModal,
  ADD_PLAYER,
  addPlayer,
  ADD_PLAYER_ERROR,
  addPlayerError,
  ADD_TEAM_COLLABORATOR,
  ADD_TEAM_COLLABORATOR_SUCCESS,
  addTeamCollaboratorSuccess,
  ADD_TEAM_COLLABORATOR_ERROR,
  addTeamCollaboratorError,
  addTeamCollaborator,
  UPDATE_TEAM_COLLABORATOR,
  UPDATE_TEAM_COLLABORATOR_SUCCESS,
  updateTeamCollaboratorSuccess,
  UPDATE_TEAM_COLLABORATOR_ERROR,
  updateTeamCollaboratorError,
  updateTeamCollaborator,
  REMOVE_TEAM_COLLABORATOR,
  REMOVE_TEAM_COLLABORATOR_SUCCESS,
  removeTeamCollaboratorSuccess,
  REMOVE_TEAM_COLLABORATOR_ERROR,
  removeTeamCollaboratorError,
  removeTeamCollaborator,
  CREATE_GAME_ENTRY,
  createGameEntry,
  CREATE_GAME_ENTRY_SUCCESS,
  createGameEntrySuccess,
  CREATE_GAME_ENTRY_ERROR,
  createGameEntryError,
  GET_TEAM_PROFILE_SUCCESS,
  getTeamProfileSuccess,
  GET_TEAM_PROFILE_ERROR,
  getTeamProfileError,
  getTeamProfile
} from './teamAction';

describe('team actions', () => {
  beforeEach(() => {
    axios.get.mockReset();
    axios.post.mockReset();
    axios.put.mockReset();
    axios.delete.mockReset();
    axios.get.mockResolvedValue({ status: 200, data: {} });
    axios.post.mockResolvedValue({ status: 200, data: {} });
    axios.put.mockResolvedValue({ status: 200, data: {} });
    axios.delete.mockResolvedValue({ status: 204, data: {} });
  });

  it('should expose GET_TEAM_PROFILE action type', () => {
    expect(GET_TEAM_PROFILE).toBe('GET_TEAM_PROFILE');
  });

  it('should request the base team profile URL when no season is provided', () => {
    const dispatch = jest.fn();

    getTeamProfile(9)(dispatch);

    expect(dispatch).toHaveBeenCalledWith({
      type: GET_TEAM_PROFILE,
      id: 9,
      season: undefined,
      filters: {}
    });
    expect(axios.get).toHaveBeenCalledWith('http://localhost:8080/teams/9', {
      withCredentials: true
    });
  });

  it('should append the season query when a season is provided', () => {
    const dispatch = jest.fn();

    getTeamProfile(9, 2026)(dispatch);

    expect(dispatch).toHaveBeenCalledWith({
      type: GET_TEAM_PROFILE,
      id: 9,
      season: 2026,
      filters: {}
    });
    expect(axios.get).toHaveBeenCalledWith('http://localhost:8080/teams/9?season=2026', {
      withCredentials: true
    });
  });

  it('should append non-empty filter queries to the team profile URL when provided', () => {
    const dispatch = jest.fn();

    getTeamProfile(9, 2026, {
      playerSearch: 'Ace',
      position: 'Pitcher'
    })(dispatch);

    expect(dispatch).toHaveBeenCalledWith({
      type: GET_TEAM_PROFILE,
      id: 9,
      season: 2026,
      filters: {
        playerSearch: 'Ace',
        position: 'Pitcher'
      }
    });
    expect(axios.get).toHaveBeenCalledWith(
      'http://localhost:8080/teams/9?season=2026&playerSearch=Ace&position=Pitcher',
      { withCredentials: true }
    );
  });

  it('should omit empty string filters from the team profile query', () => {
    const dispatch = jest.fn();

    getTeamProfile(9, undefined, {
      playerSearch: '   ',
      position: 'Pitcher'
    })(dispatch);

    expect(axios.get).toHaveBeenCalledWith(
      'http://localhost:8080/teams/9?position=Pitcher',
      { withCredentials: true }
    );
  });

  it('should trim non-empty filter values before serializing the team profile query', () => {
    const dispatch = jest.fn();

    getTeamProfile(9, 2026, {
      playerSearch: '  Ace Slugger  ',
      position: '  Pitcher  '
    })(dispatch);

    expect(axios.get).toHaveBeenCalledWith(
      'http://localhost:8080/teams/9?season=2026&playerSearch=Ace+Slugger&position=Pitcher',
      { withCredentials: true }
    );
  });

  it('should create an action to show modal', () => {
    expect(createTeam()).toEqual({ type: CREATE_TEAM });
  });

  it('should create an action to hide modal', () => {
    expect(hideModal()).toEqual({ type: HIDE_MODAL });
  });

  it('should create addPlayer action', () => {
    const response = { data: { first_name: 'a', last_name: 'b', email: 'e', position: 'p' } };
    const expected = {
      type: ADD_PLAYER,
      response
    };
    expect(addPlayer(response)).toEqual(expected);
  });

  it('should create addPlayerError action', () => {
    const response = 'err';
    const expected = {
      type: ADD_PLAYER_ERROR,
      response
    };
    expect(addPlayerError(response)).toEqual(expected);
  });

  it('should create getTeamProfileSuccess action', () => {
    const response = { data: {} };
    const expected = {
      type: GET_TEAM_PROFILE_SUCCESS,
      response
    };
    expect(getTeamProfileSuccess(response)).toEqual(expected);
  });

  it('should create getTeamProfileError action', () => {
    const response = 'err';
    const expected = {
      type: GET_TEAM_PROFILE_ERROR,
      response
    };
    expect(getTeamProfileError(response)).toEqual(expected);
  });

  it('should expose GET_TEAM_COLLABORATORS action type', () => {
    expect(GET_TEAM_COLLABORATORS).toBe('GET_TEAM_COLLABORATORS');
  });

  it('should request team collaborators from the team coaches endpoint', () => {
    const dispatch = jest.fn();

    getTeamCollaborators(9)(dispatch);

    expect(dispatch).toHaveBeenCalledWith({
      type: GET_TEAM_COLLABORATORS,
      id: 9
    });
    expect(axios.get).toHaveBeenCalledWith('http://localhost:8080/teams/9/coaches', {
      withCredentials: true
    });
  });

  it('should create getTeamCollaboratorsSuccess action', () => {
    const response = { data: [{ id: 1 }] };
    expect(getTeamCollaboratorsSuccess(response)).toEqual({
      type: GET_TEAM_COLLABORATORS_SUCCESS,
      response
    });
  });

  it('should create getTeamCollaboratorsError action', () => {
    const response = 'err';
    expect(getTeamCollaboratorsError(response)).toEqual({
      type: GET_TEAM_COLLABORATORS_ERROR,
      response
    });
  });

  it('should dispatch getTeamCollaboratorsError when collaborator fetch fails', async () => {
    const dispatch = jest.fn();
    const error = new Error('fetch failed');
    axios.get.mockRejectedValueOnce(error);

    getTeamCollaborators(9)(dispatch);
    await flushPromises();

    expect(dispatch).toHaveBeenCalledWith({
      type: GET_TEAM_COLLABORATORS,
      id: 9
    });
    expect(dispatch).toHaveBeenLastCalledWith({
      type: GET_TEAM_COLLABORATORS_ERROR,
      response: error
    });
  });

  it('should dispatch getTeamCollaboratorsSuccess when collaborator fetch succeeds', async () => {
    const dispatch = jest.fn();
    const response = { status: 200, data: [{ id: 2, role: 'assistant' }] };
    axios.get.mockResolvedValueOnce(response);

    getTeamCollaborators(9)(dispatch);
    await flushPromises();

    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: GET_TEAM_COLLABORATORS,
      id: 9
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: GET_TEAM_COLLABORATORS_SUCCESS,
      response
    });
  });

  it('should expose ADD_TEAM_COLLABORATOR action type', () => {
    expect(ADD_TEAM_COLLABORATOR).toBe('ADD_TEAM_COLLABORATOR');
  });

  it('should post a collaborator to the team coaches endpoint', () => {
    const dispatch = jest.fn();

    addTeamCollaborator(9, 2, 'assistant')(dispatch);

    expect(dispatch).toHaveBeenCalledWith({
      type: ADD_TEAM_COLLABORATOR,
      id: 9,
      coachId: 2,
      role: 'assistant'
    });
    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:8080/teams/9/coaches',
      { coachId: 2, role: 'assistant' },
      { withCredentials: true }
    );
  });

  it('should create addTeamCollaboratorSuccess action', () => {
    const response = { data: { id: 2 } };
    expect(addTeamCollaboratorSuccess(response)).toEqual({
      type: ADD_TEAM_COLLABORATOR_SUCCESS,
      response
    });
  });

  it('should create addTeamCollaboratorError action', () => {
    const response = 'err';
    expect(addTeamCollaboratorError(response)).toEqual({
      type: ADD_TEAM_COLLABORATOR_ERROR,
      response
    });
  });

  it('should dispatch addTeamCollaboratorError when collaborator creation fails', async () => {
    const dispatch = jest.fn();
    const error = new Error('create failed');
    axios.post.mockRejectedValueOnce(error);

    addTeamCollaborator(9, 2, 'assistant')(dispatch);
    await flushPromises();

    expect(dispatch).toHaveBeenCalledWith({
      type: ADD_TEAM_COLLABORATOR,
      id: 9,
      coachId: 2,
      role: 'assistant'
    });
    expect(dispatch).toHaveBeenLastCalledWith({
      type: ADD_TEAM_COLLABORATOR_ERROR,
      response: error
    });
  });

  it('should dispatch addTeamCollaboratorSuccess when collaborator creation succeeds', async () => {
    const dispatch = jest.fn();
    const response = { status: 201, data: { id: 2, role: 'assistant' } };
    axios.post.mockResolvedValueOnce(response);

    addTeamCollaborator(9, 2, 'assistant')(dispatch);
    await flushPromises();

    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: ADD_TEAM_COLLABORATOR,
      id: 9,
      coachId: 2,
      role: 'assistant'
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: ADD_TEAM_COLLABORATOR_SUCCESS,
      response
    });
  });

  it('should expose UPDATE_TEAM_COLLABORATOR action type', () => {
    expect(UPDATE_TEAM_COLLABORATOR).toBe('UPDATE_TEAM_COLLABORATOR');
  });

  it('should put collaborator role updates to the team coaches endpoint', () => {
    const dispatch = jest.fn();

    updateTeamCollaborator(9, 2, 'owner')(dispatch);

    expect(dispatch).toHaveBeenCalledWith({
      type: UPDATE_TEAM_COLLABORATOR,
      id: 9,
      coachId: 2,
      role: 'owner'
    });
    expect(axios.put).toHaveBeenCalledWith(
      'http://localhost:8080/teams/9/coaches/2',
      { role: 'owner' },
      { withCredentials: true }
    );
  });

  it('should create updateTeamCollaboratorSuccess action', () => {
    const response = { data: { id: 2, role: 'owner' } };
    expect(updateTeamCollaboratorSuccess(response)).toEqual({
      type: UPDATE_TEAM_COLLABORATOR_SUCCESS,
      response
    });
  });

  it('should create updateTeamCollaboratorError action', () => {
    const response = 'err';
    expect(updateTeamCollaboratorError(response)).toEqual({
      type: UPDATE_TEAM_COLLABORATOR_ERROR,
      response
    });
  });

  it('should dispatch updateTeamCollaboratorError when collaborator update fails', async () => {
    const dispatch = jest.fn();
    const error = new Error('update failed');
    axios.put.mockRejectedValueOnce(error);

    updateTeamCollaborator(9, 2, 'owner')(dispatch);
    await flushPromises();

    expect(dispatch).toHaveBeenCalledWith({
      type: UPDATE_TEAM_COLLABORATOR,
      id: 9,
      coachId: 2,
      role: 'owner'
    });
    expect(dispatch).toHaveBeenLastCalledWith({
      type: UPDATE_TEAM_COLLABORATOR_ERROR,
      response: error
    });
  });

  it('should dispatch updateTeamCollaboratorSuccess when collaborator update succeeds', async () => {
    const dispatch = jest.fn();
    const response = { status: 200, data: { id: 2, role: 'owner' } };
    axios.put.mockResolvedValueOnce(response);

    updateTeamCollaborator(9, 2, 'owner')(dispatch);
    await flushPromises();

    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: UPDATE_TEAM_COLLABORATOR,
      id: 9,
      coachId: 2,
      role: 'owner'
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: UPDATE_TEAM_COLLABORATOR_SUCCESS,
      response
    });
  });

  it('should expose REMOVE_TEAM_COLLABORATOR action type', () => {
    expect(REMOVE_TEAM_COLLABORATOR).toBe('REMOVE_TEAM_COLLABORATOR');
  });

  it('should delete collaborators from the team coaches endpoint', () => {
    const dispatch = jest.fn();

    removeTeamCollaborator(9, 2)(dispatch);

    expect(dispatch).toHaveBeenCalledWith({
      type: REMOVE_TEAM_COLLABORATOR,
      id: 9,
      coachId: 2
    });
    expect(axios.delete).toHaveBeenCalledWith(
      'http://localhost:8080/teams/9/coaches/2',
      { withCredentials: true }
    );
  });

  it('should create removeTeamCollaboratorSuccess action', () => {
    expect(removeTeamCollaboratorSuccess(9, 2)).toEqual({
      type: REMOVE_TEAM_COLLABORATOR_SUCCESS,
      id: 9,
      coachId: 2
    });
  });

  it('should create removeTeamCollaboratorError action', () => {
    const response = 'err';
    expect(removeTeamCollaboratorError(response)).toEqual({
      type: REMOVE_TEAM_COLLABORATOR_ERROR,
      response
    });
  });

  it('should dispatch removeTeamCollaboratorError when collaborator deletion fails', async () => {
    const dispatch = jest.fn();
    const error = new Error('delete failed');
    axios.delete.mockRejectedValueOnce(error);

    removeTeamCollaborator(9, 2)(dispatch);
    await flushPromises();

    expect(dispatch).toHaveBeenCalledWith({
      type: REMOVE_TEAM_COLLABORATOR,
      id: 9,
      coachId: 2
    });
    expect(dispatch).toHaveBeenLastCalledWith({
      type: REMOVE_TEAM_COLLABORATOR_ERROR,
      response: error
    });
  });

  it('should dispatch removeTeamCollaboratorSuccess when collaborator deletion succeeds', async () => {
    const dispatch = jest.fn();
    const response = { status: 204, data: {} };
    axios.delete.mockResolvedValueOnce(response);

    removeTeamCollaborator(9, 2)(dispatch);
    await flushPromises();

    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: REMOVE_TEAM_COLLABORATOR,
      id: 9,
      coachId: 2
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: REMOVE_TEAM_COLLABORATOR_SUCCESS,
      id: 9,
      coachId: 2
    });
  });

  it('should expose CREATE_GAME_ENTRY action type', () => {
    expect(CREATE_GAME_ENTRY).toBe('CREATE_GAME_ENTRY');
  });

  it('should post a game entry to the team games endpoint', () => {
    const dispatch = jest.fn();
    const payload = {
      opponent: 'Lions',
      game_date: '2026-03-28T00:00:00Z',
      playerStats: []
    };

    createGameEntry(9, payload)(dispatch);

    expect(dispatch).toHaveBeenCalledWith({
      type: CREATE_GAME_ENTRY,
      id: 9,
      payload
    });
    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:8080/teams/9/games',
      payload,
      { withCredentials: true }
    );
  });

  it('should create createGameEntrySuccess action', () => {
    const response = { data: { id: 1 } };
    const expected = {
      type: CREATE_GAME_ENTRY_SUCCESS,
      response
    };
    expect(createGameEntrySuccess(response)).toEqual(expected);
  });

  it('should create createGameEntryError action', () => {
    const response = 'err';
    const expected = {
      type: CREATE_GAME_ENTRY_ERROR,
      response
    };
    expect(createGameEntryError(response)).toEqual(expected);
  });
});
