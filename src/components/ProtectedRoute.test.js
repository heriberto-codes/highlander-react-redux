import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { createStore } from 'redux';

import ProtectedRoute from './ProtectedRoute';

const defaultLoginState = {
  isLoading: false,
  isloggedIn: false,
  hasResolvedSession: false,
  shouldRedirect: false,
  errorMessage: null
};

function createProtectedRouteStore(loginState = {}) {
  const initialState = {
    loginReducer: {
      ...defaultLoginState,
      ...loginState
    }
  };

  return createStore((state = initialState) => state);
}

function LoginDestination() {
  const location = useLocation();
  const fromPathname = location.state && location.state.from
    ? location.state.from.pathname
    : '';

  return <div>Login Page from {fromPathname}</div>;
}

describe('ProtectedRoute', () => {
  let div;

  function renderProtectedRoute(store, route = '/dashboard') {
    ReactDOM.render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teamdetails/:id"
              element={
                <ProtectedRoute>
                  <div>Protected Team Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginDestination />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
      div
    );
  }

  beforeEach(() => {
    div = document.createElement('div');
    document.body.appendChild(div);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(div);
    div.remove();
    div = null;
  });

  it('renders a loading state while session bootstrap is unresolved', () => {
    const store = createProtectedRouteStore({
      hasResolvedSession: false,
      isLoading: false,
      isloggedIn: false
    });

    renderProtectedRoute(store);

    expect(div.textContent).toContain('Loading...');
    expect(div.textContent).not.toContain('Protected Content');
    expect(div.textContent).not.toContain('Login Page');
  });

  it('renders a loading state while the session request is loading', () => {
    const store = createProtectedRouteStore({
      hasResolvedSession: true,
      isLoading: true,
      isloggedIn: false
    });

    renderProtectedRoute(store);

    expect(div.textContent).toContain('Loading...');
    expect(div.textContent).not.toContain('Protected Content');
    expect(div.textContent).not.toContain('Login Page');
  });

  it('redirects resolved logged-out users to login with the attempted route', async () => {
    const store = createProtectedRouteStore({
      hasResolvedSession: true,
      isLoading: false,
      isloggedIn: false
    });

    await act(async () => {
      renderProtectedRoute(store, '/teamdetails/9');
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(div.textContent).toContain('Login Page from /teamdetails/9');
    expect(div.textContent).not.toContain('Protected Team Content');
  });

  it('renders children for resolved logged-in users', () => {
    const store = createProtectedRouteStore({
      hasResolvedSession: true,
      isLoading: false,
      isloggedIn: true
    });

    renderProtectedRoute(store);

    expect(div.textContent).toContain('Protected Content');
    expect(div.textContent).not.toContain('Loading...');
    expect(div.textContent).not.toContain('Login Page');
  });
});
