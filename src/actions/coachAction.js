import axios from 'axios';
import { buildRequestUrl } from './queryParams';

const url = '/api/v1/coaches/';
const teamsUrl = '/api/v1/teams/';

function buildCoachProfileRequestUrl(id, season, filters) {
	return buildRequestUrl(`${url}${id}`, {
		season,
		teamSearch: filters.teamSearch,
		playerSearch: filters.playerSearch,
		position: filters.position,
		teamPage: filters.teamPage,
		teamLimit: filters.teamLimit,
		playerPage: filters.playerPage,
		playerLimit: filters.playerLimit,
		notificationLimit: filters.notificationLimit
	});
}

export const GET_PROFILE = 'GET_PROFILE';
export const getProfile = (id, season, filters = {}) => dispatch => {
	dispatch({
		type: GET_PROFILE,
		id,
		season,
		filters
	});

	const requestUrl = buildCoachProfileRequestUrl(id, season, filters);

       axios.get(requestUrl, { withCredentials: true })
               .then(response =>  {
			if(response.status === 200) {
				dispatch(profileSuccess(response));
			}
		})
		.catch(err => {
			dispatch(profileError(err));
		});
};

export const createCoachTeam = (coachId, team) => () => axios.post(
	teamsUrl,
	Object.assign({}, team, { coachId }),
	{ withCredentials: true }
);

export const PROFILE_SUCCESS = 'PROFILE_SUCCESS';
export const profileSuccess = response => ({
	type: PROFILE_SUCCESS,
	response
});

export const PROFILE_ERROR = 'PROFILE_ERROR';
export const profileError = response => ({
	type: PROFILE_ERROR,
	response
});
