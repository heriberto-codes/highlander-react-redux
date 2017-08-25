import { LOGIN_SUCCESS } from '../actions/loginAction';
import { GET_PROFILE, PROFILE_SUCCESS, PROFILE_ERROR } from '../actions/coachAction';

const initialState = {
  stats: [],
  teams: [],
  players: [],
  first_name: '',
  last_name: '',
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
      let players = [];
      action.response.data.teams.forEach(team => {
        players = players.concat(team.players);
      });
      return Object.assign({}, state, {
        stats: action.response.data.stats,
        teams: action.response.data.teams,
        players: players,
        first_name: action.response.data.first_name,
        last_name: action.response.data.last_name,
        email: action.response.data.email,
        id: action.response.data.id
      });
      break;
    default:
      return state;
  }
}
