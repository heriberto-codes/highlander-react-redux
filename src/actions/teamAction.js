import axios from 'axios';

const url = 'http://localhost:8080/teams/';
export const GET_TEAM_PROFILE = 'GET_TEAM_PROFILE';
// create the action creater
export const getTeamProfile = id => dispatch => {
  dispatch({
    type: GET_TEAM_PROFILE,
    id
  })
  axios.get(`${url}${id}`)
  .then(response => {
    if(response.status === 200) {
      dispatch(getTeamProfileSuccess(response))
    }
    console.log('this is the response from the team action axios call', response);
  })
  .catch(err => {
    dispatch(getTeamProfileError(err))
  })
}

export const GET_TEAM_PROFILE_SUCCESS = 'GET_TEAM_PROFILE_SUCCESS';
export const getTeamProfileSuccess = response => ({
  type: GET_TEAM_PROFILE_SUCCESS,
  response
})

export const GET_TEAM_PROFILE_ERROR = 'GET_TEAM_PROFILE_ERROR';
export const getTeamProfileError = response => ({
  type: GET_TEAM_PROFILE_ERROR,
  response
})
