import React, { useState } from 'react';

import StatusMessage from './ui/StatusMessage';

export default function EditTeamModal({ error, isSubmitting, onClose, onSubmit, team }) {
	const [draft, setDraft] = useState({
		name: team.name || '',
		city: team.city || '',
		state: team.state || '',
		season: team.season || ''
	});

	const handleChange = event => {
		setDraft(currentDraft => Object.assign({}, currentDraft, {
			[event.target.name]: event.target.value
		}));
	};

	const handleSubmit = event => {
		event.preventDefault();
		onSubmit(Object.assign({}, draft, {
			season: Number(draft.season)
		}));
	};

	return (
		<div className="modal is-active">
			<div className="modal-background" onClick={onClose}></div>
			<form className="modal-card" onSubmit={handleSubmit}>
				<header className="modal-card-head">
					<p className="modal-card-title">Edit Team</p>
					<button className="delete" type="button" aria-label="close" onClick={onClose}></button>
				</header>
				<section className="modal-card-body">
					{error ? (
						<StatusMessage message="Unable to update the team. Check the details and try again." variant="warning" />
					) : null}
					<div className="field">
						<label className="label" htmlFor="edit-team-name">Team Name</label>
						<input id="edit-team-name" className="input" name="name" value={draft.name} onChange={handleChange} required />
					</div>
					<div className="field">
						<label className="label" htmlFor="edit-team-city">City</label>
						<input id="edit-team-city" className="input" name="city" value={draft.city} onChange={handleChange} required />
					</div>
					<div className="field">
						<label className="label" htmlFor="edit-team-state">State</label>
						<input id="edit-team-state" className="input" name="state" value={draft.state} onChange={handleChange} required />
					</div>
					<div className="field">
						<label className="label" htmlFor="edit-team-season">Season</label>
						<input
							id="edit-team-season"
							className="input"
							name="season"
							type="number"
							min="1900"
							max="2100"
							value={draft.season}
							onChange={handleChange}
							required
						/>
					</div>
				</section>
				<footer className="modal-card-foot">
					<button className="button is-primary" type="submit" disabled={isSubmitting}>
						{isSubmitting ? 'Saving Team...' : 'Save Team'}
					</button>
					<button className="button" type="button" onClick={onClose} disabled={isSubmitting}>Cancel</button>
				</footer>
			</form>
		</div>
	);
}
