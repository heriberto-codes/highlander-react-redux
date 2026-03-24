import React from 'react';
import { Link } from 'react-router-dom';

import 'bulma/css/bulma.css';
import '../css/style.css';

export default function TeamDetailsNavigation(props) {
	const formatRole = role => {
		if (!role) {
			return '';
		}

		return role.charAt(0).toUpperCase() + role.slice(1);
	};

	const {
		name,
		city: location,
		first_name: firstName,
		last_name: lastName,
		email,
		activeSeason,
		availableSeasons,
		currentCoachRole,
		playerSearch,
		position,
		onSeasonChange,
		onFilterChange,
		onApplyFilters,
		showModal: onClick,
		showGameEntryForm: onShowGameEntry
	} = props;

	const showSeasonSelector = (availableSeasons || []).length > 0;

	const handleSeasonChange = event => {
		if (onSeasonChange) {
			onSeasonChange(Number(event.target.value));
		}
	};

	const handleFilterChange = event => {
		if (onFilterChange) {
			onFilterChange(event.target.name, event.target.value);
		}
	};

	const handleSubmit = event => {
		event.preventDefault();
		if (onApplyFilters) {
			onApplyFilters();
		}
	};

	return (
		<section className="hero is-primary dashboard-bg-image">
			<div className="hero-body hero-bg-image">
				<div className="container profile">
					<div className="profile-heading">
						<div className="columns level">
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
								{activeSeason !== null && activeSeason !== undefined ? (
									<p className="profile-metadata">
                  Active Season: {activeSeason}
									</p>
								) : null}
								{currentCoachRole ? (
									<p className="profile-metadata">
                  Collaboration Role: {formatRole(currentCoachRole)}
									</p>
								) : null}
							</div>
							<div className="column">
								<form className="level-right" onSubmit={handleSubmit}>
									<span className="level-item">
										<input
											id="team-details-player-search"
											name="playerSearch"
											className="input"
											type="search"
											placeholder="Search players"
											value={playerSearch || ''}
											onChange={handleFilterChange}
										/>
									</span>
									<span className="level-item">
										<input
											id="team-details-position-filter"
											name="position"
											className="input"
											type="search"
											placeholder="Filter by position"
											value={position || ''}
											onChange={handleFilterChange}
										/>
									</span>
									{showSeasonSelector ? (
										<span className="level-item">
											<label className="tagline profile-metadata coach-email" htmlFor="team-details-season-select">
                    Season
											</label>
											<div className="select is-primary is-outlined">
												<select
													id="team-details-season-select"
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
									<button
										onClick={onClick}
										type="button"
										className="button is-primary is-outlined"
									>
                    Add New Player
									</button>
								</span>
								<span className="level-item">
									<button
										onClick={onShowGameEntry}
										type="button"
										className="button is-primary is-outlined"
									>
                    Add Game Stats
									</button>
								</span>
								<span className="level-item">
									<Link className="button is-primary is-outlined" to='/editteam'>Edit Team</Link>
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
