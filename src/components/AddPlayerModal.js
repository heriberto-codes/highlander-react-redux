import React from 'react';

import 'bulma/css/bulma.css';
import '../css/style.css';

export default function AddPlayerModal(props) {

	const hideTheModal = props.closeModal;
	const addPlayer = props.addPlayer;
  const teamId = props.teamID;

	let emailInput = null;
	let firstName = null;
	let lastName = null;
	let position = null;

	function handleClick() {
		// console.log(emailInput.value);
		// console.log(firstName.value);
		// console.log(lastName.value);
		// console.log(position.value);
		addPlayer(teamId, emailInput.value, firstName.value, lastName.value, position.value);
	}

	return (
		<div className="modal is-active">
			<div className="modal-background">kdjsfhsdkjfhdj</div>
			<div className="modal-card">
				<header className="modal-card-head">
					<p className="modal-card-title">Add a Player</p>
					<button onClick={hideTheModal} className="delete" aria-label="close"></button>
				</header>
				<section className="modal-card-body">
					<div className="notification is-success add-team-notification">
            Success! You added a player.
					</div>

					<div className="notification is-warning add-team-error-notification">
            Sorry you are missing details, please fill out the <strong>entire</strong> form.
					</div>
					<div className="field">
						<label className="label">Email</label>
						<p className="control">
							<input
								className="input is-medium required"
								type="email"
								placeholder="Email"
								id="playerEmail"
								ref={ input => {  emailInput = input; }} />
						</p>
					</div>
					<div className="field">
						<label className="label">First Name</label>
						<p className="control">
							<input
								className="input is-medium required"
								type="text"
								placeholder="First Name"
								id="firstName"
								ref={ input => { firstName = input; }} />
						</p>
					</div>
					<div className="field">
						<label className="label">Last Name</label>
						<p className="control">
							<input
								className="input is-medium required"
								type="text"
								placeholder="Last Name"
								id="lastName"
								ref={ input => { lastName = input; }}/>
						</p>
					</div>
					<div className="field">
						<label className="label">Position</label>
						<p className="control">
							<input
								className="input is-medium required"
								type="text"
								placeholder="Position"
								id="playerPosition"
								ref={ input => { position = input; }}/>
						</p>
					</div>
				</section>
				<footer className="modal-card-foot">
					<button
						className="button is-success"
						onClick={handleClick}
					>Save changes
					</button>
					<button className="button">Cancel</button>
				</footer>
			</div>
		</div>
	);
}
