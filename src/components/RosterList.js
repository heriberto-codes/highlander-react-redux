import React from 'react';

import 'bulma/css/bulma.css';
import '../css/style.css';

function renderPaginationControls(pagination, onPageChange) {
	if (!pagination || pagination.totalPages <= 1) {
		return null;
	}

	const previousPage = pagination.page - 1;
	const nextPage = pagination.page + 1;
	const canGoPrevious = pagination.hasPreviousPage && typeof onPageChange === 'function';
	const canGoNext = pagination.hasNextPage && typeof onPageChange === 'function';

	return (
		<nav className="pagination is-small" role="navigation" aria-label="roster pagination">
			<button
				type="button"
				className="pagination-previous"
				disabled={!canGoPrevious}
				onClick={() => canGoPrevious && onPageChange(previousPage)}>
				Previous
			</button>
			<button
				type="button"
				className="pagination-next"
				disabled={!canGoNext}
				onClick={() => canGoNext && onPageChange(nextPage)}>
				Next
			</button>
			<ul className="pagination-list">
				<li>
					<span className="pagination-link is-current">
						Page {pagination.page} of {pagination.totalPages}
					</span>
				</li>
			</ul>
		</nav>
	);
}

function isEmptyPaginatedPage(items, pagination) {
	return items.length === 0 && pagination && pagination.totalItems > 0;
}

export default function RosterList(props) {

	const players = props.players;
	const activeSeason =
		props.activeSeason !== undefined && props.activeSeason !== null
			? props.activeSeason
			: null;
	const hasActiveFilters = Boolean(
		props.filters && (
			props.filters.teamSearch ||
			props.filters.playerSearch ||
			props.filters.position
		)
	);
	const emptyMessage = isEmptyPaginatedPage(players, props.pagination)
		? 'No players on this page.'
		: hasActiveFilters
		? `No players match the current filters${activeSeason !== null ? ` for season ${activeSeason}` : ''}.`
		: 'You dont have a Roster.';
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
		</div>;
	});


	const playerList = listOfPlayers.length > 0 ? listOfPlayers:
		<div className="notification has-text-centered roster-dashboard-message">
			{emptyMessage}
		</div>;

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
			{activeSeason !== null ? (
				<p className="tagline profile-metadata">Showing season {activeSeason}</p>
			) : null}

			<section>
				<div className="columns">
					<div className="column player-details-dashboard-page">
						{playerList}
					</div>
				</div>
			</section>
			{renderPaginationControls(props.pagination, props.onPageChange)}
		</div>
	);
}
