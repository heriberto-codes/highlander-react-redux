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

	const handleFilterChange = event => {
		if (props.onFilterChange) {
			props.onFilterChange(event.target.name, event.target.value);
		}
	};

	const handleSubmit = event => {
		event.preventDefault();
		if (props.onApplyFilters) {
			props.onApplyFilters();
		}
	};

	return (
		<section className="hero is-primary dashboard-bg-image">
			<div className="hero-body hero-bg-image">
				<div className="container profile">
					<div className="profile-heading">
						<div className="columns level">
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
							<div className="column">
								<form className="level-right" onSubmit={handleSubmit}>
									<span className="level-item">
										<input
											id="dashboard-team-search"
											name="teamSearch"
											className="input"
											type="search"
											placeholder="Search teams"
											value={props.teamSearch || ''}
											onChange={handleFilterChange}
										/>
									</span>
									<span className="level-item">
										<input
											id="dashboard-player-search"
											name="playerSearch"
											className="input"
											type="search"
											placeholder="Search players"
											value={props.playerSearch || ''}
											onChange={handleFilterChange}
										/>
									</span>
									<span className="level-item">
										<input
											id="dashboard-position-filter"
											name="position"
											className="input"
											type="search"
											placeholder="Filter by position"
											value={props.position || ''}
											onChange={handleFilterChange}
										/>
									</span>
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
										<button className="button is-primary" type="submit">
                    Apply Filters
										</button>
									</span>
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
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
