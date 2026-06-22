import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';
import { act } from 'react-dom/test-utils';

import LoginForm from './LoginForm';

describe('LoginForm', () => {
  let div;

  beforeEach(() => {
    div = document.createElement('div');
    document.body.appendChild(div);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(div);
    div.remove();
  });

  it('shows the demo account credentials', () => {
    act(() => {
      ReactDOM.render(
        <MemoryRouter>
          <LoginForm onSubmit={jest.fn()} />
        </MemoryRouter>,
        div
      );
    });

    expect(div.textContent).toContain('No account? No problem.');
    expect(div.textContent).toContain('Username: test@gmail.com');
    expect(div.textContent).toContain('Password: 1234');
  });
});
