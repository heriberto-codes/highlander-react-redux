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
    console.log('this is the response from the coachAction axios call', response)
    // GOAL IS THE ABSTRACT PLAYER STATS SO I CAN KNOW HOW TO TAGET IT IN THE COACH REDUCER
    const teams = response.data.teams;

    let players = [];
    teams.forEach(team => {
      players = players.concat(team.players);
    })

    console.log('this is the foreach logic goes through the teams array in the response object and abstracts out the players ===>', players);

    const generateStat = player => {
    return {
      first_name: player.first_name,
      last_name: player.last_name,
      position: player.position,
      stats: player.stats.map(stat => {
        return {
        description: stat.description,
        how_many: stat._pivot_how_many,
        game_date: stat._pivot_game_date
       }
      }),
    }
  }

  let statsCollection = [];
  players.forEach((player, index) => {
    console.log('This is the player men', player)
    let stat = generateStat(player);
    console.log(stat);
    statsCollection.push(generateStat(player));
  })

  console.log('this is the statsCollection', statsCollection)

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
