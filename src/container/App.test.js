import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../actions/loginAction', () => ({
  bootstrapSession: jest.fn(() => ({ type: 'BOOTSTRAP_SESSION_REQUEST' })),
  login: jest.fn(() => ({ type: 'LOGIN_REQUEST' }))
}));

jest.mock('../pages/Home', () => () => null);
jest.mock('../pages/Register', () => () => null);
jest.mock('../pages/Dashboard', () => () => <div>Dashboard Page</div>);
jest.mock('../pages/TeamDetails', () => () => <div>Team Details Page</div>);
jest.mock('../components/Nav', () => () => null);
jest.mock('../components/LoginForm', () => () => <div>Login Form</div>);
jest.mock('../components/Footer', () => () => null);

import App, { ScrollToHash } from './App';
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

  const createStoreWithLoginState = loginState => {
    const state = {
      loginReducer: {
        isLoading: false,
        isloggedIn: false,
        hasResolvedSession: false,
        shouldRedirect: false,
        errorMessage: null,
        ...loginState
      },
      coachReducer: {},
      teamReducer: {},
      form: {}
    };

    return createStore((currentState = state) => currentState);
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
    const store = createStoreWithLoginState({
      isLoading: false,
      isloggedIn: true,
      hasResolvedSession: true,
      shouldRedirect: false,
      errorMessage: null
    });
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

  it('renders protected app routes for resolved logged-in users', () => {
    const store = createStoreWithLoginState({
      isLoading: false,
      isloggedIn: true,
      hasResolvedSession: true
    });

    window.history.pushState({}, '', '/dashboard');
    act(() => {
      renderApp(store);
    });

    expect(div.textContent).toContain('Dashboard Page');
    expect(div.textContent).not.toContain('Loading...');
  });

  it('renders parameterized protected app routes for resolved logged-in users', () => {
    const store = createStoreWithLoginState({
      isLoading: false,
      isloggedIn: true,
      hasResolvedSession: true
    });

    window.history.pushState({}, '', '/dashboard/7');
    act(() => {
      renderApp(store);
    });

    expect(div.textContent).toContain('Dashboard Page');
    expect(div.textContent).not.toContain('Loading...');
  });

  it('renders protected team detail routes for resolved logged-in users', () => {
    const store = createStoreWithLoginState({
      isLoading: false,
      isloggedIn: true,
      hasResolvedSession: true
    });

    window.history.pushState({}, '', '/teamdetails/9');
    act(() => {
      renderApp(store);
    });

    expect(div.textContent).toContain('Team Details Page');
    expect(div.textContent).not.toContain('Loading...');
  });

  it('shows loading for protected app routes while session bootstrap is unresolved', () => {
    const store = createStoreWithLoginState({
      isLoading: false,
      isloggedIn: false,
      hasResolvedSession: false
    });

    window.history.pushState({}, '', '/dashboard');
    act(() => {
      renderApp(store);
    });

    expect(div.textContent).toContain('Loading...');
    expect(div.textContent).not.toContain('Dashboard Page');
    expect(div.textContent).not.toContain('Login Form');
  });

  it('redirects resolved logged-out users from protected app routes to login', async () => {
    const store = createStoreWithLoginState({
      isLoading: false,
      isloggedIn: false,
      hasResolvedSession: true
    });

    window.history.pushState({}, '', '/teamdetails/9');
    await act(async () => {
      renderApp(store);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(window.location.pathname).toBe('/login');
    expect(div.textContent).toContain('Login Form');
    expect(div.textContent).not.toContain('Team Details Page');
  });

  it('scrolls to a dashboard section from the URL hash', async () => {
    const section = document.createElement('div');
    section.id = 'roster';
    section.scrollIntoView = jest.fn();
    div.appendChild(section);

    await act(async () => {
      ReactDOM.render(
        <MemoryRouter initialEntries={['/dashboard#roster']}>
          <ScrollToHash />
        </MemoryRouter>,
        section
      );
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(section.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start'
    });
  });
});
