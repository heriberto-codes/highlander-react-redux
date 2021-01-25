import React from 'react';

import 'bulma/css/bulma.css';
import '../css/style.css';

export default function RosterList(props) {

	const players = props.players;
	// const playersFirstName = props.players.first_name;
	let listOfPlayers = players.map((player, index) => {
		return <div key={index} className='card has-text-centered'>
			<div className='card-content' id='theTeamBg'>
				<p className='title player-name'>{player.first_name}</p>
				<p className='subtitle player-email'>{player.email}</p>
			</div>
			<footer className='card-footer panel-heading dashboard-roster-footer'>
				<p className='card-footer-item'>
					<span>
						<a href='#'>View Player Details</a>
					</span>
				</p>
			</footer>
		</div>
	});


	const playerList = listOfPlayers.length > 0 ? listOfPlayers:
		<div className="notification has-text-centered roster-dashboard-message">
      You dont have a Roster.
		</div>

	return (
		<div className='tile is-child box header'>
			<nav className="level dashboard-title">
				<div className="level-left">
					<div className="level-item">
						<span className="icon icon-dasboard-placement">
							<i className="fa fa-users" aria-hidden="true"></i>
						</span>
						<p>
            Roster
						</p>
					</div>
				</div>
				<div className="level-right">
					<span className="level-item">
						<a className="button is-outlined is-primary" href="add-player.html">
            Add a New Player
						</a>
					</span>
				</div>
			</nav>

			<section>
				<div className="columns">
					<div className="column player-details-dashboard-page">
						{playerList}
					</div>
				</div>
			</section>
		</div>
	)
}
