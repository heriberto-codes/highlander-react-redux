import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { logout } from '../actions/loginAction';
import 'bulma/css/bulma.css';
import '../css/nav.css';

export default function Nav() {
	const dispatch = useDispatch();
	const isLoggedIn = useSelector(state => state.loginReducer.isloggedIn);

	const handleLogout = () => {
		dispatch(logout());
	};

	const options = isLoggedIn ? (
		<>
			<Link className="nav-item nav-color is-tab is-active" to='/dashboard'>
				<i className="fa fa-home icon the-shit" aria-hidden="true"></i>
          Dashboard
			</Link>
			<button
				className="nav-item is-tab nav-color logout-session nav-logout-button"
				type="button"
				onClick={handleLogout}
			>
				<i className="fa fa-sign-out icon the-shit" aria-hidden="true"></i>
          Log out
			</button>
		</>
	) : (
		<>
			<Link className="nav-item is-tab nav-color" to='/register'>
				<i className="fa fa-user-o icon nav-icon" aria-hidden="true"></i>
        Sign Up
			</Link>
			<Link className="nav-item is-tab nav-color" to='/login'>
				<i className="fa fa-sign-out icon nav-icon" aria-hidden="true"></i>
        Log In
			</Link>
		</>
	);

	return (
		<nav className="nav has-shadow">
			<div className="nav-left">
				<Link className="nav-item logo-nav" to='/'>
					<p className="logo">Highlander</p>
				</Link>
			</div>

			<span id="nav-toggle" className="nav-toggle toggle-hamburger-placement">
				<span></span>
				<span></span>
				<span></span>
			</span>

			<div className="nav-right nav-menu" id="nav-menu">
				{options}
			</div>
		</nav>
	);
}
