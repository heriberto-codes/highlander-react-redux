import axios from 'axios';

const url = `http://localhost:8080/coaches/login`;
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const login = (email, pwd) => dispatch => {
  dispatch({
    type: LOGIN_REQUEST,
    email,
    pwd
  })
  axios.post(url, {email, pwd})
  .then(response => {
    if(response.status === 200){
      dispatch(loginSuccess(response));
    }
  })
  .catch(err => {
    dispatch(loginFail(err));
  })
}

export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const loginSuccess = (response) => ({
  type: LOGIN_SUCCESS,
  response
})

export const LOGIN_FAIL = 'LOGIN_FAIL';
export const loginFail = (err) => ({
  type: LOGIN_FAIL,
  err
})

export const LOGOUT = 'LOGOUT';
export const logout = (email, pwd) => ({
  type: LOGOUT,
  email,
  pwd
})
