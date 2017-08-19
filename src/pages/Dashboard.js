import React, { Component } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';

import { getProfile, profileSuccess, profileError } from '../actions/coachAction';
import Nav from '../components/Nav';
import DashboardNavigation from '../components/DashboardNavigation';
import TeamsList from '../components/TeamsList';
import RosterList from '../components/RosterList';
import StatsList from '../components/StatsList';

class Dashboard extends Component {

  componentDidMount() {
    const { id } = this.props;
    console.log('This is this.props on componentDidMount ===>', this.props);
    console.log('This is this.props on componentDidMount ===>', this.props.id);
    this.props.dispatch(getProfile(id))
    console.log('This is the id when the component mounts ===>', id);
  }

  render() {
    return (
      <div>
      <Nav isLoggedIn={this.props.isLoggedIn}/>
      <DashboardNavigation />
        <section className='section'>
          <div className='tile is-ancestor'>
            <div className='tile is-4 is-vertical is-parent'>
              <TeamsList teams={this.props.teams} />
              <RosterList />
            </div>
              <StatsList />
          </div>
        </section>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  id: state.coachReducer.id,
  teams: state.coachReducer.teams,
  isLoggedIn: state.loginReducer.isloggedIn
})

export default connect(mapStateToProps)(Dashboard)
