jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ status: 200, data: {} }))
}));

import axios from 'axios';
import {
  GET_PROFILE,
  PROFILE_SUCCESS,
  profileSuccess,
  PROFILE_ERROR,
  profileError,
  getProfile
} from './coachAction';

describe('coach actions', () => {
  beforeEach(() => {
    axios.get.mockReset();
    axios.get.mockResolvedValue({ status: 200, data: {} });
  });

  it('should expose GET_PROFILE action type', () => {
    expect(GET_PROFILE).toBe('GET_PROFILE');
  });

  it('should request the base coach profile URL when no season is provided', () => {
    const dispatch = jest.fn();

    getProfile(12)(dispatch);

    expect(dispatch).toHaveBeenCalledWith({
      type: GET_PROFILE,
      id: 12,
      season: undefined
    });
    expect(axios.get).toHaveBeenCalledWith('http://localhost:8080/coaches/12', {
      withCredentials: true
    });
  });

  it('should append the season query when a season is provided', () => {
    const dispatch = jest.fn();

    getProfile(12, 2026)(dispatch);

    expect(dispatch).toHaveBeenCalledWith({
      type: GET_PROFILE,
      id: 12,
      season: 2026
    });
    expect(axios.get).toHaveBeenCalledWith('http://localhost:8080/coaches/12?season=2026', {
      withCredentials: true
    });
  });

  it('should create profileSuccess action', () => {
    const response = { data: {} };
    const expected = {
      type: PROFILE_SUCCESS,
      response
    };
    expect(profileSuccess(response)).toEqual(expected);
  });

  it('should create profileError action', () => {
    const response = 'err';
    const expected = {
      type: PROFILE_ERROR,
      response
    };
    expect(profileError(response)).toEqual(expected);
  });
});
