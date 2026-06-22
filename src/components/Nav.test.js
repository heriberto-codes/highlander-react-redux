import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { createStore } from 'redux';
import { Simulate } from 'react-dom/test-utils';

jest.mock('../actions/loginAction', () => ({
  logout: jest.fn(() => ({ type: 'LOGOUT_REQUEST' }))
}));

import Nav from './Nav';
import { logout } from '../actions/loginAction';

describe('Nav', () => {
  let div;

  const renderNav = isloggedIn => {
    const store = createStore(() => ({
      loginReducer: {
        isloggedIn
      }
    }));
    store.dispatch = jest.fn();

    ReactDOM.render(
      <Provider store={store}>
        <MemoryRouter>
          <Nav />
        </MemoryRouter>
      </Provider>,
      div
    );

    return store;
  };

  beforeEach(() => {
    div = document.createElement('div');
    document.body.appendChild(div);
    logout.mockClear();
    logout.mockReturnValue({ type: 'LOGOUT_REQUEST' });
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(div);
    div.remove();
  });

  it('shows authenticated navigation from Redux state', () => {
    renderNav(true);

    expect(div.textContent).toContain('Dashboard');
    expect(div.textContent).toContain('Log out');
    expect(div.textContent).not.toContain('Roster');
    expect(div.textContent).not.toContain('Stats');
    expect(div.textContent).not.toContain('Sign Up');
  });

  it('shows public navigation while logged out', () => {
    renderNav(false);

    expect(div.textContent).toContain('Sign Up');
    expect(div.textContent).toContain('Log In');
    expect(div.textContent).not.toContain('Log out');
  });

  it('dispatches the session logout action', () => {
    const store = renderNav(true);
    const logoutButton = Array.from(div.querySelectorAll('button')).find(
      button => button.textContent.includes('Log out')
    );

    Simulate.click(logoutButton);

    expect(logout).toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({ type: 'LOGOUT_REQUEST' });
  });
});
