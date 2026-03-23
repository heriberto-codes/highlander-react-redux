import axios from 'axios';
import { buildRequestUrl } from './queryParams';

const baseUrl = 'http://localhost:8080/';
const teamsUrl = `${baseUrl}teams/`;
const playersUrl = `${baseUrl}players/`;

function buildTeamProfileRequestUrl(id, season, filters) {
	return buildRequestUrl(`${teamsUrl}${id}`, {
		season,
		playerSearch: filters.playerSearch,
		position: filters.position
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
       axios.post(
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
})

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
