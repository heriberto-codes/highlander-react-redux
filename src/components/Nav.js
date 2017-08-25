import React from 'react';
import { Link } from 'react-router-dom';

import 'bulma/css/bulma.css';
import '../css/nav.css';

export default function Nav(props) {

  let options = [];
  if(props.isLoggedIn){
    options.push(
      <div className="nav-right nav-menu" id="nav-menu">
        <Link className="nav-item nav-color is-tab is-active" to='/dashboard'>
          <i className="fa fa-home icon the-shit" aria-hidden="true"></i>
          Dashboard
        </Link>

        <Link className="nav-item nav-color is-tab" to='/register'>
          <i className="fa fa-futbol-o icon the-shit" aria-hidden="true"></i>
          Team
        </Link>

        <Link className="nav-item nav-color is-tab" to='/register'>
          <i className="fa fa-users icon the-shit" aria-hidden="true"></i>
          Roster
        </Link>

        <Link className="nav-item nav-color is-tab" to='/register'>
          <i className="fa fa-list-ol icon the-shit" aria-hidden="true"></i>
          Stats
        </Link>

        <Link className="nav-item is-tab nav-color logout-session" to='/register'>
          <i className="fa fa-sign-out icon the-shit" aria-hidden="true"></i>
          Log out
        </Link>
      </div>
    );
  }else{
    options.push(
      <Link className="nav-item is-tab nav-color" to='/register'>
        <i className="fa fa-user-o icon nav-icon" aria-hidden="true"></i>
        Sign Up
      </Link>
    );
    options.push(
      <Link className="nav-item is-tab nav-color" to='/login'>
        <i className="fa fa-sign-out icon nav-icon" aria-hidden="true"></i>
        Log In
      </Link>
    )
  }
  return (
    <nav className="nav has-shadow">
      <div className="nav-left">
        <Link className="nav-item logo-nav" to='/'>
          <p className="logo">Highlander</p>
        </Link>
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
