import React from 'react';

import 'bulma/css/bulma.css';
import '../css/nav.css';

export default function Nav(props) {
  let options = [];
  if(props.loggedIn){
    options.push(
      <a className="nav-item is-tab nav-color" href="">
        <i className="fa fa-user-o icon nav-icon" aria-hidden="true"></i>
        Logout
      </a>
    );
  }else{
    options.push(
      <a className="nav-item is-tab nav-color" href="register.html">
        <i className="fa fa-user-o icon nav-icon" aria-hidden="true"></i>
        Sign Up
      </a>
    );
    options.push(
      <a className="nav-item is-tab nav-color" href="login.html">
        <i className="fa fa-sign-out icon nav-icon" aria-hidden="true"></i>
        Log In
      </a>
    )
  }
  return (
    <nav className="nav has-shadow">
      <div className="nav-left">
        <a className="nav-item logo-nav" href="index.html">
          <p className="logo">Highlander</p>
        </a>
      </div>

      <span id="nav-toggle" className="nav-toggle toggle-hamburger-placement">
        <span></span>
        <span></span>
        <span></span>
      </span>

      <div className="nav-right nav-menu" id="nav-menu">
        {options}
      </div>
    </nav>
  )
}
