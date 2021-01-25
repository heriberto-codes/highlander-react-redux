/* eslint-disable indent */
import React from 'react';

import 'bulma/css/bulma.css';

export default function RegisterForm(props) {
  return (
    <section className="hero is-small login-bg-image register-player">
      <div className="hero-body">
        <div className="container">
          <div className="columns">
            <div className="column is-half is-offset-3">
            <h1 className="login-form-heading">Registration</h1>
              <div className="card is-half box">
                <div className="notification is-success add-team-notification">
                  Success! You added a player.
                </div>
                <div className="notification is-warning add-team-error-notification">
                  Sorry you are missing details, please fill out the <strong>entire</strong> form.
                </div>
                <div className="card-content">
                  <div className="field">
                      <p className="control has-icon">
                        <input className="input is-large required" type="text" placeholder="First Name" id="first_name" />
                        <span className="icon is-medium">
                          <i className="fa fa-user-o"></i>
                        </span>
                      </p>
                    </div>
                    <div className="field">
                        <p className="control has-icon">
                          <input className="input is-large required" type="text" placeholder="Last Name" id="last_name" />
                          <span className="icon is-medium">
                            <i className="fa fa-user-o"></i>
                          </span>
                        </p>
                      </div>
                  <div className="field">
                      <p className="control has-icon">
                        <input className="input is-large required" type="email" placeholder="Email" id="email" />
                        <span className="icon is-medium">
                          <i className="fa fa-envelope"></i>
                        </span>
                      </p>
                    </div>
                    <div className="field">
                      <p className="control has-icon">
                        <input className="input is-large required" type="password" placeholder="Password" id="password" />
                        <span className="icon is-medium">
                          <i className="fa fa-lock"></i>
                        </span>
                      </p>
                    </div>
                    <div className="field">
                      <p className="control">
                        <button className="button is-success is-medium register-button">
                          Register
                        </button>
                      </p>
                  </div>
                </div>
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
  )
}
