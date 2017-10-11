import axios from 'axios';

const baseUrl = 'http://localhost:8080/';
const teamsUrl = `${baseUrl}teams/`;
const playersUrl = `${baseUrl}players/`;
export const GET_TEAM_PROFILE = 'GET_TEAM_PROFILE';
// create the action creater
export const getTeamProfile = id => dispatch => {
	dispatch({
		type: GET_TEAM_PROFILE,
		id
	});
	axios.get(`${teamsUrl}${id}`)
		.then(response => {
			if(response.status === 200) {
				dispatch(getTeamProfileSuccess(response));
			}
			console.log('this is the response from the team action axios call', response);
		})
		.catch(err => {
			dispatch(getTeamProfileError(err));
		});
};


export const ADD_TEAM_PLAYER = 'ADD_TEAM_PLAYER';
export const addNewPlayer = (id, emailInput, firstName, lastName, position) => dispatch => {
	console.log('Payload from action creater ADD TEAM PLAYER', emailInput, firstName, lastName, position);
	dispatch({
		type: ADD_TEAM_PLAYER,
		emailInput,
		firstName,
		lastName,
		position
	});
	axios.post(`${teamsUrl}${id}/player`, {
		email: emailInput,
		first_name: firstName,
		last_name: lastName,
		position
	})
		.then(response => {
			console.log('check to see if all the right values are in this payload ====>', response);
			if(response.status === 200) {
				dispatch(addPlayer(response));
			}
		})
		.catch(err => {
			dispatch(addPlayerError(err));
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
})
