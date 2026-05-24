import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { login } from '../actions/loginAction';

import Nav from '../components/Nav';
import LoginForm from '../components/LoginForm';
import Footer from '../components/Footer';

export function Login() {
  const dispatch = useDispatch();
  const loggedIn = useSelector(state => state.loginReducer.isloggedIn);
  const hasResolvedSession = useSelector(state => state.loginReducer.hasResolvedSession);
  const error = useSelector(state => state.loginReducer.errorMessage);
  const shouldRedirect = useSelector(state => state.loginReducer.shouldRedirect);
  const navigate = useNavigate();
  const previousAuthState = useRef(null);

  useEffect(() => {
    const previous = previousAuthState.current;

    if (!previous) {
      if (hasResolvedSession && loggedIn) {
        setTimeout(() => {
          navigate('/dashboard');
        }, 0);
      }
    } else {
      const isAuthenticated = hasResolvedSession && loggedIn;
      const redirectRequested = hasResolvedSession && shouldRedirect;
      const wasAuthenticated = previous.hasResolvedSession && previous.loggedIn;
      const hadRedirect = previous.hasResolvedSession && previous.shouldRedirect;

      if ((isAuthenticated && !wasAuthenticated) || (redirectRequested && !hadRedirect)) {
        navigate('/dashboard');
      }
    }

    previousAuthState.current = {
      hasResolvedSession,
      loggedIn,
      shouldRedirect
    };
  }, [hasResolvedSession, loggedIn, navigate, shouldRedirect]);

  function callLogin(email, pwd) {
    dispatch(login(email, pwd));
  }

  let message;
  if (hasResolvedSession && !loggedIn && error) {
    message = <p className="error">{error.message}</p>;
  }

  return (
    <div>
      <Nav isLoggedIn={loggedIn} />
      {message}
      {hasResolvedSession ? <LoginForm onSubmit={(email, pwd) => callLogin(email, pwd)} /> : null}
      <Footer />
    </div>
  );
}

export default Login;
