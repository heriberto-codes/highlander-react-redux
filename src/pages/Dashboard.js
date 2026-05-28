import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getProfile } from '../actions/coachAction';

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

export function Dashboard() {
	const dispatch = useDispatch();
	const id = useSelector(state => state.coachReducer.id);
	const teams = useSelector(state => state.coachReducer.teams);
	const players = useSelector(state => state.coachReducer.players);
	const availableSeasons = useSelector(state => state.coachReducer.availableSeasons);
	const activeSeason = useSelector(state => state.coachReducer.activeSeason);
	const filters = useSelector(state => state.coachReducer.filters);
	const dashboardPagination = useSelector(state => state.coachReducer.dashboardPagination);
	const teamPagination = useSelector(state => state.coachReducer.teamPagination);
	const playerPagination = useSelector(state => state.coachReducer.playerPagination);
	const isLoggedIn = useSelector(state => state.loginReducer.isloggedIn);
	const firstName = useSelector(state => state.coachReducer.first_name);
	const lastName = useSelector(state => state.coachReducer.last_name);
	const email = useSelector(state => state.coachReducer.email);
	const stats = useSelector(state => state.coachReducer.stats);
	const isLoadingProfile = useSelector(state => state.coachReducer.isLoadingProfile);
	const profileError = useSelector(state => state.coachReducer.profileError);
	const [filterState, setFilterState] = useState(() => getFilterStateFromProps(filters));
	const didMountRef = useRef(false);
	const previousIdRef = useRef(id);
	const previousFiltersRef = useRef(filters);
	const filterStateRef = useRef(filterState);
	const dashboardPaginationRef = useRef(dashboardPagination);

	filterStateRef.current = filterState;
	dashboardPaginationRef.current = dashboardPagination;

	const fetchProfile = useCallback((
		season,
		filters = getRequestFilters(
			filterStateRef.current,
			getPaginationStateFromProps(dashboardPaginationRef.current)
		)
	) => {
		if (!id) {
			return;
		}

		dispatch(getProfile(id, season, filters));
	}, [id, dispatch]);

	useEffect(() => {
		if (!didMountRef.current) {
			didMountRef.current = true;
			previousIdRef.current = id;
			fetchProfile();
			return;
		}

		if (previousIdRef.current !== id && id) {
			fetchProfile();
		}

		previousIdRef.current = id;
	}, [id, fetchProfile]);

	useEffect(() => {
		const previousFilterState = getFilterStateFromProps(previousFiltersRef.current);
		const nextFilterState = getFilterStateFromProps(filters);

		if (haveFilterValuesChanged(previousFilterState, nextFilterState)) {
			setFilterState(nextFilterState);
		}

		previousFiltersRef.current = filters;
	}, [filters]);

	const handleSeasonChange = season => {
		fetchProfile(
			season,
			getRequestFilters(
				filterState,
				getResetPagination(dashboardPagination)
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
			activeSeason,
			getRequestFilters(
				filterState,
				getResetPagination(dashboardPagination)
			)
		);
	};

	const handleTeamPageChange = teamPage => {
		const pagination = Object.assign(
			{},
			getPaginationStateFromProps(dashboardPagination),
			{ teamPage }
		);

		fetchProfile(
			activeSeason,
			getRequestFilters(filterState, pagination)
		);
	};

	const handlePlayerPageChange = playerPage => {
		const pagination = Object.assign(
			{},
			getPaginationStateFromProps(dashboardPagination),
			{ playerPage }
		);

		fetchProfile(
			activeSeason,
			getRequestFilters(filterState, pagination)
		);
	};

	return (
		<div>
			<Nav
				isLoggedIn={isLoggedIn}/>
			<DashboardNavigation
				email={email}
				firstName={firstName}
				lastName={lastName}
				activeSeason={activeSeason}
				availableSeasons={availableSeasons}
				teamSearch={filterState.teamSearch}
				playerSearch={filterState.playerSearch}
				position={filterState.position}
				onSeasonChange={season => handleSeasonChange(season)}
				onFilterChange={(field, value) => handleFilterChange(field, value)}
				onApplyFilters={() => applyFilters()}
			/>
			{isLoadingProfile ? (
				<section className='section'>
					<div className='notification has-text-centered'>
						Loading profile...
					</div>
				</section>
			) : null}
			{profileError ? (
				<section className='section'>
					<div className='notification is-warning has-text-centered' role='alert'>
						Unable to load profile. Please try again.
					</div>
				</section>
			) : null}
			<section className='section'>
				<div className='tile is-ancestor'>
					<div className='tile is-4 is-vertical is-parent'>
						<TeamsList
							teams={teams}
							filters={filters}
							activeSeason={activeSeason}
							pagination={teamPagination}
							onPageChange={page => handleTeamPageChange(page)}
						/>
						<RosterList
							players={players}
							filters={filters}
							activeSeason={activeSeason}
							pagination={playerPagination}
							onPageChange={page => handlePlayerPageChange(page)}
						/>
					</div>
					<StatsList
						stats={stats}
						teams={teams}
						filters={filters}
						activeSeason={activeSeason}
						pagination={playerPagination}
						onPageChange={page => handlePlayerPageChange(page)}
					/>
				</div>
			</section>
		</div>
	);
}

export default Dashboard;
