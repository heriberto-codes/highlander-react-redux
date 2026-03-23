import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import 'bulma/css/bulma.css';
import '../css/style.css';

const statCatalogs = [
	{ id: 1, label: 'Hits' },
	{ id: 2, label: 'At Bats' },
	{ id: 3, label: 'Home Runs' },
	{ id: 4, label: 'Earned Runs' },
	{ id: 5, label: 'Innings Pitched' },
	{ id: 6, label: 'Strikeouts' }
];

export default function TeamDetailsComponent(props) {
	const [opponent, setOpponent] = useState('');
	const [gameDate, setGameDate] = useState('');
	const [statEntries, setStatEntries] = useState({});
	const activeSeason =
		props.activeSeason !== undefined && props.activeSeason !== null
			? props.activeSeason
			: null;
	const hasActiveFilters = Boolean(
		props.filters && (
			props.filters.playerSearch ||
			props.filters.position
		)
	);
	const emptyMessage = hasActiveFilters
		? `No players match the current filters${activeSeason !== null ? ` for season ${activeSeason}` : ''}.`
		: 'You dont have a Roster.';
	const canSubmitGameEntry = !props.isSubmittingGame && opponent.trim() !== '' && gameDate !== '';

	useEffect(() => {
		if (!props.showGameEntryForm) {
			setOpponent('');
			setGameDate('');
			setStatEntries({});
		}
	}, [props.showGameEntryForm]);

	const updateStatEntry = (playerId, statCatalogId, value) => {
		setStatEntries(Object.assign({}, statEntries, {
			[`${playerId}:${statCatalogId}`]: value
		}));
	};

	const submitGameEntry = event => {
		event.preventDefault();

		if (!canSubmitGameEntry) {
			return;
		}

		const payload = {
			opponent: opponent.trim(),
			game_date: gameDate,
			playerStats: (props.players || []).map(player => ({
				playerId: player.id,
				stats: statCatalogs.map(statCatalog => ({
					statCatalogId: statCatalog.id,
					howMany: Number(statEntries[`${player.id}:${statCatalog.id}`] || 0)
				}))
			}))
		};

		if (props.onSubmitGameEntry) {
			props.onSubmitGameEntry(payload);
		}
	};

	return (
		<section>
			{props.showGameEntryForm ? (
				<div className="box blockElement">
					<form onSubmit={submitGameEntry}>
						<h2 className="title is-4">Game Stat Entry</h2>
						<div className="field">
							<label className="label" htmlFor="game-entry-opponent">Opponent</label>
							<div className="control">
								<input
									id="game-entry-opponent"
									className="input"
									type="text"
									value={opponent}
									onChange={event => setOpponent(event.target.value)}
									required
								/>
							</div>
						</div>
						<div className="field">
							<label className="label" htmlFor="game-entry-date">Game Date</label>
							<div className="control">
								<input
									id="game-entry-date"
									className="input"
									type="date"
									value={gameDate}
									onChange={event => setGameDate(event.target.value)}
									required
								/>
							</div>
						</div>
						<div className="table-container">
							<table className="table is-fullwidth">
								<thead>
									<tr>
										<th>Player</th>
										{statCatalogs.map(statCatalog => (
											<th key={statCatalog.id}>{statCatalog.label}</th>
										))}
									</tr>
								</thead>
								<tbody>
									{props.players.map(player => (
										<tr key={`game-entry-${player.id}`}>
											<td>{player.first_name} {player.last_name}</td>
											{statCatalogs.map(statCatalog => (
												<td key={`${player.id}-${statCatalog.id}`}>
													<input
														className="input"
														type="number"
														min="0"
														step="1"
														value={statEntries[`${player.id}:${statCatalog.id}`] || ''}
														onChange={event => updateStatEntry(player.id, statCatalog.id, event.target.value)}
														data-player-id={player.id}
														data-stat-catalog-id={statCatalog.id}
													/>
												</td>
											))}
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<div className="buttons">
							<button
								type="submit"
								className="button is-primary"
								disabled={!canSubmitGameEntry}
							>
								{props.isSubmittingGame ? 'Saving...' : 'Save Game Stats'}
							</button>
							<button
								type="button"
								className="button is-light"
								onClick={props.onCancelGameEntry}
							>
								Cancel
							</button>
						</div>
						{props.gameSubmissionSuccess && props.lastCreatedGame ? (
							<p className="has-text-success">
								Saved game entry with {props.lastCreatedGame.insertedStatRows} stat rows.
							</p>
						) : null}
						{props.gameSubmissionError ? (
							<p className="has-text-danger">
								Unable to save game entry.
							</p>
						) : null}
					</form>
				</div>
			) : null}
			{activeSeason !== null ? (
				<p className="tagline profile-metadata">Showing season {activeSeason}</p>
			) : null}
			{props.players.length > 0 ? props.players.map(player => {
				return <div key={player.id} className='columns is-gapless team-details-page blockElement'>
					<div className='card-list'>
						<div className='card has-text-centered'>
							<div className='card-content'>
								<p className='title team-name'>
									{ player.first_name + ' ' + player.last_name }
								</p>
								<p className='subtitle team-city-state'>
									{ player.email }
								</p>
								<p className='subtitle team-city-state'>
									{ player.position }
								</p>
							</div>
						</div>
						<footer className='card-footer panel-heading dashboard-team-list-footer'>
							<p className='card-footer-item'>
								<span>
									<a href="#">View Player Details</a>
								</span>
							</p>
						</footer>
					</div>
				</div>;
			}) : (
				<div className="notification has-text-centered roster-dashboard-message">
					{emptyMessage}
				</div>
			)}
		</section>
	);
}
