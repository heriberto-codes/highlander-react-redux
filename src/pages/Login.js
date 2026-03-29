import React, { Component } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { login } from '../actions/loginAction';

import Nav from '../components/Nav';
import LoginForm from '../components/LoginForm';
import Footer from '../components/Footer';

export class Login extends Component {
        componentDidMount() {
                if (this.props.hasResolvedSession && this.props.loggedIn) {
                        setTimeout(() => {
                                this.props.navigate('/dashboard');
                        }, 0);
                }
        }

        componentDidUpdate(prevProps){
                if(this.shouldNavigateToDashboard(this.props, prevProps)) {
                        this.props.navigate('/dashboard');
                }
        }

        shouldNavigateToDashboard(props, prevProps) {
                const isAuthenticated = props.hasResolvedSession && props.loggedIn;
                const redirectRequested = props.hasResolvedSession && props.shouldRedirect;
                const wasAuthenticated = prevProps.hasResolvedSession && prevProps.loggedIn;
                const hadRedirect = prevProps.hasResolvedSession && prevProps.shouldRedirect;

                return (isAuthenticated && !wasAuthenticated) || (redirectRequested && !hadRedirect);
        }

	callLogin(email, pwd){
		this.props.dispatch(login(email, pwd));
	}

	render () {
		const {loggedIn, error, hasResolvedSession} = this.props;
		let message;
		if(hasResolvedSession && !loggedIn && error){
			message = <p className="error">{error.message}</p>;
		}
		return (
			<div>
				<Nav isLoggedIn={loggedIn} />
				{message}
				{hasResolvedSession ? <LoginForm onSubmit={(email, pwd) => this.callLogin(email, pwd)} /> : null}
				<Footer />
			</div>
		);
	}
}

const mapStateToProps = state => ({
        loggedIn: state.loginReducer.isloggedIn,
        hasResolvedSession: state.loginReducer.hasResolvedSession,
        error: state.loginReducer.errorMessage,
        shouldRedirect: state.loginReducer.shouldRedirect,
});

const ConnectedLogin = connect(mapStateToProps)(Login);

export default function LoginWrapper(props) {
        const navigate = useNavigate();
        return <ConnectedLogin {...props} navigate={navigate} />;
}
