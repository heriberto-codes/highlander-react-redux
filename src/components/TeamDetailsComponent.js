import React from 'react';
import { Link } from 'react-router-dom';

import 'bulma/css/bulma.css';
import '../css/style.css';

export default function TeamDetailsComponent(props) {
	return (
		<section>
			{props.players.map(player => {
				return <div className='columns is-gapless team-details-page blockElement'>
					<div className='card-list'>
						<div className='card has-text-centered'>
							<div className='card-content'>
								<p className='title team-name'>
									{ player.first_name + ' ' + player.last_name }
								</p>
								<p className='subtitle team-city-state'>
									{ player.email }
								</p>
								<p className='subtitle team-city-state'>
									{ player.position }
								</p>
							</div>
						</div>
						<footer className='card-footer panel-heading dashboard-team-list-footer'>
							<p className='card-footer-item'>
								<span>
									<a href="https://highlandersport.herokuapp.com/roster-list-player.html?id=4">View Player Details</a>
								</span>
							</p>
						</footer>
					</div>
				</div>;
			}) }
		</section>
	);
}
