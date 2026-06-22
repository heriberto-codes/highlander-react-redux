import {
	GET_TEAM_PROFILE,
	GET_TEAM_PROFILE_SUCCESS,
	GET_TEAM_PROFILE_ERROR,
	GET_TEAM_COLLABORATORS,
	GET_TEAM_COLLABORATORS_SUCCESS,
	GET_TEAM_COLLABORATORS_ERROR,
	CREATE_TEAM,
	HIDE_MODAL,
	ADD_PLAYER,
	ADD_PLAYER_ERROR,
	ADD_TEAM_COLLABORATOR,
	ADD_TEAM_COLLABORATOR_SUCCESS,
	ADD_TEAM_COLLABORATOR_ERROR,
	UPDATE_TEAM_COLLABORATOR,
	UPDATE_TEAM_COLLABORATOR_SUCCESS,
	UPDATE_TEAM_COLLABORATOR_ERROR,
	REMOVE_TEAM_COLLABORATOR,
	REMOVE_TEAM_COLLABORATOR_SUCCESS,
	REMOVE_TEAM_COLLABORATOR_ERROR,
	CREATE_GAME_ENTRY,
	CREATE_GAME_ENTRY_SUCCESS,
	CREATE_GAME_ENTRY_ERROR
} from '../actions/teamAction';

const defaultFilters = () => ({
	playerSearch: '',
	position: ''
});

const defaultTeamDetailPagination = () => ({
	playerPage: 1,
	playerLimit: 10
});

