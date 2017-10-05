import React, { Component } from 'react';
import { connect } from 'react-redux';

import { createTeam, getTeamProfile, hideModal } from '../actions/teamAction';

import { teamReducer } from '../reducers/teamReducer';

import Nav from '../components/Nav';
import TeamDetailsNavigation from '../components/TeamDetailsNavigation';
import TeamDetailsComponent from '../components/TeamDetailsComponent';

class TeamDetails extends Component {
	componentDidMount() {
		const { id } = this.props.match.params;
		this.props.dispatch(getTeamProfile(id));
	}

	addPlayerButton(){
		this.props.dispatch(createTeam());
	}

	closeModal(){
		this.props.dispatch(hideModal());
	}

	render() {
		let teamModal = null;
  		if(this.props.showModal === true){
    		teamModal = <div>
				<a href="#" onClick={() => this.closeModal()}>Close</a>
					This will be the modal
			</div>;
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
					onClick={() => this.addPlayerButton()}
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
