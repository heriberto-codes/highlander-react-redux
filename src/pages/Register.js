import React from 'react';
import { useNavigate } from 'react-router-dom';

import { registerCoach } from '../actions/loginAction';
import Nav from '../components/Nav';
import RegisterForm from '../components/RegisterForm';
import Footer from '../components/Footer';

export default function Register() {
	const navigate = useNavigate();

	const handleRegister = coach => registerCoach(coach)
		.then(response => {
			setTimeout(() => {
				navigate('/login');
			}, 0);
			return response;
		});

	return (
		<div>
			<Nav />
			<RegisterForm onRegister={handleRegister} />
			<Footer />
		</div>
	);
}
