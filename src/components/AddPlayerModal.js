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

	function handleClick(emailInput, firstName, lastName, position) {
		// we need to check the following:
		// 	if the values in the form are empty then let the user know that they cannot continue
		// 	if we have all values filled out and complete then let the user proceed to submit form
		// if (emailInput && firstName && lastName && position === null) {
		// 	return alert('Sorry you must fill out the whole form')
		// } else {
		// 	addPlayer(teamId, emailInput.value, firstName.value, lastName.value, position.value);
		// }
	}

	return (
		<div className="modal is-active">
			<div className="modal-background"></div>
			<div className="modal-card">
				<header className="modal-card-head">
					<p className="modal-card-title">Add a Player</p>
					<button
						onClick={hideTheModal}
						className="delete"
						aria-label="close"
					>
					</button>
				</header>
				<section className="modal-card-body">
					<div className="notification is-success add-team-notification">
            Success! You added a player.
					</div>

					<div className="notification is-warning add-team-error-notification">
            Sorry you are missing details, please fill out the <strong>entire</strong> form.
					</div>
					<div className="field">
						<label className="label" htmlFor='email'>Email</label>
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
						<label className="label" htmlFor='firstname'>First Name</label>
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
						<label className="label" htmnlFor='lastname'>Last Name</label>
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
						<label className="label" htmlfor='position'>Position</label>
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
					<button
						className="button"
						onClick={hideTheModal}
					>Cancel
					</button>
				</footer>
			</div>
		</div>
	);
}