const defaultPaginationMetadata = () => ({
	page: 1,
	limit: 10,
	totalItems: 0,
	totalPages: 0,
	hasPreviousPage: false,
	hasNextPage: false
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
	teamDetailPagination: defaultTeamDetailPagination(),
	playerPagination: defaultPaginationMetadata(),
	players: [],
	coach: {
		first_name: '',
		last_name: '',
		email: '',
	},
	collaborators: [],
	currentCoachRole: null,
	isLoadingTeamProfile: false,
	isLoadingCollaborators: false,
	collaboratorLoadError: null,
	isAddingCollaborator: false,
	addCollaboratorSuccess: false,
	addCollaboratorError: null,
	isUpdatingCollaborator: false,
	updateCollaboratorSuccess: false,
	updateCollaboratorError: null,
	isRemovingCollaborator: false,
	removeCollaboratorSuccess: false,
	removeCollaboratorError: null,
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

const normalizeCollaborator = collaborator => ({
	id: collaborator.id,
	first_name: collaborator.first_name,
	last_name: collaborator.last_name,
	email: collaborator.email,
	role: collaborator.role
});

const collaborators = (state = initialState.collaborators, action) => {
	switch (action.type) {
	case GET_TEAM_PROFILE_SUCCESS:
		return (action.response.data.collaborators || []).map(normalizeCollaborator);
	case GET_TEAM_COLLABORATORS_SUCCESS:
		return (action.response.data || []).map(normalizeCollaborator);
	case ADD_TEAM_COLLABORATOR_SUCCESS:
		return [...state, normalizeCollaborator(action.response.data)];
	case UPDATE_TEAM_COLLABORATOR_SUCCESS:
		return state.map(collaborator => {
			if (Number(collaborator.id) !== Number(action.response.data.id)) {
				return collaborator;
			}

			return normalizeCollaborator(action.response.data);
		});
	case REMOVE_TEAM_COLLABORATOR_SUCCESS:
		return state.filter(collaborator => Number(collaborator.id) !== Number(action.coachId));
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

const normalizePositiveInteger = (value, defaultValue) => {
	const parsedValue = Number(value);

	return Number.isInteger(parsedValue) && parsedValue > 0
		? parsedValue
		: defaultValue;
};

const normalizeTeamDetailPagination = filters => {
	const defaults = defaultTeamDetailPagination();

	return {
		playerPage: normalizePositiveInteger(filters && filters.playerPage, defaults.playerPage),
		playerLimit: normalizePositiveInteger(filters && filters.playerLimit, defaults.playerLimit)
	};
};

const normalizePaginationMetadata = pagination => Object.assign(
	defaultPaginationMetadata(),
	pagination || {}
);

const resetCollaboratorMutationState = {
	isAddingCollaborator: false,
	addCollaboratorSuccess: false,
	addCollaboratorError: null,
	isUpdatingCollaborator: false,
	updateCollaboratorSuccess: false,
	updateCollaboratorError: null,
	isRemovingCollaborator: false,
	removeCollaboratorSuccess: false,
	removeCollaboratorError: null
};

// create the teamReducer and set the state equal to intial state
export const teamReducer = (state = initialState, action) => {
	// create the switch statement and pass in action.type
	switch(action.type) {
	case GET_TEAM_PROFILE:
		return Object.assign({}, state, {
			filters: normalizeTeamFilters(action.filters),
			teamDetailPagination: normalizeTeamDetailPagination(action.filters),
			isLoadingTeamProfile: true,
			errorMessage: null
		}, resetCollaboratorMutationState);
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
			teamDetailPagination: state.teamDetailPagination,
			playerPagination: normalizePaginationMetadata(action.response.data.playerPagination),
			players: players(state.players, action),
			coach: coach(state.coach, action),
			collaborators: collaborators(state.collaborators, action),
			currentCoachRole:
				action.response.data.currentCoachRole !== undefined
					? action.response.data.currentCoachRole
					: null,
			isLoadingTeamProfile: false,
			errorMessage: null
		}, resetCollaboratorMutationState);
	case GET_TEAM_PROFILE_ERROR:
		return Object.assign({}, state, {
			isLoadingTeamProfile: false,
			errorMessage: action.response
		}, resetCollaboratorMutationState);
	case GET_TEAM_COLLABORATORS:
		return Object.assign({}, state, {
			isLoadingCollaborators: true,
			collaboratorLoadError: null
		}, resetCollaboratorMutationState);
	case GET_TEAM_COLLABORATORS_SUCCESS:
		return Object.assign({}, state, {
			collaborators: collaborators(state.collaborators, action),
			isLoadingCollaborators: false,
			collaboratorLoadError: null
		}, resetCollaboratorMutationState);
	case GET_TEAM_COLLABORATORS_ERROR:
		return Object.assign({}, state, {
			isLoadingCollaborators: false,
			collaboratorLoadError: action.response
		}, resetCollaboratorMutationState);
	case CREATE_TEAM:
		return Object.assign({}, state, {
			showModal: true
		});
	case HIDE_MODAL:
		return Object.assign({}, state, {
			showModal: false
		});
	case ADD_PLAYER:
		return Object.assign({}, state, {
			showModal: false,
			players: players(state.players, action),
		});
	case ADD_PLAYER_ERROR:
		return Object.assign({}, state, {
			showModal: true
		});
	case ADD_TEAM_COLLABORATOR:
		return Object.assign({}, state, {
			isAddingCollaborator: true,
			addCollaboratorSuccess: false,
			addCollaboratorError: null
		});
	case ADD_TEAM_COLLABORATOR_SUCCESS:
		return Object.assign({}, state, {
			collaborators: collaborators(state.collaborators, action),
			isAddingCollaborator: false,
			addCollaboratorSuccess: true,
			addCollaboratorError: null
		});
	case ADD_TEAM_COLLABORATOR_ERROR:
		return Object.assign({}, state, {
			isAddingCollaborator: false,
			addCollaboratorSuccess: false,
			addCollaboratorError: action.response
		});
	case UPDATE_TEAM_COLLABORATOR:
		return Object.assign({}, state, {
			isUpdatingCollaborator: true,
			updateCollaboratorSuccess: false,
			updateCollaboratorError: null
		});
	case UPDATE_TEAM_COLLABORATOR_SUCCESS:
		return Object.assign({}, state, {
			collaborators: collaborators(state.collaborators, action),
			isUpdatingCollaborator: false,
			updateCollaboratorSuccess: true,
			updateCollaboratorError: null
		});
	case UPDATE_TEAM_COLLABORATOR_ERROR:
		return Object.assign({}, state, {
			isUpdatingCollaborator: false,
			updateCollaboratorSuccess: false,
			updateCollaboratorError: action.response
		});
	case REMOVE_TEAM_COLLABORATOR:
		return Object.assign({}, state, {
			isRemovingCollaborator: true,
			removeCollaboratorSuccess: false,
			removeCollaboratorError: null
		});
	case REMOVE_TEAM_COLLABORATOR_SUCCESS:
		return Object.assign({}, state, {
			collaborators: collaborators(state.collaborators, action),
			isRemovingCollaborator: false,
			removeCollaboratorSuccess: true,
			removeCollaboratorError: null
		});
	case REMOVE_TEAM_COLLABORATOR_ERROR:
		return Object.assign({}, state, {
			isRemovingCollaborator: false,
			removeCollaboratorSuccess: false,
			removeCollaboratorError: action.response
		});
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
