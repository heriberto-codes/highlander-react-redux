import axios from 'axios';
import { buildRequestUrl } from './queryParams';

const teamsUrl = '/api/v1/teams/';

function buildTeamProfileRequestUrl(id, season, filters) {
	return buildRequestUrl(`${teamsUrl}${id}`, {
		season,
		playerSearch: filters.playerSearch,
		position: filters.position,
		playerPage: filters.playerPage,
		playerLimit: filters.playerLimit
	});
}

export const GET_TEAM_PROFILE = 'GET_TEAM_PROFILE';
// create the action creater
export const getTeamProfile = (id, season, filters = {}) => dispatch => {
	dispatch({
		type: GET_TEAM_PROFILE,
		id,
		season,
		filters
	});

	const requestUrl = buildTeamProfileRequestUrl(id, season, filters);

       axios.get(requestUrl, { withCredentials: true })
               .then(response => {
			if(response.status === 200) {
				dispatch(getTeamProfileSuccess(response));
			}
		})
		.catch(err => {
			dispatch(getTeamProfileError(err));
		});
};


export const ADD_TEAM_PLAYER = 'ADD_TEAM_PLAYER';
export const addNewPlayer = (id, emailInput, firstName, lastName, position) => dispatch => {
	dispatch({
		type: ADD_TEAM_PLAYER,
		emailInput,
		firstName,
		lastName,
		position
	});
       return axios.post(
               `${teamsUrl}${id}/player`,
               {
                       email: emailInput,
                       first_name: firstName,
                       last_name: lastName,
                       position
               },
               { withCredentials: true }
       )
               .then(response => {
			if(response.status === 200) {
				dispatch(addPlayer(response));
			}
		})
		.catch(err => {
			dispatch(addPlayerError(err));
			throw err;
		});
};

export const CREATE_GAME_ENTRY = 'CREATE_GAME_ENTRY';
export const createGameEntry = (id, payload) => dispatch => {
	dispatch({
		type: CREATE_GAME_ENTRY,
		id,
		payload
	});

	axios.post(
		`${teamsUrl}${id}/games`,
		payload,
		{ withCredentials: true }
	)
		.then(response => {
			if (response.status === 201) {
				dispatch(createGameEntrySuccess(response));
			}
		})
		.catch(err => {
			dispatch(createGameEntryError(err));
		});
};

export const GET_TEAM_COLLABORATORS = 'GET_TEAM_COLLABORATORS';
export const getTeamCollaborators = id => dispatch => {
	dispatch({
		type: GET_TEAM_COLLABORATORS,
		id
	});

	axios.get(`${teamsUrl}${id}/coaches`, { withCredentials: true })
		.then(response => {
			if (response.status === 200) {
				dispatch(getTeamCollaboratorsSuccess(response));
			}
		})
		.catch(err => {
			dispatch(getTeamCollaboratorsError(err));
		});
};

export const ADD_TEAM_COLLABORATOR = 'ADD_TEAM_COLLABORATOR';
export const addTeamCollaborator = (id, coachId, role) => dispatch => {
	dispatch({
		type: ADD_TEAM_COLLABORATOR,
		id,
		coachId,
		role
	});

	axios.post(
		`${teamsUrl}${id}/coaches`,
		{ coachId, role },
		{ withCredentials: true }
	)
		.then(response => {
			if (response.status === 201) {
				dispatch(addTeamCollaboratorSuccess(response));
			}
		})
		.catch(err => {
			dispatch(addTeamCollaboratorError(err));
		});
};

export const UPDATE_TEAM_COLLABORATOR = 'UPDATE_TEAM_COLLABORATOR';
export const updateTeamCollaborator = (id, coachId, role) => dispatch => {
	dispatch({
		type: UPDATE_TEAM_COLLABORATOR,
		id,
		coachId,
		role
	});

	axios.put(
		`${teamsUrl}${id}/coaches/${coachId}`,
		{ role },
		{ withCredentials: true }
	)
		.then(response => {
			if (response.status === 200) {
				dispatch(updateTeamCollaboratorSuccess(response));
			}
		})
		.catch(err => {
			dispatch(updateTeamCollaboratorError(err));
		});
};

