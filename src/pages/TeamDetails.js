import React, { Component } from 'react';
import { connect } from 'react-redux';

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

function getFilterStateFromProps(filters) {
	return {
		playerSearch: filters && filters.playerSearch ? filters.playerSearch : '',
		position: filters && filters.position ? filters.position : ''
	};
}

function haveFilterValuesChanged(previousFilters, nextFilters) {
	return previousFilters.playerSearch !== nextFilters.playerSearch ||
		previousFilters.position !== nextFilters.position;
}

const defaultTeamDetailPagination = () => ({
	playerPage: 1,
	playerLimit: 10
});

function getPaginationStateFromProps(pagination) {
	const defaults = defaultTeamDetailPagination();

	return {
		playerPage: pagination && pagination.playerPage ? pagination.playerPage : defaults.playerPage,
		playerLimit: pagination && pagination.playerLimit ? pagination.playerLimit : defaults.playerLimit
	};
}

function getResetPagination(pagination) {
	const currentPagination = getPaginationStateFromProps(pagination);

	return Object.assign({}, currentPagination, {
		playerPage: 1
	});
}

function getFilterRequestState(state) {
	return {
		playerSearch: state.playerSearch,
		position: state.position
	};
}

function getRequestFilters(filterState, paginationState) {
	return Object.assign({}, filterState, paginationState);
}

export class TeamDetails extends Component {
	constructor(props) {
		super(props);
		this.state = Object.assign({
			showGameEntryForm: false
		}, getFilterStateFromProps(props.filters));
	}

	fetchTeamProfile(
		season,
		filters = getRequestFilters(
			getFilterRequestState(this.state),
			getPaginationStateFromProps(this.props.teamDetailPagination)
		)
	) {
		const { id } = this.props.match.params;
		this.props.dispatch(getTeamProfile(id, season, filters));
	}

	componentDidMount() {
		this.fetchTeamProfile();
	}

	componentDidUpdate(prevProps) {
		if (prevProps.match.params.id !== this.props.match.params.id) {
			this.fetchTeamProfile();
		}

		if (!prevProps.gameSubmissionSuccess && this.props.gameSubmissionSuccess) {
			this.setState({ showGameEntryForm: false });
		}

		const previousFilterState = getFilterStateFromProps(prevProps.filters);
		const nextFilterState = getFilterStateFromProps(this.props.filters);
		if (haveFilterValuesChanged(previousFilterState, nextFilterState)) {
			this.setState(nextFilterState);
		}
	}

	handleSeasonChange(season) {
		this.fetchTeamProfile(
			season,
			getRequestFilters(
				getFilterRequestState(this.state),
				getResetPagination(this.props.teamDetailPagination)
			)
		);
	}

	handleFilterChange(field, value) {
		this.setState({
			[field]: value
		});
	}

	applyFilters() {
		this.fetchTeamProfile(
			this.props.activeSeason,
			getRequestFilters(
				getFilterRequestState(this.state),
				getResetPagination(this.props.teamDetailPagination)
			)
		);
	}

	handlePlayerPageChange(playerPage) {
		const pagination = Object.assign(
			{},
			getPaginationStateFromProps(this.props.teamDetailPagination),
			{ playerPage }
		);

		this.fetchTeamProfile(
			this.props.activeSeason,
			getRequestFilters(getFilterRequestState(this.state), pagination)
		);
	}

	showModal(){
		this.props.dispatch(createTeam());
	}

	closeModal(){
		this.props.dispatch(hideModal());
	}

	addNewPlayer(teamId, email, firstName, lastName, position){
		this.props.dispatch(addNewPlayer(teamId, email, firstName, lastName, position));
	}

	showGameEntryForm() {
		this.setState({ showGameEntryForm: true });
	}

	hideGameEntryForm() {
		this.setState({ showGameEntryForm: false });
	}

	submitGameEntry(payload) {
		const { id } = this.props.match.params;
		this.props.dispatch(createGameEntry(id, payload));
	}

	addCollaborator(coachId, role) {
		const { id } = this.props.match.params;
		this.props.dispatch(addTeamCollaborator(id, coachId, role));
	}

	updateCollaborator(coachId, role) {
		const { id } = this.props.match.params;
		this.props.dispatch(updateTeamCollaborator(id, coachId, role));
	}

	removeCollaborator(coachId) {
		const { id } = this.props.match.params;
		this.props.dispatch(removeTeamCollaborator(id, coachId));
	}

	render() {
		let teamModal;
		if(this.props.showModal === true){
			teamModal = <AddPlayer
				teamID={this.props.match.params.id}
				addPlayer={(teamId, email, firstName, lastName, position) => this.addNewPlayer(teamId, email, firstName, lastName, position)}
				closeModal={() => this.closeModal()}
				onSubmit={ this.submit }
				/>;
		}
		return (
			<div>
				<Nav />
				<TeamDetailsNavigation
					name={this.props.name}
					city={this.props.city}
					season={this.props.season}
					activeSeason={this.props.activeSeason}
					availableSeasons={this.props.availableSeasons}
					playerSearch={this.state.playerSearch}
					position={this.state.position}
					first_name={this.props.first_name}
					last_name={this.props.last_name}
					email={this.props.email}
					currentCoachRole={this.props.currentCoachRole}
					onSeasonChange={season => this.handleSeasonChange(season)}
					onFilterChange={(field, value) => this.handleFilterChange(field, value)}
					onApplyFilters={() => this.applyFilters()}
					showModal={() => this.showModal()}
					showGameEntryForm={() => this.showGameEntryForm()} />
				<TeamDetailsComponent
					teamId={this.props.match.params.id}
					players={this.props.players}
					filters={this.props.filters}
					activeSeason={this.props.activeSeason}
					collaborators={this.props.collaborators}
					currentCoachRole={this.props.currentCoachRole}
					showGameEntryForm={this.state.showGameEntryForm}
					onCancelGameEntry={() => this.hideGameEntryForm()}
					onSubmitGameEntry={payload => this.submitGameEntry(payload)}
					onAddCollaborator={(coachId, role) => this.addCollaborator(coachId, role)}
					onUpdateCollaborator={(coachId, role) => this.updateCollaborator(coachId, role)}
					onRemoveCollaborator={coachId => this.removeCollaborator(coachId)}
					pagination={this.props.playerPagination}
					onPageChange={page => this.handlePlayerPageChange(page)}
					isAddingCollaborator={this.props.isAddingCollaborator}
					addCollaboratorSuccess={this.props.addCollaboratorSuccess}
					addCollaboratorError={this.props.addCollaboratorError}
					isUpdatingCollaborator={this.props.isUpdatingCollaborator}
					updateCollaboratorSuccess={this.props.updateCollaboratorSuccess}
					updateCollaboratorError={this.props.updateCollaboratorError}
					isRemovingCollaborator={this.props.isRemovingCollaborator}
					removeCollaboratorSuccess={this.props.removeCollaboratorSuccess}
					removeCollaboratorError={this.props.removeCollaboratorError}
					isSubmittingGame={this.props.isSubmittingGame}
					gameSubmissionSuccess={this.props.gameSubmissionSuccess}
					lastCreatedGame={this.props.lastCreatedGame}
					gameSubmissionError={this.props.gameSubmissionError} />
				{teamModal}
			</div>
		);
	}
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
