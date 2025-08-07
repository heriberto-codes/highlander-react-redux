import {
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
  getTeamProfileError
} from './teamAction';

describe('team actions', () => {
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
