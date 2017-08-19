import { LOGIN_SUCCESS } from '../actions/loginAction';
import { GET_PROFILE, PROFILE_SUCCESS, PROFILE_ERROR } from '../actions/coachAction';

const initialState = {
  stats: [],
  teams: [],
  players: [],
  name: null,
  email: '',
  id: null
}

export const coachReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return Object.assign({}, state, {
        id: action.response.data.id
      });
      break;
    case PROFILE_SUCCESS:
      return Object.assign({}, state, {
        stats: action.response.data.stats,
        teams: action.response.data.teams,
        players: action.response.data.players,
        name: action.response.data.name,
        email: action.response.data.email,
        id: action.response.data.id
      });
      break;
    default:
      return state;
  }
}
