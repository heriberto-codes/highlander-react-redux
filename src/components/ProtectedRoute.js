import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
	const location = useLocation();
	const hasResolvedSession = useSelector(state => state.loginReducer.hasResolvedSession);
	const isLoggedIn = useSelector(state => state.loginReducer.isloggedIn);
	const isLoading = useSelector(state => state.loginReducer.isLoading);

	if (!hasResolvedSession || isLoading) {
		return (
			<section className="section">
				<p>Loading...</p>
			</section>
		);
	}

	if (!isLoggedIn) {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}

	return children;
}
