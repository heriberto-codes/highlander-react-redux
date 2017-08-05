import React from 'react';

import 'bulma/css/bulma.css';
import '../css/style.css';
// user login via action
// creates session in the backend
// any request session ID must be sent

// So typically you would use onChange to grab the value of the form but that would mean
// I would have to make this a smart component. The work around is to use REFS.

export default function LoginForm(props){
  return (
    <div>
      <section className="hero is-small login-bg-image login-player">
        <div className="hero-body">
          <div className="container">
            <div className="columns">
              <div className="column is-half is-offset-3">
              <h1 className="login-form-heading">Login</h1>
                <div className="card is-small box">
                  <div className="notification is-success add-team-notification">
                    Success! You added a player.
                  </div>
                  <div className="notification is-warning add-team-error-notification">
                    Sorry you are missing details, please fill out the <strong>entire</strong> form.
                  </div>
                  <div className="card-content">
                    <div className="field">
                      <p className="control has-icon">
                        <input className="input is-large" type="email" placeholder="Email" id="email" />
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
                        <button className="button is-success is-medium login-button">
                          Login
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
    </div>
 )
}
