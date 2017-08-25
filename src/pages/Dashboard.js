import React, { Component } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';

import { getProfile, profileSuccess, profileError } from '../actions/coachAction';
import { coachReducer } from '../reducers/coachReducer';
import Nav from '../components/Nav';
import DashboardNavigation from '../components/DashboardNavigation';
import TeamsList from '../components/TeamsList';
import RosterList from '../components/RosterList';
import StatsList from '../components/StatsList';

class Dashboard extends Component {

  componentDidMount() {
    const { id } = this.props;
    this.props.dispatch(getProfile(id))
  }

  render() {
    return (
      <div>
      <Nav isLoggedIn={this.props.isLoggedIn}/>
      <DashboardNavigation email={this.props.email} firstName={this.props.first_name} lastName={this.props.last_name} />
        <section className='section'>
          <div className='tile is-ancestor'>
            <div className='tile is-4 is-vertical is-parent'>
              <TeamsList teams={this.props.teams} />
              <RosterList teams={this.props.teams}/>
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
  isLoggedIn: state.loginReducer.isloggedIn,
  first_name: state.coachReducer.first_name,
  last_name: state.coachReducer.last_name,
  email: state.coachReducer.email
})

export default connect(mapStateToProps)(Dashboard)
