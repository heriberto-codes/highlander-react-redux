jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ status: 200, data: {} }))
}));

import axios from 'axios';
import {
  GET_TEAM_PROFILE,
  CREATE_TEAM,
  createTeam,
  HIDE_MODAL,
  hideModal,
  ADD_PLAYER,
  addPlayer,
  ADD_PLAYER_ERROR,
  addPlayerError,
  GET_TEAM_PROFILE_SUCCESS,
  getTeamProfileSuccess,
  GET_TEAM_PROFILE_ERROR,
  getTeamProfileError,
  getTeamProfile
} from './teamAction';

describe('team actions', () => {
  beforeEach(() => {
    axios.get.mockReset();
    axios.get.mockResolvedValue({ status: 200, data: {} });
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
      season: undefined
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
      season: 2026
    });
    expect(axios.get).toHaveBeenCalledWith('http://localhost:8080/teams/9?season=2026', {
      withCredentials: true
    });
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
});
