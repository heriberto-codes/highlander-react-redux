import { loginReducer } from './loginReducer';
import { LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAIL, LOGOUT } from '../actions/loginAction';

describe('loginReducer', () => {
  it('should handle LOGIN_REQUEST', () => {
    const state = loginReducer(undefined, { type: LOGIN_REQUEST });
    expect(state).toEqual({
      isLoading: true,
      isloggedIn: false,
      shouldRedirect: false,
      errorMessage: null
    });
  });

  it('should handle LOGIN_SUCCESS', () => {
    const state = loginReducer(undefined, { type: LOGIN_SUCCESS });
    expect(state.isLoading).toBe(false);
    expect(state.isloggedIn).toBe(true);
    expect(state.shouldRedirect).toBe(true);
  });

  it('should handle LOGIN_FAIL', () => {
    const err = 'bad';
    const state = loginReducer(undefined, { type: LOGIN_FAIL, err });
    expect(state).toEqual({
      isLoading: false,
      isloggedIn: false,
      shouldRedirect: false,
      errorMessage: err
    });
  });

  it('should handle LOGOUT', () => {
    const prevState = {
      isLoading: false,
      isloggedIn: true,
      shouldRedirect: true,
      errorMessage: null
    };
    const state = loginReducer(prevState, { type: LOGOUT });
    expect(state).toEqual({
      isLoading: false,
      isloggedIn: false,
      shouldRedirect: false,
      errorMessage: null
    });
  });
});
