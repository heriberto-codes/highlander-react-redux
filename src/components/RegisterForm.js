/* eslint-disable indent */
import React, { useState } from 'react';

import 'bulma/css/bulma.css';

import { registerCoach } from '../actions/loginAction';
import DemoAccountNotice from './DemoAccountNotice';

const initialFormState = {
  first_name: '',
  last_name: '',
  email: '',
  password: ''
};

const getRegistrationErrorMessage = err => {
  if (err && err.response && err.response.data) {
    if (err.response.data.error) {
      return err.response.data.error;
    }
    if (typeof err.response.data === 'string') {
      return err.response.data;
    }
  }

  return 'Sorry, registration failed. Please try again.';
};

export default function RegisterForm({ onRegister = registerCoach }) {
  const [coach, setCoach] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');

  const handleChange = event => {
    const { name, value } = event.target;

    setCoach(currentCoach => Object.assign({}, currentCoach, {
      [name]: value
    }));
  };

  const handleSubmit = event => {
    event.preventDefault();

    if (!coach.first_name || !coach.last_name || !coach.email || !coach.password) {
      setStatus('error');
      setMessage('Sorry you are missing details, please fill out the entire form.');
      return;
    }

    setIsSubmitting(true);
    setStatus(null);
    setMessage('');

    onRegister(coach)
      .then(() => {
        setCoach(initialFormState);
        setStatus('success');
        setMessage('Success! Your account was created.');
      })
      .catch(err => {
        setStatus('error');
        setMessage(getRegistrationErrorMessage(err));
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <section className="hero is-small login-bg-image register-player">
      <div className="hero-body">
        <div className="container">
          <div className="columns">
            <div className="column is-half is-offset-3">
            <h1 className="login-form-heading">Registration</h1>
              <div className="card is-half box">
                {status === 'success' && (
                  <div className="notification is-success add-team-notification">
                    {message}
                  </div>
                )}
                {status === 'error' && (
                  <div className="notification is-warning add-team-error-notification">
                    {message}
                  </div>
                )}
                <form className="card-content" onSubmit={handleSubmit}>
                    <div className="field">
                        <p className="control has-icon">
                          <input
                            className="input is-large required"
                            type="text"
                            placeholder="First Name"
                            id="first_name"
                            name="first_name"
                            value={coach.first_name}
                            onChange={handleChange}
                            disabled={isSubmitting}
                          />
                          <span className="icon is-medium">
                            <i className="fa fa-user-o"></i>
                          </span>
                        </p>
                      </div>
                      <div className="field">
                          <p className="control has-icon">
                            <input
                              className="input is-large required"
                              type="text"
                              placeholder="Last Name"
                              id="last_name"
                              name="last_name"
                              value={coach.last_name}
                              onChange={handleChange}
                              disabled={isSubmitting}
                            />
                            <span className="icon is-medium">
                              <i className="fa fa-user-o"></i>
                            </span>
                          </p>
                        </div>
                    <div className="field">
                      <p className="control has-icon">
                        <input
                          className="input is-large required"
                          type="email"
                          placeholder="Email"
                          id="email"
                          name="email"
                          value={coach.email}
                          onChange={handleChange}
                          disabled={isSubmitting}
                        />
                        <span className="icon is-medium">
                          <i className="fa fa-envelope"></i>
                        </span>
                      </p>
                    </div>
                    <div className="field">
                      <p className="control has-icon">
                        <input
                          className="input is-large required"
                          type="password"
                          placeholder="Password"
                          id="password"
                          name="password"
                          value={coach.password}
                          onChange={handleChange}
                          disabled={isSubmitting}
                        />
                        <span className="icon is-medium">
                          <i className="fa fa-lock"></i>
                        </span>
                      </p>
                    </div>
                    <div className="field">
                      <p className="control">
                        <button
                          className="button is-success is-medium register-button"
                          type="submit"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Registering...' : 'Register'}
                        </button>
                      </p>
                  </div>
                </form>
                <DemoAccountNotice showLoginLink />
                <div className="has-text-centered">
                  <p>
                    <a href="login.html" className="loginCookies">Login</a> |
                    <a href="register.html" className="loginCookies">Register an Account</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  </section>
  );
}
