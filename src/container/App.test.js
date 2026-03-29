import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

jest.mock('../actions/loginAction', () => ({
  bootstrapSession: jest.fn(() => ({ type: 'BOOTSTRAP_SESSION_REQUEST' })),
  login: jest.fn(() => ({ type: 'LOGIN_REQUEST' }))
}));

jest.mock('../pages/Home', () => () => null);
jest.mock('../pages/Register', () => () => null);
jest.mock('../pages/Dashboard', () => () => <div>Dashboard Page</div>);
jest.mock('../pages/TeamDetails', () => () => null);
jest.mock('../components/Nav', () => () => null);
jest.mock('../components/LoginForm', () => () => null);
jest.mock('../components/Footer', () => () => null);

import ConnectedApp, { App } from './App';
import { bootstrapSession } from '../actions/loginAction';

describe('App container', () => {
  let div;

  beforeEach(() => {
    div = document.createElement('div');
    document.body.appendChild(div);
    bootstrapSession.mockClear();
    window.history.pushState({}, '', '/');
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(div);
    div.remove();
    div = null;
  });

  it('renders without crashing and bootstraps the session on mount', () => {
    const bootstrapSession = jest.fn();

    ReactDOM.render(<App bootstrapSession={bootstrapSession} />, div);

    expect(bootstrapSession).toHaveBeenCalledTimes(1);
  });

  it('does not dispatch bootstrapSession again on rerender', () => {
    const bootstrapSession = jest.fn();

    ReactDOM.render(<App bootstrapSession={bootstrapSession} />, div);
    ReactDOM.render(<App bootstrapSession={bootstrapSession} />, div);

    expect(bootstrapSession).toHaveBeenCalledTimes(1);
  });

  it('dispatches bootstrapSession when the connected App mounts inside a Provider', () => {
    const store = createStore(() => ({}));
    bootstrapSession.mockReturnValueOnce({
      type: 'BOOTSTRAP_SESSION_REQUEST'
    });

    ReactDOM.render(
      <Provider store={store}>
        <ConnectedApp />
      </Provider>,
      div
    );

    expect(bootstrapSession).toHaveBeenCalledTimes(1);
  });

  it('routes authenticated bootstrap state from /login to the dashboard in the connected app', done => {
    window.history.pushState({}, '', '/login');
    const state = {
      loginReducer: {
        isLoading: false,
        isloggedIn: true,
        hasResolvedSession: true,
        shouldRedirect: false,
        errorMessage: null
      },
      coachReducer: {},
      teamReducer: {},
      form: {}
    };
    const store = createStore((currentState = state) => currentState);
    bootstrapSession.mockReturnValueOnce({
      type: 'BOOTSTRAP_SESSION_REQUEST'
    });

    ReactDOM.render(
      <Provider store={store}>
        <ConnectedApp />
      </Provider>,
      div
    );

    expect(bootstrapSession).toHaveBeenCalledTimes(1);

    setTimeout(() => {
      expect(div.textContent).toContain('Dashboard Page');
      done();
    }, 0);
  });
});
