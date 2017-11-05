import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Route, Redirect, Router } from 'react-router-dom';

import { login, logout } from '../actions/loginAction';
import { loginReducer } from '../reducers/loginReducer';

import Nav from '../components/Nav';
import LoginForm from '../components/LoginForm';
import Footer from '../components/Footer';
import Dashboard from '../pages/Dashboard';

class Login extends Component {
	componentWillReceiveProps(nextProps){
		if(nextProps.shouldRedirect) {
			this.props.history.push('/dashboard');
		}
	}

	callLogin(email, pwd){
		this.props.dispatch(login(email, pwd));
	}

	render () {
		const {loggedIn, error} = this.props;
		let message;
		if(!loggedIn && error){
			message = <p className="error">{error.message}</p>;
		}
		return (
			<div>
				<Nav isLoggedIn={loggedIn} />
				{message}
				<LoginForm onSubmit={(email, pwd) => this.callLogin(email, pwd)} />
				<Footer />
			</div>
		);
	}
}

const mapStateToProps = state => ({
	loggedIn: state.loginReducer.isloggedIn,
	error: state.loginReducer.errorMessage,
	shouldRedirect: state.loginReducer.shouldRedirect,
});

export default connect(mapStateToProps)(Login);
