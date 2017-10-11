import React, { Component } from 'react';
import { connect } from 'react-redux';

import { createTeam, getTeamProfile, hideModal, addNewPlayer } from '../actions/teamAction';

import { teamReducer } from '../reducers/teamReducer';

import Nav from '../components/Nav';
import TeamDetailsNavigation from '../components/TeamDetailsNavigation';
import TeamDetailsComponent from '../components/TeamDetailsComponent';
import AddPlayerModal from '../components/AddPlayerModal';

class TeamDetails extends Component {
	componentDidMount() {
		const { id } = this.props.match.params;
		this.props.dispatch(getTeamProfile(id));
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

	render() {
		let teamModal;
		if(this.props.showModal === true){
			teamModal = <AddPlayerModal
				teamID={this.props.match.params.id}
				addPlayer={(teamId, email, firstName, lastName, position) => this.addNewPlayer(teamId, email, firstName, lastName, position)}
				closeModal={() => this.closeModal()} />;
			// this will be the helper function for the closeModal button
			// 	<a href="#" onClick={() => this.closeModal()}>Close</a>
		}
		return (
			<div>
				<Nav />
				<TeamDetailsNavigation
					name={this.props.name}
					city={this.props.city}
					first_name={this.props.first_name}
					last_name={this.props.last_name}
					email={this.props.email}
					showModal={() => this.showModal()}
				/>
				<TeamDetailsComponent
					players={this.props.players}
				/>
				{teamModal}
			</div>
		);
	}
}

const mapStateToProps = state => ({
	name: state.teamReducer.name,
	city: state.teamReducer.city,
	first_name: state.teamReducer.coach.first_name,
	last_name: state.teamReducer.coach.last_name,
	email: state.teamReducer.coach.email,
	players: state.teamReducer.players,
	showModal: state.teamReducer.showModal
});

export default connect(mapStateToProps)(TeamDetails);
