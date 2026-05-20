import React, { useCallback, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';

import { getProfile, profileSuccess, profileError } from '../actions/coachAction';

import { coachReducer } from '../reducers/coachReducer';
import { loginReducer } from '../reducers/loginReducer';

import Nav from '../components/Nav';
import DashboardNavigation from '../components/DashboardNavigation';
import TeamsList from '../components/TeamsList';
import RosterList from '../components/RosterList';
import StatsList from '../components/StatsList';

export function getFilterStateFromProps(filters) {
	return {
		teamSearch: filters && filters.teamSearch ? filters.teamSearch : '',
		playerSearch: filters && filters.playerSearch ? filters.playerSearch : '',
		position: filters && filters.position ? filters.position : ''
	};
}

export function haveFilterValuesChanged(previousFilters, nextFilters) {
	return previousFilters.teamSearch !== nextFilters.teamSearch ||
		previousFilters.playerSearch !== nextFilters.playerSearch ||
		previousFilters.position !== nextFilters.position;
}

export const defaultDashboardPagination = () => ({
	teamPage: 1,
	teamLimit: 10,
	playerPage: 1,
	playerLimit: 10,
	notificationLimit: 10
});

export function getPaginationStateFromProps(pagination) {
	const defaults = defaultDashboardPagination();

	return {
		teamPage: pagination && pagination.teamPage ? pagination.teamPage : defaults.teamPage,
		teamLimit: pagination && pagination.teamLimit ? pagination.teamLimit : defaults.teamLimit,
		playerPage: pagination && pagination.playerPage ? pagination.playerPage : defaults.playerPage,
		playerLimit: pagination && pagination.playerLimit ? pagination.playerLimit : defaults.playerLimit,
		notificationLimit:
			pagination && pagination.notificationLimit
				? pagination.notificationLimit
				: defaults.notificationLimit
	};
}

export function getResetPagination(pagination) {
	const currentPagination = getPaginationStateFromProps(pagination);

	return Object.assign({}, currentPagination, {
		teamPage: 1,
		playerPage: 1
	});
}

export function getRequestFilters(filterState, paginationState) {
	return Object.assign({}, filterState, paginationState);
}

export function Dashboard(props) {
	const [filterState, setFilterState] = useState(() => getFilterStateFromProps(props.filters));
	const didMountRef = useRef(false);
	const previousIdRef = useRef(props.id);
	const previousFiltersRef = useRef(props.filters);
	const filterStateRef = useRef(filterState);
	const dashboardPaginationRef = useRef(props.dashboardPagination);

	filterStateRef.current = filterState;
	dashboardPaginationRef.current = props.dashboardPagination;

	const fetchProfile = useCallback((
		season,
		filters = getRequestFilters(
			filterStateRef.current,
			getPaginationStateFromProps(dashboardPaginationRef.current)
		)
	) => {
		if (!props.id) {
			return;
		}

		props.dispatch(getProfile(props.id, season, filters));
	}, [props.id, props.dispatch]);

	useEffect(() => {
		if (!didMountRef.current) {
			didMountRef.current = true;
			previousIdRef.current = props.id;
			fetchProfile();
			return;
		}

		if (previousIdRef.current !== props.id && props.id) {
			fetchProfile();
		}

		previousIdRef.current = props.id;
	}, [props.id, fetchProfile]);

	useEffect(() => {
		const previousFilterState = getFilterStateFromProps(previousFiltersRef.current);
		const nextFilterState = getFilterStateFromProps(props.filters);

		if (haveFilterValuesChanged(previousFilterState, nextFilterState)) {
			setFilterState(nextFilterState);
		}

		previousFiltersRef.current = props.filters;
	}, [props.filters]);

	const handleSeasonChange = season => {
		fetchProfile(
			season,
			getRequestFilters(
				filterState,
				getResetPagination(props.dashboardPagination)
			)
		);
	};

	const handleFilterChange = (field, value) => {
		setFilterState(currentFilterState => Object.assign({}, currentFilterState, {
			[field]: value
		}));
	};

	const applyFilters = () => {
		fetchProfile(
			props.activeSeason,
			getRequestFilters(
				filterState,
				getResetPagination(props.dashboardPagination)
			)
		);
	};

	const handleTeamPageChange = teamPage => {
		const pagination = Object.assign(
			{},
			getPaginationStateFromProps(props.dashboardPagination),
			{ teamPage }
		);

		fetchProfile(
			props.activeSeason,
			getRequestFilters(filterState, pagination)
		);
	};

	const handlePlayerPageChange = playerPage => {
		const pagination = Object.assign(
			{},
			getPaginationStateFromProps(props.dashboardPagination),
			{ playerPage }
		);

		fetchProfile(
			props.activeSeason,
			getRequestFilters(filterState, pagination)
		);
	};

	return (
		<div>
			<Nav
				isLoggedIn={props.isLoggedIn}/>
			<DashboardNavigation
				email={props.email}
				firstName={props.first_name}
				lastName={props.last_name}
				activeSeason={props.activeSeason}
				availableSeasons={props.availableSeasons}
				teamSearch={filterState.teamSearch}
				playerSearch={filterState.playerSearch}
				position={filterState.position}
				onSeasonChange={season => handleSeasonChange(season)}
				onFilterChange={(field, value) => handleFilterChange(field, value)}
				onApplyFilters={() => applyFilters()}
			/>
			<section className='section'>
				<div className='tile is-ancestor'>
					<div className='tile is-4 is-vertical is-parent'>
						<TeamsList
							teams={props.teams}
							filters={props.filters}
							activeSeason={props.activeSeason}
							pagination={props.teamPagination}
							onPageChange={page => handleTeamPageChange(page)}
						/>
						<RosterList
							players={props.players}
							filters={props.filters}
							activeSeason={props.activeSeason}
							pagination={props.playerPagination}
							onPageChange={page => handlePlayerPageChange(page)}
						/>
					</div>
					<StatsList
						stats={props.stats}
						teams={props.teams}
						filters={props.filters}
						activeSeason={props.activeSeason}
						pagination={props.playerPagination}
						onPageChange={page => handlePlayerPageChange(page)}
					/>
				</div>
			</section>
		</div>
	);
}

const mapStateToProps = state => ({
	id: state.coachReducer.id,
	teams: state.coachReducer.teams,
	players: state.coachReducer.players,
	availableSeasons: state.coachReducer.availableSeasons,
	activeSeason: state.coachReducer.activeSeason,
	filters: state.coachReducer.filters,
	dashboardPagination: state.coachReducer.dashboardPagination,
	teamPagination: state.coachReducer.teamPagination,
	playerPagination: state.coachReducer.playerPagination,
	notificationPagination: state.coachReducer.notificationPagination,
	isLoggedIn: state.loginReducer.isloggedIn,
	first_name: state.coachReducer.first_name,
	last_name: state.coachReducer.last_name,
	email: state.coachReducer.email,
	stats: state.coachReducer.stats
});

export default connect(mapStateToProps)(Dashboard);

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
