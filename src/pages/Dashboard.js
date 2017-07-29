import React, { Component } from 'react';

import Nav from '../components/Nav';
import DashboardNavigation from '../components/DashboardNavigation';
import TeamsList from '../components/TeamsList';
import RosterList from '../components/RosterList';
import StatsList from '../components/StatsList';

export default class Dashboard extends Component {
  constructor(props){
    super(props);
  }

  render() {
    return (
      <div>
      <Nav />
      <DashboardNavigation />
        <section className='section'>
          <div className='tile is-ancestor'>
            <div className='tile is-4 is-vertical is-parent'>
              <TeamsList />
              <RosterList />
            </div>
              <StatsList />
          </div>
        </section>
      </div>
    )
  }
}
