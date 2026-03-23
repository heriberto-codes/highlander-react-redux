import {
	GET_TEAM_PROFILE,
	GET_TEAM_PROFILE_SUCCESS,
	GET_TEAM_PROFILE_ERROR,
	CREATE_TEAM,
	HIDE_MODAL,
	ADD_PLAYER,
	CREATE_GAME_ENTRY,
	CREATE_GAME_ENTRY_SUCCESS,
	CREATE_GAME_ENTRY_ERROR
} from '../actions/teamAction';

const defaultFilters = () => ({
	playerSearch: '',
	position: ''
});

// create intial state
// think about what state is needed on this page
const initialState = {
	name: '',
	city: '',
	state: '',
	season: null,
	activeSeason: null,
	availableSeasons: [],
	filters: defaultFilters(),
        players: [],
	coach: {
		first_name: '',
		last_name: '',
		email: '',
	},
	isSubmittingGame: false,
	gameSubmissionSuccess: false,
	lastCreatedGame: null,
	gameSubmissionError: null,
	errorMessage: null,
	showModal: false
};

const players = (state = initialState.players, action) => {
        switch(action.type) {
        case GET_TEAM_PROFILE_SUCCESS:
                return action.response.data.players.map(({ id, first_name, last_name, email, position }) => ({
                        id,
                        first_name,
                        last_name,
                        email,
                        position
                }));
        case ADD_PLAYER:
                return [...state, {
                        id: action.response.data.id,
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

const normalizeFilterValue = value => {
	if (typeof value !== 'string') {
		return '';
	}

	return value.trim();
};

const normalizeTeamFilters = filters => ({
	playerSearch: normalizeFilterValue(filters && filters.playerSearch),
	position: normalizeFilterValue(filters && filters.position)
});

// create the teamReducer and set the state equal to intial state
export const teamReducer = (state = initialState, action) => {
	// create the switch statement and pass in action.type
	switch(action.type) {
	case GET_TEAM_PROFILE:
		return Object.assign({}, state, {
			filters: normalizeTeamFilters(action.filters)
		});
	case GET_TEAM_PROFILE_SUCCESS:
		return Object.assign({}, state, {
			name: action.response.data.name,
			city: action.response.data.city,
			state: action.response.data.state,
			season:
				action.response.data.season !== undefined
					? action.response.data.season
					: null,
			activeSeason:
				action.response.data.activeSeason !== undefined
					? action.response.data.activeSeason
					: null,
			availableSeasons: action.response.data.availableSeasons || [],
			filters: state.filters,
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
	case CREATE_GAME_ENTRY:
		return Object.assign({}, state, {
			isSubmittingGame: true,
			gameSubmissionSuccess: false,
			lastCreatedGame: null,
			gameSubmissionError: null
		});
	case CREATE_GAME_ENTRY_SUCCESS:
		return Object.assign({}, state, {
			isSubmittingGame: false,
			gameSubmissionSuccess: true,
			lastCreatedGame: action.response.data,
			gameSubmissionError: null
		});
	case CREATE_GAME_ENTRY_ERROR:
		return Object.assign({}, state, {
			isSubmittingGame: false,
			gameSubmissionSuccess: false,
			lastCreatedGame: null,
			gameSubmissionError: action.response
		});
	default:
		return state;
	}
};
