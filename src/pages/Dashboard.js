import React, { Component } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';

// import module action

import Nav from '../components/Nav';
import DashboardNavigation from '../components/DashboardNavigation';
import TeamsList from '../components/TeamsList';
import RosterList from '../components/RosterList';
import StatsList from '../components/StatsList';

class Dashboard extends Component {
  constructor(props){
    super(props);

    this.state = {
      stats:[]
    };
  }

  componentDidMount() {
    const { id } = this.props;
    this.props.dispatch(getProfile(id))
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

const mapStateToProps = state => ({
  id: state.id
})

export default connect(mapStateToProps)(Dashboard)
