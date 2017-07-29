import React from 'react';

import 'bulma/css/bulma.css';
import '../css/style.css';

export default function DashboardNavigation(props) {
  return (
    <section className="hero is-primary dashboard-bg-image">
      <div className="hero-body hero-bg-image">
        <div className="container profile">
          <div className="profile-heading">
            <nav className="columns level">
              <div className="column is-4 level-left">
                <h1 className="title coach-title coach-heading-dashboard">Coach:</h1>
                <p>
                  <span className="title is-bold profile-title coach-fullname">Heriberto Roman</span>
                </p>
                <p>
                  <span className="tagline profile-metadata coach-email">Romanh99@gmail.com</span>
                </p>
              </div>
              <div className="level-right">
                  <span className="level-item">
                    <a className="button is-primary is-outlined" href="add-team.html">
                      Add a New Team
                    </a>
                  </span>
                  <span className="level-item">
                    <a className="button is-primary is-outlined" href="add-player.html">
                      Add a New Player
                    </a>
                  </span>
                  <span className="level-item">
                    <a className="button is-primary is-outlined" href="add-stats.html">
                      Add New Stats
                    </a>
                  </span>
                  </div>
                </nav>
              </div>
            </div>
          </div>
    </section>
  )
}
