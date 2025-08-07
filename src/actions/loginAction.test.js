import { LOGIN_SUCCESS, loginSuccess, LOGIN_FAIL, loginFail, LOGOUT, logout } from './loginAction';

// Test synchronous action creators

describe('login actions', () => {
  it('should create an action for loginSuccess', () => {
    const response = { data: { token: '123' } };
    const expectedAction = {
      type: LOGIN_SUCCESS,
      response
    };
    expect(loginSuccess(response)).toEqual(expectedAction);
  });

  it('should create an action for loginFail', () => {
    const err = 'error';
    const expectedAction = {
      type: LOGIN_FAIL,
      err
    };
    expect(loginFail(err)).toEqual(expectedAction);
  });

  it('should create an action for logout', () => {
    const email = 'test@example.com';
    const pwd = 'pwd';
    const expectedAction = {
      type: LOGOUT,
      email,
      pwd
    };
    expect(logout(email, pwd)).toEqual(expectedAction);
  });
});
