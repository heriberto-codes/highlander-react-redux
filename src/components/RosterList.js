import React from 'react';

import 'bulma/css/bulma.css';
import '../css/style.css';

export default function RosterList(props) {
  return (
    <div className='tile is-child box header'>
    <nav className="level dashboard-title">
    <div className="level-left">
      <div className="level-item">
        <span className="icon icon-dasboard-placement">
          <i className="fa fa-users" aria-hidden="true"></i>
        </span>
        <p>
          Roster
        </p>
      </div>
    </div>
    <div className="level-right">
  <span className="level-item">
    <a className="button is-outlined is-primary" href="add-player.html">
      Add a New Player
    </a>
  </span>
</div>
</nav>


<div className="notification has-text-centered roster-dashboard-message">
  You dont have a Roster.
  </div>
    <div className="columns">
      <div className="column player-details-dashboard-page">
        <div className='card has-text-centered'>
          <div className='card-content'>
            <p className='title player-name'>Some name</p>
            <p className='subtitle player-email'>name@gmail.com</p>
          </div>
          <footer className='card-footer panel-heading dashboard-roster-footer'>
            <p className='card-footer-item'>
              <span>
                <a href='#'>View Player Details</a>
              </span>
            </p>
          </footer>
        </div>
      </div>
  </div>
</div>
  )
}
