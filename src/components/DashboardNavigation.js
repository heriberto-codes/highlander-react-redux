import React from 'react';

import 'bulma/css/bulma.css';
import '../css/style.css';

export default function DashboardNavigation(props) {  
	const availableSeasons = props.availableSeasons || [];
	const activeSeason = props.activeSeason;
	const showSeasonSelector = availableSeasons.length > 0;

	const handleSeasonChange = event => {
		if (props.onSeasonChange) {
			props.onSeasonChange(Number(event.target.value));
		}
	};

	return (
		<section className="hero is-primary dashboard-bg-image">
			<div className="hero-body hero-bg-image">
				<div className="container profile">
					<div className="profile-heading">
						<nav className="columns level">
							<div className="column is-4 level-left">
								<h1 className="title coach-title coach-heading-dashboard">Coach:</h1>
								<p>
									<span className="title is-bold profile-title coach-fullname">{props.firstName} {props.lastName}</span>
								</p>
								<p>
									<span className="tagline profile-metadata coach-email">{props.email}</span>
								</p>
								{activeSeason !== null && activeSeason !== undefined ? (
									<p>
										<span className="tagline profile-metadata coach-email">Active Season: {activeSeason}</span>
									</p>
								) : null}
							</div>
							<div className="level-right">
								{showSeasonSelector ? (
									<span className="level-item">
										<label className="tagline profile-metadata coach-email" htmlFor="dashboard-season-select">
                    Season
										</label>
										<div className="select is-primary is-outlined">
											<select
												id="dashboard-season-select"
												value={activeSeason !== null && activeSeason !== undefined ? activeSeason : ''}
												onChange={handleSeasonChange}
											>
												{availableSeasons.map(season => (
													<option key={season} value={season}>{season}</option>
												))}
											</select>
										</div>
									</span>
								) : null}
								<span className="level-item">
									<a className="button is-primary is-outlined" href="add-team.html">
                    Add a New Team
									</a>
								</span>
								<span className="level-item">
									<a className="button is-primary is-outlined" href="add-player.html">
                    Add a New Player
									</a>
								</span>
								<span className="level-item">
									<a className="button is-primary is-outlined" href="add-stats.html">
                    Add New Stats
									</a>
								</span>
							</div>
						</nav>
					</div>
				</div>
			</div>
		</section>
	);
}
