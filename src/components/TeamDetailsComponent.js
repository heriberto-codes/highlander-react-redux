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
	const [newCollaboratorCoachId, setNewCollaboratorCoachId] = useState('');
	const [newCollaboratorRole, setNewCollaboratorRole] = useState('assistant');
	const [roleDrafts, setRoleDrafts] = useState({});
	const activeSeason =
		props.activeSeason !== undefined && props.activeSeason !== null
			? props.activeSeason
			: null;
	const collaborators = props.collaborators || [];
	const isOwner = props.currentCoachRole === 'owner';
	const isCollaboratorMutationPending =
		props.isAddingCollaborator ||
		props.isUpdatingCollaborator ||
		props.isRemovingCollaborator;
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

	useEffect(() => {
		setRoleDrafts(
			collaborators.reduce((drafts, collaborator) => Object.assign({}, drafts, {
				[collaborator.id]: collaborator.role
			}), {})
		);
	}, [collaborators]);

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

	const handleRoleDraftChange = (collaboratorId, value) => {
		setRoleDrafts(Object.assign({}, roleDrafts, {
			[collaboratorId]: value
		}));
	};

	const submitAddCollaborator = event => {
		event.preventDefault();

		const coachId = Number(newCollaboratorCoachId);
		if (!isOwner || !Number.isInteger(coachId) || props.isAddingCollaborator) {
			return;
		}

		if (props.onAddCollaborator) {
			props.onAddCollaborator(coachId, newCollaboratorRole);
		}
	};

	const submitCollaboratorRoleUpdate = (event, collaboratorId) => {
		event.preventDefault();

		if (!isOwner || !props.onUpdateCollaborator || props.isUpdatingCollaborator) {
			return;
		}

		props.onUpdateCollaborator(collaboratorId, roleDrafts[collaboratorId] || 'assistant');
	};

	const removeCollaborator = collaboratorId => {
		if (!isOwner || !props.onRemoveCollaborator || props.isRemovingCollaborator) {
			return;
		}

		props.onRemoveCollaborator(collaboratorId);
	};

	const renderCollaboratorStatus = () => (
		<div className="content">
			{props.isAddingCollaborator ? <p>Adding collaborator...</p> : null}
			{props.addCollaboratorSuccess ? <p className="has-text-success">Collaborator added.</p> : null}
			{props.addCollaboratorError ? <p className="has-text-danger">Unable to add collaborator.</p> : null}
			{props.isUpdatingCollaborator ? <p>Updating collaborator...</p> : null}
			{props.updateCollaboratorSuccess ? <p className="has-text-success">Collaborator updated.</p> : null}
			{props.updateCollaboratorError ? <p className="has-text-danger">Unable to update collaborator.</p> : null}
			{props.isRemovingCollaborator ? <p>Removing collaborator...</p> : null}
			{props.removeCollaboratorSuccess ? <p className="has-text-success">Collaborator removed.</p> : null}
			{props.removeCollaboratorError ? <p className="has-text-danger">Unable to remove collaborator.</p> : null}
		</div>
	);

	return (
		<section>
			<div className="box blockElement">
				<h2 className="title is-4">Team Collaborators</h2>
				{collaborators.length > 0 ? (
					<div className="content">
						{collaborators.map(collaborator => (
							<div key={`collaborator-${collaborator.id}`} className="box">
								<p>
									<strong>{collaborator.first_name} {collaborator.last_name}</strong>
								</p>
								<p>{collaborator.email}</p>
								<p>Role: {collaborator.role}</p>
								{isOwner ? (
									<form onSubmit={event => submitCollaboratorRoleUpdate(event, collaborator.id)}>
										<div className="field is-grouped is-align-items-flex-end">
											<div className="control">
												<label className="label" htmlFor={`collaborator-role-${collaborator.id}`}>Role</label>
								<div className="select">
									<select
										id={`collaborator-role-${collaborator.id}`}
										value={roleDrafts[collaborator.id] || collaborator.role}
										onChange={event => handleRoleDraftChange(collaborator.id, event.target.value)}
										disabled={props.isUpdatingCollaborator}
									>
														<option value="owner">owner</option>
														<option value="assistant">assistant</option>
													</select>
												</div>
											</div>
											<div className="control">
											<button
												type="submit"
												className="button is-primary is-outlined"
												data-collaborator-update-id={collaborator.id}
												disabled={props.isUpdatingCollaborator}
											>
													Update Role
												</button>
											</div>
											<div className="control">
											<button
												type="button"
												className="button is-danger is-outlined"
												data-collaborator-remove-id={collaborator.id}
												onClick={() => removeCollaborator(collaborator.id)}
												disabled={props.isRemovingCollaborator}
											>
													Remove
												</button>
											</div>
										</div>
									</form>
								) : null}
							</div>
						))}
					</div>
				) : (
					<p className="content">No collaborators yet.</p>
				)}
				{renderCollaboratorStatus()}
				{isOwner ? (
					<form onSubmit={submitAddCollaborator}>
						<h3 className="title is-5">Add Collaborator</h3>
						<div className="field is-grouped is-align-items-flex-end">
							<div className="control">
								<label className="label" htmlFor="team-collaborator-coach-id">Coach ID</label>
								<input
									id="team-collaborator-coach-id"
									className="input"
									type="number"
									min="1"
									step="1"
									value={newCollaboratorCoachId}
									onChange={event => setNewCollaboratorCoachId(event.target.value)}
									disabled={props.isAddingCollaborator}
								/>
							</div>
							<div className="control">
								<label className="label" htmlFor="team-collaborator-role">Role</label>
								<div className="select">
									<select
										id="team-collaborator-role"
										value={newCollaboratorRole}
										onChange={event => setNewCollaboratorRole(event.target.value)}
										disabled={props.isAddingCollaborator}
									>
										<option value="assistant">assistant</option>
										<option value="owner">owner</option>
									</select>
								</div>
							</div>
							<div className="control">
								<button
									type="submit"
									className="button is-primary"
									disabled={isCollaboratorMutationPending}
								>
									Add Collaborator
								</button>
							</div>
						</div>
					</form>
				) : null}
			</div>
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
