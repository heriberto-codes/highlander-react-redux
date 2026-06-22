import React, { useState } from 'react';

import Button from './ui/Button';
import StatusMessage from './ui/StatusMessage';

const currentYear = new Date().getFullYear();

export default function AddTeamModal({ error, isSubmitting, onClose, onSubmit }) {
	const [team, setTeam] = useState({
		name: '',
		city: '',
		state: '',
		season: currentYear
	});

	const handleChange = event => {
		setTeam(currentTeam => Object.assign({}, currentTeam, {
			[event.target.name]: event.target.value
		}));
	};

	const handleSubmit = event => {
		event.preventDefault();
		onSubmit(Object.assign({}, team, {
			season: Number(team.season)
		}));
	};

	return (
		<div className="modal is-active">
			<div className="modal-background" onClick={onClose}></div>
			<form className="modal-card" onSubmit={handleSubmit}>
				<header className="modal-card-head">
					<p className="modal-card-title">Add a New Team</p>
					<button className="delete" type="button" aria-label="close" onClick={onClose}></button>
				</header>
				<section className="modal-card-body">
					{error ? (
						<StatusMessage message="Unable to create the team. Check the details and try again." variant="warning" />
					) : null}
					<div className="field">
						<label className="label" htmlFor="new-team-name">Team Name</label>
						<input id="new-team-name" className="input" name="name" value={team.name} onChange={handleChange} required />
					</div>
					<div className="field">
						<label className="label" htmlFor="new-team-city">City</label>
						<input id="new-team-city" className="input" name="city" value={team.city} onChange={handleChange} required />
					</div>
					<div className="field">
						<label className="label" htmlFor="new-team-state">State</label>
						<input id="new-team-state" className="input" name="state" value={team.state} onChange={handleChange} required />
					</div>
					<div className="field">
						<label className="label" htmlFor="new-team-season">Season</label>
						<input
							id="new-team-season"
							className="input"
							name="season"
							type="number"
							min="1900"
							max="2100"
							value={team.season}
							onChange={handleChange}
							required
						/>
					</div>
				</section>
				<footer className="modal-card-foot">
					<Button type="submit" variant="primary" disabled={isSubmitting}>
						{isSubmitting ? 'Creating Team...' : 'Create Team'}
					</Button>
					<Button type="button" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
				</footer>
			</form>
		</div>
	);
}
