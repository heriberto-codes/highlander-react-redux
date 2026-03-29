import {
	LOGIN_REQUEST,
	LOGIN_SUCCESS,
	LOGIN_FAIL,
	LOGOUT,
	BOOTSTRAP_SESSION_REQUEST,
	BOOTSTRAP_SESSION_SUCCESS,
	BOOTSTRAP_SESSION_FAIL
} from '../actions/loginAction';

const initialState = {
	isLoading: false,
	isloggedIn: false,
	hasResolvedSession: false,
	shouldRedirect: false,
	errorMessage: null
};

export const loginReducer = (state = initialState, action) => {
	switch (action.type) {
	case LOGIN_REQUEST:
		return Object.assign({}, state, {
			isLoading: true,
			errorMessage: null
		});
		break;
	case LOGIN_SUCCESS:
		return Object.assign({}, state, {
			isLoading: false,
			isloggedIn: true,
			hasResolvedSession: true,
			errorMessage: null,
			shouldRedirect: true
		});
		break;
	case LOGIN_FAIL:
		return Object.assign({}, state, {
			isLoading: false,
			isloggedIn: false,
			hasResolvedSession: true,
			shouldRedirect: false,
			errorMessage: action.err
		});
		break;
	case BOOTSTRAP_SESSION_REQUEST:
		return Object.assign({}, state, {
			isLoading: true,
			shouldRedirect: false,
			errorMessage: null
		});
		break;
	case BOOTSTRAP_SESSION_SUCCESS:
		return Object.assign({}, state, {
			isLoading: false,
			isloggedIn: true,
			hasResolvedSession: true,
			shouldRedirect: false,
			errorMessage: null
		});
		break;
	case BOOTSTRAP_SESSION_FAIL:
		return Object.assign({}, state, {
			isLoading: false,
			isloggedIn: false,
			hasResolvedSession: true,
			shouldRedirect: false,
			errorMessage: action.err
		});
		break;
    case LOGOUT:
                return Object.assign({}, initialState, {
			hasResolvedSession: true
		});
                break;
        default:
		return state;
	}
};
