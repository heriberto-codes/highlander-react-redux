import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getProfile, profileSuccess, profileError } from '../actions/coachAction';

import { coachReducer } from '../reducers/coachReducer';
import { loginReducer } from '../reducers/loginReducer';

import Nav from '../components/Nav';
import DashboardNavigation from '../components/DashboardNavigation';
import TeamsList from '../components/TeamsList';
import RosterList from '../components/RosterList';
import StatsList from '../components/StatsList';

class Dashboard extends Component {

	componentDidMount() {
		const { id } = this.props;
		console.log(id);
		this.props.dispatch(getProfile(id))
	}

	render() {
		return (
			<div>
				<Nav
					isLoggedIn={this.props.isLoggedIn}/>
				<DashboardNavigation
					email={this.props.email}
					firstName={this.props.first_name}
					lastName={this.props.last_name}
				/>
				<section className='section'>
					<div className='tile is-ancestor'>
						<div className='tile is-4 is-vertical is-parent'>
							<TeamsList
								teams={this.props.teams}
							/>
							<RosterList
								players={this.props.players}
							/>
						</div>
						<StatsList
							stats={this.props.stats}
							teams={this.props.teams}
						/>
					</div>
				</section>
			</div>
		)
	}
}

const mapStateToProps = state => ({
	id: state.coachReducer.id,
	teams: state.coachReducer.teams,
	players: state.coachReducer.players,
	isLoggedIn: state.loginReducer.isloggedIn,
	first_name: state.coachReducer.first_name,
	last_name: state.coachReducer.last_name,
	email: state.coachReducer.email,
	stats: state.coachReducer.stats
})

export default connect(mapStateToProps)(Dashboard)

// ask wences if I can do someting like this is react?
// const mapCoachReducerToProps = coachState => ({
//   id: coachState.coachReducer.id,
//   teams: coachState.coachReducer.teams,
//   players: coachState.coachReducer.players,
//   first_name: coachState.coachReducer.first_name,
//   last_name: coachState.coachReducer.last_name,
//   email: coachState.coachReducer.email
// })
//
// const mapLoginReducerToProps = loginState => ({
//   isLoggedIn: loginState.loginReducer.isloggedIn,
// })
//
// export default connect(mapCoachReducerToProps, mapLoginReducerToProps)(Dashboard)
