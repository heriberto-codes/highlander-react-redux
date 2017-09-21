import React from 'react';

import 'bulma/css/bulma.css';
import '../css/style.css';

export default function DashboardTeamNavigation(props) {
  console.log('this is the props', props)

  const location = props.city
  const firstName = props.first_name
  const lastName = props.last_name
  const email = props.email

  console.log('this is the location ===>', location)

  return (
    <section className="hero is-primary dashboard-bg-image">
      <div className="hero-body hero-bg-image">
        <div className="container profile">
          <div className="profile-heading">
            <nav className="columns level">
              <div className="column is-4 level-left">
                <h1 className="title coach-title coach-heading-dashboard">Team Details:</h1>
                  <p className="profile-metadata">
                    <span className="title is-bold profile-title team-name">Team goes here</span>
                  </p>
                  <p className="profile-metadata">
                    Location: {location}
                    <span className="tagline profile-metadata team-location"></span>
                  </p>
                  <p className="profile-metadata">
                    Head Coach: {firstName + ' ' + lastName}
                    <span className="tagline profile-metadata coach-name"></span>
                  </p>
                  <p className="profile-metadata">
                    Email: {email}
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
