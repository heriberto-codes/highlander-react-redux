import React from 'react';
import { Link } from 'react-router-dom';

import 'bulma/css/bulma.css';
import '../css/style.css';

export default function TeamsList(props) {
	const teams = props.teams;
	const activeSeason =
		props.activeSeason !== undefined && props.activeSeason !== null
			? props.activeSeason
			: teams && teams.length > 0 && teams[0].season !== undefined
				? teams[0].season
				: null;
	const hasActiveFilters = Boolean(
		props.filters && (
			props.filters.teamSearch ||
			props.filters.playerSearch ||
			props.filters.position
		)
	);
	const emptyMessage = hasActiveFilters
		? `No teams match the current filters${activeSeason !== null ? ` for season ${activeSeason}` : ''}.`
		: 'You dont have any teams.';

	let listOfTeams = teams.map((team, index) => {
		return <li className='panel-heading' key={index}>
			<Link to={'/teamdetails/' + team.id}>
				{team.name}
				{team.season !== undefined ? ` (${team.season})` : ''}
			</Link>
		</li>
	});

	const teamsList = listOfTeams.length > 0 ? listOfTeams
		: <div className="notification has-text-centered add-team-message">
			{emptyMessage}
		</div>;

	return (
		<div className='tile is-child box header'>
			<nav className="level dashboard-title">
				<div className="level-left">
					<div className="level-item">
						<span className="icon">
							<i className="fa fa-futbol-o icon-dasboard-placement" aria-hidden="true"></i>
						</span>
						<p>
                Teams
						</p>
					</div>
				</div>
				<div className="level-right">
					<span className="level-item">
						<a className="button is-outlined is-primary" href="add-team.html">
                Add a New Team
						</a>
					</span>
				</div>
			</nav>
			{activeSeason !== null ? (
				<p className="tagline profile-metadata">Showing season {activeSeason}</p>
			) : null}
			<ul className="teams-list-container">
				{teamsList}
			</ul>
		</div>
	)
}
