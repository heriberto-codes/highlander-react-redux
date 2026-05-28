import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import {
	createTeam,
	createGameEntry,
	getTeamProfile,
	hideModal,
	addNewPlayer,
	addTeamCollaborator,
	updateTeamCollaborator,
	removeTeamCollaborator
} from '../actions/teamAction';

import Nav from '../components/Nav';
import TeamDetailsNavigation from '../components/TeamDetailsNavigation';
import TeamDetailsComponent from '../components/TeamDetailsComponent';
// import AddPlayerModal from '../components/AddPlayerModal';
import AddPlayer from '../components/AddPlayerModal2';

export function getFilterStateFromProps(filters) {
	return {
		playerSearch: filters && filters.playerSearch ? filters.playerSearch : '',
		position: filters && filters.position ? filters.position : ''
	};
}

export function haveFilterValuesChanged(previousFilters, nextFilters) {
	return previousFilters.playerSearch !== nextFilters.playerSearch ||
		previousFilters.position !== nextFilters.position;
}

export const defaultTeamDetailPagination = () => ({
	playerPage: 1,
	playerLimit: 10
});

export function getPaginationStateFromProps(pagination) {
	const defaults = defaultTeamDetailPagination();

	return {
		playerPage: pagination && pagination.playerPage ? pagination.playerPage : defaults.playerPage,
		playerLimit: pagination && pagination.playerLimit ? pagination.playerLimit : defaults.playerLimit
	};
}

export function getResetPagination(pagination) {
	const currentPagination = getPaginationStateFromProps(pagination);

	return Object.assign({}, currentPagination, {
		playerPage: 1
	});
}

export function getFilterRequestState(state) {
	return {
		playerSearch: state.playerSearch,
		position: state.position
	};
}

export function getRequestFilters(filterState, paginationState) {
	return Object.assign({}, filterState, paginationState);
}

