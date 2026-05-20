import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

jest.mock('../actions/loginAction', () => ({
  login: jest.fn((email, pwd) => ({
    type: 'LOGIN_REQUEST',
    email,
    pwd
  }))
}));

jest.mock('../components/Nav', () => props => (
  <div data-testid="nav">{props.isLoggedIn ? 'logged-in-nav' : 'logged-out-nav'}</div>
));

jest.mock('../components/LoginForm', () => props => (
  <button
    type="button"
    onClick={() => props.onSubmit('coach@example.com', 'secret')}
  >
    Login Form
  </button>
));

jest.mock('../components/Footer', () => () => <div>Footer</div>);

import { Login } from './Login';
import { login } from '../actions/loginAction';

describe('Login page', () => {
  let div;

  function renderLogin(props) {
    ReactDOM.render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login {...props} />} />
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        </Routes>
      </MemoryRouter>,
      div
    );
  }

  beforeEach(() => {
    div = document.createElement('div');
    document.body.appendChild(div);
    login.mockClear();
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(div);
    div.remove();
    div = null;
  });

  it('does not render the login form while session bootstrap is unresolved', () => {
    act(() => {
      renderLogin({
        dispatch: jest.fn(),
        loggedIn: false,
        hasResolvedSession: false,
        shouldRedirect: false,
        error: null
      });
    });

    expect(div.textContent).toContain('logged-out-nav');
    expect(div.textContent).not.toContain('Login Form');
  });

  it('renders the login form once session bootstrap resolves logged out', () => {
    act(() => {
      renderLogin({
        dispatch: jest.fn(),
        loggedIn: false,
        hasResolvedSession: true,
        shouldRedirect: false,
        error: null
      });
    });

    expect(div.textContent).toContain('Login Form');
  });

  it('renders the login form and error once bootstrap resolves logged out after a failure', () => {
    act(() => {
      renderLogin({
        dispatch: jest.fn(),
        loggedIn: false,
        hasResolvedSession: false,
        shouldRedirect: false,
        error: null
      });
    });

    act(() => {
      renderLogin({
        dispatch: jest.fn(),
        loggedIn: false,
        hasResolvedSession: true,
        shouldRedirect: false,
        error: { message: 'Unauthorized' }
      });
    });

    expect(div.textContent).toContain('Login Form');
    expect(div.textContent).toContain('Unauthorized');
  });

  it('redirects to dashboard once bootstrap resolves authenticated', async () => {
    await act(async () => {
      renderLogin({
        dispatch: jest.fn(),
        loggedIn: false,
        hasResolvedSession: false,
        shouldRedirect: false,
        error: null
      });
    });

    await act(async () => {
      renderLogin({
        dispatch: jest.fn(),
        loggedIn: true,
        hasResolvedSession: true,
        shouldRedirect: false,
        error: null
      });
      await Promise.resolve();
    });

    expect(div.textContent).toContain('Dashboard Page');
  });

  it('redirects to dashboard when resolved login requests a redirect', async () => {
    await act(async () => {
      renderLogin({
        dispatch: jest.fn(),
        loggedIn: false,
        hasResolvedSession: true,
        shouldRedirect: false,
        error: null
      });
    });

    await act(async () => {
      renderLogin({
        dispatch: jest.fn(),
        loggedIn: false,
        hasResolvedSession: true,
        shouldRedirect: true,
        error: null
      });
      await Promise.resolve();
    });

    expect(div.textContent).toContain('Dashboard Page');
  });

  it('dispatches login when the form submit handler is called', () => {
    const dispatch = jest.fn();
    const action = {
      type: 'LOGIN_REQUEST',
      email: 'coach@example.com',
      pwd: 'secret'
    };
    login.mockReturnValueOnce(action);

    act(() => {
      renderLogin({
        dispatch,
        loggedIn: false,
        hasResolvedSession: true,
        shouldRedirect: false,
        error: null
      });
    });

    act(() => {
      div.querySelector('button').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(login).toHaveBeenCalledWith('coach@example.com', 'secret');
    expect(dispatch).toHaveBeenCalledWith(action);
  });
});
