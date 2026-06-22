import React from 'react';
import ReactDOM from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';

jest.mock('../actions/loginAction', () => ({
  registerCoach: jest.fn(() => Promise.resolve({ status: 200 }))
}));

import RegisterForm from './RegisterForm';

const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

describe('RegisterForm', () => {
  let div;

  const renderRegisterForm = props => {
    ReactDOM.render(<RegisterForm {...props} />, div);
  };

  const changeInput = (selector, value) => {
    const input = div.querySelector(selector);

    act(() => {
      Simulate.change(input, {
        target: {
          name: input.name,
          value
        }
      });
    });

    return input;
  };

  const fillRegistrationForm = () => {
    changeInput('input#first_name', 'New');
    changeInput('input#last_name', 'Coach');
    changeInput('input#email', 'new-coach@example.com');
    changeInput('input#password', 'highlander');
  };

  beforeEach(() => {
    div = document.createElement('div');
    document.body.appendChild(div);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(div);
    div.remove();
    div = null;
  });

  it('submits controlled coach details and shows success feedback', async () => {
    let resolveRegistration;
    const registrationPromise = new Promise(resolve => {
      resolveRegistration = resolve;
    });
    const onRegister = jest.fn(() => registrationPromise);

    renderRegisterForm({ onRegister });
    fillRegistrationForm();

    act(() => {
      Simulate.submit(div.querySelector('form'));
    });

    const button = div.querySelector('button[type="submit"]');

    expect(onRegister).toHaveBeenCalledWith({
      first_name: 'New',
      last_name: 'Coach',
      email: 'new-coach@example.com',
      password: 'highlander'
    });
    expect(button.disabled).toBe(true);
    expect(button.textContent).toContain('Registering...');

    await act(async () => {
      resolveRegistration({ status: 200 });
      await registrationPromise;
      await flushPromises();
    });

    expect(div.textContent).toContain('Success! Your account was created.');
    expect(div.querySelector('input#first_name').value).toBe('');
    expect(div.querySelector('input#last_name').value).toBe('');
    expect(div.querySelector('input#email').value).toBe('');
    expect(div.querySelector('input#password').value).toBe('');
    expect(div.querySelector('button[type="submit"]').disabled).toBe(false);
  });

  it('shows a missing-details error and does not submit incomplete forms', () => {
    const onRegister = jest.fn();

    renderRegisterForm({ onRegister });
    changeInput('input#first_name', 'New');
    changeInput('input#last_name', 'Coach');
    changeInput('input#email', 'new-coach@example.com');

    act(() => {
      Simulate.submit(div.querySelector('form'));
    });

    expect(onRegister).not.toHaveBeenCalled();
    expect(div.textContent).toContain('Sorry you are missing details, please fill out the entire form.');
  });

  it('shows registration failure feedback and re-enables submit', async () => {
    const onRegister = jest.fn(() => Promise.reject({
      response: {
        data: {
          error: 'Email already registered'
        }
      }
    }));

    renderRegisterForm({ onRegister });
    fillRegistrationForm();

    await act(async () => {
      Simulate.submit(div.querySelector('form'));
      await flushPromises();
    });

    expect(onRegister).toHaveBeenCalledTimes(1);
    expect(div.textContent).toContain('Email already registered');
    expect(div.querySelector('button[type="submit"]').disabled).toBe(false);
  });

  it('shows the demo account credentials and login link', () => {
    renderRegisterForm();

    expect(div.textContent).toContain('No account? No problem.');
    expect(div.textContent).toContain('Username: test@gmail.com');
    expect(div.textContent).toContain('Password: 1234');
    expect(div.querySelector('.demo-account-login-link a').getAttribute('href')).toBe('/login');
  });
});
