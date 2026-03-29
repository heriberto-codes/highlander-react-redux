import React from 'react';
import ReactDOM from 'react-dom';

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
    ReactDOM.render(
      <Login
        dispatch={jest.fn()}
        navigate={jest.fn()}
        loggedIn={false}
        hasResolvedSession={false}
        shouldRedirect={false}
        error={null}
      />,
      div
    );

    expect(div.textContent).toContain('logged-out-nav');
    expect(div.textContent).not.toContain('Login Form');
  });

  it('renders the login form once session bootstrap resolves logged out', () => {
    ReactDOM.render(
      <Login
        dispatch={jest.fn()}
        navigate={jest.fn()}
        loggedIn={false}
        hasResolvedSession={true}
        shouldRedirect={false}
        error={null}
      />,
      div
    );

    expect(div.textContent).toContain('Login Form');
  });

  it('renders the login form and error once bootstrap resolves logged out after a failure', () => {
    ReactDOM.render(
      <Login
        dispatch={jest.fn()}
        navigate={jest.fn()}
        loggedIn={false}
        hasResolvedSession={false}
        shouldRedirect={false}
        error={null}
      />,
      div
    );

    ReactDOM.render(
      <Login
        dispatch={jest.fn()}
        navigate={jest.fn()}
        loggedIn={false}
        hasResolvedSession={true}
        shouldRedirect={false}
        error={{ message: 'Unauthorized' }}
      />,
      div
    );

    expect(div.textContent).toContain('Login Form');
    expect(div.textContent).toContain('Unauthorized');
  });

  it('redirects to dashboard once bootstrap resolves authenticated', done => {
    const navigate = jest.fn();

    ReactDOM.render(
      <Login
        dispatch={jest.fn()}
        navigate={navigate}
        loggedIn={false}
        hasResolvedSession={false}
        shouldRedirect={false}
        error={null}
      />,
      div
    );

    ReactDOM.render(
      <Login
        dispatch={jest.fn()}
        navigate={navigate}
        loggedIn={true}
        hasResolvedSession={true}
        shouldRedirect={false}
        error={null}
      />,
      div
    );

    setTimeout(() => {
      expect(navigate).toHaveBeenCalledWith('/dashboard');
      done();
    }, 0);
  });

  it('dispatches login when the form submit handler is called', () => {
    const dispatch = jest.fn();
    const action = {
      type: 'LOGIN_REQUEST',
      email: 'coach@example.com',
      pwd: 'secret'
    };
    login.mockReturnValueOnce(action);

    ReactDOM.render(
      <Login
        dispatch={dispatch}
        navigate={jest.fn()}
        loggedIn={false}
        hasResolvedSession={true}
        shouldRedirect={false}
        error={null}
      />,
      div
    );

    div.querySelector('button').dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(login).toHaveBeenCalledWith('coach@example.com', 'secret');
    expect(dispatch).toHaveBeenCalledWith(action);
  });
});
