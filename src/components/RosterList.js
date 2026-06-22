import React, { useState } from 'react';

import 'bulma/css/bulma.css';
import '../css/style.css';

import Button from './ui/Button';
import EmptyState from './ui/EmptyState';
import PaginationControls from './ui/PaginationControls';
import SectionPanel from './ui/SectionPanel';
import PlayerDetailsModal from './PlayerDetailsModal';

function isEmptyPaginatedPage(items, pagination) {
	return items.length === 0 && pagination && pagination.totalItems > 0;
}

export default function RosterList(props) {
	const [selectedPlayerId, setSelectedPlayerId] = useState(null);

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
		return <div key={player.id || index} className='card has-text-centered'>
			<div className='card-content' id='theTeamBg'>
				<p className='title player-name'>{player.first_name}</p>
				<p className='subtitle player-email'>{player.email}</p>
			</div>
			<footer className='card-footer panel-heading dashboard-roster-footer'>
				<p className='card-footer-item'>
					<span>
						<button
							className="button is-text"
							type="button"
							onClick={() => setSelectedPlayerId(player.id)}
							disabled={!player.id}
						>
							View Player Details
						</button>
					</span>
				</p>
			</footer>
		</div>;
	});


	const playerList = listOfPlayers.length > 0 ? listOfPlayers:
		<EmptyState className="roster-dashboard-message" message={emptyMessage} />;

	return (
		<SectionPanel
			actions={(
				<Button onClick={props.onAddPlayer} isOutlined variant="primary">
					Add a New Player
				</Button>
			)}
			iconClassName="fa fa-users"
			title="Roster"
		>
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
			<PaginationControls
				ariaLabel="roster pagination"
				onPageChange={props.onPageChange}
				pagination={props.pagination}
			/>
			{selectedPlayerId ? (
				<PlayerDetailsModal
					playerId={selectedPlayerId}
					onClose={() => setSelectedPlayerId(null)}
				/>
			) : null}
		</SectionPanel>
	);
}
