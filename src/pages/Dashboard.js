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

function getFilterStateFromProps(filters) {
	return {
		teamSearch: filters && filters.teamSearch ? filters.teamSearch : '',
		playerSearch: filters && filters.playerSearch ? filters.playerSearch : '',
		position: filters && filters.position ? filters.position : ''
	};
}

function haveFilterValuesChanged(previousFilters, nextFilters) {
	return previousFilters.teamSearch !== nextFilters.teamSearch ||
		previousFilters.playerSearch !== nextFilters.playerSearch ||
		previousFilters.position !== nextFilters.position;
}

export class Dashboard extends Component {
	constructor(props) {
		super(props);
		this.state = getFilterStateFromProps(props.filters);
	}

	fetchProfile(season, filters = this.state) {
		if (!this.props.id) {
			return;
		}

		this.props.dispatch(getProfile(this.props.id, season, filters));
	}

	componentDidMount() {
		this.fetchProfile();
	}

	componentDidUpdate(prevProps) {
		if (prevProps.id !== this.props.id && this.props.id) {
			this.fetchProfile();
		}

		const previousFilterState = getFilterStateFromProps(prevProps.filters);
		const nextFilterState = getFilterStateFromProps(this.props.filters);
		if (haveFilterValuesChanged(previousFilterState, nextFilterState)) {
			this.setState(nextFilterState);
		}
	}

	handleSeasonChange(season) {
		this.fetchProfile(season, this.state);
	}

	handleFilterChange(field, value) {
		this.setState({
			[field]: value
		});
	}

	applyFilters() {
		this.fetchProfile(this.props.activeSeason, this.state);
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
					activeSeason={this.props.activeSeason}
					availableSeasons={this.props.availableSeasons}
					teamSearch={this.state.teamSearch}
					playerSearch={this.state.playerSearch}
					position={this.state.position}
					onSeasonChange={season => this.handleSeasonChange(season)}
					onFilterChange={(field, value) => this.handleFilterChange(field, value)}
					onApplyFilters={() => this.applyFilters()}
				/>
				<section className='section'>
					<div className='tile is-ancestor'>
						<div className='tile is-4 is-vertical is-parent'>
							<TeamsList
								teams={this.props.teams}
								filters={this.props.filters}
								activeSeason={this.props.activeSeason}
							/>
							<RosterList
								players={this.props.players}
								filters={this.props.filters}
								activeSeason={this.props.activeSeason}
							/>
						</div>
						<StatsList
							stats={this.props.stats}
							teams={this.props.teams}
							filters={this.props.filters}
							activeSeason={this.props.activeSeason}
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
	availableSeasons: state.coachReducer.availableSeasons,
	activeSeason: state.coachReducer.activeSeason,
	filters: state.coachReducer.filters,
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