export function TeamDetails(props = {}) {
	const dispatch = useDispatch();
	const params = useParams();
	const matchId = props.match && props.match.params ? props.match.params.id : undefined;
	const teamId = params.id || matchId;
	const name = useSelector(state => state.teamReducer.name);
	const city = useSelector(state => state.teamReducer.city);
	const season = useSelector(state => state.teamReducer.season);
	const activeSeason = useSelector(state => state.teamReducer.activeSeason);
	const availableSeasons = useSelector(state => state.teamReducer.availableSeasons);
	const filters = useSelector(state => state.teamReducer.filters);
	const first_name = useSelector(state => state.teamReducer.coach.first_name);
	const last_name = useSelector(state => state.teamReducer.coach.last_name);
	const email = useSelector(state => state.teamReducer.coach.email);
	const players = useSelector(state => state.teamReducer.players);
	const teamDetailPagination = useSelector(state => state.teamReducer.teamDetailPagination);
	const playerPagination = useSelector(state => state.teamReducer.playerPagination);
	const collaborators = useSelector(state => state.teamReducer.collaborators);
	const currentCoachRole = useSelector(state => state.teamReducer.currentCoachRole);
	const isAddingCollaborator = useSelector(state => state.teamReducer.isAddingCollaborator);
	const addCollaboratorSuccess = useSelector(state => state.teamReducer.addCollaboratorSuccess);
	const addCollaboratorError = useSelector(state => state.teamReducer.addCollaboratorError);
	const isUpdatingCollaborator = useSelector(state => state.teamReducer.isUpdatingCollaborator);
	const updateCollaboratorSuccess = useSelector(state => state.teamReducer.updateCollaboratorSuccess);
	const updateCollaboratorError = useSelector(state => state.teamReducer.updateCollaboratorError);
	const isRemovingCollaborator = useSelector(state => state.teamReducer.isRemovingCollaborator);
	const removeCollaboratorSuccess = useSelector(state => state.teamReducer.removeCollaboratorSuccess);
	const removeCollaboratorError = useSelector(state => state.teamReducer.removeCollaboratorError);
	const isSubmittingGame = useSelector(state => state.teamReducer.isSubmittingGame);
	const gameSubmissionSuccess = useSelector(state => state.teamReducer.gameSubmissionSuccess);
	const lastCreatedGame = useSelector(state => state.teamReducer.lastCreatedGame);
	const gameSubmissionError = useSelector(state => state.teamReducer.gameSubmissionError);
	const isPlayerModalVisible = useSelector(state => state.teamReducer.showModal);
	const isLoadingTeamProfile = useSelector(state => state.teamReducer.isLoadingTeamProfile);
	const teamProfileError = useSelector(state => state.teamReducer.errorMessage);
	const [filterState, setFilterState] = useState(() => getFilterStateFromProps(filters));
	const [showGameEntryForm, setShowGameEntryForm] = useState(false);
	const didMountRef = useRef(false);
	const previousIdRef = useRef(teamId);
	const previousFiltersRef = useRef(filters);
	const previousGameSubmissionSuccessRef = useRef(gameSubmissionSuccess);
	const filterStateRef = useRef(filterState);
	const teamDetailPaginationRef = useRef(teamDetailPagination);

	filterStateRef.current = filterState;
	teamDetailPaginationRef.current = teamDetailPagination;

	const fetchTeamProfile = useCallback((
		season,
		filters = getRequestFilters(
			getFilterRequestState(filterStateRef.current),
			getPaginationStateFromProps(teamDetailPaginationRef.current)
		)
	) => {
		dispatch(getTeamProfile(teamId, season, filters));
	}, [dispatch, teamId]);

	useEffect(() => {
		if (!didMountRef.current) {
			didMountRef.current = true;
			previousIdRef.current = teamId;
			fetchTeamProfile();
			return;
		}

		if (previousIdRef.current !== teamId) {
			fetchTeamProfile();
		}

		previousIdRef.current = teamId;
	}, [teamId, fetchTeamProfile]);

	useEffect(() => {
		if (!previousGameSubmissionSuccessRef.current && gameSubmissionSuccess) {
			setShowGameEntryForm(false);
		}

		previousGameSubmissionSuccessRef.current = gameSubmissionSuccess;
	}, [gameSubmissionSuccess]);

	useEffect(() => {
		const previousFilterState = getFilterStateFromProps(previousFiltersRef.current);
		const nextFilterState = getFilterStateFromProps(filters);

		if (haveFilterValuesChanged(previousFilterState, nextFilterState)) {
			setFilterState(nextFilterState);
		}

		previousFiltersRef.current = filters;
	}, [filters]);

	const handleSeasonChange = season => {
		fetchTeamProfile(
			season,
			getRequestFilters(
				getFilterRequestState(filterState),
				getResetPagination(teamDetailPagination)
			)
		);
	};

	const handleFilterChange = (field, value) => {
		setFilterState(currentFilterState => Object.assign({}, currentFilterState, {
			[field]: value
		}));
	};

	const applyFilters = () => {
		fetchTeamProfile(
			activeSeason,
			getRequestFilters(
				getFilterRequestState(filterState),
				getResetPagination(teamDetailPagination)
			)
		);
	};

	const handlePlayerPageChange = playerPage => {
		const pagination = Object.assign(
			{},
			getPaginationStateFromProps(teamDetailPagination),
			{ playerPage }
		);

		fetchTeamProfile(
			activeSeason,
			getRequestFilters(getFilterRequestState(filterState), pagination)
		);
	};

	const openModal = () => {
		dispatch(createTeam());
	};

	const closeModal = () => {
		dispatch(hideModal());
	};

	const addNewPlayerToTeam = (teamId, email, firstName, lastName, position) => {
		dispatch(addNewPlayer(teamId, email, firstName, lastName, position));
	};

	const submitGameEntry = payload => {
		dispatch(createGameEntry(teamId, payload));
	};

	const addCollaborator = (coachId, role) => {
		dispatch(addTeamCollaborator(teamId, coachId, role));
	};

	const updateCollaborator = (coachId, role) => {
		dispatch(updateTeamCollaborator(teamId, coachId, role));
	};

	const removeCollaborator = coachId => {
		dispatch(removeTeamCollaborator(teamId, coachId));
	};

	let teamModal;
	if(isPlayerModalVisible === true){
		teamModal = <AddPlayer
			teamID={teamId}
			addPlayer={(teamId, email, firstName, lastName, position) => addNewPlayerToTeam(teamId, email, firstName, lastName, position)}
			closeModal={() => closeModal()}
			onSubmit={ undefined }
			/>;
	}

	return (
		<div>
			<Nav />
			<TeamDetailsNavigation
				name={name}
				city={city}
				season={season}
				activeSeason={activeSeason}
				availableSeasons={availableSeasons}
				playerSearch={filterState.playerSearch}
				position={filterState.position}
				first_name={first_name}
				last_name={last_name}
				email={email}
				currentCoachRole={currentCoachRole}
				onSeasonChange={season => handleSeasonChange(season)}
				onFilterChange={(field, value) => handleFilterChange(field, value)}
				onApplyFilters={() => applyFilters()}
				showModal={() => openModal()}
				showGameEntryForm={() => setShowGameEntryForm(true)} />
			{isLoadingTeamProfile ? (
				<section className='section'>
					<div className='notification has-text-centered'>
						Loading team profile...
					</div>
				</section>
			) : null}
			{teamProfileError ? (
				<section className='section'>
					<div className='notification is-warning has-text-centered' role='alert'>
						Unable to load team profile. Please try again.
					</div>
				</section>
			) : null}
			<TeamDetailsComponent
				teamId={teamId}
				players={players}
				filters={filters}
				activeSeason={activeSeason}
				collaborators={collaborators}
				currentCoachRole={currentCoachRole}
				showGameEntryForm={showGameEntryForm}
				onCancelGameEntry={() => setShowGameEntryForm(false)}
				onSubmitGameEntry={payload => submitGameEntry(payload)}
				onAddCollaborator={(coachId, role) => addCollaborator(coachId, role)}
				onUpdateCollaborator={(coachId, role) => updateCollaborator(coachId, role)}
				onRemoveCollaborator={coachId => removeCollaborator(coachId)}
				pagination={playerPagination}
				onPageChange={page => handlePlayerPageChange(page)}
				isAddingCollaborator={isAddingCollaborator}
				addCollaboratorSuccess={addCollaboratorSuccess}
				addCollaboratorError={addCollaboratorError}
				isUpdatingCollaborator={isUpdatingCollaborator}
				updateCollaboratorSuccess={updateCollaboratorSuccess}
				updateCollaboratorError={updateCollaboratorError}
				isRemovingCollaborator={isRemovingCollaborator}
				removeCollaboratorSuccess={removeCollaboratorSuccess}
				removeCollaboratorError={removeCollaboratorError}
				isSubmittingGame={isSubmittingGame}
				gameSubmissionSuccess={gameSubmissionSuccess}
				lastCreatedGame={lastCreatedGame}
				gameSubmissionError={gameSubmissionError} />
			{teamModal}
		</div>
	);
}

export default TeamDetails;
