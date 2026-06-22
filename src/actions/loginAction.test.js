jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ status: 200, data: {} })),
  post: jest.fn(() => Promise.resolve({ status: 200, data: {} })),
  delete: jest.fn(() => Promise.resolve({ status: 204 }))
}));

const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

import axios from 'axios';
import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  login,
  loginSuccess,
  LOGIN_FAIL,
  loginFail,
  LOGOUT,
  logout,
  BOOTSTRAP_SESSION_REQUEST,
  bootstrapSessionRequest,
  BOOTSTRAP_SESSION_SUCCESS,
  bootstrapSessionSuccess,
  BOOTSTRAP_SESSION_FAIL,
  bootstrapSessionFail,
  BOOTSTRAP_SESSION_LOGGED_OUT,
  bootstrapSessionLoggedOut,
  bootstrapSession,
  registerCoach
} from './loginAction';

describe('login actions', () => {
  beforeEach(() => {
    axios.get.mockReset();
    axios.post.mockReset();
    axios.delete.mockReset();
    axios.get.mockResolvedValue({ status: 200, data: {} });
    axios.post.mockResolvedValue({ status: 200, data: {} });
    axios.delete.mockResolvedValue({ status: 204 });
  });

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

  it('destroys the server session and dispatches logout', async () => {
    const dispatch = jest.fn();

    await logout()(dispatch);

    expect(axios.delete).toHaveBeenCalledWith('/api/v1/sessions', {
      withCredentials: true
    });
    expect(dispatch).toHaveBeenCalledWith({ type: LOGOUT });
  });

  it('should create a bootstrapSessionRequest action', () => {
    expect(bootstrapSessionRequest()).toEqual({
      type: BOOTSTRAP_SESSION_REQUEST
    });
  });

  it('should create a bootstrapSessionSuccess action', () => {
    const response = { data: { id: 10 } };
    expect(bootstrapSessionSuccess(response)).toEqual({
      type: BOOTSTRAP_SESSION_SUCCESS,
      response
    });
  });

  it('should create a bootstrapSessionFail action', () => {
    const err = new Error('unauthorized');
    expect(bootstrapSessionFail(err)).toEqual({
      type: BOOTSTRAP_SESSION_FAIL,
      err
    });
  });

  it('should create a bootstrapSessionLoggedOut action', () => {
    expect(bootstrapSessionLoggedOut()).toEqual({
      type: BOOTSTRAP_SESSION_LOGGED_OUT
    });
  });

  it('should post login credentials to the relative session path and dispatch success', async () => {
    const dispatch = jest.fn();
    const response = {
      status: 200,
      data: {
        id: 10,
        email: 'coach@example.com'
      }
    };
    axios.post.mockResolvedValueOnce(response);

    login('coach@example.com', 'password123')(dispatch);
    await flushPromises();

    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: LOGIN_REQUEST,
      email: 'coach@example.com',
      pwd: 'password123'
    });
    expect(axios.post).toHaveBeenCalledWith(
      '/api/v1/sessions/login',
      { email: 'coach@example.com', pwd: 'password123' },
      { withCredentials: true }
    );
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: LOGIN_SUCCESS,
      response
    });
  });

  it('should dispatch loginFail when the login request fails', async () => {
    const dispatch = jest.fn();
    const error = new Error('invalid credentials');
    axios.post.mockRejectedValueOnce(error);

    login('coach@example.com', 'wrong-password')(dispatch);
    await flushPromises();

    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: LOGIN_REQUEST,
      email: 'coach@example.com',
      pwd: 'wrong-password'
    });
    expect(axios.post).toHaveBeenCalledWith(
      '/api/v1/sessions/login',
      { email: 'coach@example.com', pwd: 'wrong-password' },
      { withCredentials: true }
    );
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: LOGIN_FAIL,
      err: error
    });
  });

  it('should request the current session bootstrap payload and dispatch success', async () => {
    const dispatch = jest.fn();
    const response = {
      status: 200,
      data: {
        id: 10,
        email: 'coach@example.com',
        first_name: 'Test',
        last_name: 'Coach'
      }
    };
    axios.get.mockResolvedValueOnce(response);

    bootstrapSession()(dispatch);
    await flushPromises();

    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: BOOTSTRAP_SESSION_REQUEST
    });
    expect(axios.get).toHaveBeenCalledWith('/api/v1/sessions', {
      withCredentials: true
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: BOOTSTRAP_SESSION_SUCCESS,
      response
    });
  });

  it.each([401, 403])(
    'should dispatch bootstrapSessionLoggedOut when bootstrap returns %s',
    async status => {
      const dispatch = jest.fn();
      axios.get.mockRejectedValueOnce({
        response: { status }
      });

      bootstrapSession()(dispatch);
      await flushPromises();

      expect(dispatch).toHaveBeenNthCalledWith(1, {
        type: BOOTSTRAP_SESSION_REQUEST
      });
      expect(dispatch).toHaveBeenNthCalledWith(2, {
        type: BOOTSTRAP_SESSION_LOGGED_OUT
      });
    }
  );

  it('should dispatch bootstrapSessionFail when bootstrap request has no response', async () => {
    const dispatch = jest.fn();
    const error = new Error('network unavailable');
    axios.get.mockRejectedValueOnce(error);

    bootstrapSession()(dispatch);
    await flushPromises();

    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: BOOTSTRAP_SESSION_REQUEST
    });
    expect(axios.get).toHaveBeenCalledWith('/api/v1/sessions', {
      withCredentials: true
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: BOOTSTRAP_SESSION_FAIL,
      err: error
    });
  });

  it('should dispatch bootstrapSessionFail for an unexpected bootstrap status', async () => {
    const dispatch = jest.fn();
    const error = {
      response: { status: 500 }
    };
    axios.get.mockRejectedValueOnce(error);

    bootstrapSession()(dispatch);
    await flushPromises();

    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: BOOTSTRAP_SESSION_REQUEST
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: BOOTSTRAP_SESSION_FAIL,
      err: error
    });
  });

  it('should post registration details to the relative coaches path', async () => {
    const coach = {
      email: 'new-coach@example.com',
      first_name: 'New',
      last_name: 'Coach',
      password: 'highlander'
    };
    const response = {
      status: 200,
      data: {
        id: 11,
        email: 'new-coach@example.com',
        first_name: 'New',
        last_name: 'Coach'
      }
    };
    axios.post.mockResolvedValueOnce(response);

    await expect(registerCoach(coach)).resolves.toBe(response);

    expect(axios.post).toHaveBeenCalledWith(
      '/api/v1/coaches',
      coach,
      { withCredentials: true }
    );
  });
});
