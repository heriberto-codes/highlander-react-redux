import React from 'react';
import ReactDOM from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

jest.mock('../actions/loginAction', () => ({
  registerCoach: jest.fn(() => Promise.resolve({ status: 200 }))
}));

jest.mock('../components/Nav', () => () => <div>Nav</div>);
jest.mock('../components/RegisterForm', () => props => (
  <button
    type="button"
    onClick={() => props.onRegister({
      first_name: 'New',
      last_name: 'Coach',
      email: 'new-coach@example.com',
      password: 'highlander'
    })}
  >
    Register Form
  </button>
));
jest.mock('../components/Footer', () => () => <div>Footer</div>);

import Register from './Register';
import { registerCoach } from '../actions/loginAction';

const expectedCoach = {
  first_name: 'New',
  last_name: 'Coach',
  email: 'new-coach@example.com',
  password: 'highlander'
};

const flushTimers = () => new Promise(resolve => setTimeout(resolve, 0));

describe('Register page', () => {
  let div;

  const renderRegister = () => {
    ReactDOM.render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
      div
    );
  };

  beforeEach(() => {
    div = document.createElement('div');
    document.body.appendChild(div);
    registerCoach.mockClear();
    registerCoach.mockResolvedValue({ status: 200 });
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(div);
    div.remove();
    div = null;
  });

  it('renders the register page shell with nav, form, and footer', () => {
    act(() => {
      renderRegister();
    });

    expect(div.textContent).toContain('Nav');
    expect(div.textContent).toContain('Register Form');
    expect(div.textContent).toContain('Footer');
  });

  it('submits registration through the page handler and redirects to login after success', async () => {
    act(() => {
      renderRegister();
    });

    await act(async () => {
      Simulate.click(div.querySelector('button[type="button"]'));
      await flushTimers();
      await flushTimers();
    });

    expect(registerCoach).toHaveBeenCalledTimes(1);
    expect(registerCoach).toHaveBeenCalledWith(expectedCoach);
    expect(div.textContent).toContain('Login Page');
  });
});
