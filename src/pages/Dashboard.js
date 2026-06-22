import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { createCoachTeam, getProfile } from '../actions/coachAction';

import Nav from '../components/Nav';
import DashboardNavigation from '../components/DashboardNavigation';
import TeamsList from '../components/TeamsList';
import RosterList from '../components/RosterList';
import StatsList from '../components/StatsList';
import StatusMessage from '../components/ui/StatusMessage';
import AddTeamModal from '../components/AddTeamModal';

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
	const navigate = useNavigate();
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
	const [showAddTeamModal, setShowAddTeamModal] = useState(false);
	const [isCreatingTeam, setIsCreatingTeam] = useState(false);
	const [createTeamError, setCreateTeamError] = useState(null);
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

	const openTeamAction = action => {
		if (!teams || teams.length === 0) {
			setCreateTeamError(null);
			setShowAddTeamModal(true);
			return;
		}

		navigate(`/teamdetails/${teams[0].id}`, {
			state: { dashboardAction: action }
		});
	};

	const createTeam = team => {
		setIsCreatingTeam(true);
		setCreateTeamError(null);

		dispatch(createCoachTeam(id, team))
			.then(response => {
				setIsCreatingTeam(false);
				setShowAddTeamModal(false);
				navigate(`/teamdetails/${response.data.id}`);
			})
			.catch(error => {
				setIsCreatingTeam(false);
				setCreateTeamError(error);
			});
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
				onAddTeam={() => setShowAddTeamModal(true)}
				onAddPlayer={() => openTeamAction('add-player')}
				onAddStats={() => openTeamAction('add-stats')}
			/>
			{isLoadingProfile ? (
				<section className='section'>
					<StatusMessage className='has-text-centered' message='Loading profile...' />
				</section>
			) : null}
			{profileError ? (
				<section className='section'>
					<StatusMessage
						className='has-text-centered'
						message='Unable to load profile. Please try again.'
						variant='warning'
					/>
				</section>
			) : null}
			<section className='section'>
				<div className='tile is-ancestor'>
					<div className='tile is-4 is-vertical is-parent'>
						<div id="teams">
							<TeamsList
								teams={teams}
								filters={filters}
								activeSeason={activeSeason}
								pagination={teamPagination}
								onPageChange={page => handleTeamPageChange(page)}
								onAddTeam={() => setShowAddTeamModal(true)}
							/>
						</div>
						<div id="roster">
							<RosterList
								players={players}
								filters={filters}
								activeSeason={activeSeason}
								pagination={playerPagination}
								onPageChange={page => handlePlayerPageChange(page)}
								onAddPlayer={() => openTeamAction('add-player')}
							/>
						</div>
					</div>
					<div id="stats" className="tile is-parent">
						<StatsList
							stats={stats}
							teams={teams}
							filters={filters}
							activeSeason={activeSeason}
							pagination={playerPagination}
							onPageChange={page => handlePlayerPageChange(page)}
							onAddStats={() => openTeamAction('add-stats')}
						/>
					</div>
				</div>
			</section>
			{showAddTeamModal ? (
				<AddTeamModal
					error={createTeamError}
					isSubmitting={isCreatingTeam}
					onClose={() => setShowAddTeamModal(false)}
					onSubmit={team => createTeam(team)}
				/>
			) : null}
		</div>
	);
}

export default Dashboard;
