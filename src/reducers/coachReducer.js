import { LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAIL,
  LOGOUT } from '../actions/loginAction';

const initialState = {
  stats: [],
  teams: [],
  players: [],
  name: null,
  email: ''
}

export const coachReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'PROFILE_SUCCESS':
      return Object.assign({}, state, {
        stats: action.response.data.stats,
        teams: action.response.data.teams,
        players: action.response.data.players,
        name: action.response.data.name,
        email: action.response.data.email
      });
      break;
    default:
      return state;
  }
}
