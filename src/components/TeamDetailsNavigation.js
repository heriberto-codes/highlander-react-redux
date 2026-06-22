import React from 'react';

import Button from './ui/Button';
import 'bulma/css/bulma.css';
import '../css/style.css';

export default function TeamDetailsNavigation(props) {
	const {
		name,
		city: location,
		first_name: firstName,
		last_name: lastName,
		email,
		activeSeason,
		availableSeasons,
		playerSearch,
		position,
		onSeasonChange,
		onFilterChange,
		onApplyFilters,
		showModal: onClick,
		showGameEntryForm: onShowGameEntry,
		onEditTeam
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
							</div>
							<div className="column">
								<form className="team-details-filter-form" onSubmit={handleSubmit}>
									<div className="team-details-filter-fields">
									<span className="team-details-filter-control">
										<input
											id="team-details-player-search"
											name="playerSearch"
											className="input hl-focusable"
											type="search"
											placeholder="Search players"
											value={playerSearch || ''}
											onChange={handleFilterChange}
										/>
									</span>
									<span className="team-details-filter-control">
										<input
											id="team-details-position-filter"
											name="position"
											className="input hl-focusable"
											type="search"
											placeholder="Filter by position"
											value={position || ''}
											onChange={handleFilterChange}
										/>
									</span>
									</div>
									<div className="team-details-filter-actions">
									{showSeasonSelector ? (
										<span className="team-details-season-control">
											<label className="tagline profile-metadata coach-email" htmlFor="team-details-season-select">
                    Season
											</label>
											<div className="select is-primary is-outlined">
												<select
													id="team-details-season-select"
													className="hl-focusable"
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
									<span>
										<Button type="submit" variant="primary">
                    Apply Filters
										</Button>
									</span>
								<span>
									<Button
										onClick={onClick}
										type="button"
										isOutlined
										variant="primary"
									>
                    Add New Player
									</Button>
								</span>
								<span>
									<Button
										onClick={onShowGameEntry}
										type="button"
										isOutlined
										variant="primary"
									>
                    Add Game Stats
									</Button>
								</span>
								<span>
									<Button isOutlined type="button" onClick={onEditTeam} variant="primary">Edit Team</Button>
								</span>
								</div>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
