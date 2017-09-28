import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getTeamProfile } from '../actions/teamAction';

import { teamReducer } from '../reducers/teamReducer';

import Nav from '../components/Nav';
import DashboardTeamNavigation from '../components/DashboardTeamNavigation';

class TeamDetails extends Component {
  componentDidMount() {
    const { id } = this.props.match.params;
    this.props.dispatch(getTeamProfile(id));
  }


// #Genreal notes
// Nav bar should change its state to logged in presenting the user nav options
// When the team page is loaded I want to pull the teams data into that page
// The team data consist of the following
//   - Team meta data
//     - Team Name
//     - Location, Name and email
//     - Two buttons
//       - Add new player
//       - Edit team
//   - Individual team info in the scop of boxes
//     - Player Name
//     - Player email
//     - Player position
//     - A link to view player details

// #NEXT STEPS
// ====================
  //so when component mounts then dispatch an action to get team id
  // pas data that I need into the reducer
  // map state to props in the component
  // then pass it to the dumb component to render

  render() {
    return (
      <div>
        <Nav />
        <DashboardTeamNavigation
          name={this.props.name}
          city={this.props.city}
          first_name={this.props.first_name}
          last_name={this.props.last_name}
          email={this.props.email}
        />
      </div>
    )
  }
}

const mapStateToProps = state => ({
  name: state.teamReducer.name,
  city: state.teamReducer.city,
  first_name: state.teamReducer.coach.first_name,
  last_name: state.teamReducer.coach.last_name,
  email: state.teamReducer.coach.email
})

export default connect(mapStateToProps)(TeamDetails)
