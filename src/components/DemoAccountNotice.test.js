import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';
import { act } from 'react-dom/test-utils';

import DemoAccountNotice from './DemoAccountNotice';

describe('DemoAccountNotice', () => {
  let div;

  beforeEach(() => {
    div = document.createElement('div');
    document.body.appendChild(div);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(div);
    div.remove();
  });

  it('shows the demo credentials', () => {
    act(() => {
      ReactDOM.render(
        <MemoryRouter>
          <DemoAccountNotice />
        </MemoryRouter>,
        div
      );
    });

    expect(div.textContent).toContain('No account? No problem.');
    expect(div.textContent).toContain('Username: test@gmail.com');
    expect(div.textContent).toContain('Password: 1234');
    expect(div.querySelector('a')).toBeNull();
  });

  it('optionally links registration visitors to login', () => {
    act(() => {
      ReactDOM.render(
        <MemoryRouter>
          <DemoAccountNotice showLoginLink />
        </MemoryRouter>,
        div
      );
    });

    const loginLink = div.querySelector('a');
    expect(loginLink.getAttribute('href')).toBe('/login');
    expect(loginLink.textContent).toBe('Use demo account and log in');
  });
});
