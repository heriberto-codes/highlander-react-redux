import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
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

import App from './App';
import { bootstrapSession } from '../actions/loginAction';

describe('App container', () => {
  let div;

  beforeEach(() => {
    div = document.createElement('div');
    document.body.appendChild(div);
    bootstrapSession.mockClear();
    bootstrapSession.mockImplementation(() => ({ type: 'BOOTSTRAP_SESSION_REQUEST' }));
    window.history.pushState({}, '', '/');
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(div);
    div.remove();
    div = null;
  });

  const renderApp = store => {
    ReactDOM.render(
      <Provider store={store}>
        <App />
      </Provider>,
      div
    );
  };

  it('renders without crashing and bootstraps the session on mount', () => {
    const store = createStore(() => ({}));

    act(() => {
      renderApp(store);
    });

    expect(bootstrapSession).toHaveBeenCalledTimes(1);
  });

  it('does not dispatch bootstrapSession again on rerender', () => {
    const store = createStore(() => ({}));

    act(() => {
      renderApp(store);
    });
    act(() => {
      renderApp(store);
    });

    expect(bootstrapSession).toHaveBeenCalledTimes(1);
  });

  it('dispatches bootstrapSession when App mounts inside a Provider', () => {
    const store = createStore(() => ({}));
    bootstrapSession.mockReturnValueOnce({
      type: 'BOOTSTRAP_SESSION_REQUEST'
    });

    act(() => {
      renderApp(store);
    });

    expect(bootstrapSession).toHaveBeenCalledTimes(1);
  });

  it('routes authenticated bootstrap state from /login to the dashboard in the hook-based app', async () => {
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

    await act(async () => {
      renderApp(store);
      await new Promise(resolve => setTimeout(resolve, 0));
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(bootstrapSession).toHaveBeenCalledTimes(1);
    expect(div.textContent).toContain('Dashboard Page');
  });
});
