import axios from 'axios';

const url = 'http://localhost:8080/coaches/';
export const GET_PROFILE = 'GET_PROFILE';
export const getProfile = id => dispatch => {
  dispatch({
    type: GET_PROFILE,
    id
  })
  axios.get(`${url}${id}`)
  .then(response =>  {
    console.log('Response from coachAction', response);
    if(response.status === 200) {
      dispatch(profileSuccess(response))
    }
  })
  .catch(err => {
    dispatch(profileError(err));
  })
}

export const PROFILE_SUCCESS = 'PROFILE_SUCCESS'
export const profileSuccess = response => ({
  type: PROFILE_SUCCESS,
  response
})

export const PROFILE_ERROR = 'PROFILE_ERROR'
export const profileError = response => ({
  type: PROFILE_ERROR,
  response
})
