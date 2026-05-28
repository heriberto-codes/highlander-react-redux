import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { createStore } from 'redux';

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

const defaultLoginState = {
  isLoading: false,
  isloggedIn: false,
  hasResolvedSession: false,
  errorMessage: null,
  shouldRedirect: false
};

function createLoginStore(loginState = {}) {
  const initialState = {
    loginReducer: {
      ...defaultLoginState,
      ...loginState
    }
  };

  return createStore((state = initialState, action) => {
    if (action.type === 'SET_LOGIN_STATE') {
      return {
        ...state,
        loginReducer: {
          ...state.loginReducer,
          ...action.payload
        }
      };
    }

    return state;
  });
}

describe('Login page', () => {
  let div;

  function renderLogin(store = createLoginStore(), initialEntries = ['/login']) {
    ReactDOM.render(
      <Provider store={store}>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<div>Dashboard Page</div>} />
            <Route path="/teamdetails/:id" element={<div>Team Details Page</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>,
      div
    );

    return store;
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

  it('renders loading and does not render the login form while session bootstrap is unresolved', () => {
    act(() => {
      renderLogin();
    });

    expect(div.textContent).toContain('logged-out-nav');
    expect(div.textContent).toContain('Loading...');
    expect(div.textContent).not.toContain('Login Form');
  });

  it('renders loading and hides the login form while auth is loading', () => {
    const store = createLoginStore({
      hasResolvedSession: true,
      isLoading: true
    });

    act(() => {
      renderLogin(store);
    });

    expect(div.textContent).toContain('Loading...');
    expect(div.textContent).not.toContain('Login Form');
  });

  it('renders the login form once session bootstrap resolves logged out', () => {
    const store = createLoginStore({ hasResolvedSession: true });

    act(() => {
      renderLogin(store);
    });

    expect(div.textContent).toContain('Login Form');
    expect(div.textContent).not.toContain('Loading...');
  });

  it('renders the login form and error once bootstrap resolves logged out after a failure', () => {
    const store = createLoginStore();

    act(() => {
      renderLogin(store);
    });

    act(() => {
      store.dispatch({
        type: 'SET_LOGIN_STATE',
        payload: {
          hasResolvedSession: true,
          errorMessage: { message: 'Unauthorized' }
        }
      });
    });

    expect(div.textContent).toContain('Login Form');
    expect(div.textContent).toContain('Unauthorized');
  });

  it('redirects to dashboard once bootstrap resolves authenticated', async () => {
    const store = createLoginStore();

    await act(async () => {
      renderLogin(store);
    });

    await act(async () => {
      store.dispatch({
        type: 'SET_LOGIN_STATE',
        payload: {
          isloggedIn: true,
          hasResolvedSession: true
        }
      });
      await Promise.resolve();
    });

    expect(div.textContent).toContain('Dashboard Page');
  });

  it('redirects to dashboard when resolved login requests a redirect', async () => {
    const store = createLoginStore({ hasResolvedSession: true });

    await act(async () => {
      renderLogin(store);
    });

    await act(async () => {
      store.dispatch({
        type: 'SET_LOGIN_STATE',
        payload: {
          shouldRedirect: true
        }
      });
      await Promise.resolve();
    });

    expect(div.textContent).toContain('Dashboard Page');
  });

  it('redirects to a preserved protected route after authentication', async () => {
    const store = createLoginStore({ hasResolvedSession: true });
    const loginEntry = {
      pathname: '/login',
      state: {
        from: {
          pathname: '/teamdetails/9'
        }
      }
    };

    await act(async () => {
      renderLogin(store, [loginEntry]);
    });

    await act(async () => {
      store.dispatch({
        type: 'SET_LOGIN_STATE',
        payload: {
          isloggedIn: true
        }
      });
      await Promise.resolve();
    });

    expect(div.textContent).toContain('Team Details Page');
    expect(div.textContent).not.toContain('Dashboard Page');
  });

  it('dispatches login when the form submit handler is called', () => {
    const store = createLoginStore({ hasResolvedSession: true });
    const dispatch = jest.spyOn(store, 'dispatch');
    const action = {
      type: 'LOGIN_REQUEST',
      email: 'coach@example.com',
      pwd: 'secret'
    };
    login.mockReturnValueOnce(action);

    act(() => {
      renderLogin(store);
    });

    act(() => {
      div.querySelector('button').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(login).toHaveBeenCalledWith('coach@example.com', 'secret');
    expect(dispatch).toHaveBeenCalledWith(action);
  });
});
