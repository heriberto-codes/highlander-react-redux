import { GET_TEAM_PROFILE, GET_TEAM_PROFILE_SUCCESS, GET_TEAM_PROFILE_ERROR } from '../actions/teamAction';

// create intial state
// think about what state is needed on this page
const initialState = {
  name: '',
  city: '',
  state: '',
  players: [],
  coach: {
    first_name: '',
    last_name: '',
    email: '',
  },
  // coach: [],
  errorMessage: null
}

// this is the way to approach nested state to generate the data im looking for
const coach = (state = initialState.coach, action) => {
  switch(action.type) {
    case GET_TEAM_PROFILE_SUCCESS:
      return Object.assign({}, state, {
        first_name: action.response.data.coach.map(coach => coach.first_name),
        last_name: action.response.data.coach.map(coach => coach.last_name),
        email: action.response.data.coach.map(coach => coach.email)
        // teams: action.response.data.coach.teams.map(t => team(t, action))
      });
    break;
  }
}

// const coach = (state = initialState.coach, action) => {
//   switch(action.type) {
//     case GET_TEAM_PROFILE_SUCCESS:
//       return Object.assign({}, state, {
//         first_name: [...state.coach, {
//           first_name: action.response.data.coach.map(coach => coach.first_name)
//         }]
//       });
//   }
// }

// create the teamReducer and set the state equal to intial state
export const teamReducer = (state = initialState, action) => {
  // create the switch statement and pass in action.type
  switch(action.type) {
    case GET_TEAM_PROFILE_SUCCESS:
      return Object.assign({}, state, {
        name: action.response.data.name,
        city: action.response.data.city,
        state: action.response.data.state,
        players: action.response.data.players,
        coach: coach(state.coach, action)
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
