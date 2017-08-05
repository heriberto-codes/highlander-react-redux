import React, { Component } from 'react';
import axios from 'axios';

import Nav from '../components/Nav';
import DashboardNavigation from '../components/DashboardNavigation';
import TeamsList from '../components/TeamsList';
import RosterList from '../components/RosterList';
import StatsList from '../components/StatsList';

export default class Dashboard extends Component {
  constructor(props){
    super(props);

    this.state = {
      stats:[]
    };
  }

componentDidMount() {
    axios.get('/:id/stats')
    .then(response =>  {
      console.log(response, 'YO RESPONSE HERE')
    })
    .catch(error => {
      console.log(error)
    });
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
