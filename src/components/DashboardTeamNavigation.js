import React from 'react';

import 'bulma/css/bulma.css';
import '../css/style.css';

export default function DashboardTeamNavigation(props) {
  return (
    <section className="hero is-primary dashboard-bg-image">
      <div className="hero-body hero-bg-image">
        <div className="container profile">
          <div className="profile-heading">
            <nav className="columns level">
              <div className="column is-4 level-left">
                <h1 className="title coach-title coach-heading-dashboard">Team Details:</h1>
                  <p className="profile-metadata">
                    <span className="title is-bold profile-title team-name"></span>
                  </p>
                  <p className="profile-metadata">
                    Location:
                    <span className="tagline profile-metadata team-location"></span>
                  </p>
                  <p className="profile-metadata">
                    Name:
                    <span className="tagline profile-metadata coach-name"></span>
                  </p>
                  <p className="profile-metadata">
                    Email:
                    <span className="tagline profile-metadata coach-email"></span>
                </p>
                </div>
            </nav>
          </div>
        </div>
      </div>
    </section>
  )
}
