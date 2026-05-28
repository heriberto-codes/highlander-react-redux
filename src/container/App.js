import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { bootstrapSession } from '../actions/loginAction';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import TeamDetails from '../pages/TeamDetails';
import ProtectedRoute from '../components/ProtectedRoute';

export function App() {
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(bootstrapSession());
	}, [dispatch]);

	return (
		<Router>
			<div className="App">
				<Routes>
					<Route path='/' element={<Home />} />
					<Route path='/login' element={<Login />} />
					<Route path='/register' element={<Register />} />
					<Route
						path='/dashboard'
						element={
							<ProtectedRoute>
								<Dashboard />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/dashboard/:id'
						element={
							<ProtectedRoute>
								<Dashboard />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/teamdetails/:id'
						element={
							<ProtectedRoute>
								<TeamDetails />
							</ProtectedRoute>
						}
					/>
				</Routes>
			</div>
		</Router>
	);
}

export default App;
