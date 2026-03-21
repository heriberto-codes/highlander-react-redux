import React, { Component } from 'react';
import { connect } from 'react-redux';

import { createTeam, createGameEntry, getTeamProfile, hideModal, addNewPlayer } from '../actions/teamAction';

import { teamReducer } from '../reducers/teamReducer';

import Nav from '../components/Nav';
import TeamDetailsNavigation from '../components/TeamDetailsNavigation';
import TeamDetailsComponent from '../components/TeamDetailsComponent';
// import AddPlayerModal from '../components/AddPlayerModal';
import AddPlayer from '../components/AddPlayerModal2';


class TeamDetails extends Component {
	state = {
		showGameEntryForm: false
	};

	fetchTeamProfile(season) {
		const { id } = this.props.match.params;
		this.props.dispatch(getTeamProfile(id, season));
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
	}

	handleSeasonChange(season) {
		this.fetchTeamProfile(season);
	}

	showModal(){
		this.props.dispatch(createTeam());
	}

	closeModal(){
		this.props.dispatch(hideModal());
	}

	addNewPlayer(teamId, email, firstName, lastName, position){
		console.log('addPlayer function was called', teamId, email, firstName, lastName, position);
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
		console.log(this);
		return (
			<div>
				<Nav />
				<TeamDetailsNavigation
					name={this.props.name}
					city={this.props.city}
					season={this.props.season}
					activeSeason={this.props.activeSeason}
					availableSeasons={this.props.availableSeasons}
					first_name={this.props.first_name}
					last_name={this.props.last_name}
					email={this.props.email}
					onSeasonChange={season => this.handleSeasonChange(season)}
					showModal={() => this.showModal()}
					showGameEntryForm={() => this.showGameEntryForm()} />
				<TeamDetailsComponent
					teamId={this.props.match.params.id}
					players={this.props.players}
					showGameEntryForm={this.state.showGameEntryForm}
					onCancelGameEntry={() => this.hideGameEntryForm()}
					onSubmitGameEntry={payload => this.submitGameEntry(payload)}
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
	first_name: state.teamReducer.coach.first_name,
	last_name: state.teamReducer.coach.last_name,
	email: state.teamReducer.coach.email,
	players: state.teamReducer.players,
	isSubmittingGame: state.teamReducer.isSubmittingGame,
	gameSubmissionSuccess: state.teamReducer.gameSubmissionSuccess,
	lastCreatedGame: state.teamReducer.lastCreatedGame,
	gameSubmissionError: state.teamReducer.gameSubmissionError,
	showModal: state.teamReducer.showModal
});

export default connect(mapStateToProps)(TeamDetails);


