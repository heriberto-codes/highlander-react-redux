import axios from 'axios';

const loginUrl = '/api/v1/sessions/login';
const bootstrapUrl = '/api/v1/sessions';
const registrationUrl = '/api/v1/coaches';
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const login = (email, pwd) => dispatch => {
	dispatch({
		type: LOGIN_REQUEST,
		email,
		pwd
	});
       axios.post(loginUrl, {email, pwd}, { withCredentials: true })
               .then(response => {
			if(response.status === 200){
				dispatch(loginSuccess(response));
			}
		})
		.catch(err => {
			dispatch(loginFail(err));
		});
};

export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const loginSuccess = (response) => ({
	type: LOGIN_SUCCESS,
	response
});

export const LOGIN_FAIL = 'LOGIN_FAIL';
export const loginFail = (err) => ({
	type: LOGIN_FAIL,
	err
});

export const LOGOUT = 'LOGOUT';
export const logout = () => dispatch => axios.delete(
	bootstrapUrl,
	{ withCredentials: true }
).then(response => {
	dispatch({ type: LOGOUT });
	return response;
});

export const BOOTSTRAP_SESSION_REQUEST = 'BOOTSTRAP_SESSION_REQUEST';
export const bootstrapSessionRequest = () => ({
	type: BOOTSTRAP_SESSION_REQUEST
});

export const BOOTSTRAP_SESSION_SUCCESS = 'BOOTSTRAP_SESSION_SUCCESS';
export const bootstrapSessionSuccess = (response) => ({
	type: BOOTSTRAP_SESSION_SUCCESS,
	response
});

export const BOOTSTRAP_SESSION_FAIL = 'BOOTSTRAP_SESSION_FAIL';
export const bootstrapSessionFail = (err) => ({
	type: BOOTSTRAP_SESSION_FAIL,
	err
});

export const BOOTSTRAP_SESSION_LOGGED_OUT = 'BOOTSTRAP_SESSION_LOGGED_OUT';
export const bootstrapSessionLoggedOut = () => ({
	type: BOOTSTRAP_SESSION_LOGGED_OUT
});

export const bootstrapSession = () => dispatch => {
	dispatch(bootstrapSessionRequest());
	axios.get(bootstrapUrl, { withCredentials: true })
		.then(response => {
			if (response.status === 200) {
				dispatch(bootstrapSessionSuccess(response));
			}
		})
		.catch(err => {
			const status = err.response && err.response.status;

			if (status === 401 || status === 403) {
				dispatch(bootstrapSessionLoggedOut());
				return;
			}

			dispatch(bootstrapSessionFail(err));
		});
};

export const registerCoach = coach => axios.post(
	registrationUrl,
	coach,
	{ withCredentials: true }
);
