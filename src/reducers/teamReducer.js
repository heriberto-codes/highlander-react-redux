import { GET_TEAM_PROFILE, GET_TEAM_PROFILE_SUCCESS, GET_TEAM_PROFILE_ERROR, CREATE_TEAM, HIDE_MODAL, ADD_PLAYER  } from '../actions/teamAction';

// create intial state
// think about what state is needed on this page
const initialState = {
	name: '',
	city: '',
	state: '',
	players: [{
		first_name: false,
		last_name: false,
		email: false,
		position: false
	}],
	coach: {
		first_name: '',
		last_name: '',
		email: '',
	},
	errorMessage: null,
	showModal: false
};

const players = (state = initialState.players, action) => {
        switch(action.type) {
        case GET_TEAM_PROFILE_SUCCESS:
                return action.response.data.players.map(player => Object.assign({}, state, {
                        first_name: player.first_name,
                        last_name: player.last_name,
                        email: player.email,
                        position: player.position
                }));
        case ADD_PLAYER:
                return [...state, {
                        first_name: action.response.data.first_name,
                        last_name: action.response.data.last_name,
                        email: action.response.data.email,
                        position: action.response.data.position
                }];
        default:
                return state;
        }
};

// this is the way to approach nested state to generate the data im looking for
const coach = (state = initialState.coach, action) => {
        switch(action.type) {
        case GET_TEAM_PROFILE_SUCCESS:
                return Object.assign({}, state, {
                        first_name: action.response.data.coach[0].first_name,
                        last_name: action.response.data.coach[0].last_name,
                        email: action.response.data.coach[0].email
                });
        default:
                return state;
        }
};

// create the teamReducer and set the state equal to intial state
export const teamReducer = (state = initialState, action) => {
	// create the switch statement and pass in action.type
	switch(action.type) {
	case GET_TEAM_PROFILE_SUCCESS:
		return Object.assign({}, state, {
			name: action.response.data.name,
			city: action.response.data.city,
			state: action.response.data.state,
			players: players(state.players, action),
			coach: coach(state.coach, action)
		});
		break;
        case GET_TEAM_PROFILE_ERROR:
                return Object.assign({}, state, {
                        errorMessage: action.response
                });
	case CREATE_TEAM:
		return Object.assign({}, state, {
			showModal: true
		})
	case HIDE_MODAL:
		return Object.assign({}, state, {
			showModal: false
		})
	case ADD_PLAYER:
		return Object.assign({}, state, {
			showModal: false,
			players: players(state.players, action),
		})
	default:
		return state;
	}
};
