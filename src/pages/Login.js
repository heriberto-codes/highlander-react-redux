import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import { login } from '../actions/loginAction';

import Nav from '../components/Nav';
import LoginForm from '../components/LoginForm';
import Footer from '../components/Footer';

function getInternalRedirectPath(fromLocation) {
  if (
    !fromLocation ||
    typeof fromLocation.pathname !== 'string' ||
    !fromLocation.pathname.startsWith('/') ||
    fromLocation.pathname.startsWith('//')
  ) {
    return '/dashboard';
  }

  return `${fromLocation.pathname}${fromLocation.search || ''}${fromLocation.hash || ''}`;
}

export function Login() {
  const dispatch = useDispatch();
  const loggedIn = useSelector(state => state.loginReducer.isloggedIn);
  const isLoading = useSelector(state => state.loginReducer.isLoading);
  const hasResolvedSession = useSelector(state => state.loginReducer.hasResolvedSession);
  const error = useSelector(state => state.loginReducer.errorMessage);
  const shouldRedirect = useSelector(state => state.loginReducer.shouldRedirect);
  const location = useLocation();
  const navigate = useNavigate();
  const previousAuthState = useRef(null);
  const redirectPath = getInternalRedirectPath(location.state && location.state.from);

  useEffect(() => {
    const previous = previousAuthState.current;

    if (!previous) {
      if (hasResolvedSession && loggedIn) {
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 0);
      }
    } else {
      const isAuthenticated = hasResolvedSession && loggedIn;
      const redirectRequested = hasResolvedSession && shouldRedirect;
      const wasAuthenticated = previous.hasResolvedSession && previous.loggedIn;
      const hadRedirect = previous.hasResolvedSession && previous.shouldRedirect;

      if ((isAuthenticated && !wasAuthenticated) || (redirectRequested && !hadRedirect)) {
        navigate(redirectPath, { replace: true });
      }
    }

    previousAuthState.current = {
      hasResolvedSession,
      loggedIn,
      shouldRedirect
    };
  }, [hasResolvedSession, loggedIn, navigate, redirectPath, shouldRedirect]);

  function callLogin(email, pwd) {
    dispatch(login(email, pwd));
  }

  let message;
  if (!hasResolvedSession || isLoading) {
    message = <p>Loading...</p>;
  }

  if (hasResolvedSession && !loggedIn && error) {
    message = <p className="error">{error.message}</p>;
  }

  return (
    <div>
      <Nav isLoggedIn={loggedIn} />
      {message}
      {hasResolvedSession && !isLoading ? <LoginForm onSubmit={(email, pwd) => callLogin(email, pwd)} /> : null}
      <Footer />
    </div>
  );
}

export default Login;
