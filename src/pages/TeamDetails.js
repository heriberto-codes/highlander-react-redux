import React, { Component } from 'react';

import Nav from '../components/Nav';
import DashboardTeamNavigation from '../components/DashboardTeamNavigation';

export default class TeamDetails extends Component {
  componentDidMount() {
    console.log(this.props.match.params.id);
    
  }

  render() {
    return (
      <div>
        <Nav />
        <DashboardTeamNavigation />
      </div>
    )
  }
}
