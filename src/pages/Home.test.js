import React from 'react';
import ReactDOM from 'react-dom';

jest.mock('../components/Nav', () => props => (
  <div data-testid="nav">{props.loggedIn ? 'logged-in-nav' : 'logged-out-nav'}</div>
));
jest.mock('../components/Hero', () => () => <div>Hero</div>);
jest.mock('../components/Footer', () => () => <div>Footer</div>);

import Home from './Home';

describe('Home page', () => {
  let div;

  beforeEach(() => {
    div = document.createElement('div');
    document.body.appendChild(div);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(div);
    div.remove();
    div = null;
  });

  it('renders the home page shell with nav, hero, and footer', () => {
    ReactDOM.render(<Home />, div);

    const section = div.querySelector('section#home');

    expect(section).not.toBeNull();
    expect(div.textContent).toContain('logged-out-nav');
    expect(div.textContent).toContain('Hero');
    expect(div.textContent).toContain('Footer');
  });
});
