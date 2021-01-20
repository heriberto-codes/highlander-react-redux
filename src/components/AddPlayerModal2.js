import React, { Component } from 'react';
import { Field, reduxForm, SubmissionError} from 'redux-form';
import Input from './input';

class AddPlayer extends Component {

submit() {
	// something goes here
}

locationInput({ input, meta: { touched, error }, ...custom}) {
	// const hasError = touched && error !== undefined;
	return (
		// <div>
		// 	{hasError &&
		// 		<Message
		// 			error
		// 			header='Error'
		// 			content={ error }
		// 		/>}
		// 		<Input
		// 			error={ hasError }
		// 			fluid
		// 			placeholder='something goes here'
		// 			{ ...input }
		// 			{ ... custom }
		// 		/>
		// </div>
		<div>
			<h1>Some location input goes here</h1>
		</div>
	)
}

render() {
	const { hanldeSubmit } = this.props;
	return (
		<form>
		{/* <form onSubmit = { handleSubmit(this.submit.bind(this))}> */}
			<div className="modal is-active">
				<div className="modal-background"></div>
				<div className="modal-card">
					<header className="modal-card-head">
						<p className="modal-card-title">Add a Player</p>
						<button
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
								<Field
									className="input is-medium"
									name='email'
									component={Input}
									type='email'
									placeholder="Email"
								id="playerEmail"/>
							</p>
						</div>

						<div className="field">
							<label className="label" htmlFor='firstName'>First Name</label>
							<p className="control">
								<Field
									className="input is-medium required"
									name='firstName'
									component={Input}
									placeholder="First Name"
									id="firstName"
									type='text' />
							</p>
						</div>

						<div className='field'>
							<label className="label" htmlFor='lastName'>Last Name</label>
							<p className="control">
								<Field
									className="input is-medium required"
									name='lastName'
									component={Input}
									type='text'
									placeholder="Last Name"
									id="lastName"
								/>
							</p>
						</div>

						<div className='field'>
							<label className="label" htmlFor='position'>Position</label>
							<p className="control">
								<Field
									className="input is-medium required"
									name='position'
									component={Input}
									type='text'
									placeholder="Position"
									id="playerPosition"
								/>
							</p>
						</div>

					</section>
					<footer className="modal-card-foot">
						<button
							className="button is-success"
							type='submit'
							disabled={
								this.props.pristine || this.props.submitting
							}>
							Submit
						</button>
						<button className="button">Cancel</button>
					</footer>
				</div>
			</div>
		</form>
	);
}
}

const validate = values => {
	const { location } = values;
	const errors = {};
	if (!location || location.trim() === '') {
		errors.location = 'Location required';
	}
	return errors;
}

export default reduxForm({
	form: 'addPlayer'
})(AddPlayer);
