import React, { useState } from 'react';

import StatusMessage from './ui/StatusMessage';

const initialPlayer = {
	email: '',
	firstName: '',
	lastName: '',
	position: ''
};

export default function AddPlayer(props) {
	const [player, setPlayer] = useState(initialPlayer);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState(null);

	const handleChange = event => {
		setPlayer(currentPlayer => Object.assign({}, currentPlayer, {
			[event.target.name]: event.target.value
		}));
	};

	const handleSubmit = event => {
		event.preventDefault();
		setIsSubmitting(true);
		setSubmitError(null);

		Promise.resolve(props.addPlayer(
			props.teamID,
			player.email,
			player.firstName,
			player.lastName,
			player.position
		))
			.catch(error => {
				setSubmitError(error);
				setIsSubmitting(false);
			});
	};

	return (
		<div className="modal is-active">
			<div className="modal-background" onClick={props.closeModal}></div>
			<form className="modal-card" onSubmit={handleSubmit}>
				<header className="modal-card-head">
					<p className="modal-card-title">Add a Player</p>
					<button
						className="delete"
						type="button"
						aria-label="close"
						onClick={props.closeModal}
					>
					</button>
				</header>
				<section className="modal-card-body">
					{submitError ? (
						<StatusMessage
							message="Unable to add the player. Check the details and try again."
							variant="warning"
						/>
					) : null}
					<div className="field">
						<label className="label" htmlFor="playerEmail">Email</label>
						<input
							id="playerEmail"
							className="input is-medium"
							name="email"
							type="email"
							value={player.email}
							onChange={handleChange}
							required
						/>
					</div>
					<div className="field">
						<label className="label" htmlFor="firstName">First Name</label>
						<input
							id="firstName"
							className="input is-medium"
							name="firstName"
							value={player.firstName}
							onChange={handleChange}
							required
						/>
					</div>
					<div className="field">
						<label className="label" htmlFor="lastName">Last Name</label>
						<input
							id="lastName"
							className="input is-medium"
							name="lastName"
							value={player.lastName}
							onChange={handleChange}
							required
						/>
					</div>
					<div className="field">
						<label className="label" htmlFor="playerPosition">Position</label>
						<input
							id="playerPosition"
							className="input is-medium"
							name="position"
							value={player.position}
							onChange={handleChange}
							required
						/>
					</div>
				</section>
				<footer className="modal-card-foot">
					<button className="button is-success" type="submit" disabled={isSubmitting}>
						{isSubmitting ? 'Adding Player...' : 'Add Player'}
					</button>
					<button className="button" type="button" onClick={props.closeModal} disabled={isSubmitting}>
						Cancel
					</button>
				</footer>
			</form>
		</div>
	);
}
