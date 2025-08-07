import { PROFILE_SUCCESS, profileSuccess, PROFILE_ERROR, profileError } from './coachAction';

describe('coach actions', () => {
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
