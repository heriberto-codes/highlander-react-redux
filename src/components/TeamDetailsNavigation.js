import React from 'react';
import { Link } from 'react-router-dom';

import 'bulma/css/bulma.css';
import '../css/style.css';

export default function TeamDetailsNavigation(props) {

	//TODO: look into storing all of this via deconstruction
	const name = props.name;
	const location = props.city;
	const firstName = props.first_name;
	const lastName = props.last_name;
	const email = props.email;
	const onClick = props.showModal;

	return (
		<section className="hero is-primary dashboard-bg-image">
			<div className="hero-body hero-bg-image">
				<div className="container profile">
					<div className="profile-heading">
						<nav className="columns level">
							<div className="column is-4 level-left">
								<h1 className="title coach-title coach-heading-dashboard">Team Details:</h1>
								<p className="profile-metadata">
									<span className="title is-bold profile-title team-name">{name}</span>
								</p>
								<p className="profile-metadata">
                  Location: {location}
									<span className="tagline profile-metadata team-location"></span>
								</p>
								<p className="profile-metadata">
                  Head Coach: {firstName + ' ' + lastName}
									<span className="tagline profile-metadata coach-name"></span>
								</p>
								<p className="profile-metadata">
                  Email: {email}
									<span className="tagline profile-metadata coach-email"></span>
								</p>
							</div>
							<div className="level-right">
								<span className="level-item">
									<button
										onClick={onClick}
										className="button is-primary is-outlined"
									>
                    Add New Player
									</button>
								</span>
								<span className="level-item">
									<Link className="button is-primary is-outlined" to='/editteam'>Edit Team</Link>
								</span>
							</div>
						</nav>
					</div>
				</div>
			</div>
		</section>
	);
}
