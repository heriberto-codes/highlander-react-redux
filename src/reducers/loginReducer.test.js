jest.mock('../actions/loginAction', () => ({
  LOGIN_REQUEST: 'LOGIN_REQUEST',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAIL: 'LOGIN_FAIL',
  LOGOUT: 'LOGOUT',
  BOOTSTRAP_SESSION_REQUEST: 'BOOTSTRAP_SESSION_REQUEST',
  BOOTSTRAP_SESSION_SUCCESS: 'BOOTSTRAP_SESSION_SUCCESS',
  BOOTSTRAP_SESSION_FAIL: 'BOOTSTRAP_SESSION_FAIL',
  BOOTSTRAP_SESSION_LOGGED_OUT: 'BOOTSTRAP_SESSION_LOGGED_OUT'
}));

import { loginReducer } from './loginReducer';
import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  BOOTSTRAP_SESSION_REQUEST,
  BOOTSTRAP_SESSION_SUCCESS,
  BOOTSTRAP_SESSION_FAIL,
  BOOTSTRAP_SESSION_LOGGED_OUT
} from '../actions/loginAction';

describe('loginReducer', () => {
  it('should handle LOGIN_REQUEST', () => {
    const state = loginReducer(undefined, { type: LOGIN_REQUEST });
    expect(state).toEqual({
      isLoading: true,
      isloggedIn: false,
      hasResolvedSession: false,
      shouldRedirect: false,
      errorMessage: null
    });
  });

  it('should handle LOGIN_SUCCESS', () => {
    const state = loginReducer(undefined, { type: LOGIN_SUCCESS });
    expect(state.isLoading).toBe(false);
    expect(state.isloggedIn).toBe(true);
    expect(state.hasResolvedSession).toBe(true);
    expect(state.shouldRedirect).toBe(true);
  });

  it('should handle LOGIN_FAIL', () => {
    const err = 'bad';
    const state = loginReducer(undefined, { type: LOGIN_FAIL, err });
    expect(state).toEqual({
      isLoading: false,
      isloggedIn: false,
      hasResolvedSession: true,
      shouldRedirect: false,
      errorMessage: err
    });
  });

  it('should handle BOOTSTRAP_SESSION_REQUEST', () => {
    const state = loginReducer(undefined, { type: BOOTSTRAP_SESSION_REQUEST });
    expect(state).toEqual({
      isLoading: true,
      isloggedIn: false,
      hasResolvedSession: false,
      shouldRedirect: false,
      errorMessage: null
    });
  });

  it('should handle BOOTSTRAP_SESSION_SUCCESS', () => {
    const state = loginReducer(undefined, { type: BOOTSTRAP_SESSION_SUCCESS });
    expect(state).toEqual({
      isLoading: false,
      isloggedIn: true,
      hasResolvedSession: true,
      shouldRedirect: false,
      errorMessage: null
    });
  });

  it('should handle BOOTSTRAP_SESSION_FAIL', () => {
    const err = 'unauthorized';
    const state = loginReducer(undefined, { type: BOOTSTRAP_SESSION_FAIL, err });
    expect(state).toEqual({
      isLoading: false,
      isloggedIn: false,
      hasResolvedSession: true,
      shouldRedirect: false,
      errorMessage: err
    });
  });

  it('should handle BOOTSTRAP_SESSION_LOGGED_OUT', () => {
    const prevState = {
      isLoading: true,
      isloggedIn: true,
      hasResolvedSession: false,
      shouldRedirect: true,
      errorMessage: 'stale error'
    };
    const state = loginReducer(prevState, {
      type: BOOTSTRAP_SESSION_LOGGED_OUT
    });
    expect(state).toEqual({
      isLoading: false,
      isloggedIn: false,
      hasResolvedSession: true,
      shouldRedirect: false,
      errorMessage: null
    });
  });

  it('should handle LOGOUT', () => {
    const prevState = {
      isLoading: false,
      isloggedIn: true,
      hasResolvedSession: true,
      shouldRedirect: true,
      errorMessage: null
    };
    const state = loginReducer(prevState, { type: LOGOUT });
    expect(state).toEqual({
      isLoading: false,
      isloggedIn: false,
      hasResolvedSession: true,
      shouldRedirect: false,
      errorMessage: null
    });
  });
});
