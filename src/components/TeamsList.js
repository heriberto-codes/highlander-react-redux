import React from 'react';
import { Link } from 'react-router-dom';

import 'bulma/css/bulma.css';
import '../css/style.css';

import Button from './ui/Button';
import EmptyState from './ui/EmptyState';
import PaginationControls from './ui/PaginationControls';
import SectionPanel from './ui/SectionPanel';

function isEmptyPaginatedPage(items, pagination) {
	return items.length === 0 && pagination && pagination.totalItems > 0;
}

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
	const emptyMessage = isEmptyPaginatedPage(teams, props.pagination)
		? 'No teams on this page.'
		: hasActiveFilters
		? `No teams match the current filters${activeSeason !== null ? ` for season ${activeSeason}` : ''}.`
		: 'You dont have any teams.';

	let listOfTeams = teams.map((team, index) => {
		return <li className='panel-heading' key={index}>
			<Link to={'/teamdetails/' + team.id}>
				{team.name}
				{team.season !== undefined ? ` (${team.season})` : ''}
			</Link>
		</li>;
	});

	const teamsList = listOfTeams.length > 0 ? listOfTeams
		: <EmptyState className="add-team-message" message={emptyMessage} />;

	return (
		<SectionPanel
			actions={(
				<Button onClick={props.onAddTeam} isOutlined variant="primary">
					Add a New Team
				</Button>
			)}
			iconClassName="fa fa-futbol-o icon-dasboard-placement"
			title="Teams"
		>
			{activeSeason !== null ? (
				<p className="tagline profile-metadata">Showing season {activeSeason}</p>
			) : null}
			<ul className="teams-list-container">
				{teamsList}
			</ul>
			<PaginationControls
				ariaLabel="teams pagination"
				onPageChange={props.onPageChange}
				pagination={props.pagination}
			/>
		</SectionPanel>
	);
}
