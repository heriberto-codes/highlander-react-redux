import { GET_TEAM_PROFILE, GET_TEAM_PROFILE_SUCCESS, GET_TEAM_PROFILE_ERROR } from '../actions/teamAction';

// create intial state
// think about what state is needed on this page
const initialState = {
  name: '',
  first_name: '',
  last_name: '',
  city: '',
  state: '',
  email: '',
  players: [],
  playerEmail: '',
  playerPosition: '',
  coach: [],
  errorMessage: null
}

// create the teamReducer and set the state equal to intial state
export const teamReducer = (state = initialState, action) => {
  // create the switch statement and pass in action.type
  switch(action.type) {
    case GET_TEAM_PROFILE_SUCCESS:
      return Object.assign({}, state, {
        name: action.response.data.name,
        city: action.response.data.city,
        state: action.response.data.state,
      });
      break;
    case GET_TEAM_PROFILE_ERROR:
      return Object.assign({}, state, {
        errorMessage: action.err
      })
    default:
      return state;
  }
}
