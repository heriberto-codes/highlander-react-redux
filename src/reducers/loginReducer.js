import { LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAIL,
  LOGOUT } from '../actions/loginAction';

const initialState = {
  isLoading: false,
  isloggedIn: false,
  shouldRedirect: false,
  errorMessage: null,
  email: '',
  pwd: ''
}

export const loginReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
      return Object.assign({}, state, {
        isLoading: true,
        email: action.email,
        pwd: action.pwd
      });
      break;
    case 'LOGIN_SUCCESS':
      return Object.assign({}, state, {
        isLoading: false,
        isloggedIn: true,
        shouldRedirect: true
      });
      break;
      case 'LOGIN_FAIL':
        return Object.assign({}, state, {
          isLoading: false,
          isloggedIn: false,
          shouldRedirect: false,
          errorMessage: action.err
        });
        break;
    case 'LOGOUT':
      return Object.assign({}, state, {
        isLoggedin: false,
        email: '',
        pwd: ''
      })
      break;
    default:
      return state;
  }
}
