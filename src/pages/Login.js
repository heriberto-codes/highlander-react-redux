import React, { Component } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { login } from '../actions/loginAction';

import Nav from '../components/Nav';
import LoginForm from '../components/LoginForm';
import Footer from '../components/Footer';

class Login extends Component {
        componentDidUpdate(prevProps){
                if(this.props.shouldRedirect && !prevProps.shouldRedirect) {
                        this.props.navigate('/dashboard');
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

const ConnectedLogin = connect(mapStateToProps)(Login);

export default function LoginWrapper(props) {
        const navigate = useNavigate();
        return <ConnectedLogin {...props} navigate={navigate} />;
}
