import React, { useCallback, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
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

import { teamReducer } from '../reducers/teamReducer';

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

export function TeamDetails(props) {
	const params = useParams();
	const matchId = props.match && props.match.params ? props.match.params.id : undefined;
	const teamId = params.id || matchId;
	const [filterState, setFilterState] = useState(() => getFilterStateFromProps(props.filters));
	const [showGameEntryForm, setShowGameEntryForm] = useState(false);
	const didMountRef = useRef(false);
	const previousIdRef = useRef(teamId);
	const previousFiltersRef = useRef(props.filters);
	const previousGameSubmissionSuccessRef = useRef(props.gameSubmissionSuccess);
	const filterStateRef = useRef(filterState);
	const teamDetailPaginationRef = useRef(props.teamDetailPagination);

	filterStateRef.current = filterState;
	teamDetailPaginationRef.current = props.teamDetailPagination;

	const fetchTeamProfile = useCallback((
		season,
		filters = getRequestFilters(
			getFilterRequestState(filterStateRef.current),
			getPaginationStateFromProps(teamDetailPaginationRef.current)
		)
	) => {
		props.dispatch(getTeamProfile(teamId, season, filters));
	}, [props.dispatch, teamId]);

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
		if (!previousGameSubmissionSuccessRef.current && props.gameSubmissionSuccess) {
			setShowGameEntryForm(false);
		}

		previousGameSubmissionSuccessRef.current = props.gameSubmissionSuccess;
	}, [props.gameSubmissionSuccess]);

	useEffect(() => {
		const previousFilterState = getFilterStateFromProps(previousFiltersRef.current);
		const nextFilterState = getFilterStateFromProps(props.filters);

		if (haveFilterValuesChanged(previousFilterState, nextFilterState)) {
			setFilterState(nextFilterState);
		}

		previousFiltersRef.current = props.filters;
	}, [props.filters]);

	const handleSeasonChange = season => {
		fetchTeamProfile(
			season,
			getRequestFilters(
				getFilterRequestState(filterState),
				getResetPagination(props.teamDetailPagination)
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
			props.activeSeason,
			getRequestFilters(
				getFilterRequestState(filterState),
				getResetPagination(props.teamDetailPagination)
			)
		);
	};

	const handlePlayerPageChange = playerPage => {
		const pagination = Object.assign(
			{},
			getPaginationStateFromProps(props.teamDetailPagination),
			{ playerPage }
		);

		fetchTeamProfile(
			props.activeSeason,
			getRequestFilters(getFilterRequestState(filterState), pagination)
		);
	};

	const showModal = () => {
		props.dispatch(createTeam());
	};

	const closeModal = () => {
		props.dispatch(hideModal());
	};

	const addNewPlayerToTeam = (teamId, email, firstName, lastName, position) => {
		props.dispatch(addNewPlayer(teamId, email, firstName, lastName, position));
	};

	const submitGameEntry = payload => {
		props.dispatch(createGameEntry(teamId, payload));
	};

	const addCollaborator = (coachId, role) => {
		props.dispatch(addTeamCollaborator(teamId, coachId, role));
	};

	const updateCollaborator = (coachId, role) => {
		props.dispatch(updateTeamCollaborator(teamId, coachId, role));
	};

	const removeCollaborator = coachId => {
		props.dispatch(removeTeamCollaborator(teamId, coachId));
	};

	let teamModal;
	if(props.showModal === true){
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
				name={props.name}
				city={props.city}
				season={props.season}
				activeSeason={props.activeSeason}
				availableSeasons={props.availableSeasons}
				playerSearch={filterState.playerSearch}
				position={filterState.position}
				first_name={props.first_name}
				last_name={props.last_name}
				email={props.email}
				currentCoachRole={props.currentCoachRole}
				onSeasonChange={season => handleSeasonChange(season)}
				onFilterChange={(field, value) => handleFilterChange(field, value)}
				onApplyFilters={() => applyFilters()}
				showModal={() => showModal()}
				showGameEntryForm={() => setShowGameEntryForm(true)} />
			<TeamDetailsComponent
				teamId={teamId}
				players={props.players}
				filters={props.filters}
				activeSeason={props.activeSeason}
				collaborators={props.collaborators}
				currentCoachRole={props.currentCoachRole}
				showGameEntryForm={showGameEntryForm}
				onCancelGameEntry={() => setShowGameEntryForm(false)}
				onSubmitGameEntry={payload => submitGameEntry(payload)}
				onAddCollaborator={(coachId, role) => addCollaborator(coachId, role)}
				onUpdateCollaborator={(coachId, role) => updateCollaborator(coachId, role)}
				onRemoveCollaborator={coachId => removeCollaborator(coachId)}
				pagination={props.playerPagination}
				onPageChange={page => handlePlayerPageChange(page)}
				isAddingCollaborator={props.isAddingCollaborator}
				addCollaboratorSuccess={props.addCollaboratorSuccess}
				addCollaboratorError={props.addCollaboratorError}
				isUpdatingCollaborator={props.isUpdatingCollaborator}
				updateCollaboratorSuccess={props.updateCollaboratorSuccess}
				updateCollaboratorError={props.updateCollaboratorError}
				isRemovingCollaborator={props.isRemovingCollaborator}
				removeCollaboratorSuccess={props.removeCollaboratorSuccess}
				removeCollaboratorError={props.removeCollaboratorError}
				isSubmittingGame={props.isSubmittingGame}
				gameSubmissionSuccess={props.gameSubmissionSuccess}
				lastCreatedGame={props.lastCreatedGame}
				gameSubmissionError={props.gameSubmissionError} />
			{teamModal}
		</div>
	);
}

const mapStateToProps = state => ({
	name: state.teamReducer.name,
	city: state.teamReducer.city,
	season: state.teamReducer.season,
	activeSeason: state.teamReducer.activeSeason,
	availableSeasons: state.teamReducer.availableSeasons,
	filters: state.teamReducer.filters,
	first_name: state.teamReducer.coach.first_name,
	last_name: state.teamReducer.coach.last_name,
	email: state.teamReducer.coach.email,
	players: state.teamReducer.players,
	teamDetailPagination: state.teamReducer.teamDetailPagination,
	playerPagination: state.teamReducer.playerPagination,
	collaborators: state.teamReducer.collaborators,
	currentCoachRole: state.teamReducer.currentCoachRole,
	isAddingCollaborator: state.teamReducer.isAddingCollaborator,
	addCollaboratorSuccess: state.teamReducer.addCollaboratorSuccess,
	addCollaboratorError: state.teamReducer.addCollaboratorError,
	isUpdatingCollaborator: state.teamReducer.isUpdatingCollaborator,
	updateCollaboratorSuccess: state.teamReducer.updateCollaboratorSuccess,
	updateCollaboratorError: state.teamReducer.updateCollaboratorError,
	isRemovingCollaborator: state.teamReducer.isRemovingCollaborator,
	removeCollaboratorSuccess: state.teamReducer.removeCollaboratorSuccess,
	removeCollaboratorError: state.teamReducer.removeCollaboratorError,
	isSubmittingGame: state.teamReducer.isSubmittingGame,
	gameSubmissionSuccess: state.teamReducer.gameSubmissionSuccess,
	lastCreatedGame: state.teamReducer.lastCreatedGame,
	gameSubmissionError: state.teamReducer.gameSubmissionError,
	showModal: state.teamReducer.showModal
});

export default connect(mapStateToProps)(TeamDetails);
