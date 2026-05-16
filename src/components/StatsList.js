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
		<nav className="pagination is-small" role="navigation" aria-label="stats pagination">
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

export default function StatsList(props) {
	const stats = props.stats;
	const activeSeason =
		props.activeSeason !== undefined && props.activeSeason !== null
			? props.activeSeason
			: props.teams && props.teams.length > 0 && props.teams[0].season !== undefined
				? props.teams[0].season
				: null;
	const hasActiveFilters = Boolean(
		props.filters && (
			props.filters.teamSearch ||
			props.filters.playerSearch ||
			props.filters.position
		)
	);
	const formatDerivedStat = value =>
		value === null || value === undefined ? '--' : Number(value).toFixed(3);
	// const mergeTeamStats = [];

	// the fact that I am setting state for stats here seems dirty.
	let playerStats = stats.map((player, index) => {
		const rowKey = player.id || `${player.first_name}-${player.last_name}-${player.position}-${index}`;
		return <tr key={rowKey}>
			<th>{player.position}</th>
			<td>{player.first_name} {player.last_name}</td>
			<td>{player.stats['Hits']}</td>
			<td>{player.stats['At Bats']}</td>
			<td>{player.stats['Home Runs']}</td>
			<td>{player.stats['Earned Runs']}</td>
			<td>{player.stats['Innings Pitched']}</td>
			<td>{player.stats['Strikeouts']}</td>
			<td>{formatDerivedStat(player.derivedStats && player.derivedStats.battingAverage)}</td>
			<td>{formatDerivedStat(player.derivedStats && player.derivedStats.homeRunRate)}</td>
			<td>{formatDerivedStat(player.derivedStats && player.derivedStats.era)}</td>
			<td>{formatDerivedStat(player.derivedStats && player.derivedStats.strikeoutsPerInning)}</td>
		</tr>;
	});
	// mergeTeamStats.push(newPlayerStat);
	// })
	// console.log(mergeTeamStats)

	const emptyMessage = isEmptyPaginatedPage(stats, props.pagination)
		? 'No stats on this page.'
		: hasActiveFilters
		? `No stats match the current filters${activeSeason !== null ? ` for season ${activeSeason}` : ''}.`
		: 'You dont have Stats.';
	return (
		<div className='tile is-parent'>
			<div className='tile is-child box header'>
				<nav className="level dashboard-title">
					<div className="level-left">
						<div className="level-item">
							<span className="icon icon-dasboard-placement">
								<i className="fa fa-list-ol" aria-hidden="true"></i>
							</span>
							<p>
                Stats
							</p>
						</div>
					</div>
					<div className="level-right">
						<span className="level-item">
							<a className="button is-outlined is-primary" href="add-stats.html">
                Add New Stats
							</a>
						</span>
					</div>
			</nav>
			{activeSeason !== null ? (
				<p className="tagline profile-metadata">Showing season {activeSeason}</p>
			) : null}

				<section>
					{playerStats.length > 0 ? (
						<table className="table">
							<thead className="stat-header-details-container">
								<tr>
									<th>
										<abbr title='Position'>Pos</abbr>
									</th>
									<th>
										<abbr title='Name'>Name</abbr>
									</th>
									<th>
										<abbr title='Hits'>Hits</abbr>
									</th>
									<th>
										<abbr title='At Bats'>AB</abbr>
									</th>
									<th>
										<abbr title='Home Runs'>HR</abbr>
									</th>
									<th>
										<abbr title='Earned Runs'>ER</abbr>
									</th>
									<th>
										<abbr title='Inning Pitched'>IP</abbr>
									</th>
									<th>
										<abbr title='Strike Outs'>Strike Outs</abbr>
									</th>
									<th>
										<abbr title='Batting Average'>AVG</abbr>
									</th>
									<th>
										<abbr title='Home Run Rate'>HR Rate</abbr>
									</th>
									<th>
										<abbr title='Earned Run Average'>ERA</abbr>
									</th>
									<th>
										<abbr title='Strikeouts Per Inning'>K/IP</abbr>
									</th>
								</tr>
							</thead>
							<tbody className="stat-details-container">
								{ playerStats }
							</tbody>
						</table>
					) : (
						<div className="notification has-text-centered stats-module-dashboard-message">
							{emptyMessage}
						</div>
					)}
				</section>
				{renderPaginationControls(props.pagination, props.onPageChange)}
			</div>
		</div>
	);
}