export const REMOVE_TEAM_COLLABORATOR = 'REMOVE_TEAM_COLLABORATOR';
export const removeTeamCollaborator = (id, coachId) => dispatch => {
	dispatch({
		type: REMOVE_TEAM_COLLABORATOR,
		id,
		coachId
	});

	axios.delete(
		`${teamsUrl}${id}/coaches/${coachId}`,
		{ withCredentials: true }
	)
		.then(response => {
			if (response.status === 204) {
				dispatch(removeTeamCollaboratorSuccess(id, coachId));
			}
		})
		.catch(err => {
			dispatch(removeTeamCollaboratorError(err));
		});
};

export const GET_TEAM_PROFILE_SUCCESS = 'GET_TEAM_PROFILE_SUCCESS';
export const getTeamProfileSuccess = response => ({
	type: GET_TEAM_PROFILE_SUCCESS,
	response
});

export const GET_TEAM_PROFILE_ERROR = 'GET_TEAM_PROFILE_ERROR';
export const getTeamProfileError = response => ({
	type: GET_TEAM_PROFILE_ERROR,
	response
});

export const CREATE_TEAM = 'CREATE_TEAM';
export const createTeam = () => ({
	type: CREATE_TEAM
});

export const HIDE_MODAL = 'HIDE_MODAL';
export const hideModal = () => ({
	type: HIDE_MODAL
});

export const ADD_PLAYER = 'ADD_PLAYER';
export const addPlayer = (response) => ({
	type: ADD_PLAYER,
	response
});

export const ADD_PLAYER_ERROR = 'ADD_PLAYER_ERROR';
export const addPlayerError = response => ({
	type: ADD_PLAYER_ERROR,
	response
});

export const CREATE_GAME_ENTRY_SUCCESS = 'CREATE_GAME_ENTRY_SUCCESS';
export const createGameEntrySuccess = response => ({
	type: CREATE_GAME_ENTRY_SUCCESS,
	response
});

export const CREATE_GAME_ENTRY_ERROR = 'CREATE_GAME_ENTRY_ERROR';
export const createGameEntryError = response => ({
	type: CREATE_GAME_ENTRY_ERROR,
	response
});

export const GET_TEAM_COLLABORATORS_SUCCESS = 'GET_TEAM_COLLABORATORS_SUCCESS';
export const getTeamCollaboratorsSuccess = response => ({
	type: GET_TEAM_COLLABORATORS_SUCCESS,
	response
});

export const GET_TEAM_COLLABORATORS_ERROR = 'GET_TEAM_COLLABORATORS_ERROR';
export const getTeamCollaboratorsError = response => ({
	type: GET_TEAM_COLLABORATORS_ERROR,
	response
});

export const ADD_TEAM_COLLABORATOR_SUCCESS = 'ADD_TEAM_COLLABORATOR_SUCCESS';
export const addTeamCollaboratorSuccess = response => ({
	type: ADD_TEAM_COLLABORATOR_SUCCESS,
	response
});

export const ADD_TEAM_COLLABORATOR_ERROR = 'ADD_TEAM_COLLABORATOR_ERROR';
export const addTeamCollaboratorError = response => ({
	type: ADD_TEAM_COLLABORATOR_ERROR,
	response
});

export const UPDATE_TEAM_COLLABORATOR_SUCCESS = 'UPDATE_TEAM_COLLABORATOR_SUCCESS';
export const updateTeamCollaboratorSuccess = response => ({
	type: UPDATE_TEAM_COLLABORATOR_SUCCESS,
	response
});

export const UPDATE_TEAM_COLLABORATOR_ERROR = 'UPDATE_TEAM_COLLABORATOR_ERROR';
export const updateTeamCollaboratorError = response => ({
	type: UPDATE_TEAM_COLLABORATOR_ERROR,
	response
});

export const REMOVE_TEAM_COLLABORATOR_SUCCESS = 'REMOVE_TEAM_COLLABORATOR_SUCCESS';
export const removeTeamCollaboratorSuccess = (id, coachId) => ({
	type: REMOVE_TEAM_COLLABORATOR_SUCCESS,
	id,
	coachId
});

export const REMOVE_TEAM_COLLABORATOR_ERROR = 'REMOVE_TEAM_COLLABORATOR_ERROR';
export const removeTeamCollaboratorError = response => ({
	type: REMOVE_TEAM_COLLABORATOR_ERROR,
	response
});
