import React from 'react';

import 'bulma/css/bulma.css';

export default function TeamsList(props) {
  return (
    <div className='tile is-child box header'>
      <nav className="level dashboard-title">
          <div className="level-left">
            <div className="level-item">
              <span className="icon">
                <i className="fa fa-futbol-o icon-dasboard-placement" aria-hidden="true"></i>
              </span>
              <p>
                Teams
              </p>
            </div>
          </div>
          <div className="level-right">
            <span className="level-item">
              <a className="button is-outlined is-primary" href="add-team.html">
                Add a New Team
              </a>
            </span>
          </div>
        </nav>
        <ul className="teams-list-container">

          <div className="notification has-text-centered add-team-message">
            You dont have any teams.
          </div>
        </ul>
    </div>
  )
}
